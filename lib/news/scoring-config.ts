/**
 * @file scoring-config.ts
 * @purpose News relevance scoring — SSOT for keyword weights and thresholds.
 * TASK-0401: Used by newsdata-fetch to filter low-quality signals before DB insert.
 */

/** Minimum score to be inserted into DB as draft. Below this = discarded. */
export const SCORE_THRESHOLD = 4;

/** Keyword → weight. Matched against title + description (case-insensitive). */
export const KEYWORD_WEIGHTS: Record<string, number> = {
  // HoReCa core
  restoran: 3,
  restaurant: 3,
  otel: 3,
  hotel: 3,
  kafe: 2,
  cafe: 2,
  franchise: 3,
  'food cost': 3,
  'qida təhlükəsizliyi': 3,
  'food safety': 3,
  horeca: 3,
  catering: 2,
  turizm: 2,
  tourism: 2,
  hospitality: 2,

  // Business signals
  sahibkar: 2,
  entrepreneur: 2,
  investisiya: 2,
  investment: 2,
  açılış: 2,
  opening: 2,
  bağlanma: 2,
  closure: 2,
  iflas: 2,
  bankruptcy: 2,

  // Azerbaijan / region
  bakı: 2,
  baku: 2,
  azərbaycan: 3,
  azerbaijan: 3,
  türkiye: 2,
  turkey: 2,

  // Negative signals (PR/spam)
  'press release': -2,
  sponsored: -3,
  advertisement: -3,
  reklam: -3,
};

/** Source domain quality. Unknown domains default to 0. */
export const SOURCE_WEIGHTS: Record<string, number> = {
  // Tier 1 — premium
  'reuters.com': 3,
  'bloomberg.com': 3,
  'ft.com': 3,

  // Tier 2 — quality trade
  'skift.com': 2,
  'restaurantbusinessonline.com': 2,
  'nation.restaurant': 2,
  'eater.com': 2,
  'hospitalitynet.org': 2,
  'hotelmanagement.net': 2,

  // Tier 3 — regional
  'report.az': 2,
  'apa.az': 1,
  'trend.az': 1,
  'azertag.az': 1,
  'hurriyet.com.tr': 1,
  'sozcu.com.tr': 1,

  // Spam / low quality
  'pr.com': -3,
  'prnewswire.com': -2,
  'businesswire.com': -2,
};

/**
 * Calculate relevance score for a news item.
 * @returns numeric score; >= SCORE_THRESHOLD means relevant enough to keep
 */
export function scoreNewsItem(title: string, description: string, sourceUrl: string): number {
  const text = `${title} ${description}`.toLowerCase();
  let score = 0;

  // Keyword matching
  for (const [keyword, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (text.includes(keyword.toLowerCase())) {
      score += weight;
    }
  }

  // Source domain weight
  try {
    const domain = new URL(sourceUrl).hostname.replace(/^www\./, '');
    for (const [pattern, weight] of Object.entries(SOURCE_WEIGHTS)) {
      if (domain.endsWith(pattern)) {
        score += weight;
        break;
      }
    }
  } catch {
    // Invalid URL — no domain bonus
  }

  return score;
}
