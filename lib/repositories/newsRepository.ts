import { and, desc, eq, inArray, isNotNull, ne, or, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { newsArticles, newsSources } from '@/lib/db/schema';
import { getAllNews } from '@/lib/data/mockNewsDB';
import { defaultNewsSources } from '@/lib/data/newsSources';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';
import { translateText } from '@/lib/ai/translate';

export interface NewsAdminFilters {
  status?: string | null;
  /** Only rows flagged for the showcase (manşet / top / gündəm / editor pick). */
  showcase?: boolean;
  /** 1-based page number (default 1). */
  page?: number;
  /** Rows per page (default 50, max 200). */
  pageSize?: number;
}

/** Lightweight list row — no content/summary columns (TASK-0490: list was ~1037 full rows). */
export interface AdminNewsArticle {
  id: number;
  sourceId: number | null;
  sourceName: string | null;
  externalUrl: string | null;
  slug: string | null;
  title: string;
  titleAz: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  origin: string | null;
  newsType: string | null;
  publishedAt: string;
  status: 'fetched' | 'translated' | 'approved' | 'rejected';
  isEditorPick: boolean;
  isManset: boolean;
  isTop: boolean;
  isGundem: boolean;
}

export const ADMIN_NEWS_PAGE_SIZE = 50;

export type NewsCategoryKey = 'all' | 'finance' | 'operations' | 'growth' | 'market' | 'technology';

export interface PublicNewsFilters {
  category?: NewsCategoryKey;
  limit?: number;
  offset?: number;
}

export interface PublicNewsArticle {
  id: number;
  slug: string;
  title: string;
  summary: string;
  content: string;
  category: Exclude<NewsCategoryKey, 'all'>;
  imageUrl: string | null;
  author: string | null;
  sourceName: string | null;
  externalUrl: string;
  isManual: boolean;
  publishedAt: string;
  isEditorPick: boolean;
  isManset: boolean;
  isTop: boolean;
  isGundem: boolean;
}

function getTranslatedNewsConditions() {
  return [
    isNotNull(newsArticles.titleAz),
    sql`trim(coalesce(${newsArticles.titleAz}, '')) <> ''`,
    isNotNull(newsArticles.summaryAz),
    sql`trim(coalesce(${newsArticles.summaryAz}, '')) <> ''`,
  ];
}

function getPublicNewsConditions(category?: NewsCategoryKey) {
  const conditions = [
    eq(newsArticles.status, 'approved'),
    isNotNull(newsArticles.slug),
    ...getTranslatedNewsConditions(),
  ];

  if (category && category !== 'all') {
    conditions.push(eq(newsArticles.category, category));
  }

  return conditions;
}

export async function getAdminNewsArticles(filters: NewsAdminFilters = {}) {
  const pageSize = Math.min(Math.max(Math.trunc(filters.pageSize ?? ADMIN_NEWS_PAGE_SIZE), 1), 200);
  const page = Math.max(Math.trunc(filters.page ?? 1), 1);
  const offset = (page - 1) * pageSize;

  if (!dbAvailable || !db) {
    const mockRows: AdminNewsArticle[] = getAllNews()
      .map((item, index) => ({
        id: index + 1,
        sourceId: null,
        sourceName: item.author,
        externalUrl: null,
        slug: item.slug,
        title: item.title,
        titleAz: item.title,
        category: item.category,
        imageUrl: null,
        author: item.author,
        origin: 'manual',
        newsType: 'none',
        publishedAt: item.publishDate,
        status: (item.isPremium ? 'translated' : 'approved') as AdminNewsArticle['status'],
        isEditorPick: index === 0,
        isManset: false,
        isTop: false,
        isGundem: false,
      }))
      .filter((item) =>
        !filters.status || filters.status === 'all' ? true : item.status === filters.status
      )
      .filter((item) => (filters.showcase ? item.isEditorPick : true));

    return {
      items: mockRows.slice(offset, offset + pageSize),
      total: mockRows.length,
      page,
      pageSize,
      source: 'mock' as const,
    };
  }

  const conditions = [];
  if (filters.status && filters.status !== 'all') {
    conditions.push(
      eq(newsArticles.status, filters.status as typeof newsArticles.$inferSelect.status)
    );
  }
  if (filters.showcase) {
    conditions.push(
      or(
        eq(newsArticles.isManset, true),
        eq(newsArticles.isTop, true),
        eq(newsArticles.isGundem, true),
        eq(newsArticles.isEditorPick, true)
      )
    );
  }
  const where = conditions.length ? and(...conditions) : undefined;

  const [rows, totalRows] = await Promise.all([
    db
      .select({
        id: newsArticles.id,
        sourceId: newsArticles.sourceId,
        sourceName: newsSources.name,
        externalUrl: newsArticles.externalUrl,
        slug: newsArticles.slug,
        title: newsArticles.title,
        titleAz: newsArticles.titleAz,
        category: newsArticles.category,
        imageUrl: newsArticles.imageUrl,
        author: newsArticles.author,
        origin: newsArticles.origin,
        newsType: newsArticles.newsType,
        publishedAt: newsArticles.publishedAt,
        status: newsArticles.status,
        isEditorPick: newsArticles.isEditorPick,
        isManset: newsArticles.isManset,
        isTop: newsArticles.isTop,
        isGundem: newsArticles.isGundem,
      })
      .from(newsArticles)
      .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .where(where)
      .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsArticles)
      .where(where),
  ]);

  return {
    items: rows.map((item) => ({
      ...item,
      publishedAt: item.publishedAt?.toISOString() || new Date().toISOString(),
    })) as AdminNewsArticle[],
    total: totalRows[0]?.count || 0,
    page,
    pageSize,
    source: 'db' as const,
  };
}

