import { and, desc, eq, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { newsArticles, newsSources } from '@/lib/db/schema';
import { getAllNews } from '@/lib/data/mockNewsDB';
import { defaultNewsSources } from '@/lib/data/newsSources';

export interface NewsAdminFilters {
  status?: string | null;
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

    return { items: mockRows, total: mockRows.length, source: 'mock' as const };
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

  return {
    items: rows.map((item) => ({
      ...item,
      publishedAt: item.publishedAt?.toISOString() || new Date().toISOString(),
    })),
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
