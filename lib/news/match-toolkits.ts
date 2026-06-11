/**
 * @file match-toolkits.ts
 * @purpose DeepSeek ilə xəbər → toolkit eşləşdirmə (JSON mode)
 */

import { AI_MODELS } from '@/lib/ai-models';
import { buildToolkitPromptCatalog, validateToolkitSlugs } from './toolkit-catalog';

interface MatchResult {
  toolkits: string[];
  blogSlug: string | null;
  error?: string;
}

/**
 * DeepSeek-dən xəbər content-inə uyğun 1-3 toolkit seçdirir.
 * JSON mode istifadə edir — parse xətası ~0.
 */
export async function matchToolkitsForArticle(
  titleAz: string,
  summaryAz: string,
  contentAz: string | null,
): Promise<MatchResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) return { toolkits: [], blogSlug: null, error: 'no-api-key' };

  const catalog = buildToolkitPromptCatalog();
  const articleText = `Başlıq: ${titleAz}\nXülasə: ${summaryAz}\n${contentAz ? `Məzmun: ${contentAz.slice(0, 1000)}` : ''}`;

  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.1,
        max_tokens: 200,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content: `Sən HoReCa sektoru üzrə ekspertsan. Sənə bir xəbər məqaləsi veriləcək. Aşağıdakı toolkit kataloqunda hər alətin ID-si və qısa təsviri var. Bu xəbərlə ən çox əlaqəli 1-3 toolkit seç. Əgər heç biri uyğun deyilsə boş array qaytaar.

TOOLKIT KATALOQU:
${catalog}

CAVAB FORMATI (yalnız JSON):
{"toolkits": ["slug1", "slug2"], "blogSlug": null}

QAYDALAR:
- Yalnız kataloqdakı ID-lərdən seç. Uydurma ID yazma.
- Ən çox 3 toolkit. Uyğun yoxdursa boş array.
- blogSlug hələlik null (gələcəkdə əlavə ediləcək).`,
          },
          { role: 'user', content: articleText },
        ],
      }),
    });

    if (!res.ok) {
      return { toolkits: [], blogSlug: null, error: `deepseek-${res.status}` };
    }

    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const raw = data.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(raw) as { toolkits?: unknown; blogSlug?: unknown };

    return {
      toolkits: validateToolkitSlugs(parsed.toolkits),
      blogSlug: typeof parsed.blogSlug === 'string' ? parsed.blogSlug : null,
    };
  } catch (e) {
    return { toolkits: [], blogSlug: null, error: String(e).slice(0, 200) };
  }
}
