/**
 * @file lib/news/category-covers.ts
 * @purpose TASK-0539 (owner 2026-10-11): when a news article has no image — or its feed image fails
 *          to load — the card, the detail page, the share preview (OG) and the Telegram post use the
 *          owner-made cover of the article's category. Files: public/news/covers/<category>.jpg
 *          (1600×800, from the owner's PNGs). The covers carry the AZ category name as artwork.
 */

export const NEWS_COVER_CATEGORIES = ['finance', 'operations', 'growth', 'market', 'technology'] as const;
export type NewsCoverCategory = (typeof NEWS_COVER_CATEGORIES)[number];

const SITE_URL = 'https://dkagency.com.tr';

function coverCategory(category?: string | null): NewsCoverCategory {
  const c = (category ?? '').toLowerCase();
  return (NEWS_COVER_CATEGORIES as readonly string[]).includes(c) ? (c as NewsCoverCategory) : 'market';
}

/** Site path of the category cover — unknown or empty category → «market» (the DB default). */
export function newsCategoryCover(category?: string | null): string {
  return `/news/covers/${coverCategory(category)}.jpg`;
}

/** Absolute URL — for OG/Twitter/JSON-LD and Telegram, which need a full address. */
export function newsCategoryCoverAbsolute(category?: string | null): string {
  return `${SITE_URL}${newsCategoryCover(category)}`;
}