/** Bulk status change (TASK-0490). Returns the ids that were actually updated. */
export async function setNewsArticlesStatus(
  ids: number[],
  status: 'fetched' | 'translated' | 'approved' | 'rejected'
) {
  if (!dbAvailable || !db || ids.length === 0) return [] as number[];
  const rows = await db
    .update(newsArticles)
    .set({ status, ...(status === 'rejected' ? { isEditorPick: false } : {}) })
    .where(inArray(newsArticles.id, ids))
    .returning({ id: newsArticles.id });
  return rows.map((r) => r.id);
}

/**
 * Bulk delete (TASK-0490). Same semantics as deleteNewsArticle, for many ids.
 * TASK-0493: published (approved) articles are protected unless `includeApproved` is set —
 * a "select all" on the newest page deleted live articles (incl. the AİİQA story) on 2026-10-05.
 */
export async function deleteNewsArticles(ids: number[], options: { includeApproved?: boolean } = {}) {
  if (!dbAvailable || !db || ids.length === 0) {
    return { deleted: [] as number[], protectedIds: [] as number[] };
  }
  let targets = ids;
  let protectedIds: number[] = [];
  if (!options.includeApproved) {
    const approved = await db
      .select({ id: newsArticles.id })
      .from(newsArticles)
      .where(and(inArray(newsArticles.id, ids), eq(newsArticles.status, 'approved')));
    protectedIds = approved.map((r) => r.id);
    targets = ids.filter((id) => !protectedIds.includes(id));
  }
  if (targets.length === 0) return { deleted: [] as number[], protectedIds };
  const rows = await db
    .delete(newsArticles)
    .where(inArray(newsArticles.id, targets))
    .returning({ id: newsArticles.id });
  return { deleted: rows.map((r) => r.id), protectedIds };
}

export async function updateNewsArticleReviewState(
  id: number,
  input: { status?: 'fetched' | 'translated' | 'approved' | 'rejected'; isEditorPick?: boolean }
) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  await db
    .update(newsArticles)
    .set({
      status: input.status,
      isEditorPick: input.isEditorPick,
    })
    .where(eq(newsArticles.id, id));

  return { success: true, source: 'db' as const };
}

export async function updateNewsArticleAdmin(
  id: number,
  input: {
    status?: 'fetched' | 'translated' | 'approved' | 'rejected';
    isEditorPick?: boolean;
    isManset?: boolean;
    isTop?: boolean;
    isGundem?: boolean;
    titleAz?: string | null;
    summaryAz?: string | null;
    contentAz?: string | null;
    contentRu?: string | null;
    contentEn?: string | null;
    contentTr?: string | null;
    titleRu?: string | null;
    titleEn?: string | null;
    titleTr?: string | null;
    summaryRu?: string | null;
    summaryEn?: string | null;
    summaryTr?: string | null;
    category?: string;
    author?: string | null;
    imageUrl?: string | null;
    seoTitle?: string | null;
    seoDescription?: string | null;
    slug?: string | null;
    publishedAt?: Date | null;
    externalUrl?: string | null;
    sourceId?: number | null;
    newsType?: string | null;
    telegramSend?: boolean;
    logoOverlay?: boolean;
    relatedToolkits?: string[];
    relatedBlogSlug?: string | null;
  }
) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  const setData: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(input)) {
    if (value !== undefined) {
      setData[key] = value;
    }
  }

  if (Object.keys(setData).length === 0) {
    return { success: true, source: 'db' as const };
  }

  await db.update(newsArticles).set(setData).where(eq(newsArticles.id, id));

  return { success: true, source: 'db' as const };
}

