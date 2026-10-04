/**
 * @file rss-ingest.ts
 * @purpose Trade-press RSS → news_articles (origin='rss', status='fetched') — TASK-0480 (news scope, phase 2).
 *
 * NewsData.io search returned mostly noise (games, wars, sitcoms — see TASK-0479 run log). These feeds were
 * verified on 2026-10-04 (HTTP 200, valid RSS). Items go through the same scoring as NewsData, then the same
 * DeepSeek synthesis and Telegram approval.
 *
 * - `trade` feeds are HoReCa/hospitality specific → normal scoring on title + description.
 * - `general` feeds (Azerbaijani news agencies) carry mostly politics/sport → scored on the TITLE only, so an
 *   item is kept only when its headline itself is about restaurants/hotels/tourism business.
 */

import { createHash } from 'crypto';
import { eq, or } from 'drizzle-orm';
import Parser from 'rss-parser';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { slugifyAz } from '@/lib/utils/slugify-az';
import { isTechTopic, scoreNewsItem, SCORE_THRESHOLD } from './scoring-config';

type FeedKind = 'trade' | 'general';
type Feed = { url: string; name: string; kind: FeedKind };

export const RSS_FEEDS: Feed[] = [
  // Global hospitality / restaurant trade press (EN)
  { url: 'https://skift.com/tag/artificial-intelligence/feed/', name: 'Skift AI', kind: 'trade' },
  { url: 'https://skift.com/feed/', name: 'Skift', kind: 'trade' },
  { url: 'https://www.hospitalitynet.org/rss/news.xml', name: 'Hospitality Net', kind: 'trade' },
  { url: 'https://www.restaurantdive.com/feeds/news/', name: 'Restaurant Dive', kind: 'trade' },
  { url: 'https://www.hoteldive.com/feeds/news/', name: 'Hotel Dive', kind: 'trade' },
  { url: 'https://www.nrn.com/rss.xml', name: "Nation's Restaurant News", kind: 'trade' },
  {
    url: 'https://restauranttechnologynews.com/feed/',
    name: 'Restaurant Technology News',
    kind: 'trade',
  },
  { url: 'https://hoteltechnologynews.com/feed/', name: 'Hotel Technology News', kind: 'trade' },
  { url: 'https://www.hotelmanagement.net/rss.xml', name: 'Hotel Management', kind: 'trade' },
  { url: 'https://hospitalityinsights.ehl.edu/rss.xml', name: 'EHL Insights', kind: 'trade' },
  { url: 'https://www.foodondemand.com/feed/', name: 'Food On Demand', kind: 'trade' },
  {
    url: 'https://www.modernrestaurantmanagement.com/feed/',
    name: 'Modern Restaurant Management',
    kind: 'trade',
  },
  { url: 'https://en.10minhotel.com/feed/', name: '10 Minutes Hotel News', kind: 'trade' },
  // Türkiye tourism / gastronomy
  { url: 'https://www.turizmguncel.com/rss.xml', name: 'Turizm Güncel', kind: 'trade' },
  { url: 'https://www.turizmajansi.com/rss', name: 'Turizm Ajansı', kind: 'trade' },
  { url: 'https://www.turizmgunlugu.com/feed/', name: 'Turizm Günlüğü', kind: 'trade' },
  { url: 'https://www.gastromondiale.com/feed/', name: 'Gastro Mondiale', kind: 'trade' },
  // Azerbaijan general news agencies (title must be HoReCa)
  { url: 'https://report.az/rss/', name: 'Report.az', kind: 'general' },
  { url: 'https://report.az/ru/rss/', name: 'Report.az RU', kind: 'general' },
  { url: 'https://report.az/en/rss/', name: 'Report.az EN', kind: 'general' },
  { url: 'https://az.trend.az/feeds/index.rss', name: 'Trend', kind: 'general' },
  { url: 'https://ru.trend.az/feeds/index.rss', name: 'Trend RU', kind: 'general' },
  { url: 'https://en.trend.az/feeds/index.rss', name: 'Trend EN', kind: 'general' },
  { url: 'https://apa.az/rss', name: 'APA', kind: 'general' },
  { url: 'https://azertag.az/rss', name: 'AZERTAC', kind: 'general' },
];

const MAX_AGE_DAYS = 4;
const MAX_INSERT_PER_RUN = 30;

export interface RssIngestResult {
  feedsOk: number;
  feedsFailed: string[];
  inserted: Array<{ score: number; title: string; source: string }>;
  rejected: Array<{ score: number; title: string; source: string }>;
  tooOld: number;
  duplicates: number;
  overCap: number;
  errors: string[];
}

