import { and, desc, eq, sql } from 'drizzle-orm';
import { db, dbAvailable } from './index';
import { blogPosts, guruBoxes } from './schema';
import {
  BLOG_ARTICLES as STATIC_BLOG_ARTICLES,
  getAllBlogArticles,
  getBlogArticleBySlug,
  type BlogArticle,
} from '@/lib/data/blogArticles';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';

export interface BlogListFilters {
  category?: string | null;
  status?: string | null;
  limit?: number | null;
  offset?: number | null;
}

export interface DbBlogPost extends BlogArticle {
  seoTitle?: string;
  seoDescription?: string;
  doganNote?: string;
  status: string;
  guruBoxes: Array<{
    guruName: string;
    quote: string;
    book: string;
    sortOrder: number;
  }>;
}

function excerpt(content: string, length: number = 180) {
  return content.replace(/[#>*`]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, length);
}

function mapStaticArticle(article: BlogArticle): DbBlogPost {
  return {
    ...article,
    seoTitle: article.title,
    seoDescription: article.metaDescription,
    doganNote: '',
    status: 'published',
    guruBoxes: [],
  };
}

function mapDbArticle(
  row: typeof blogPosts.$inferSelect,
  boxRows: typeof guruBoxes.$inferSelect[] = [],
  locale: ContentLocale = 'az',
): DbBlogPost {
  const r = row as unknown as Record<string, unknown>;
  const title = localizedField(r, 'title', locale) || row.title_az;
  const summary = localizedField(r, 'summary', locale) || excerpt(row.content_az, 220);
  const content = localizedField(r, 'content', locale) || row.content_az;

  return {
    id: String(row.id),
    slug: row.slug,
    title,
    subtitle: undefined,
    category: (row.category as BlogArticle['category']) || 'maliyye',
    categoryEmoji: '',
    readingTime: row.readTime || 8,
    wordCount: content?.split(/\s+/).filter(Boolean).length || 0,
    author: row.author || 'DK Agency',
    publishDate: row.publishedAt?.toISOString() || row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || row.createdAt?.toISOString() || new Date().toISOString(),
    tags: [],
    metaDescription: row.seoDescription || summary || excerpt(content, 160),
    focusKeyword: '',
    summary,
    content,
    isPremium: Boolean(row.hasPaywall),
    relatedArticles: [],
    coverImage: row.featuredImage || '',
    coverImageAlt: title,
    seoTitle: row.seoTitle || title,
    seoDescription: row.seoDescription || summary || '',
    doganNote: row.doganNote || '',
    status: row.status || 'draft',
    guruBoxes: boxRows
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => {
        const boxR = item as unknown as Record<string, unknown>;
        return {
          guruName: item.guruName || '',
          quote: localizedField(boxR, 'quote', locale) || item.quote_az || '',
          book: item.book || '',
          sortOrder: item.sortOrder || 0,
        };
      }),
  };
}

export async function getBlogPostsFromDb(filters: BlogListFilters = {}, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) {
    const staticArticles = getAllBlogArticles().map(mapStaticArticle);
    const filtered = staticArticles.filter((article) => {
      const categoryMatch = !filters.category || article.category === filters.category;
      const statusMatch =
        !filters.status || filters.status === 'all' ? true : article.status === filters.status;
      return categoryMatch && statusMatch;
    });
    return {
      posts: filtered.slice(filters.offset || 0, (filters.offset || 0) + (filters.limit || filtered.length)),
      total: filtered.length,
      source: 'static' as const,
    };
  }

  const conditions = [];
  if (filters.category) conditions.push(eq(blogPosts.category, filters.category));
  if (filters.status && filters.status !== 'all') conditions.push(eq(blogPosts.status, filters.status));

  let query = db
    .select()
    .from(blogPosts)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(blogPosts.publishedAt), desc(blogPosts.createdAt))
    .$dynamic();

  if (typeof filters.limit === 'number') {
    query = query.limit(filters.limit);
  }
  if (typeof filters.offset === 'number') {
    query = query.offset(filters.offset);
  }

  const rows = await query;
  const totalRows = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(blogPosts)
    .where(conditions.length ? and(...conditions) : undefined);

  return {
    posts: rows.map((row) => mapDbArticle(row, [], loc)),
    total: totalRows[0]?.count || 0,
    source: 'db' as const,
  };
}

