import { and, desc, eq, isNotNull, ne, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { newsArticles, newsSources } from '@/lib/db/schema';
import { getAllNews } from '@/lib/data/mockNewsDB';
import { defaultNewsSources } from '@/lib/data/newsSources';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';

export interface NewsAdminFilters {
  status?: string | null;
}

export interface AdminNewsArticle {
  id: number;
  sourceId: number | null;
  sourceName: string | null;
  externalUrl: string | null;
  slug: string | null;
  title: string;
  titleAz: string | null;
  summary: string | null;
  summaryAz: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  publishedAt: string;
  status: 'fetched' | 'translated' | 'approved' | 'rejected';
  isEditorPick: boolean;
}

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
  category: Exclude<NewsCategoryKey, 'all'>;
  imageUrl: string | null;
  author: string | null;
  sourceName: string | null;
  externalUrl: string;
  publishedAt: string;
  isEditorPick: boolean;
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
  if (!dbAvailable || !db) {
    const mockRows = getAllNews()
      .map((item, index) => ({
        id: index + 1,
        sourceId: null,
        sourceName: item.author,
        externalUrl: null,
        slug: item.slug,
        title: item.title,
        titleAz: item.title,
        summary: item.summary,
        summaryAz: item.summary,
        category: item.category,
        imageUrl: null,
        author: item.author,
        publishedAt: item.publishDate,
        status: item.isPremium ? 'translated' : 'approved',
        isEditorPick: index === 0,
      }))
      .filter((item) => (!filters.status || filters.status === 'all' ? true : item.status === filters.status));

    console.log('[newsRepository.getAdminNewsArticles] mock', {
      status: filters.status ?? 'all',
      total: mockRows.length,
    });

    return { items: mockRows as AdminNewsArticle[], total: mockRows.length, source: 'mock' as const };
  }

  const conditions = [];
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(newsArticles.status, filters.status as typeof newsArticles.$inferSelect.status));
  }

  const rows = await db
    .select({
      id: newsArticles.id,
      sourceId: newsArticles.sourceId,
      sourceName: newsSources.name,
      externalUrl: newsArticles.externalUrl,
      slug: newsArticles.slug,
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      summary: newsArticles.summary,
      summaryAz: newsArticles.summaryAz,
      category: newsArticles.category,
      imageUrl: newsArticles.imageUrl,
      author: newsArticles.author,
      publishedAt: newsArticles.publishedAt,
      status: newsArticles.status,
      isEditorPick: newsArticles.isEditorPick,
    })
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt));

  const totalRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(newsArticles)
    .where(conditions.length ? and(...conditions) : undefined);

  console.log('[newsRepository.getAdminNewsArticles] db', {
    status: filters.status ?? 'all',
    total: totalRows[0]?.count || 0,
    sampleIds: rows.slice(0, 5).map((item) => item.id),
  });

  return {
    items: rows.map((item) => ({
      ...item,
      publishedAt: item.publishedAt?.toISOString() || new Date().toISOString(),
    })) as AdminNewsArticle[],
    total: totalRows[0]?.count || 0,
    source: 'db' as const,
  };
}

export async function updateNewsArticleReviewState(
  id: number,
  input: { status?: 'fetched' | 'translated' | 'approved' | 'rejected'; isEditorPick?: boolean },
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
    titleAz?: string | null;
    summaryAz?: string | null;
    imageUrl?: string | null;
  },
) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  await db
    .update(newsArticles)
    .set({
      status: input.status,
      isEditorPick: input.isEditorPick,
      titleAz: input.titleAz,
      summaryAz: input.summaryAz,
      imageUrl: input.imageUrl,
    })
    .where(eq(newsArticles.id, id));

  return { success: true, source: 'db' as const };
}