function urlHash(url: string): string {
  return createHash('sha256').update(url.trim().toLowerCase()).digest('hex').slice(0, 40);
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function categoryFor(text: string): 'operations' | 'finance' | 'growth' | 'market' | 'technology' {
  if (isTechTopic(text)) return 'technology';
  if (
    /(food safety|food cost|food waste|menu|menyu|menü|kitchen|mətbəx|staff|labor|personel|hygiene|gigiyena)/i.test(
      text
    )
  ) {
    return 'operations';
  }
  if (
    /(franchise|franchising|françayz|франшиз|expansion|opening|açılış|open[s]? (its|a|new))/i.test(
      text
    )
  )
    return 'growth';
  if (
    /(revenue|profit|earnings|investment|investisiya|yatırım|funding|acquir|merger|price|qiymət|fiyat)/i.test(
      text
    )
  ) {
    return 'finance';
  }
  return 'market';
}

type Candidate = {
  feed: Feed;
  title: string;
  link: string;
  summary: string;
  imageUrl: string | null;
  publishedAt: Date | null;
  score: number;
};

export async function ingestTradeRss(): Promise<RssIngestResult> {
  const result: RssIngestResult = {
    feedsOk: 0,
    feedsFailed: [],
    inserted: [],
    rejected: [],
    tooOld: 0,
    duplicates: 0,
    overCap: 0,
    errors: [],
  };
  if (!db) {
    result.errors.push('Database not available');
    return result;
  }

  const parser = new Parser({
    timeout: 15_000,
    headers: { 'User-Agent': 'DKAgencyNewsBot/1.0 (+https://dkagency.com.tr)' },
  });
  const cutoff = Date.now() - MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const candidates: Candidate[] = [];

  for (const feed of RSS_FEEDS) {
    let items: Parser.Item[];
    try {
      items = (await parser.parseURL(feed.url)).items ?? [];
      result.feedsOk++;
    } catch (err) {
      result.feedsFailed.push(
        `${feed.name}: ${(err instanceof Error ? err.message : String(err)).slice(0, 80)}`
      );
      continue;
    }

    for (const item of items.slice(0, 30)) {
      const title = stripHtml(item.title || '');
      let link = (item.link || '').trim();
      if (!title || !link) continue;
      if (link.startsWith('http://')) link = `https://${link.slice(7)}`;

      const publishedAt = item.isoDate
        ? new Date(item.isoDate)
        : item.pubDate
          ? new Date(item.pubDate)
          : null;
      if (publishedAt && !Number.isNaN(publishedAt.getTime()) && publishedAt.getTime() < cutoff) {
        result.tooOld++;
        continue;
      }

      const summary = stripHtml(item.contentSnippet || item.summary || item.content || '').slice(
        0,
        2000
      );
      const score =
        feed.kind === 'general'
          ? scoreNewsItem(title, '', link)
          : scoreNewsItem(title, summary, link);
      if (score < SCORE_THRESHOLD) {
        result.rejected.push({ score, title: title.slice(0, 110), source: feed.name });
        continue;
      }

      const enclosure = (item as { enclosure?: { url?: string } }).enclosure?.url;
      candidates.push({
        feed,
        title,
        link,
        summary,
        imageUrl: enclosure && /^https?:\/\//.test(enclosure) ? enclosure : null,
        publishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
        score,
      });
    }
  }

  // Best first; the same story can appear in several feeds — keep the first (highest score) link per title.
  candidates.sort((a, b) => b.score - a.score);
  const seenTitles = new Set<string>();
  for (const c of candidates) {
    const titleKey = c.title.toLowerCase().replace(/\W+/g, ' ').trim();
    if (seenTitles.has(titleKey)) {
      result.duplicates++;
      continue;
    }
    seenTitles.add(titleKey);

    if (result.inserted.length >= MAX_INSERT_PER_RUN) {
      result.overCap++;
      continue;
    }

    const hash = urlHash(c.link);
    const existing = await db
      .select({ id: newsArticles.id })
      .from(newsArticles)
      .where(or(eq(newsArticles.sourceUrlHash, hash), eq(newsArticles.externalUrl, c.link)))
      .then((rows) => rows[0]);
    if (existing) {
      result.duplicates++;
      continue;
    }

    try {
      await db.insert(newsArticles).values({
        externalUrl: c.link,
        sourceUrlHash: hash,
        slug: `${slugifyAz(c.title).slice(0, 80) || 'xeber'}-${Date.now().toString(36).slice(-5)}`,
        title: c.title,
        summary: c.summary,
        category: categoryFor(`${c.title} ${c.summary}`),
        imageUrl: c.imageUrl,
        author: c.feed.name.slice(0, 150),
        publishedAt: c.publishedAt ?? new Date(),
        status: 'fetched',
        origin: 'rss',
        relevanceScore: c.score,
      });
      result.inserted.push({ score: c.score, title: c.title.slice(0, 110), source: c.feed.name });
    } catch (err) {
      const cause = (err as { cause?: Error })?.cause;
      const msg = cause?.message || (err instanceof Error ? err.message : 'Insert error');
      if (msg.includes('unique') || msg.includes('duplicate') || msg.includes('23505'))
        result.duplicates++;
      else result.errors.push(`[insert] ${msg.slice(0, 160)}`);
    }
  }

  return result;
}