export async function getBlogPostDetail(slug: string, locale?: string) {
  const loc = sanitizeLocale(locale);

  if (!dbAvailable || !db) {
    const article = getBlogArticleBySlug(slug);
    return article ? mapStaticArticle(article) : null;
  }

  const row = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).then((items) => items[0]);
  if (!row) return null;

  const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, row.id));
  return mapDbArticle(row, boxes, loc);
}

/** Returns raw DB row with all locale columns — for admin editor */
export async function getBlogPostRaw(slug: string) {
  if (!dbAvailable || !db) return null;

  const row = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).then((items) => items[0]);
  if (!row) return null;

  const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, row.id));
  return { ...row, guruBoxesList: boxes };
}

export async function createBlogPostInDb(input: {
  slug: string;
  titleAz: string;
  titleTr?: string;
  titleEn?: string;
  titleRu?: string;
  category: string;
  author: string;
  readTime: number;
  featuredImage?: string;
  contentAz: string;
  contentTr?: string;
  contentEn?: string;
  contentRu?: string;
  doganNote?: string;
  seoTitle?: string;
  seoDescription?: string;
  paywall: boolean;
  status: string;
  guruBoxes?: Array<{ guru: string; quote: string; book: string }>;
}) {
  if (!dbAvailable || !db) {
    console.log('blog_create_mock', input);
    return { slug: input.slug, source: 'static' as const };
  }

  const inserted = await db
    .insert(blogPosts)
    .values({
      slug: input.slug,
      title_az: input.titleAz,
      title_tr: input.titleTr || null,
      title_en: input.titleEn || null,
      title_ru: input.titleRu || null,
      summary_az: excerpt(input.contentAz, 220),
      content_az: input.contentAz,
      content_tr: input.contentTr || null,
      content_en: input.contentEn || null,
      content_ru: input.contentRu || null,
      category: input.category,
      author: input.author,
      readTime: input.readTime,
      featuredImage: input.featuredImage || null,
      doganNote: input.doganNote || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      hasPaywall: input.paywall,
      status: input.status,
      publishedAt: input.status === 'published' ? new Date() : null,
    })
    .returning({ id: blogPosts.id, slug: blogPosts.slug });

  const post = inserted[0];
  for (const [index, box] of (input.guruBoxes || []).entries()) {
    if (!box.guru && !box.quote && !box.book) continue;
    await db.insert(guruBoxes).values({
      blogPostId: post.id,
      guruName: box.guru || null,
      quote_az: box.quote || null,
      book: box.book || null,
      sortOrder: index,
    });
  }

  return { slug: post.slug, source: 'db' as const };
}

export async function updateBlogPostInDb(
  slug: string,
  input: Parameters<typeof createBlogPostInDb>[0],
) {
  if (!dbAvailable || !db) {
    console.log('blog_update_mock', { slug, input });
    return { slug, source: 'static' as const };
  }

  const existing = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug)).then((items) => items[0]);
  if (!existing) return null;

  await db
    .update(blogPosts)
    .set({
      slug: input.slug,
      title_az: input.titleAz,
      title_tr: input.titleTr || null,
      title_en: input.titleEn || null,
      title_ru: input.titleRu || null,
      summary_az: excerpt(input.contentAz, 220),
      content_az: input.contentAz,
      content_tr: input.contentTr || null,
      content_en: input.contentEn || null,
      content_ru: input.contentRu || null,
      category: input.category,
      author: input.author,
      readTime: input.readTime,
      featuredImage: input.featuredImage || null,
      doganNote: input.doganNote || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      hasPaywall: input.paywall,
      status: input.status,
      publishedAt: input.status === 'published' ? existing.publishedAt || new Date() : existing.publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.id, existing.id));

  await db.delete(guruBoxes).where(eq(guruBoxes.blogPostId, existing.id));
  for (const [index, box] of (input.guruBoxes || []).entries()) {
    if (!box.guru && !box.quote && !box.book) continue;
    await db.insert(guruBoxes).values({
      blogPostId: existing.id,
      guruName: box.guru || null,
      quote_az: box.quote || null,
      book: box.book || null,
      sortOrder: index,
    });
  }

  return { slug: input.slug, source: 'db' as const };
}

export async function archiveBlogPostInDb(slug: string) {
  if (!dbAvailable || !db) {
    console.log('blog_delete_mock', slug);
    return true;
  }

  await db
    .update(blogPosts)
    .set({
      status: 'archived',
      updatedAt: new Date(),
    })
    .where(eq(blogPosts.slug, slug));

  return true;
}

export function getStaticBlogSeedSource() {
  return STATIC_BLOG_ARTICLES;
}
