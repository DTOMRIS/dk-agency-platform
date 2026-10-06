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
 *
 * TASK-0491 (Azerbaijani coverage): text is case-folded with Turkish/Azerbaijani rules before
 * matching ("İCTİMAİ İAŞƏ" → "ictimai iaşə", "BAKI" → "bakı"); long terms allow up to 10 suffix
 * letters ("restoranlarımızda", "restoranlardaki"); AZ/TR/RU core vocabulary added (iaşə,
 * yeməkxana, şadlıq sarayı, lokanta, turizm…); `lig` / `neft` block only as whole words.
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
  'qonaq ev': 3,
  pansiyon: 3,
  'guest house': 3,
  hostel: 2,
  cafe: 2,
  café: 2,
  kafe: 3,
  кафе: 2,
  catering: 2,
  'ictimai iaşə': 3,
  общепит: 3,
  'общественное питание': 3,
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
  'yeme içme': 3,
  aqta: 3,

  // TASK-0491: Azerbaijani / Turkish / Russian sector vocabulary
  iaşə: 3,
  aiiqa: 3,
  yeməkxana: 3,
  aşxana: 3,
  'şadlıq saray': 3,
  'restoran şəbəkə': 3,
  'restoran zinciri': 3,
  qonaqpərvərlik: 3,
  lokanta: 3,
  otelçilik: 3,
  otelcilik: 3,
  'turizm sektoru': 3,
  'dövlət turizm agentliyi': 3,
  dta: 2,
  turoperator: 2,
  'tur operatoru': 2,
  turist: 2,
  çayxana: 2,
  bufet: 2,
  büfe: 2,
  pastaxana: 2,
  pastane: 2,
  şirniyyat: 2,
  qastronomiya: 2,
  gastronomi: 2,
  gastronomy: 2,
  // TASK-0494: "Габала … гастрономическое направление" scored 0 — RU/AZ stems were missing.
  гастроном: 2,
  qastronom: 2,
  кулинар: 2,
  kulinar: 2,
  гостеприимств: 3,
  турист: 2,
  // Tourism is the sector's demand side — core (TASK-0491), was +1 supporting.
  turizm: 2,
  туризм: 2,
  tourism: 2,
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
  'basketball',
  'volleyball',
  'futbol',
  'basketbol',
  'voleybol',
  'maç',
  'lig',
  'matç',
  'çempionat',
  'футбол',
  'баскетбол',
  'волейбол',
  'матч',
  'чемпионат',
  'крикет',
  // politics / war / defence
  'election',
  'missile',
  'sanctions',
  'ceasefire',
  'military',
  'defense minister',
  'defence minister',
  'adex',
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
  'həbs',
  'qətl',
  'задержан',
  // TASK-0494: violent-crime headlines from AZ firehose feeds ("restoranda döyülən kişi ölüb")
  'döyül',
  'döyüb',
  'bıçaqla',
  'öldürül',
  'избит',
  'убит',
  'зарезан',
  'ножев',
];

/**
 * Terms that match only as a whole word (no suffixes). `neft` with suffixes rejected
 * "Neftçilər prospektində yeni restoran" and "Neftçala"; `lig` must not grow into other words.
 */
const EXACT_TERMS = new Set(['lig', 'neft', 'adex']);

/** Word continuations that turn a term into an unrelated word ("kafedra" = university chair). */
const TERM_EXCLUSIONS: Record<string, string> = {
  kafe: 'dr',
  кафе: 'др',
};

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

  // Tier 3 — regional. TASK-0491: Azerbaijani sources are the platform's home market → raised.
  'report.az': 3,
  'apa.az': 3,
  'trend.az': 3,
  'azertag.az': 3,
  'musavat.com': 3,
  'modern.az': 3,
  // TASK-0494: Azerbaijani outlets where local HoReCa stories actually appear (Google News check 2026-10-06)
  'baku.ws': 3,
  'media.az': 3,
  'vesti.az': 3,
  'day.az': 3,
  'qafqazinfo.az': 3,
  'zerkalo.az': 3,
  'haqqin.az': 3,
  'minval.az': 3,
  'turizmgazetesi.com': 3,
  'turizmguncel.com': 2,
  'turizmajansi.com': 2,
  'hurriyet.com.tr': 1,
  'sozcu.com.tr': 1,
  'dunya.com': 1,

  // Spam / low quality
  'pr.com': -3,
  'prnewswire.com': -2,
  'businesswire.com': -2,
  // TASK-0491: 79 rows of syndicated noise, 0 approvals
  'prnasia.com': -3,
  'menafn.com': -3,
  'travelandtourworld.com': -3,
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Case-fold variants used for matching. Turkish/Azerbaijani fold ("BAKI" → "bakı", "İAŞƏ" → "iaşə")
 * plus the standard fold ("AI" → "ai", "HILTON" → "hilton"); a term matches if either variant has it.
 */
