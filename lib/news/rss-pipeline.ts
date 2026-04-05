import Parser from 'rss-parser';

import {
  createFetchedNewsArticle,
  findNewsArticleByExternalUrl,
  getActiveNewsSources,
  getFetchedNewsArticles,
  updateNewsSourceLastFetchedAt,
  updateTranslatedNewsArticle,
} from '@/lib/repositories/newsRepository';

type FeedItem = {
  title?: string;
  link?: string;
  contentSnippet?: string;
  content?: string;
  isoDate?: string;
  pubDate?: string;
  creator?: string;
  author?: string;
  enclosure?: { url?: string };
  description?: string;
  contentEncoded?: string;
  mediaContent?: Array<{ $?: { url?: string } }> | { $?: { url?: string } };
  mediaThumbnail?: Array<{ $?: { url?: string } }> | { $?: { url?: string } };
  [key: string]: unknown;
};

const parser = new Parser<Record<string, never>, FeedItem>({
  customFields: {
    item: [
      ['media:content', 'mediaContent'],
      ['media:thumbnail', 'mediaThumbnail'],
      ['description', 'description'],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120);
}

function stripHtml(value: string) {
  return value.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function getSummary(item: FeedItem) {
  const raw = item.contentSnippet || item.description || item.content || item.contentEncoded || '';
  return stripHtml(raw).slice(0, 500) || null;
}

function getImageUrl(item: FeedItem) {
  if (item.enclosure?.url) return item.enclosure.url;

  if (Array.isArray(item.mediaContent) && item.mediaContent[0]?.$?.url) {
    return item.mediaContent[0].$.url;
  }
  if (!Array.isArray(item.mediaContent) && item.mediaContent?.$?.url) {
    return item.mediaContent.$.url;
  }

  if (Array.isArray(item.mediaThumbnail) && item.mediaThumbnail[0]?.$?.url) {
    return item.mediaThumbnail[0].$.url;
  }
  if (!Array.isArray(item.mediaThumbnail) && item.mediaThumbnail?.$?.url) {
    return item.mediaThumbnail.$.url;
  }

  return null;
}

function getPublishedAt(item: FeedItem) {
  const value = item.isoDate || item.pubDate;
  if (!value) return null;

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

async function parseFeedWithTimeout(url: string, timeoutMs: number = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'user-agent': 'DKAgencyRSSBot/1.0 (+https://dkagency.az)',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(`RSS ${response.status}`);
    }

    const xml = await response.text();
    return await parser.parseString(xml);
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function fetchNewsFromRss() {
  const sources = await getActiveNewsSources();
  let fetched = 0;
  let skipped = 0;
  let errors = 0;

  for (const source of sources) {
    try {
      const feed = await parseFeedWithTimeout(source.rssUrl);

      for (const item of feed.items || []) {
        if (!item.link || !item.title) {
          skipped += 1;
          continue;
        }

        const existing = await findNewsArticleByExternalUrl(item.link);
        if (existing) {
          skipped += 1;
          continue;
        }

        const publishedAt = getPublishedAt(item);
        const slugBase = slugify(item.title);
        const slugSuffix = publishedAt
          ? publishedAt.getTime().toString().slice(-6)
          : Date.now().toString().slice(-6);

        await createFetchedNewsArticle({
          sourceId: source.id,
          externalUrl: item.link,
          slug: `${slugBase}-${slugSuffix}`,
          title: item.title.trim(),
          summary: getSummary(item),
          imageUrl: getImageUrl(item),
          author: item.creator || item.author || null,
          publishedAt,
          category: source.category,
        });

        fetched += 1;
      }

      await updateNewsSourceLastFetchedAt(source.id);
    } catch {
      errors += 1;
    }
  }

  return { fetched, skipped, errors };
}

function parseDeepSeekTranslation(content: string, fallbackTitle: string, fallbackSummary: string) {
  const trimmed = content.trim();

  try {
    const parsed = JSON.parse(trimmed) as { titleAz?: string; summaryAz?: string };
    return {
      titleAz: parsed.titleAz?.trim() || fallbackTitle,
      summaryAz: parsed.summaryAz?.trim() || fallbackSummary,
    };
  } catch {
    const titleMatch = trimmed.match(/titleAz\s*[:=]\s*(.+)/i);
    const summaryMatch = trimmed.match(/summaryAz\s*[:=]\s*([\s\S]+)/i);
    return {
      titleAz: titleMatch?.[1]?.trim() || fallbackTitle,
      summaryAz: summaryMatch?.[1]?.trim() || fallbackSummary,
    };
  }
}

async function translateWithDeepSeek(title: string, summary: string, apiKey: string) {
  const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      temperature: 0.3,
      max_tokens: 500,
      messages: [
        {
          role: 'system',
          content:
            'Professional HoReCa xəbər tərcüməçisisən. EN-dən AZ-a tərcümə et. Qısa, aydın, informativ. Cavabı yalnız JSON formatında qaytar: {"titleAz":"...","summaryAz":"..."}',
        },
        {
          role: 'user',
          content: `Title: ${title}\nSummary: ${summary}`,
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek ${response.status}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = payload.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('DeepSeek boş cavab qaytardı');
  }

  return parseDeepSeekTranslation(content, title, summary);
}

export async function translateFetchedNews(limit: number = 10) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    throw new Error('DEEPSEEK_API_KEY tapılmadı');
  }

  const rows = await getFetchedNewsArticles(limit);
  let translated = 0;
  let errors = 0;

  for (const row of rows) {
    try {
      const translatedContent = await translateWithDeepSeek(row.title, row.summary || '', apiKey);
      await updateTranslatedNewsArticle(row.id, translatedContent);
      translated += 1;
    } catch {
      errors += 1;
    }
  }

  return { translated, errors };
}
