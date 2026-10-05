/**
 * @file newsdata-fetch.ts
 * @purpose NewsData.io discovery — fetch, score, dedup, insert as draft.
 * TASK-0401: Called by `npm run news:fetch` (manual) and later by cron (TASK-0403).
 *
 * Flow: API call → parse → score (SSOT) → dedup (hash) → insert (origin='newsdata', status='fetched')
 */

import { createHash } from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { isTechTopic, scoreNewsItem, SCORE_THRESHOLD } from './scoring-config';
import { slugifyAz } from '@/lib/utils/slugify-az';

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';

/**
 * Categories + keywords for HoReCa/franchise/tourism discovery.
 * `language` overrides the default 'en,tr,az,ru' (TASK-0491: the AZ query is pinned to language=az).
 */
const DEFAULT_LANGUAGES = 'en,tr,az,ru';
type QuerySet = { q: string; country: string; language?: string };

export const QUERY_SETS: QuerySet[] = [
  { q: 'restaurant OR hotel OR franchise OR hospitality', country: 'az,tr' },
  { q: 'food cost OR food safety OR HACCP OR catering', country: 'az,tr' },
  { q: 'Azerbaijan restaurant OR Azerbaijan tourism OR Azerbaijan hotel', country: '' },
  { q: 'franchise restaurant OR franchise hotel OR franchise cafe', country: '' },
  // TASK-0478: AI / hospitality technology — what operators need to follow now
  { q: 'restaurant AI OR hotel AI OR hospitality AI OR restaurant technology OR hotel technology', country: '' },
  // TASK-0491: Azerbaijani-language coverage — no AZ-language query existed before.
  { q: 'restoran OR mehmanxana OR turizm OR iaşə OR kafe', country: 'az', language: 'az' },
  // TASK-0491: the TASK-0478 Russian query ('ресторан OR отель OR гостиница OR общепит', country az) returned
  // 0 results every run. Tested 2026-10-05: language=ru + country=az → 0; ru without country → Russian
  // regional noise (1/6 relevant). Dropped — RU coverage now comes from RSS (Trend Туризм, Report.az RU,
  // AZERTAC Экономика), which saves one credit per run.
];

interface NewsDataArticle {
  article_id: string;
  title: string;
  description: string | null;
  link: string;
  source_id: string;
  source_name: string;
  source_url: string;
  pubDate: string;
  image_url: string | null;
  category: string[];
  country: string[];
  language: string;
}

interface NewsDataResponse {
  status: string;
  totalResults: number;
  results: NewsDataArticle[];
  nextPage?: string;
}

export interface FetchResult {
  fetched: number;
  /** TASK-0479: titles + scores for tuning the filter from real runs (printed by the CLI). */
  accepted: Array<{ score: number; title: string }>;
  rejected: Array<{ score: number; title: string; domain: string }>;
  skipped: number;
  belowThreshold: number;
  duplicates: number;
  errors: string[];
}

function urlHash(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 40);
}

function mapCategory(
  categories: string[],
  text = '',
): 'operations' | 'finance' | 'growth' | 'market' | 'technology' {
  // TASK-0478: content first — AI / hospitality-tech stories go to "technology" whatever NewsData labels them.
  if (isTechTopic(text)) return 'technology';
  const cats = categories.map((c) => c.toLowerCase());
  if (cats.some((c) => c.includes('food') || c.includes('health'))) return 'operations';
  if (cats.some((c) => c.includes('business') || c.includes('econom'))) return 'finance';
  if (cats.some((c) => c.includes('tourism') || c.includes('travel'))) return 'market';
  if (cats.some((c) => c.includes('tech'))) return 'technology';
  return 'market';
}

/**
 * TASK-0478: AZ/TR letters are transliterated (ə→e, ş→s…) instead of deleted — the old regex
 * produced `liyev`, `xankndi`. Temporary: synthesize.ts rebuilds it from the AZ title + id.
 */