export async function deleteNewsArticle(id: number) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  await db.delete(newsArticles).where(eq(newsArticles.id, id));
  return { success: true, source: 'db' as const };
}

export async function getAdminNewsArticleById(id: number) {
  if (!dbAvailable || !db) return null;

  return db
    .select({
      id: newsArticles.id,
      sourceId: newsArticles.sourceId,
      slug: newsArticles.slug,
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      titleRu: newsArticles.titleRu,
      titleEn: newsArticles.titleEn,
      titleTr: newsArticles.titleTr,
      summary: newsArticles.summary,
      summaryAz: newsArticles.summaryAz,
      summaryRu: newsArticles.summaryRu,
      summaryEn: newsArticles.summaryEn,
      summaryTr: newsArticles.summaryTr,
      contentAz: newsArticles.contentAz,
      contentRu: newsArticles.contentRu,
      contentEn: newsArticles.contentEn,
      contentTr: newsArticles.contentTr,
      category: newsArticles.category,
      imageUrl: newsArticles.imageUrl,
      author: newsArticles.author,
      externalUrl: newsArticles.externalUrl,
      status: newsArticles.status,
      isEditorPick: newsArticles.isEditorPick,
      isManset: newsArticles.isManset,
      isTop: newsArticles.isTop,
      isGundem: newsArticles.isGundem,
      seoTitle: newsArticles.seoTitle,
      seoDescription: newsArticles.seoDescription,
      newsType: newsArticles.newsType,
      telegramSend: newsArticles.telegramSend,
      logoOverlay: newsArticles.logoOverlay,
      publishedAt: newsArticles.publishedAt,
      createdAt: newsArticles.createdAt,
    })
    .from(newsArticles)
    .where(eq(newsArticles.id, id))
    .then((rows) => rows[0] || null);
}

export async function getNewsSourcesAdmin() {
  if (!dbAvailable || !db) {
    return defaultNewsSources.map((source, index) => ({
      id: index + 1,
      ...source,
      lastFetchedAt: null as string | null,
    }));
  }

  const rows = await db.select().from(newsSources).orderBy(newsSources.name);
  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    url: item.url,
    rssUrl: item.rssUrl,
    language: item.language,
    category: item.category,
    isActive: item.isActive,
    lastFetchedAt: item.lastFetchedAt?.toISOString() || null,
  }));
}

export async function updateNewsSource(id: number, input: { isActive?: boolean }) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  await db.update(newsSources).set({ isActive: input.isActive }).where(eq(newsSources.id, id));
  return { success: true, source: 'db' as const };
}

export async function getActiveNewsSources() {
  if (!dbAvailable || !db) {
    return defaultNewsSources
      .filter((item) => item.isActive)
      .map((item, index) => ({ id: index + 1, ...item, lastFetchedAt: null }));
  }

  return db
    .select()
    .from(newsSources)
    .where(eq(newsSources.isActive, true))
    .orderBy(newsSources.name);
}

export async function findNewsArticleByExternalUrl(externalUrl: string) {
  if (!dbAvailable || !db) return null;
  return db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.externalUrl, externalUrl))
    .then((rows) => rows[0] || null);
}

export async function createFetchedNewsArticle(input: {
  sourceId: number;
  externalUrl: string;
  slug: string;
  title: string;
  summary: string | null;
  category: Exclude<NewsCategoryKey, 'all'>;
  imageUrl?: string | null;
  author?: string | null;
  publishedAt?: Date | null;
}) {
  if (!dbAvailable || !db) {
    return { id: Date.now(), source: 'mock' as const };
  }

  const inserted = await db
    .insert(newsArticles)
    .values({
      sourceId: input.sourceId,
      externalUrl: input.externalUrl,
      slug: input.slug,
      title: input.title,
      titleEn: input.title,
      summary: input.summary,
      summaryEn: input.summary,
      category: input.category,
      imageUrl: input.imageUrl || null,
      author: input.author || null,
      publishedAt: input.publishedAt || new Date(),
      status: 'fetched',
    })
    .returning({ id: newsArticles.id });

  return { id: inserted[0]?.id, source: 'db' as const };
}

