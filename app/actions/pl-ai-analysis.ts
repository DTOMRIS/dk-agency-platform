'use server';

import { cookies } from 'next/headers';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { checkToolAccess, logToolRun } from '@/lib/marketing-gating';
import { AI_MODELS } from '@/lib/ai-models';

export type PLPeriod = 'weekly' | 'monthly' | 'yearly';

export interface PLAnalysisInput {
  period: PLPeriod;
  totalSales: number;
  cogs: number;
  foodCostPercent: number;
  labor: number;
  laborPercent: number;
  primeCost: number;
  primeCostPercent: number;
  overhead: number;
  netProfit: number;
  netProfitPercent: number;
  breakevenSales: number;
}

export interface PLAnalysisResult {
  ok: boolean;
  analysis?: string;
  error?: 'unauthorized' | 'rate-limited' | 'validation' | 'missing-key' | 'ai-failed';
}

const RATE_COOKIE = 'dk_pl_ai_runs';
const WINDOW_MS = 10 * 60 * 1000;
const MAX_RUNS = 3;

function sanitizeNumber(value: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric < 0) return null;
  return Math.round(numeric * 100) / 100;
}

function sanitizeSignedNumber(value: number) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;
  return Math.round(numeric * 100) / 100;
}

function sanitizeInput(input: PLAnalysisInput): PLAnalysisInput | null {
  if (!['weekly', 'monthly', 'yearly'].includes(input.period)) return null;
  const totalSales = sanitizeNumber(input.totalSales);
  if (!totalSales || totalSales <= 0) return null;

  const sanitized = {
    period: input.period,
    totalSales,
    cogs: sanitizeNumber(input.cogs),
    foodCostPercent: sanitizeNumber(input.foodCostPercent),
    labor: sanitizeNumber(input.labor),
    laborPercent: sanitizeNumber(input.laborPercent),
    primeCost: sanitizeNumber(input.primeCost),
    primeCostPercent: sanitizeNumber(input.primeCostPercent),
    overhead: sanitizeNumber(input.overhead),
    netProfit: sanitizeSignedNumber(input.netProfit),
    netProfitPercent: sanitizeSignedNumber(input.netProfitPercent),
    breakevenSales: sanitizeNumber(input.breakevenSales),
  };

  if (Object.values(sanitized).some((value) => value === null)) return null;
  return sanitized as PLAnalysisInput;
}

async function checkRateLimit(userId: number): Promise<boolean> {
  const store = await cookies();
  const now = Date.now();
  const raw = store.get(RATE_COOKIE)?.value;
  let records: Array<{ userId: number; at: number }> = [];

  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Array<{ userId: number; at: number }>;
      if (Array.isArray(parsed)) {
        records = parsed.filter((record) =>
          Number.isInteger(record.userId) &&
          Number.isFinite(record.at) &&
          now - record.at < WINDOW_MS
        );
      }
    } catch {
      records = [];
    }
  }

  if (records.filter((record) => record.userId === userId).length >= MAX_RUNS) return false;

  records.push({ userId, at: now });
  store.set(RATE_COOKIE, JSON.stringify(records).slice(0, 1800), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: WINDOW_MS / 1000,
  });
  return true;
}

function buildPrompt(input: PLAnalysisInput) {
  // TASK-0523: plain Azerbaijani labels (no COGS / Prime Cost / Overhead / BEP jargon in the answer).
  return `Restoranın gəlir-xərc rəqəmləri (${input.period === 'monthly' ? 'aylıq' : input.period === 'weekly' ? 'həftəlik' : 'illik'}):
- Satış: ${input.totalSales} AZN
- Yemək və qablaşdırma xərci: ${input.cogs} AZN (${input.foodCostPercent}%)
- İşçi xərci: ${input.labor} AZN (${input.laborPercent}%)
- Yemək + işçi birlikdə: ${input.primeCost} AZN (${input.primeCostPercent}%)
- Digər sabit xərclər (icarə, kommunal, reklam və s.): ${input.overhead} AZN
- Xalis mənfəət: ${input.netProfit} AZN (${input.netProfitPercent}%)
- Başabaş satış (nə qazanc, nə zərər): ${input.breakevenSales} AZN

Başabaş belə hesablanıb: yalnız yemək və qablaşdırma satışla artır; işçi, icarə və digərləri hər halda ödənir.
Təxmini ölçülər: yemək xərci ≤30%, işçi ≤30%, yemək + işçi ≤60%, xalis mənfəət ≥5%.

Cavabı sadə Azərbaycan dilində yaz, ingiliscə termin işlətmə. Aşağıdakıları ver:
1. ÜMUMİ VƏZİYYƏT: rəqəmlər sağlamdırmı? 3-4 cümlə
2. ƏSAS PROBLEMLƏR: ən böyük 2-3 problem, konkret faiz fərqi ilə
3. BU AY EDİLƏCƏKLƏR: 3-5 praktik addım
4. BAŞABAŞ: cari satış başabaşdan nə qədər uzaqdır, nə etmək lazımdır
5. 3 AYLIQ HƏDƏF: addımlar tətbiq olunarsa xalis mənfəət nə qədər arta bilər — ehtiyatlı hesabla`;
}

export async function getPLAIAnalysis(input: PLAnalysisInput): Promise<PLAnalysisResult> {
  const auth = await getAuthFromCookie();
  if (!auth) return { ok: false, error: 'unauthorized' };

  const access = await checkToolAccess(auth.userId, 'pl-simulyatoru', auth.role);
  if (!access.allowed) return { ok: false, error: 'unauthorized' };

  const sanitized = sanitizeInput(input);
  if (!sanitized) return { ok: false, error: 'validation' };

  const allowed = await checkRateLimit(auth.userId);
  if (!allowed) return { ok: false, error: 'rate-limited' };

  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { ok: false, error: 'missing-key' };

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.35,
        max_tokens: 1300,
        messages: [
          {
            role: 'system',
            content: 'Sən Azərbaycan restoranları üçün maliyyə məsləhətçisisən. 2026 restoran sənayesi benchmarklarını bilirsən. Cavabın praktik, konkret, Azərbaycan dilində olsun. Xarici termin işlədəndə yanında Azərbaycan dilində izah ver.',
          },
          { role: 'user', content: buildPrompt(sanitized) },
        ],
      }),
      cache: 'no-store',
      signal: AbortSignal.timeout(30_000),
    });

    if (!response.ok) return { ok: false, error: 'ai-failed' };

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const analysis = data.choices?.[0]?.message?.content?.trim();
    if (!analysis) return { ok: false, error: 'ai-failed' };
    await logToolRun({ userId: auth.userId, toolSlug: 'pl-simulyatoru', input: { ...sanitized }, status: 'success' });
    return { ok: true, analysis: analysis.slice(0, 5000) };
  } catch {
    return { ok: false, error: 'ai-failed' };
  }
}