export async function getAdminNewsArticleById(id: number) {
  if (!dbAvailable || !db) return null;

  return db
    .select({
      id: newsArticles.id,
      titleAz: newsArticles.titleAz,
      summaryAz: newsArticles.summaryAz,
      status: newsArticles.status,
      isEditorPick: newsArticles.isEditorPick,
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
  input: { titleAz: string; summaryAz: string },
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

function mapPublicArticle(row: {
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
}, locale: ContentLocale = 'az'): PublicNewsArticle {
  const r = row as unknown as Record<string, unknown>;
  // News uses titleAz (camelCase) not title_az — remap for localizedField
  const titleByLocale: Record<ContentLocale, string | null | undefined> = {
    az: row.titleAz, ru: row.titleRu, en: row.titleEn, tr: row.titleTr,
  };
  const summaryByLocale: Record<ContentLocale, string | null | undefined> = {
    az: row.summaryAz, ru: row.summaryRu, en: row.summaryEn, tr: row.summaryTr,
  };

  const title = titleByLocale[locale]?.trim() || row.titleAz || row.title;
  const summary = summaryByLocale[locale]?.trim() || row.summaryAz || row.summary || '';

  return {
    id: row.id,
    slug: row.slug || `news-${row.id}`,
    title,
    summary,
    category: row.category,
    imageUrl: row.imageUrl,
    author: row.author,
    sourceName: row.sourceName,
    externalUrl: row.externalUrl,
    publishedAt: row.publishedAt?.toISOString() || new Date().toISOString(),
    isEditorPick: row.isEditorPick,
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
    category: newsArticles.category,
    imageUrl: newsArticles.imageUrl,
    author: newsArticles.author,
    sourceName: newsSources.name,
    externalUrl: newsArticles.externalUrl,
    publishedAt: newsArticles.publishedAt,
    isEditorPick: newsArticles.isEditorPick,
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
        category: 'market' as const,
        imageUrl: null,
        author: item.author,
        sourceName: item.author,
        externalUrl: `https://dkagency.az/haberler/${item.slug}`,
        publishedAt: item.publishDate,
        isEditorPick: index === 0,
      }))
      .filter((item) => (filters.category && filters.category !== 'all' ? item.category === filters.category : true));

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
    db.select({ count: sql<number>`count(*)::int` }).from(newsArticles).where(where),
  ]);

  return {
    items: rows.map((row) => mapPublicArticle(row, loc)),
    total: totalRows[0]?.count || 0,
    source: 'db' as const,
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
        ...(category && category !== 'all' ? [eq(newsArticles.category, category)] : []),
      ),
    )
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(1)
    .then((rows) => rows[0] || null);

  return row ? mapPublicArticle(row, loc) : null;
}

export async function getNewsArticleBySlug(slug: string, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return null;

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
      category: newsArticles.category,
      imageUrl: newsArticles.imageUrl,
      author: newsArticles.author,
      sourceName: newsSources.name,
      externalUrl: newsArticles.externalUrl,
      publishedAt: newsArticles.publishedAt,
      isEditorPick: newsArticles.isEditorPick,
      status: newsArticles.status,
    })
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(and(eq(newsArticles.slug, slug), ...getPublicNewsConditions()))
    .then((rows) => rows[0] || null);

  if (!row || row.status !== 'approved') return null;
  return {
    ...mapPublicArticle(row, loc),
    originalTitle: row.title,
    originalSummary: row.summary || '',
  };
}

export async function getRelatedApprovedNewsArticles(articleId: number, category: Exclude<NewsCategoryKey, 'all'>, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) return [];

  const rows = await db
    .select(buildPublicArticleSelect())
    .from(newsArticles)
    .leftJoin(newsSources, eq(newsSources.id, newsArticles.sourceId))
    .where(
      and(
        ...getPublicNewsConditions(category),
        ne(newsArticles.id, articleId),
      ),
    )
    .orderBy(desc(newsArticles.publishedAt), desc(newsArticles.createdAt))
    .limit(3);

  return rows.map((row) => mapPublicArticle(row, loc));
}