export async function updateNewsSourceLastFetchedAt(sourceId: number) {
  if (!dbAvailable || !db) return { success: true, source: 'mock' as const };

  await db
    .update(newsSources)
    .set({ lastFetchedAt: new Date() })
    .where(eq(newsSources.id, sourceId));

  return { success: true, source: 'db' as const };
}

export async function getFetchedNewsArticles(limit: number = 10) {
  if (!dbAvailable || !db) return [];

  const rows = await db
    .select()
    .from(newsArticles)
    .where(eq(newsArticles.status, 'fetched'))
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(limit);

  return rows;
}

export async function updateTranslatedNewsArticle(
  id: number,
  input: { titleAz: string; summaryAz: string }
) {
  if (!dbAvailable || !db) return { success: true, source: 'mock' as const };

  await db
    .update(newsArticles)
    .set({
      titleAz: input.titleAz,
      summaryAz: input.summaryAz,
      status: 'translated',
    })
    .where(eq(newsArticles.id, id));

  return { success: true, source: 'db' as const };
}

function mapPublicArticle(
  row: {
    id: number;
    slug: string | null;
    title: string;
    titleAz: string | null;
    summary: string | null;
    summaryAz: string | null;
    category: typeof newsArticles.$inferSelect.category;
    imageUrl: string | null;
    author: string | null;
    sourceName: string | null;
    externalUrl: string;
    publishedAt: Date | null;
    isEditorPick: boolean;
    titleRu?: string | null;
    titleEn?: string | null;
    titleTr?: string | null;
    summaryRu?: string | null;
    summaryEn?: string | null;
    summaryTr?: string | null;
    contentAz?: string | null;
    contentRu?: string | null;
    contentEn?: string | null;
    contentTr?: string | null;
  },
  locale: ContentLocale = 'az'
): PublicNewsArticle {
  const titleByLocale: Record<ContentLocale, string | null | undefined> = {
    az: row.titleAz,
    ru: row.titleRu,
    en: row.titleEn,
    tr: row.titleTr,
  };
  const summaryByLocale: Record<ContentLocale, string | null | undefined> = {
    az: row.summaryAz,
    ru: row.summaryRu,
    en: row.summaryEn,
    tr: row.summaryTr,
  };
  const contentByLocale: Record<ContentLocale, string | null | undefined> = {
    az: row.contentAz,
    ru: row.contentRu,
    en: row.contentEn,
    tr: row.contentTr,
  };

  const title = titleByLocale[locale]?.trim() || row.titleAz || row.title;
  const summary = summaryByLocale[locale]?.trim() || row.summaryAz || row.summary || '';
  const content = contentByLocale[locale]?.trim() || row.contentAz || '';

  // Manual news has synthetic externalUrl like "manual:slug:timestamp" —
  // it's not a real source link and shouldn't be exposed as "read full article".
  const isManual = typeof row.externalUrl === 'string' && row.externalUrl.startsWith('manual:');

  return {
    id: row.id,
    slug: row.slug || `news-${row.id}`,
    title,
    summary,
    content,
    category: row.category,
    imageUrl: row.imageUrl,
    author: row.author,
    sourceName: row.sourceName,
    externalUrl: row.externalUrl,
    isManual,
    publishedAt: row.publishedAt?.toISOString() || new Date().toISOString(),
    isEditorPick: row.isEditorPick,
    isManset: row.isManset ?? false,
    isTop: row.isTop ?? false,
    isGundem: row.isGundem ?? false,
  };
}

function buildPublicArticleSelect() {
  return {
    id: newsArticles.id,
    slug: newsArticles.slug,
    title: newsArticles.title,
    titleAz: newsArticles.titleAz,
    titleRu: newsArticles.titleRu,
    titleEn: newsArticles.titleEn,
    titleTr: newsArticles.titleTr,
    summary: newsArticles.summary,
    summaryAz: newsArticles.summaryAz,
    summaryRu: newsArticles.summaryRu,
    summaryEn: newsArticles.summaryEn,
    summaryTr: newsArticles.summaryTr,
    contentAz: newsArticles.contentAz,
    contentRu: newsArticles.contentRu,
    contentEn: newsArticles.contentEn,
    contentTr: newsArticles.contentTr,
    category: newsArticles.category,
    imageUrl: newsArticles.imageUrl,
    author: newsArticles.author,
    sourceName: newsSources.name,
    externalUrl: newsArticles.externalUrl,
    publishedAt: newsArticles.publishedAt,
    isEditorPick: newsArticles.isEditorPick,
    isManset: newsArticles.isManset,
    isTop: newsArticles.isTop,
    isGundem: newsArticles.isGundem,
  };
}

