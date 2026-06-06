'use server';

import { cookies } from 'next/headers';
import { AI_MODELS } from '@/lib/ai-models';

// ── Types ───────────────────────────────────────────────────────────

export interface InsightInput {
  toolId: string;
  locale: 'az' | 'ru' | 'en' | 'tr';
  result: Record<string, number | string>;
}

export interface InsightResult {
  ok: boolean;
  insight?: string;
  error?: 'rate-limited' | 'missing-key' | 'ai-failed' | 'validation';
}

// ── Rate limit (cookie-based, 20/hour) ──────────────────────────────

const RATE_COOKIE = 'dk_toolkit_insight_runs';
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_RUNS = 20;

async function checkRate(): Promise<boolean> {
  const jar = await cookies();
  const raw = jar.get(RATE_COOKIE)?.value;
  if (!raw) return true;
  try {
    const runs = JSON.parse(raw) as number[];
    const now = Date.now();
    const recent = runs.filter((ts) => now - ts < WINDOW_MS);
    return recent.length < MAX_RUNS;
  } catch {
    return true;
  }
}

async function recordRun(): Promise<void> {
  const jar = await cookies();
  const raw = jar.get(RATE_COOKIE)?.value;
  const now = Date.now();
  let runs: number[] = [];
  try {
    if (raw) runs = (JSON.parse(raw) as number[]).filter((ts) => now - ts < WINDOW_MS);
  } catch { /* reset */ }
  runs.push(now);
  jar.set(RATE_COOKIE, JSON.stringify(runs), { maxAge: 3600, httpOnly: true, sameSite: 'lax' });
}

// ── Sanitize (prompt injection defense) ─────────────────────────────

function sanitizeResult(result: Record<string, number | string>): string {
  const safe: string[] = [];
  for (const [key, value] of Object.entries(result)) {
    const safeKey = String(key).replace(/[^a-zA-Z0-9_]/g, '').slice(0, 30);
    if (!safeKey) continue;
    if (typeof value === 'number') {
      if (!Number.isFinite(value)) continue;
      safe.push(`${safeKey}: ${Math.round(value * 100) / 100}`);
    } else {
      // String values: strip anything that looks like prompt injection
      const safeValue = String(value)
        .replace(/[\n\r]/g, ' ')
        .replace(/[{}[\]<>]/g, '')
        .slice(0, 100);
      safe.push(`${safeKey}: ${safeValue}`);
    }
  }
  return safe.join(', ');
}

// ── Tool-specific system prompts ────────────────────────────────────

const TOOL_PROMPTS: Record<string, string> = {
  'metbex-istasyon': 'Sən sürətli yemək (QSR/fast food) mətbəx planlaması üzrə mütəxəssissən. İstifadəçinin SKU, istasyon və kadro hesablamasını şərh et. Əmək faizi 32%-dən aşağı QSR üçün yaxşıdır. Delivery/drive-thru kanallarının kadroya təsirini nəzərə al. 2-3 cümlə praktik tövsiyə ver, rəqəm uydurma.',
  'personel-planlayici': 'Sən HoReCa sektoru üzrə peşəkar HR məsləhətçisisən. İstifadəçinin restoran/kafe personel planlama nəticəsini şərh et. Əmək faizi restoranda 30-35%, kafedə 28-32% normaldır. Peak saatlar üçün kadronun kifayətliyini qiymətləndir. 2-3 cümlə praktik tövsiyə ver, rəqəm uydurma.',
  'food-cost': 'Sən HoReCa maliyyə məsləhətçisisən. İstifadəçinin food cost hesablama nəticəsini şərh et. Nəticə yaxşıdırmı (sektorda 28-32% normal), nə etməli? Rəqəm uydurma.',
  'basabas': 'Sən restoran maliyyə məsləhətçisisən. İstifadəçinin başabaş nöqtəsi hesablamasını şərh et. Təhlükəsizlik marjası 20%+ yaxşıdır. Praktik tövsiyə ver.',
  'staff-retention': 'Sən HoReCa HR məsləhətçisisən. İşçi saxlama hesablamasını şərh et. 15%-dən aşağı turnover yaxşıdır. Praktik tövsiyə ver.',
  'branding-guide': 'Sən restoran marka məsləhətçisisən. Branding checklist irəliləyişini şərh et. Tamamlanmamış sahələr üçün prioritet təklif et.',
  'delivery-calc': 'Sən restoran çatdırılma məsləhətçisisən. Çatdırılma rentabellik hesablamasını şərh et. Komissiya 30%-dən yuxarıdırsa xəbərdarlıq ver.',
  'menu-matrix': 'Sən menyu mühəndisliyi ekspertisən. BCG matris nəticəsini şərh et. Ulduz və İt kateqoriyalarına diqqət yetir.',
  'checklist': 'Sən restoran açılış məsləhətçisisən. Checklist irəliləyişini şərh et. Geri qalan sahələr üçün prioritet təklif et.',
  'aqta-checklist': 'Sən qida təhlükəsizliyi ekspertisən. AQTA uyğunluq checklist irəliləyişini şərh et. Kritik boşluqları vurğula.',
  'insaat-checklist': 'Sən restoran layihə menecerisən. İnşaat checklist irəliləyişini şərh et. Gecikmə riskli sahələri vurğula.',
  'pnl': 'Sən restoran P&L ekspertisən. P&L nəticəsini şərh et. Prime cost 65%-dən, food cost 32%-dən, rent 10%-dən yuxarıdırsa xəbərdarlıq ver.',
};

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  az: 'Azərbaycan dilində cavab ver.',
  en: 'Reply in English.',
  ru: 'Ответь на русском языке.',
  tr: 'Türkçe cevap ver.',
};

// ── Main action ─────────────────────────────────────────────────────

export async function getToolkitInsight(input: InsightInput): Promise<InsightResult> {
  // Validation
  if (!input.toolId || !input.locale || !input.result || typeof input.result !== 'object') {
    return { ok: false, error: 'validation' };
  }

  // Rate limit
  const allowed = await checkRate();
  if (!allowed) {
    return { ok: false, error: 'rate-limited' };
  }

  // API key check
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { ok: false, error: 'missing-key' };
  }

  // Build prompt
  const systemPrompt = TOOL_PROMPTS[input.toolId] ?? 'Sən HoReCa məsləhətçisisən. Hesablama nəticəsini şərh et.';
  const sanitized = sanitizeResult(input.result);
  const localeNote = LOCALE_INSTRUCTIONS[input.locale] ?? LOCALE_INSTRUCTIONS.az;

  const userPrompt = `Hesablama nəticəsi: ${sanitized}\n\n${localeNote} 2-3 cümlə praktik şərh ver. Rəqəm uydurma, yalnız verilən datanı şərh et.`;

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.4,
        max_tokens: 200,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      return { ok: false, error: 'ai-failed' };
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content?.trim();

    if (!text) {
      return { ok: false, error: 'ai-failed' };
    }

    await recordRun();
    return { ok: true, insight: text };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