function buildSlug(title: string): string {
  const base = slugifyAz(title).slice(0, 80) || 'xeber';
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

export async function fetchFromNewsData(
  apiKey: string,
  query: string,
  country: string,
  language: string = DEFAULT_LANGUAGES,
): Promise<NewsDataArticle[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    q: query,
    language,
    size: '10',
  });
  if (country) params.set('country', country);

  const res = await fetch(`${NEWSDATA_BASE}?${params.toString()}`, {
    signal: AbortSignal.timeout(20_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`NewsData.io ${res.status}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as NewsDataResponse;
  if (data.status !== 'success') {
    throw new Error(`NewsData.io status: ${data.status}`);
  }

  return data.results ?? [];
}

/**
 * Main entry: fetch from NewsData.io → score → dedup → insert drafts.
 * Safe to re-run (idempotent via source_url_hash).
 */
export async function fetchAndScoreNews(): Promise<FetchResult> {
  const apiKey = process.env.NEWSDATA_API_KEY;
  if (!apiKey) {
    return { fetched: 0, accepted: [], rejected: [], skipped: 0, belowThreshold: 0, duplicates: 0, errors: ['NEWSDATA_API_KEY not set'] };
  }

  if (!db) {
    return { fetched: 0, accepted: [], rejected: [], skipped: 0, belowThreshold: 0, duplicates: 0, errors: ['Database not available'] };
  }

  const result: FetchResult = { fetched: 0, accepted: [], rejected: [], skipped: 0, belowThreshold: 0, duplicates: 0, errors: [] };

  for (const querySet of QUERY_SETS) {
    let articles: NewsDataArticle[];
    try {
      articles = await fetchFromNewsData(apiKey, querySet.q, querySet.country, querySet.language);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown fetch error';
      result.errors.push(`[${querySet.q.slice(0, 30)}...] ${msg}`);
      continue;
    }

    for (const article of articles) {
      if (!article.title || !article.link) {
        result.skipped++;
        continue;
      }

      // Score
      const score = scoreNewsItem(article.title, article.description ?? '', article.link);
      if (score < SCORE_THRESHOLD) {
        result.belowThreshold++;
        let domain = '';
        try {
          domain = new URL(article.link).hostname.replace(/^www\./, '');
        } catch {
          // ignore
        }
        result.rejected.push({ score, title: article.title.slice(0, 110), domain });
        continue;
      }

      // Dedup by URL hash
      const hash = urlHash(article.link);
      const existing = await db
        .select({ id: newsArticles.id })
        .from(newsArticles)
        .where(eq(newsArticles.sourceUrlHash, hash))
        .then((rows) => rows[0]);

      if (existing) {
        result.duplicates++;
        continue;
      }

      // Also check externalUrl (legacy dedup)
      const existingByUrl = await db
        .select({ id: newsArticles.id })
        .from(newsArticles)
        .where(eq(newsArticles.externalUrl, article.link))
        .then((rows) => rows[0]);

      if (existingByUrl) {
        result.duplicates++;
        continue;
      }

      // Insert
      try {
        await db.insert(newsArticles).values({
          externalUrl: article.link,
          sourceUrlHash: hash,
          slug: buildSlug(article.title),
          title: article.title,
          summary: (article.description ?? '').slice(0, 2000),
          category: mapCategory(article.category ?? [], `${article.title} ${article.description ?? ''}`),
          imageUrl: article.image_url ?? null,
          author: article.source_name?.slice(0, 150) ?? null,
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
          status: 'fetched',
          origin: 'newsdata',
          relevanceScore: score,
        });
        result.fetched++;
        result.accepted.push({ score, title: article.title.slice(0, 110) });
      } catch (err) {
        const cause = (err as { cause?: Error })?.cause;
        const msg = cause?.message || (err instanceof Error ? err.message : 'Insert error');
        // Unique constraint = duplicate (race condition safe)
        if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('23505')) {
          result.duplicates++;
        } else {
          result.errors.push(`[insert] ${msg.slice(0, 200)}`);
        }
      }
    }
  }

  return result;
}