export async function getApprovedNewsArticles(filters: PublicNewsFilters = {}, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) {
    const mockItems = getAllNews()
      .map((item, index) => ({
        id: index + 1,
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        content: '',
        category: 'market' as const,
        imageUrl: null,
        author: item.author,
        sourceName: item.author,
        externalUrl: `https://dkagency.com.tr/haberler/${item.slug}`,
        isManual: false,
        publishedAt: item.publishDate,
        isEditorPick: index === 0,
      }))
      .filter((item) =>
        filters.category && filters.category !== 'all' ? item.category === filters.category : true
      );

    return {
      items: mockItems.slice(filters.offset ?? 0, (filters.offset ?? 0) + (filters.limit ?? 12)),
      total: mockItems.length,
      source: 'mock' as const,
    };
  }

  const limit = filters.limit ?? 12;
  const offset = filters.offset ?? 0;
  const where = and(...getPublicNewsConditions(filters.category));

  const [rows, totalRows] = await Promise.all([
    db
      .select(buildPublicArticleSelect())
      .from(newsArticles)
      .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .where(where)
      .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
      .limit(limit)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsArticles)
      .where(where),
  ]);

  return {
    items: rows.map((row) => mapPublicArticle(row, loc)),
    total: totalRows[0]?.count || 0,
    source: 'db' as const,
  };
}

/**
 * Real counters for the /haberler hero (TASK-0514): approved public articles in the last 7 days,
 * all approved public articles, and active RSS sources. `null` when the DB is not available —
 * the page then hides the counters instead of showing invented numbers.
 */
export async function getPublicNewsStats(): Promise<{
  last7Days: number;
  total: number;
  activeSources: number;
} | null> {
  if (!dbAvailable || !db) return null;
  const where = and(...getPublicNewsConditions());
  const [recent, total, sources] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsArticles)
      .where(
        and(
          where,
          sql`coalesce(${newsArticles.publishedAt}, ${newsArticles.createdAt}) >= now() - interval '7 days'`
        )
      ),
    db.select({ count: sql<number>`count(*)::int` }).from(newsArticles).where(where),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(newsSources)
      .where(eq(newsSources.isActive, true)),
  ]);
  return {
    last7Days: recent[0]?.count ?? 0,
    total: total[0]?.count ?? 0,
    activeSources: sources[0]?.count ?? 0,
  };
}

export async function getApprovedEditorPick(category?: NewsCategoryKey, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return null;

  const row = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(
      and(
        eq(newsArticles.isEditorPick, true),
        eq(newsArticles.status, 'approved'),
        isNotNull(newsArticles.slug),
        isNotNull(newsArticles.titleAz),
        sql`trim(coalesce(${newsArticles.titleAz}, '')) <> ''`,
        isNotNull(newsArticles.summaryAz),
        sql`trim(coalesce(${newsArticles.summaryAz}, '')) <> ''`,
        ...(category && category !== 'all' ? [eq(newsArticles.category, category)] : [])
      )
    )
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(1)
    .then((rows) => rows[0] || null);

  return row ? mapPublicArticle(row, loc) : null;
}

/** Fetch up to `limit` vitrin articles for the slider (all pages) */
export async function getVitrinNewsArticles(limit = 8, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return [];

  const rows = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(and(...getPublicNewsConditions()))
    // TASK-0490: manşet/top flags only win while the article is fresh (≤7 days).
    // Older flagged items fall back to plain date order instead of being stuck forever.
    .orderBy(
      desc(
        sql`(${newsArticles.isManset} and coalesce(${newsArticles.publishedAt}, ${newsArticles.createdAt}) >= now() - interval '7 days')`
      ),
      desc(
        sql`(${newsArticles.isTop} and coalesce(${newsArticles.publishedAt}, ${newsArticles.createdAt}) >= now() - interval '7 days')`
      ),
      desc(newsArticles.publishedAt),
      desc(newsArticles.createdAt)
    )
    .limit(limit);

  return rows.map((row) => mapPublicArticle(row, loc));
}

