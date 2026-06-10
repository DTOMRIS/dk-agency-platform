import { AI_MODELS } from '@/lib/ai-models';

const LANG_NAME: Record<string, string> = { ru: 'Russian', en: 'English', tr: 'Turkish' };

// Brand / proper nouns that must NOT be translated.
const KEEP = [
  'DK Agency',
  'KAZAN AI',
  'OCAQ',
  'AQTA',
  'ASAN',
  'KOBİA',
  'Sedd Rozeti',
  'Doğan Tomris',
];

function systemPrompt(lang: string): string {
  return `You are a professional translator for a HoReCa B2B platform. Translate the user's text from Azerbaijani into ${LANG_NAME[lang] ?? lang}.
Rules:
- Preserve ALL Markdown formatting, links, image refs and placeholders exactly (e.g. {name}, [text](url), ## headings).
- Mirror the source structure 1:1. Do NOT add, remove or renumber headings, list items, bullets or section numbers. If the source has no leading numbers ("1.", "2.") on its sections, the translation must not add them, and vice-versa.
- Do NOT translate these brand/proper names: ${KEEP.join(', ')}.
- Keep numbers, currency and dates intact.
- Output ONLY the translation — no notes, no quotes around it.`;
}

/**
 * Translate Azerbaijani text into ru/en/tr via DeepSeek (server-side).
 * Best-effort: returns null on any failure/timeout (caller keeps the AZ source).
 */
export async function translateText(
  text: string,
  targetLang: 'ru' | 'en' | 'tr'
): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || !text || !text.trim()) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 60_000);
  try {
    const res = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        model: AI_MODELS.deepseek.chat,
        temperature: 0.3,
        max_tokens: 8000,
        messages: [
          { role: 'system', content: systemPrompt(targetLang) },
          { role: 'user', content: text },
        ],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    return data.choices?.[0]?.message?.content?.trim() || null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