export function foldVariants(text: string): string[] {
  const nfc = (text || '').normalize('NFC');
  const tr = nfc.replace(/I/g, 'ı').replace(/İ/g, 'i').toLocaleLowerCase('tr').replace(/̇/g, '');
  const std = nfc.replace(/İ/g, 'i').toLowerCase().replace(/̇/g, '');
  return tr === std ? [tr] : [tr, std];
}

const matcherCache = new Map<string, RegExp>();

function letterCount(term: string): number {
  return term.replace(/[^\p{L}]/gu, '').length;
}

/**
 * Word-start match, Unicode-aware, on already case-folded text. Suffix allowance grows with the
 * term: ≤3 letters exact ("ai", "pos", "ota"), 4 letters up to 7 ("kafelərində"), ≥5 letters up to
 * 10 ("restoranlarımızda", "restoranlardaki", "ресторанов"). A term never matches inside another
 * word ("otel" does not match "hotel"; "ai" does not match "said").
 */
function termRegex(term: string): RegExp {
  let re = matcherCache.get(term);
  if (!re) {
    const letters = letterCount(term);
    const suffix = EXACT_TERMS.has(term)
      ? ''
      : letters <= 3
        ? ''
        : letters === 4
          ? '\\p{L}{0,7}'
          : '\\p{L}{0,10}';
    const exclusion = TERM_EXCLUSIONS[term] ? `(?!${escapeRegex(TERM_EXCLUSIONS[term])})` : '';
    re = new RegExp(
      `(?<![\\p{L}\\p{N}])${escapeRegex(term)}${exclusion}${suffix}(?![\\p{L}\\p{N}])`,
      'u'
    );
    matcherCache.set(term, re);
  }
  return re;
}

function hasTerm(variants: string[], term: string): boolean {
  const re = termRegex(term);
  return variants.some((v) => re.test(v));
}

/** True when the text (title) contains an off-topic term. */
export function isBlockedTopic(text: string): boolean {
  const variants = foldVariants(text);
  return BLOCKED_TERMS.some((term) => hasTerm(variants, term));
}

/** True when the text is about AI / hospitality technology. */
export function isTechTopic(text: string): boolean {
  const variants = foldVariants(text);
  return TECH_TERMS.some((term) => hasTerm(variants, term));
}

/**
 * Calculate relevance score for a news item.
 * @returns numeric score; >= SCORE_THRESHOLD means relevant enough to keep
 */
export function scoreNewsItem(title: string, description: string, sourceUrl: string): number {
  // Off-topic in the headline: never relevant, whatever else it mentions.
  if (isBlockedTopic(title || '')) return 0;

  const variants = foldVariants(`${title || ''} ${description || ''}`);

  // Must actually be about HoReCa.
  let core = 0;
  for (const [term, weight] of Object.entries(CORE_TERMS)) {
    if (hasTerm(variants, term)) core += weight;
  }
  if (core === 0) return 0;

  let score = core;
  for (const [term, weight] of Object.entries(KEYWORD_WEIGHTS)) {
    if (hasTerm(variants, term)) score += weight;
  }
  if (description && isBlockedTopic(description)) score -= 4;

  // Source domain weight
  try {
    const domain = new URL(sourceUrl).hostname.replace(/^www\./, '');
    for (const [pattern, weight] of Object.entries(SOURCE_WEIGHTS)) {
      if (domain === pattern || domain.endsWith(`.${pattern}`)) {
        score += weight;
        break;
      }
    }
  } catch {
    // Invalid URL — no domain bonus
  }

  return score;
}