/**
 * TASK-0515: ONLY the stories the admin flagged «Xəbər manşet olsun?» (dashboard/xeberler →
 * NewsEditorForm `isManset`), still fresh (≤ 7 days, same rule as TASK-0490). Feeds the /haberler
 * lead slider; an empty result means "no manşet chosen" and the page falls back to one lead story.
 */
export async function getMansetNewsArticles(limit = 6, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return [];

  const rows = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(
      and(
        ...getPublicNewsConditions(),
        eq(newsArticles.isManset, true),
        sql`coalesce(${newsArticles.publishedAt}, ${newsArticles.createdAt}) >= now() - interval '7 days'`
      )
    )
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(limit);

  return rows.map((row) => mapPublicArticle(row, loc));
}

export async function getNewsArticleBySlug(slug: string, locale?: string, preview = false) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return null;

  const conditions = preview
    ? [eq(newsArticles.slug, slug), isNotNull(newsArticles.slug)]
    : [eq(newsArticles.slug, slug), ...getPublicNewsConditions()];

  const row = await db
    .select({
      id: newsArticles.id,
      slug: newsArticles.slug,
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      titleRu: newsArticles.titleRu,
      titleEn: newsArticles.titleEn,
      titleTr: newsArticles.titleTr,
      summary: newsArticles.summary,
      summaryAz: newsArticles.summaryAz,
      summaryRu: newsArticles.summaryRu,
      summaryEn: newsArticles.summaryEn,
      summaryTr: newsArticles.summaryTr,
      contentAz: newsArticles.contentAz,
      contentRu: newsArticles.contentRu,
      contentEn: newsArticles.contentEn,
      contentTr: newsArticles.contentTr,
      category: newsArticles.category,
      imageUrl: newsArticles.imageUrl,
      author: newsArticles.author,
      sourceName: newsSources.name,
      externalUrl: newsArticles.externalUrl,
      publishedAt: newsArticles.publishedAt,
      isEditorPick: newsArticles.isEditorPick,
      status: newsArticles.status,
      // to_jsonb keeps the query compatible while the idempotent 0017 migration
      // is pending, then starts returning the real columns without another deploy.
      relatedToolkits: sql<
        string[]
      >`coalesce(to_jsonb(news_articles)->'related_toolkits', '[]'::jsonb)`,
      relatedBlogSlug: sql<string | null>`to_jsonb(news_articles)->>'related_blog_slug'`,
    })
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(and(...conditions))
    .then((rows) => rows[0] || null);

  if (!row) return null;
  if (!preview && row.status !== 'approved') return null;

  return {
    ...mapPublicArticle(row, loc),
    originalTitle: row.title,
    originalSummary: row.summary || '',
    relatedToolkits: (row.relatedToolkits as string[] | null) || [],
    relatedBlogSlug: row.relatedBlogSlug || null,
  };
}

/** Conditions for related articles — includes both approved and translated for fuller sidebar */
function getRelatedNewsConditions(category?: NewsCategoryKey) {
  const conditions = [
    inArray(newsArticles.status, ['approved', 'translated']),
    isNotNull(newsArticles.slug),
    ...getTranslatedNewsConditions(),
  ];

  if (category && category !== 'all') {
    conditions.push(eq(newsArticles.category, category));
  }

  return conditions;
}

export async function getRelatedApprovedNewsArticles(
  articleId: number,
  category: Exclude<NewsCategoryKey, 'all'>,
  locale?: string
) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return [];

  // First try same category (approved + translated)
  const sameCategory = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(and(...getRelatedNewsConditions(category), ne(newsArticles.id, articleId)))
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(8);

  // If not enough, fill with other categories
  if (sameCategory.length < 8) {
    const existingIds = [articleId, ...sameCategory.map((r) => r.id)];
    const fill = await db
      .select(buildPublicArticleSelect())
      .from(newsArticles)
      .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
      .where(
        and(...getRelatedNewsConditions(), ...existingIds.map((eid) => ne(newsArticles.id, eid)))
      )
      .orderBy(desc(newsArticles.publishedAt))
      .limit(8 - sameCategory.length);
    sameCategory.push(...fill);
  }

  return sameCategory.map((row) => mapPublicArticle(row, loc));
}

