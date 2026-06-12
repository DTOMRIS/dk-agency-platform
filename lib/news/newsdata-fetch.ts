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
import { scoreNewsItem, SCORE_THRESHOLD } from './scoring-config';

const NEWSDATA_BASE = 'https://newsdata.io/api/1/latest';

/** Categories + keywords for HoReCa/franchise/tourism discovery */
const QUERY_SETS = [
  { q: 'restaurant OR hotel OR franchise OR hospitality', country: 'az,tr' },
  { q: 'food cost OR food safety OR HACCP OR catering', country: 'az,tr' },
  { q: 'Azerbaijan restaurant OR Azerbaijan tourism OR Azerbaijan hotel', country: '' },
  { q: 'franchise restaurant OR franchise hotel OR franchise cafe', country: '' },
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
  skipped: number;
  belowThreshold: number;
  duplicates: number;
  errors: string[];
}

function urlHash(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 40);
}

function mapCategory(categories: string[]): 'operations' | 'finance' | 'growth' | 'market' | 'technology' {
  const cats = categories.map((c) => c.toLowerCase());
  if (cats.some((c) => c.includes('food') || c.includes('health'))) return 'operations';
  if (cats.some((c) => c.includes('business') || c.includes('econom'))) return 'finance';
  if (cats.some((c) => c.includes('tourism') || c.includes('travel'))) return 'market';
  if (cats.some((c) => c.includes('tech'))) return 'technology';
  return 'market';
}

function buildSlug(title: string): string {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 80);
  const suffix = Date.now().toString(36).slice(-4);
  return `${base}-${suffix}`;
}

async function fetchFromNewsData(apiKey: string, query: string, country: string): Promise<NewsDataArticle[]> {
  const params = new URLSearchParams({
    apikey: apiKey,
    q: query,
    language: 'en,tr,az',
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
    return { fetched: 0, skipped: 0, belowThreshold: 0, duplicates: 0, errors: ['NEWSDATA_API_KEY not set'] };
  }

  if (!db) {
    return { fetched: 0, skipped: 0, belowThreshold: 0, duplicates: 0, errors: ['Database not available'] };
  }

  const result: FetchResult = { fetched: 0, skipped: 0, belowThreshold: 0, duplicates: 0, errors: [] };

  for (const querySet of QUERY_SETS) {
    let articles: NewsDataArticle[];
    try {
      articles = await fetchFromNewsData(apiKey, querySet.q, querySet.country);
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
          summary: article.description ?? '',
          category: mapCategory(article.category ?? []),
          imageUrl: article.image_url ?? null,
          author: article.source_name ?? null,
          publishedAt: article.pubDate ? new Date(article.pubDate) : new Date(),
          status: 'fetched',
          origin: 'newsdata',
          relevanceScore: score,
        });
        result.fetched++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Insert error';
        // Unique constraint = duplicate (race condition safe)
        if (msg.includes('unique') || msg.includes('duplicate')) {
          result.duplicates++;
        } else {
          result.errors.push(`[insert] ${msg}`);
        }
      }
    }
  }

  return result;
}
