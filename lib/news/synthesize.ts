/**
 * @file synthesize.ts
 * @purpose DeepSeek Model-B — fetched signal → original DK HoReCa analysis (AZ).
 * TASK-0402: Called by `npm run news:synthesize` (manual) and later by cron (TASK-0403).
 *
 * NOT a copy/paraphrase. Creates original DK analysis from facts only.
 * Toolkit matching + translation happen at approve time (existing flow, NOT rebuilt here).
 */

import { and, desc, eq, inArray, isNull } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { AI_MODELS } from '@/lib/ai-models';
import { sendNewsForApproval } from '@/lib/telegram/news-approval';
import { slugifyAz } from '@/lib/utils/slugify-az';

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

### Bu həftə 1 addım
Azərbaycandakı restoran, kafe, otel və ya qonaq evi sahibinin bu həftə edə biləcəyi 1 konkret, ölçülə bilən, pulsuz və ya ucuz addım (1-2 cümlə).

### DK baxışı
1 kəskin cümlə ilə bitir.

QAYDA:
- Azərbaycan dilində yaz (AZ).
- Cəmi 180-320 söz. Axıcı, jurnalist üslubunda.
- Bölmə başlıqları YALNIZ ### istifadə et (## və # QADAĞAN).
- **Bold** yalnız şirkət/brend adları üçün istifadə et.
- Rəqəm şirkətin öz iddiasıdırsa (press-reliz, vendor), bunu açıq yaz: "şirkətin açıqlamasına görə".

UYĞUNLUQ (publishable):
- publishable:true — restoran, kafe, otel, qonaq evi, catering, françayz, turizm biznesi və ya onların texnologiyası/AI-ı haqqında xəbər. DÜNYA xəbərləri də uyğundur (məs. McDonald's, Hilton, Skift, AI agentləri, dinamik qiymət), əgər Azərbaycan HoReCa sahibkarı üçün dərs çıxarmaq mümkündürsə.
- publishable:false — yalnız bu hallarda: mövzu otelçilik/restoran biznesi deyil (idman, siyasət, kriminal, şou-biznes, ümumi iqtisadiyyat), ya da siqnalda yazmaq üçün fakt yoxdur. "reason" sahəsində qısa səbəb yaz.

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
 * Only processes articles with origin='newsdata' or 'rss', status='fetched', no contentAz.
 */
export async function synthesizeFetchedNews(limit = 15): Promise<SynthesizeResult> {
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
        // TASK-0480: trade-press RSS drafts go through the same synthesis
        inArray(newsArticles.origin, ['newsdata', 'rss']),
        eq(newsArticles.status, 'fetched'),
        isNull(newsArticles.contentAz),
      ),
    )
    // TASK-0476: newest first — old stuck rows used to fill every batch and starve fresh news.
    .orderBy(desc(newsArticles.id))
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
          max_tokens: 2500, // TASK-0482: 1200 truncated AZ analyses mid-JSON → [parse] errors
          // TASK-0488: v4-flash "thinking" ate the whole budget (5/8 measured: reasoning 1600-2500
          // tokens, finish_reason=length → empty/cut JSON). Off: 8/8 valid, ~3x fewer tokens.
          thinking: { type: 'disabled' },
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
        // TASK-0482: tolerate ```json fences / text around the object.
        const start = raw.indexOf('{');
        const end = raw.lastIndexOf('}');
        parsed = JSON.parse(start >= 0 && end > start ? raw.slice(start, end + 1) : raw) as SynthesisResult;
      } catch {
        result.errors.push(`[parse] Invalid JSON for article #${article.id}`);
        continue;
      }

      // TASK-0476: a weak signal ("publishable": false) comes back WITHOUT title/body. Checking
      // title/body first sent it to [validate] and it was retried on every run forever. Mark it
      // processed first; also mark it when the model returns neither content nor a verdict.
      if (parsed.publishable === false || (!parsed.title_az && !parsed.body_az)) {
        // Mark as processed but don't write content — admin can review manually
        await db
          .update(newsArticles)
          .set({
            origin: 'synthesized',
            // seo_description is varchar(160): the old `[unpublishable] ` + 150 chars overflowed it.
            seoDescription: `[unpublishable] ${parsed.reason || 'Zəif siqnal'}`.slice(0, 160),
          })
          .where(eq(newsArticles.id, article.id));
        result.unpublishable++;
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

      // Write synthesis
      await db
        .update(newsArticles)
        .set({
          titleAz: parsed.title_az,
          // TASK-0478: public URL from the AZ headline (not the foreign source title) + id = unique.
          slug: `${slugifyAz(parsed.title_az).slice(0, 80) || 'xeber'}-${article.id}`,
          contentAz: parsed.body_az,
          summaryAz: extractSummary(parsed.body_az, parsed.title_az),
          origin: 'synthesized',
          status: 'translated',
        })
        .where(eq(newsArticles.id, article.id));

      result.synthesized++;

      // TASK-0477: ask the owner on Telegram (✅ Yayınla / ❌ Rədd et). No-op without TELEGRAM_* env.
      await sendNewsForApproval({
        id: article.id,
        titleAz: parsed.title_az,
        contentAz: parsed.body_az,
        externalUrl: article.externalUrl,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`[synthesis] ${msg.slice(0, 200)} for article #${article.id}`);
    }
  }

  return result;
}
