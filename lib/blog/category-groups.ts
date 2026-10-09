/**
 * @file category-groups.ts
 * @purpose Blog category keys are mixed in the data («maliyye» and «Maliyyə», «satis» and «Satış»).
 *          Normalise them in code (data stays untouched) and group them into the /blog tabs
 *          (owner decision 2026-10-09): Xərc = Maliyyə + Əməliyyat, Gəlir = Satış + Marketinq,
 *          Açılış = Açılış + Konsept + Hüquqi, Kadr = Kadr.
 * @task TASK-0514
 */

export type BlogCategoryKey =
  | 'maliyye'
  | 'emeliyyat'
  | 'satis'
  | 'marketinq'
  | 'acilis'
  | 'konsept'
  | 'huquqi'
  | 'kadr';

export type BlogTab = 'xerc' | 'gelir' | 'acilis' | 'kadr';

const FOLD: Record<string, string> = { ə: 'e', ı: 'i', ş: 's', ç: 'c', ğ: 'g', ö: 'o', ü: 'u' };

const KNOWN: ReadonlySet<string> = new Set([
  'maliyye',
  'emeliyyat',
  'satis',
  'marketinq',
  'acilis',
  'konsept',
  'huquqi',
  'kadr',
]);

/** «Maliyyə» / «maliyye» → «maliyye»; unknown values → null. */
export function normalizeBlogCategory(raw: string | null | undefined): BlogCategoryKey | null {
  if (!raw) return null;
  const key = raw
    .trim()
    .toLocaleLowerCase('az')
    .replace(/[əışçğöü]/g, (c) => FOLD[c] ?? c)
    .replace(/i̇/g, 'i');
  return KNOWN.has(key) ? (key as BlogCategoryKey) : null;
}

export const BLOG_CATEGORY_TAB: Record<BlogCategoryKey, BlogTab> = {
  maliyye: 'xerc',
  emeliyyat: 'xerc',
  satis: 'gelir',
  marketinq: 'gelir',
  acilis: 'acilis',
  konsept: 'acilis',
  huquqi: 'acilis',
  kadr: 'kadr',
};

/** blogDetail.cat* message key for a normalised category. */
export const BLOG_CATEGORY_MESSAGE: Record<BlogCategoryKey, string> = {
  maliyye: 'catMaliyye',
  emeliyyat: 'catEmeliyyat',
  satis: 'catSatis',
  marketinq: 'catMarketinq',
  acilis: 'catAcilis',
  konsept: 'catKonsept',
  huquqi: 'catHuquqi',
  kadr: 'catKadr',
};