type NewsCategoryDb = typeof newsArticles.$inferInsert.category;
type NewsStatusDb = typeof newsArticles.$inferInsert.status;

export interface CreateNewsInput {
  slug?: string | null;
  titleAz?: string | null;
  titleRu?: string | null;
  titleEn?: string | null;
  titleTr?: string | null;
  summaryAz?: string | null;
  summaryRu?: string | null;
  summaryEn?: string | null;
  summaryTr?: string | null;
  contentAz?: string | null;
  contentRu?: string | null;
  contentEn?: string | null;
  contentTr?: string | null;
  category?: NewsCategoryDb;
  author?: string | null;
  publishedAt?: string | null;
  status?: NewsStatusDb;
  imageUrl?: string | null;
  seoTitle?: string | null;
  seoDescription?: string | null;
  isEditorPick?: boolean;
  isManset?: boolean;
  isTop?: boolean;
  isGundem?: boolean;
  newsType?: string | null;
  telegramSend?: boolean;
  logoOverlay?: boolean;
  externalUrl?: string | null;
  sourceId?: number | null;
}

export async function createNewsArticle(input: CreateNewsInput) {
  if (!dbAvailable || !db) {
    throw new Error('DB unavailable — cannot create news article');
  }

  const slugBase =
    input.slug?.trim() ||
    input.titleAz?.trim() ||
    input.titleTr?.trim() ||
    input.titleEn?.trim() ||
    input.titleRu?.trim() ||
    'haber';

  const slug = slugBase
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
    .slice(0, 240);

  const externalUrl =
    input.externalUrl && input.externalUrl.trim().length > 0
      ? input.externalUrl.trim()
      : `manual:${slug}:${Date.now()}`;

  const title =
    input.titleAz?.trim() ||
    input.titleTr?.trim() ||
    input.titleEn?.trim() ||
    input.titleRu?.trim() ||
    'Başlıqsız xəbər';

  const summary =
    input.summaryAz?.trim() ||
    input.summaryTr?.trim() ||
    input.summaryEn?.trim() ||
    input.summaryRu?.trim() ||
    null;

  const publishedAt = input.publishedAt ? new Date(input.publishedAt) : new Date();

  const [row] = await db
    .insert(newsArticles)
    .values({
      sourceId: input.sourceId ?? null,
      externalUrl,
      slug,
      title,
      titleAz: input.titleAz ?? null,
      titleRu: input.titleRu ?? null,
      titleEn: input.titleEn ?? null,
      titleTr: input.titleTr ?? null,
      summary,
      summaryAz: input.summaryAz ?? null,
      summaryRu: input.summaryRu ?? null,
      summaryEn: input.summaryEn ?? null,
      summaryTr: input.summaryTr ?? null,
      contentAz: input.contentAz ?? null,
      contentRu: input.contentRu ?? null,
      contentEn: input.contentEn ?? null,
      contentTr: input.contentTr ?? null,
      category: input.category ?? 'market',
      imageUrl: input.imageUrl?.trim() || null,
      author: input.author?.trim() || null,
      publishedAt,
      status: input.status ?? 'fetched',
      isEditorPick: input.isEditorPick ?? false,
      isManset: input.isManset ?? false,
      isTop: input.isTop ?? false,
      isGundem: input.isGundem ?? false,
      newsType: input.newsType ?? 'none',
      telegramSend: input.telegramSend ?? false,
      logoOverlay: input.logoOverlay ?? false,
      seoTitle: input.seoTitle?.trim()?.slice(0, 70) || null,
      seoDescription: input.seoDescription?.trim()?.slice(0, 160) || null,
    })
    .returning({ id: newsArticles.id, slug: newsArticles.slug });

  return row;
}

// ===========================================================================
// AI Auto-translate (mirrors blog-repository.translateBlogPostBySlug pattern)
// ===========================================================================

export type NewsTranslateResult = {
  ok: boolean;
  langs: Record<'ru' | 'en' | 'tr', 'done' | 'failed' | 'skipped'>;
  error?: string;
};

function needsTranslation(targetValue: unknown, azSource: string | null | undefined): boolean {
  if (!azSource || !azSource.trim()) return false;
  if (typeof targetValue !== 'string' || !targetValue.trim()) return true;
  return targetValue.trim() === azSource.trim();
}

const EMPTY_TRANSLATE_RESULT = (): NewsTranslateResult => ({
  ok: false,
  langs: { ru: 'skipped', en: 'skipped', tr: 'skipped' },
});

