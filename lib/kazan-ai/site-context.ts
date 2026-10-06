/**
 * @file site-context.ts
 * @purpose KAZAN AI-a saytın real məzmununu verir: dərc olunmuş bloq yazıları,
 * toolkit kataloqu və son təsdiqlənmiş xəbərlər. Sualla ən uyğun yazıların
 * xülasəsi + mətn parçası prompt-a əlavə olunur ki model uydurmasın, istinad etsin.
 * TASK-0487
 */

import { and, desc, eq, gte } from 'drizzle-orm';
import { db } from '@/lib/db';
import { blogPosts, newsArticles } from '@/lib/db/schema';
import { TOOLKIT_CATALOG } from '@/lib/news/toolkit-catalog';
import { TQTA_EMPLOYER_URL, getTqtaJobs, type TqtaJob } from '@/lib/tqta/jobs';

type Locale = 'az' | 'ru' | 'en' | 'tr';

interface BlogDoc {
  slug: string;
  category: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
  content: Record<Locale, string>;
}

interface NewsDoc {
  slug: string;
  title: Record<Locale, string>;
  summary: Record<Locale, string>;
}

interface SiteDocs {
  blogs: BlogDoc[];
  news: NewsDoc[];
  loadedAt: number;
}

const CACHE_MS = 10 * 60 * 1000;
const NEWS_DAYS = 30;
const EXCERPT_CHARS = 1400;
let cache: SiteDocs | null = null;
const JOBS_IN_PROMPT = 10;
let jobsCache: { jobs: TqtaJob[]; loadedAt: number } | null = null;

/** TQTA vakansiyaları (TASK-0495) — bloq konteksti kimi 10 dəq yaddaşda saxlanır. */
async function loadJobs(): Promise<TqtaJob[]> {
  if (jobsCache && Date.now() - jobsCache.loadedAt < CACHE_MS) return jobsCache.jobs;
  const { ok, jobs } = await getTqtaJobs();
  // Uğursuz cavab keşlənmir — növbəti sualda yenidən cəhd olunur.
  if (ok) jobsCache = { jobs, loadedAt: Date.now() };
  return jobs;
}

function normalizeLocale(locale: string): Locale {
  const l = locale.toLowerCase();
  return l === 'ru' || l === 'en' || l === 'tr' ? l : 'az';
}

function localePath(path: string, locale: Locale): string {
  return locale === 'az' ? path : `/${locale}${path}`;
}

function pick(values: Record<Locale, string>, locale: Locale): string {
  return values[locale] || values.az;
}

