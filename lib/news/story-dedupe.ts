/**
 * @file lib/news/story-dedupe.ts
 * @purpose TASK-0549 (Doğan 14.10: «haberlere hep aynı haberler»): the same story arrives from several feeds
 *          (10 Minutes Hotel News + Hospitality Net carry the same press release; Turizm Gazetesi + 10min the
 *          same WTTC item). URL/exact-title checks miss them, so each copy went to the owner for approval.
 *          A story key = significant words (names, numbers, ≥ 4-letter words minus stop words); two titles are
 *          the same story when they share ≥ 3 key words covering ≥ 60% of the shorter title.
 */

const STOP = new Set(
  (
    'the and for with from into over that this have has will about after their more than says said new ' +
    'hotel hotels restaurant restaurants hospitality group brand brands launch launches launched announces announced ' +
    'appoints appointed opens opening open first year years plans plan its are was were been your our you ' +
    'otel otelləri restoran restoranlar ilə üçün olan olub edib edir artıb təqdim açılır yeni ' +
    'için olarak oldu yılı yıl yeni'
  ).split(' '),
);

export type StoryKey = { words: Set<string>; names: Set<string> };

/** Key words + «names» (capitalised words and numbers — companies, places, figures). */
export function storyKey(title: string): StoryKey {
  const raw = title.normalize('NFKC').replace(/[’'`´]s\b/g, '').split(/[^\p{L}\p{N}]+/u).filter(Boolean);
  const words = new Set<string>();
  const names = new Set<string>();
  for (const w of raw) {
    const lw = w.toLowerCase();
    const isNum = /^\d/.test(w);
    if (isNum || (lw.length >= 4 && !STOP.has(lw))) words.add(lw);
    if (isNum || (/^\p{Lu}/u.test(w) && !STOP.has(lw) && lw.length >= 3)) names.add(lw);
  }
  return { words, names };
}

/** Same story = ≥ 3 shared key words covering ≥ 60% of the shorter title AND at least one shared name/number. */
export function sameStory(a: StoryKey, b: StoryKey): boolean {
  if (a.words.size === 0 || b.words.size === 0) return false;
  let shared = 0;
  for (const w of a.words) if (b.words.has(w)) shared += 1;
  if (shared < 3 || shared / Math.min(a.words.size, b.words.size) < 0.6) return false;
  for (const n of a.names) if (b.names.has(n)) return true;
  return false;
}

/** Press-release wires: not journalism, mostly irrelevant expo/product notices. */
export const PRESS_RELEASE_SOURCE = /pr\s*newswire|globe\s*newswire|business\s*wire|einpresswire|prweb|accesswire|newsfile/i;