export async function autoTranslateNewsArticle(id: number): Promise<NewsTranslateResult> {
  const result: NewsTranslateResult = {
    ok: true,
    langs: { ru: 'skipped', en: 'skipped', tr: 'skipped' },
  };
  if (!dbAvailable || !db) return { ...EMPTY_TRANSLATE_RESULT(), error: 'db-unavailable' };

  try {
    const [row] = await db.select().from(newsArticles).where(eq(newsArticles.id, id));
    if (!row) return { ...EMPTY_TRANSLATE_RESULT(), error: 'not-found' };

    const langs = ['ru', 'en', 'tr'] as const;
    const failedFields: string[] = [];
    const database = db;

    // TASK-0490: languages and fields run in parallel (was 3 langs × 3 fields
    // sequential → the admin request outlived Hostinger's proxy timeout → 504).
    const langOutcomes = await Promise.all(
      langs.map(async (lang) => {
        const capLang = lang.charAt(0).toUpperCase() + lang.slice(1);
        const fields: Array<['title' | 'summary' | 'content', string]> = [];

        if (needsTranslation(row[`title${capLang}` as keyof typeof row], row.titleAz)) {
          fields.push(['title', row.titleAz as string]);
        }
        if (needsTranslation(row[`summary${capLang}` as keyof typeof row], row.summaryAz)) {
          fields.push(['summary', row.summaryAz as string]);
        }
        if (needsTranslation(row[`content${capLang}` as keyof typeof row], row.contentAz)) {
          fields.push(['content', row.contentAz as string]);
        }

        if (fields.length === 0) return { lang, state: 'skipped' as const };

        const translated = await Promise.all(
          fields.map(async ([name, src]) => ({ name, src, value: await translateText(src, lang) }))
        );

        const langUpdates: Record<string, string> = {};
        let anyFail = false;
        for (const { name, src, value } of translated) {
          if (value) {
            langUpdates[`${name}${capLang}`] = value;
          } else {
            anyFail = true;
            failedFields.push(`${name}_${lang}`);
            console.error(
              `[translate-news] FAIL ${row.slug} ${name}_${lang} (${src.length} chars)`
            );
          }
        }

        if (Object.keys(langUpdates).length > 0) {
          await database
            .update(newsArticles)
            .set(langUpdates as unknown as Partial<typeof newsArticles.$inferInsert>)
            .where(eq(newsArticles.id, id));
        }

        return { lang, state: anyFail ? ('failed' as const) : ('done' as const) };
      })
    );

    for (const outcome of langOutcomes) {
      result.langs[outcome.lang] = outcome.state;
      if (outcome.state === 'failed') result.ok = false;
    }

    if (failedFields.length > 0) {
      result.error = `Failed fields: ${failedFields.join(', ')}`;
    }

    return result;
  } catch (e) {
    const msg = String(e).slice(0, 300);
    console.error(`[translate-news] CRASH for article id=${id}: ${msg}`);
    return { ...EMPTY_TRANSLATE_RESULT(), error: msg };
  }
}

export async function translateNewsArticleBySlug(slug: string): Promise<NewsTranslateResult> {
  if (!dbAvailable || !db) return { ...EMPTY_TRANSLATE_RESULT(), error: 'db-unavailable' };
  const [row] = await db
    .select({ id: newsArticles.id })
    .from(newsArticles)
    .where(eq(newsArticles.slug, slug));
  if (!row) return { ...EMPTY_TRANSLATE_RESULT(), error: 'not-found' };
  return autoTranslateNewsArticle(row.id);
}

/**
 * TASK-0529: «Trend xəbərlər» strip on /haberler (owner 10.10, Biznes Mərkəzi pattern). Stories the
 * editor flagged — top, gündəm or editor pick — from the last 30 days, newest first. The page tops the
 * strip up with the newest stories when fewer than 4 are flagged.
 */
export async function getTrendNewsArticles(limit = 10, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return [];

  const rows = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(
      and(
        ...getPublicNewsConditions(),
        sql`(${newsArticles.isTop} or ${newsArticles.isGundem} or ${newsArticles.isEditorPick})`,
        sql`coalesce(${newsArticles.publishedAt}, ${newsArticles.createdAt}) >= now() - interval '30 days'`
      )
    )
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(limit);

  return rows.map((row) => mapPublicArticle(row, loc));
}