/** Markdown/HTML-i düz mətnə çevirir (prompt üçün). */
function plain(text: string): string {
  return text
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[#>*_`|]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function loadDocs(): Promise<SiteDocs> {
  if (cache && Date.now() - cache.loadedAt < CACHE_MS) return cache;
  if (!db) return { blogs: [], news: [], loadedAt: Date.now() };

  try {
    const blogRows = await db
      .select()
      .from(blogPosts)
      .where(eq(blogPosts.status, 'published'))
      .orderBy(desc(blogPosts.publishedAt));

    const since = new Date(Date.now() - NEWS_DAYS * 24 * 60 * 60 * 1000);
    const newsRows = await db
      .select({
        slug: newsArticles.slug,
        title: newsArticles.title,
        titleAz: newsArticles.titleAz,
        titleRu: newsArticles.titleRu,
        titleEn: newsArticles.titleEn,
        titleTr: newsArticles.titleTr,
        summaryAz: newsArticles.summaryAz,
        summaryRu: newsArticles.summaryRu,
        summaryEn: newsArticles.summaryEn,
        summaryTr: newsArticles.summaryTr,
      })
      .from(newsArticles)
      .where(and(eq(newsArticles.status, 'approved'), gte(newsArticles.createdAt, since)))
      .orderBy(desc(newsArticles.createdAt))
      .limit(20);

    cache = {
      loadedAt: Date.now(),
      blogs: blogRows.map((r) => ({
        slug: r.slug,
        category: r.category ?? '',
        title: { az: r.title_az, ru: r.title_ru ?? '', en: r.title_en ?? '', tr: r.title_tr ?? '' },
        summary: {
          az: r.summary_az ?? '',
          ru: r.summary_ru ?? '',
          en: r.summary_en ?? '',
          tr: r.summary_tr ?? '',
        },
        content: {
          az: r.content_az,
          ru: r.content_ru ?? '',
          en: r.content_en ?? '',
          tr: r.content_tr ?? '',
        },
      })),
      news: newsRows
        .filter((r): r is typeof r & { slug: string } => Boolean(r.slug))
        .map((r) => ({
          slug: r.slug,
          title: {
            az: r.titleAz || r.title,
            ru: r.titleRu ?? '',
            en: r.titleEn ?? '',
            tr: r.titleTr ?? '',
          },
          summary: {
            az: r.summaryAz ?? '',
            ru: r.summaryRu ?? '',
            en: r.summaryEn ?? '',
            tr: r.summaryTr ?? '',
          },
        })),
    };
    return cache;
  } catch {
    // DB əlçatmazdırsa KAZAN statik bilik bazası ilə işləməyə davam edir.
    return { blogs: [], news: [], loadedAt: Date.now() };
  }
}

/** Söz kökləri: 4+ hərfli sözlərin ilk 5 hərfi (az/tr şəkilçilərini təxmini kəsir). */
function stems(text: string): Set<string> {
  const words = text.toLocaleLowerCase('az').match(/[\p{L}\p{N}&]{4,}/gu) ?? [];
  return new Set(words.map((w) => w.slice(0, 5)));
}

function overlap(query: Set<string>, text: string): number {
  let hits = 0;
  for (const s of stems(text)) if (query.has(s)) hits += 1;
  return hits;
}

function scoreBlog(query: Set<string>, doc: BlogDoc, locale: Locale): number {
  const title = `${pick(doc.title, locale)} ${doc.title.az} ${doc.slug.replace(/-/g, ' ')}`;
  return overlap(query, title) * 3 + overlap(query, `${doc.category} ${pick(doc.summary, locale)}`);
}

export async function buildSiteContext(userText: string, localeInput: string): Promise<string> {
  const locale = normalizeLocale(localeInput);
  const [docs, jobs] = await Promise.all([loadDocs(), loadJobs()]);
  const query = stems(userText);

  const toolLines = TOOLKIT_CATALOG.map(
    (t) => `- [${t.label}](${localePath(`/toolkit/${t.slug}`, locale)}) — ${t.description}`
  );

  const blogLines = docs.blogs.map(
    (b) => `- [${pick(b.title, locale)}](${localePath(`/blog/${b.slug}`, locale)})`
  );

  const relevant = docs.blogs
    .map((b) => ({ b, s: scoreBlog(query, b, locale) }))
    .filter((x) => x.s >= 3)
    .sort((a, b) => b.s - a.s)
    .slice(0, 2)
    .map(({ b }) => {
      const body = plain(pick(b.content, locale)).slice(0, EXCERPT_CHARS);
      return [
        `### ${pick(b.title, locale)}`,
        `Link: ${localePath(`/blog/${b.slug}`, locale)}`,
        `Xülasə: ${plain(pick(b.summary, locale))}`,
        `Mətndən parça: ${body}…`,
      ].join('\n');
    });

  const newsLines = docs.news
    .map((n) => ({ n, s: overlap(query, `${pick(n.title, locale)} ${pick(n.summary, locale)}`) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, 5)
    .map(({ n }) => `- [${pick(n.title, locale)}](${localePath(`/haberler/${n.slug}`, locale)})`);

  const sections = [
    'SAYTIN REAL MƏZMUNU (yalnız bu linklərə istinad et, başqa başlıq/link uydurma):',
    '',
    'ALƏTLƏR (pulsuz toolkit):',
    ...toolLines,
  ];
  if (blogLines.length) sections.push('', 'BLOQ YAZILARI (hamısı):', ...blogLines);
  if (relevant.length) {
    sections.push(
      '',
      'SUALA ƏN UYĞUN BLOQ YAZILARI (cavabını bunlara söykə, linkini ver):',
      ...relevant
    );
  }
  if (newsLines.length) sections.push('', `SON XƏBƏRLƏR (${NEWS_DAYS} gün):`, ...newsLines);
  const jobsPath = localePath('/is-elanlari', locale);
  sections.push(
    '',
    `İŞ ELANLARI (TQTA tərəfdaş akademiyası ilə; vitrin: ${jobsPath}, işəgötürən elan yerləşdirir: ${TQTA_EMPLOYER_URL}):`
  );
  if (jobs.length) {
    sections.push(
      `Aktiv vakansiya sayı: ${jobs.length}. Son elanlar:`,
      ...jobs.slice(0, JOBS_IN_PROMPT).map((j) => `- ${j.title} — ${j.company}${j.city ? `, ${j.city}` : ''}`)
    );
  }
  return sections.join('\n');
}
