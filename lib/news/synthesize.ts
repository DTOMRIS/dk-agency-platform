/**
 * @file synthesize.ts
 * @purpose DeepSeek Model-B — fetched signal → original DK HoReCa analysis (AZ).
 * TASK-0402: Called by `npm run news:synthesize` (manual) and later by cron (TASK-0403).
 *
 * NOT a copy/paraphrase. Creates original DK analysis from facts only.
 * Toolkit matching + translation happen at approve time (existing flow, NOT rebuilt here).
 */

import { and, eq, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { AI_MODELS } from '@/lib/ai-models';

/** Words that must never appear in DK output */
const FORBIDDEN_TERMS = [
  'CRM', 'Pipeline', 'Agentlik', 'Holdinq', 'Tezliklə',
  'agentlik', 'holdinq', 'tezliklə', 'pipeline', 'crm',
];

interface SynthesisResult {
  title_az: string;
  body_az: string;
  publishable: boolean;
  reason: string;
}

const SYSTEM_PROMPT = `Sən DK Agency HoReCa sektor analitikisən. Sənə xəbər SİQNALI verilir.

QADAĞAN:
- Mənbəni cümlə-cümlə təkrar/yaxın parafraz etmə.
- Orijinal mənbənin strukturunu kopyalama.
- Mənbə şəkli/sitatı istifadə etmə.
- Bu sözləri HEÇVAXT istifadə etmə: CRM, Pipeline, Agentlik, Holdinq, Tezliklə.
- Reklam dili istifadə etmə.

VƏZİFƏ: Yalnız FAKTLARı götür, DK dili ilə TAM ORİJİNAL qısa analiz yaz.
Hər bölmə ### başlıq ilə başlamalıdır. Struktur:

### Nə baş verdi
2-3 cümlə ilə nə baş verdiyini öz sözünlə izah et.

### Niyə önəmlidir
Bunun sektor kontekstində niyə önəmli olduğunu yaz.

### Azərbaycan HoReCa üçün dərs
Praktik dərs çıxar.

### Risk
Risk və ya diqqət ediləcək məqamları qeyd et (yoxdursa bu bölməni yaz: "Bu məqamda ciddi risk görünmür.").

### DK baxışı
1 kəskin cümlə ilə bitir.

QAYDA:
- Azərbaycan dilində yaz (AZ).
- Cəmi 150-300 söz. Axıcı, jurnalist üslubunda.
- Bölmə başlıqları YALNIZ ### istifadə et (## və # QADAĞAN).
- **Bold** yalnız şirkət/brend adları üçün istifadə et.
- Zəif/irrelevant siqnal olsa publishable:false qaytar.

ÇIXIŞ JSON:
{"title_az": "string", "body_az": "string (### headings + paragraphs)", "publishable": true/false, "reason": "string"}`;

/** Extract first real content line (skip markdown headings/bold labels) */
function extractSummary(body: string, fallback: string): string {
  const lines = body.split('\n').map((l) => l.trim()).filter(Boolean);
  for (const line of lines) {
    // Skip markdown headings and bold-only labels like "**Nə baş verdi:**"
    if (/^#{1,3}\s/.test(line)) continue;
    if (/^\*\*[^*]+:\*\*$/.test(line)) continue;
    // Strip leading bold label if line has content after it
    const cleaned = line.replace(/^\*\*[^*]+:\*\*\s*/, '').trim();
    if (cleaned.length > 20) return cleaned.slice(0, 300);
  }
  return fallback;
}

function containsForbidden(text: string): string | null {
  for (const term of FORBIDDEN_TERMS) {
    if (text.includes(term)) return term;
  }
  return null;
}

export interface SynthesizeResult {
  synthesized: number;
  skipped: number;
  unpublishable: number;
  errors: string[];
}

/**
 * Process fetched signals: send to DeepSeek for original DK analysis.
 * Only processes articles with origin='newsdata', status='fetched', no contentAz.
 */
export async function synthesizeFetchedNews(limit = 10): Promise<SynthesizeResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { synthesized: 0, skipped: 0, unpublishable: 0, errors: ['DEEPSEEK_API_KEY not set'] };
  }
  if (!db) {
    return { synthesized: 0, skipped: 0, unpublishable: 0, errors: ['Database not available'] };
  }

  const result: SynthesizeResult = { synthesized: 0, skipped: 0, unpublishable: 0, errors: [] };

  // Get fetched signals without content
  const pending = await db
    .select({
      id: newsArticles.id,
      title: newsArticles.title,
      summary: newsArticles.summary,
      externalUrl: newsArticles.externalUrl,
    })
    .from(newsArticles)
    .where(
      and(
        eq(newsArticles.origin, 'newsdata'),
        eq(newsArticles.status, 'fetched'),
        isNull(newsArticles.contentAz),
      ),
    )
    .limit(limit);

  if (!pending.length) {
    result.skipped = 0;
    return result;
  }

  for (const article of pending) {
    const signal = `Başlıq: ${article.title}\nXülasə: ${article.summary || 'Yoxdur'}\nMənbə URL: ${article.externalUrl}`;

    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODELS.deepseek.chat,
          temperature: 0.3,
          max_tokens: 1200,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            { role: 'user', content: signal },
          ],
        }),
        signal: AbortSignal.timeout(30_000),
      });

      if (!res.ok) {
        result.errors.push(`[deepseek] ${res.status} for article #${article.id}`);
        continue;
      }

      const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
      const raw = data.choices?.[0]?.message?.content || '{}';

      let parsed: SynthesisResult;
      try {
        parsed = JSON.parse(raw) as SynthesisResult;
      } catch {
        result.errors.push(`[parse] Invalid JSON for article #${article.id}`);
        continue;
      }

      // Validate
      if (!parsed.title_az || !parsed.body_az) {
        result.errors.push(`[validate] Empty title/body for article #${article.id}`);
        continue;
      }

      // Forbidden terms guard
      const forbidden = containsForbidden(parsed.title_az) || containsForbidden(parsed.body_az);
      if (forbidden) {
        result.errors.push(`[forbidden] Term "${forbidden}" in output for article #${article.id}`);
        continue;
      }

      if (!parsed.publishable) {
        // Mark as processed but don't write content — admin can review manually
        await db
          .update(newsArticles)
          .set({
            origin: 'synthesized',
            seoDescription: `[unpublishable] ${parsed.reason?.slice(0, 150) || 'Zəif siqnal'}`,
          })
          .where(eq(newsArticles.id, article.id));
        result.unpublishable++;
        continue;
      }

      // Write synthesis
      await db
        .update(newsArticles)
        .set({
          titleAz: parsed.title_az,
          contentAz: parsed.body_az,
          summaryAz: extractSummary(parsed.body_az, parsed.title_az),
          origin: 'synthesized',
          status: 'translated',
        })
        .where(eq(newsArticles.id, article.id));

      result.synthesized++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`[synthesis] ${msg.slice(0, 200)} for article #${article.id}`);
    }
  }

  return result;
}
