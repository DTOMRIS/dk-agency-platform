/**
 * @file scoring-config.ts
 * @purpose News relevance scoring — SSOT for keyword weights, topic blocklist and thresholds.
 * TASK-0401: Used by newsdata-fetch to filter low-quality signals before DB insert.
 *
 * TASK-0478 (scope): matching is now word-based (Unicode-aware, Turkish/AZ suffixes allowed) —
 * the old `text.includes('otel')` matched inside "hotel", so any story mentioning a hotel
 * (cricket, OPEC, real-estate tokenisation) passed. An item now needs at least one real HoReCa
 * term, an off-topic word in the TITLE rejects it outright, and AI / hospitality-tech terms are
 * rewarded and route the item to the "technology" category.
 */

/** Minimum score to be inserted into DB as draft. Below this = discarded. */
export const SCORE_THRESHOLD = 5;

/** Core HoReCa vocabulary (EN / TR / AZ / RU). At least one must match, or the item scores 0. */
export const CORE_TERMS: Record<string, number> = {
  restaurant: 3,
  restoran: 3,
  ресторан: 3,
  hotel: 3,
  otel: 3,
  mehmanxana: 3,
  отель: 3,
  гостиниц: 3,
  hospitality: 3,
  horeca: 3,
  хорека: 3,
  foodservice: 3,
  'food service': 3,
  'qonaq evi': 3,
  pansiyon: 3,
  'guest house': 3,
  hostel: 2,
  cafe: 2,
  café: 2,
  kafe: 2,
  кафе: 2,
  catering: 2,
  'ictimai iaşə': 3,
  общепит: 3,
  franchise: 3,
  franchising: 3,
  françayz: 3,
  франшиз: 3,
  'food cost': 3,
  'food safety': 3,
  'food waste': 3,
  'qida təhlükəsizliyi': 3,
  'gıda güvenliği': 3,
  'gıda israfı': 3,
  menyu: 2,
  menü: 2,
  menu: 2,
  qsr: 3,
  'quick service': 3,
  revpar: 3,
  'revenue management': 3,
  'online travel agency': 2,
  ota: 2,
  'direct booking': 2,
  'front desk': 2,
  konaklama: 3,
  'yiyecek içecek': 3,
  aqta: 3,
};

/** Supporting signals — only count when a core term is present. */
export const KEYWORD_WEIGHTS: Record<string, number> = {
  // AI / hospitality technology (TASK-0478)
  ai: 2,
  'artificial intelligence': 2,
  'yapay zeka': 2,
  'süni intellekt': 2,
  'искусственный интеллект': 2,
  agentic: 2,
  chatbot: 2,
  'voice ordering': 2,
  'voice agent': 2,
  automation: 2,
  robot: 2,
  kiosk: 2,
  pos: 2,
  'dynamic pricing': 2,
  'demand forecasting': 2,
  'kitchen automation': 2,
  pms: 2,
  concierge: 2,

  // Business signals
  tourism: 1,
  turizm: 1,
  туризм: 1,
  sahibkar: 2,
  entrepreneur: 1,
  investisiya: 1,
  investment: 1,
  yatırım: 1,
  açılış: 2,
  opening: 1,
  bağlanma: 2,
  closure: 2,
  iflas: 2,
  bankruptcy: 2,
  occupancy: 2,
  doluluk: 2,

  // Azerbaijan / region
  bakı: 2,
  baku: 2,
  баку: 2,
  azərbaycan: 2,
  azerbaijan: 2,
  азербайджан: 2,
  türkiye: 1,
  turkey: 1,

  // Negative signals (PR/spam)
  'press release': -2,
  sponsored: -3,
  advertisement: -3,
  reklam: -3,
};

/** AI / tech vocabulary — an item matching any of these is categorised as "technology". */
export const TECH_TERMS = [
  'ai',
  'artificial intelligence',
  'yapay zeka',
  'süni intellekt',
  'искусственный интеллект',
  'agentic',
  'chatbot',
  'voice ordering',
  'voice agent',
  'automation',
  'robot',
  'kiosk',
  'pos',
  'dynamic pricing',
  'demand forecasting',
  'kitchen automation',
  'pms',
];

/**
 * Off-topic vocabulary. In the TITLE → item rejected; in the description → −4.
 * Sports, politics/war, energy markets, crypto, general real estate, crime.
 */
