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

CRITICAL: You MUST actually translate the text into ${LANG_NAME[lang] ?? lang}. Do NOT copy the Azerbaijani source text. The output MUST be written entirely in ${LANG_NAME[lang] ?? lang}. If the output contains Azerbaijani-specific characters (ə, ö, ü, ğ, ı, ş, ç) that are not valid in ${LANG_NAME[lang] ?? lang}, you have FAILED — re-do the translation.

Rules:
- Preserve ALL Markdown formatting, links, image refs and placeholders exactly (e.g. {name}, [text](url), ## headings).
- Mirror the source structure 1:1. Do NOT add, remove or renumber headings, list items, bullets or section numbers. If the source has no leading numbers ("1.", "2.") on its sections, the translation must not add them, and vice-versa.
- Do NOT translate these brand/proper names: ${KEEP.join(', ')}.
- Keep numbers, currency and dates intact.
- Output ONLY the translation — no notes, no quotes around it.`;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;
// Chunk threshold: texts above this char count are split by markdown headings
const CHUNK_CHAR_THRESHOLD = 6000;

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Split long markdown by ## headings so each chunk fits token limits.
 * Returns array of chunks. Short texts return single-element array.
 */
function chunkByHeadings(text: string): string[] {
  if (text.length <= CHUNK_CHAR_THRESHOLD) return [text];

  const lines = text.split('\n');
  const chunks: string[] = [];
  let current: string[] = [];

  for (const line of lines) {
    if (/^#{1,3}\s/.test(line) && current.length > 0) {
      const block = current.join('\n').trim();
      if (block) chunks.push(block);
      current = [line];
    } else {
      current.push(line);
    }
  }
  const last = current.join('\n').trim();
  if (last) chunks.push(last);

  return chunks.length > 0 ? chunks : [text];
}

/**
 * Single DeepSeek translation call with retry.
 * Returns translated text or null on exhausted retries.
 */
async function callDeepSeek(
  text: string,
  targetLang: string,
  apiKey: string,
): Promise<string | null> {
  const estimatedTokens = Math.ceil(text.length / 2);
  const maxTokens = Math.max(8000, Math.min(estimatedTokens * 2, 32000));

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          model: AI_MODELS.deepseek.chat,
          temperature: 0.3,
          max_tokens: maxTokens,
          messages: [
            { role: 'system', content: systemPrompt(targetLang) },
            { role: 'user', content: text },
          ],
        }),
      });

      if (res.status === 429 || res.status >= 500) {
        console.error(`[translate] DeepSeek ${res.status} on attempt ${attempt}/${MAX_RETRIES} for ${targetLang} (${text.length} chars)`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return null;
      }

      if (!res.ok) {
        console.error(`[translate] DeepSeek ${res.status} ${res.statusText} for ${targetLang}`);
        return null;
      }

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string }; finish_reason?: string }>;
      };
      const content = data.choices?.[0]?.message?.content?.trim();
      const finishReason = data.choices?.[0]?.finish_reason;

      if (finishReason === 'length') {
        console.error(`[translate] DeepSeek output TRUNCATED for ${targetLang} (${text.length} chars input, maxTokens=${maxTokens})`);
      }

      if (!content) {
        console.error(`[translate] DeepSeek returned empty content for ${targetLang} attempt ${attempt}`);
        if (attempt < MAX_RETRIES) {
          await sleep(RETRY_DELAY_MS * attempt);
          continue;
        }
        return null;
      }

      return content;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[translate] DeepSeek error attempt ${attempt}/${MAX_RETRIES} for ${targetLang}: ${msg}`);
      if (attempt < MAX_RETRIES) {
        await sleep(RETRY_DELAY_MS * attempt);
        continue;
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
  return null;
}

/**
 * Translate Azerbaijani text into ru/en/tr via DeepSeek (server-side).
 * Retries up to 3x. Chunks long content by markdown headings.
 * Returns null on failure (caller must log/flag — silent swallow FORBIDDEN).
 */
export async function translateText(
  text: string,
  targetLang: 'ru' | 'en' | 'tr'
): Promise<string | null> {
  const key = process.env.DEEPSEEK_API_KEY;
  if (!key || !text || !text.trim()) return null;

  const chunks = chunkByHeadings(text);

  if (chunks.length === 1) {
    return callDeepSeek(text, targetLang, key);
  }

  // Translate chunks independently, rejoin
  console.log(`[translate] Chunked ${targetLang}: ${chunks.length} chunks (${text.length} chars total)`);
  const translated: string[] = [];
  for (const chunk of chunks) {
    const result = await callDeepSeek(chunk, targetLang, key);
    if (!result) {
      console.error(`[translate] Chunk failed for ${targetLang}, aborting entire text`);
      return null; // Partial translation = no translation. Don't mix languages.
    }
    translated.push(result);
  }
  return translated.join('\n\n');
}