export const BLOCKED_TERMS = [
  // sports
  'football',
  'soccer',
  'cricket',
  'league',
  'champions league',
  'premier league',
  'tennis',
  'olympic',
  'futbol',
  'maç',
  'lig',
  'matç',
  'çempionat',
  'футбол',
  'матч',
  'чемпионат',
  'крикет',
  // politics / war
  'election',
  'missile',
  'sanctions',
  'ceasefire',
  'military',
  'seçim',
  'füze',
  'seçki',
  'raket',
  'выборы',
  'ракета',
  'санкции',
  // energy / commodities
  'opec',
  'oil price',
  'crude',
  'natural gas',
  'petrol',
  'doğalgaz',
  'neft',
  'нефть',
  // crypto / securities
  'bitcoin',
  'crypto',
  'cryptocurrency',
  'tokenisation',
  'tokenization',
  'tokenised',
  'tokenized',
  'kripto',
  'крипто',
  // general real estate
  'real estate',
  'mortgage',
  'housing market',
  'konut',
  'daşınmaz əmlak',
  'недвижимость',
  // crime
  'arrested',
  'gözaltı',
  'tutuklandı',
];

/** Source domain quality. Unknown domains default to 0. */
export const SOURCE_WEIGHTS: Record<string, number> = {
  // Tier 1 — premium
  'reuters.com': 3,
  'bloomberg.com': 3,
  'ft.com': 3,

  // Tier 2 — hospitality / restaurant trade press (verified feeds, 2026-10-04 research)
  'skift.com': 3,
  'hospitalitynet.org': 3,
  'restaurantdive.com': 3,
  'hoteldive.com': 3,
  'restauranttechnologynews.com': 3,
  'hoteltechnologynews.com': 3,
  'nrn.com': 2,
  'restaurantbusinessonline.com': 2,
  'nation.restaurant': 2,
  'hotelmanagement.net': 2,
  'foodondemand.com': 2,
  'hospitalityinsights.ehl.edu': 2,
  'eater.com': 2,

  // Tier 3 — regional
  'report.az': 2,
  'apa.az': 1,
  'trend.az': 1,
  'azertag.az': 1,
  'turizmguncel.com': 2,
  'turizmajansi.com': 2,
  'hurriyet.com.tr': 1,
  'sozcu.com.tr': 1,

  // Spam / low quality
  'pr.com': -3,
  'prnewswire.com': -2,
  'businesswire.com': -2,
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const matcherCache = new Map<string, RegExp>();

/**
 * Word-start match, Unicode-aware. Up to 5 trailing letters allow plurals/suffixes
 * ("hotels", "restoranlar", "otelləri", "ресторанов"), but a term never matches inside another
 * word ("otel" does not match "hotel"; "ai" does not match "said").
 */
function hasTerm(text: string, term: string): boolean {
  let re = matcherCache.get(term);
  if (!re) {
    const suffix = term.length <= 3 ? '' : '\\p{L}{0,5}';
    re = new RegExp(`(?<![\\p{L}\\p{N}])${escapeRegex(term)}${suffix}(?![\\p{L}\\p{N}])`, 'iu');
    matcherCache.set(term, re);
  }
  return re.test(text);
}

/** True when the text (title) contains an off-topic term. */
export function isBlockedTopic(text: string): boolean {
  return BLOCKED_TERMS.some((term) => hasTerm(text, term));
}

/** True when the text is about AI / hospitality technology. */
export function isTechTopic(text: string): boolean {
  return TECH_TERMS.some((term) => hasTerm(text, term));
}

/**
 * Calculate relevance score for a news item.
 * @returns numeric score; >= SCORE_THRESHOLD means relevant enough to keep
 */
export function scoreNewsItem(title: string, description: string, sourceUrl: string): number {
  const cleanTitle = (title || '').normalize('NFC');
  const text = `${cleanTitle} ${description || ''}`.normalize('NFC');

  // Off-topic in the headline: never relevant, whatever else it mentions.
  if (isBlockedTopic(cleanTitle)) return 0;

  // Must actually be about HoReCa.
  let core = 0;
  for (const [term, weight] of Object.entries(CORE_TERMS)) {
    if (hasTerm(text, term)) core += weight;
  }
  if (core === 0) return 0;

  let score = core;
  for (const [term, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (hasTerm(text, term)) score += weight;
  }
  if (isBlockedTopic(description || '')) score -= 4;

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
