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
import { translateText } from '@/lib/ai/translate';

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
  return content
    .replace(/[#>*`]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, length);
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

function resolveLocalCover(slug: string, dbImage: string | null): string {
  // blob:/data: values are browser-only artifacts that should never have been
  // persisted (legacy editor bug). Treat them as missing so a fallback shows
  // instead of a broken image.
  const usable =
    dbImage && !dbImage.startsWith('blob:') && !dbImage.startsWith('data:') ? dbImage : null;
  if (usable && usable.startsWith('/')) return usable;
  const staticMatch = STATIC_BLOG_ARTICLES.find((a) => a.slug === slug);
  if (staticMatch?.coverImage) return staticMatch.coverImage;
  if (usable) {
    if (usable.startsWith('http://') || usable.startsWith('https://')) {
      return usable;
    }
    return '/' + usable;
  }
  return '';
}

function mapDbArticle(
  row: typeof blogPosts.$inferSelect,
  boxRows: (typeof guruBoxes.$inferSelect)[] = [],
  locale: ContentLocale = 'az'
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
    stage: (row.stage as BlogArticle['stage']) || undefined,
    readingTime: row.readTime || 8,
    wordCount: content?.split(/\s+/).filter(Boolean).length || 0,
    author: row.author || 'DK Agency',
    publishDate:
      row.publishedAt?.toISOString() || row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt:
      row.updatedAt?.toISOString() || row.createdAt?.toISOString() || new Date().toISOString(),
    tags: [],
    metaDescription: row.seoDescription || summary || excerpt(content, 160),
    focusKeyword: '',
    summary,
    content,
    isPremium: Boolean(row.hasPaywall),
    relatedArticles: [],
    coverImage: resolveLocalCover(row.slug, row.featuredImage),
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
      posts: filtered.slice(
        filters.offset || 0,
        (filters.offset || 0) + (filters.limit || filtered.length)
      ),
      total: filtered.length,
      source: 'static' as const,
    };
  }

  const conditions = [];
  if (filters.category) conditions.push(eq(blogPosts.category, filters.category));
  if (filters.status && filters.status !== 'all')
    conditions.push(eq(blogPosts.status, filters.status));

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

  const row = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .then((items) => items[0]);
  if (!row) return null;

  const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, row.id));
  return mapDbArticle(row, boxes, loc);
}

/** Returns raw DB row with all locale columns — for admin editor */
export async function getBlogPostRaw(slug: string) {
  if (!dbAvailable || !db) return null;

  const row = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .then((items) => items[0]);
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
  stage?: string;
  paywall: boolean;
  status: string;
  guruBoxes?: Array<{ guru: string; quote: string; book: string }>;
}) {
  if (!dbAvailable || !db) {
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
      stage: input.stage || null,
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
  input: Parameters<typeof createBlogPostInDb>[0]
) {
  if (!dbAvailable || !db) {
    return { slug, source: 'static' as const };
  }

  const existing = await db
    .select()
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug))
    .then((items) => items[0]);
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
      stage: input.stage || null,
      author: input.author,
      readTime: input.readTime,
      featuredImage: input.featuredImage || null,
      doganNote: input.doganNote || null,
      seoTitle: input.seoTitle || null,
      seoDescription: input.seoDescription || null,
      hasPaywall: input.paywall,
      status: input.status,
      publishedAt:
        input.status === 'published' ? existing.publishedAt || new Date() : existing.publishedAt,
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

/**
 * Best-effort auto-translation of a blog post's AZ fields into ru/en/tr.
 * Fills only EMPTY target fields (never overwrites manual translations).
 * Returns a per-language result so callers can show the admin what happened
 * (no silent failure). Never throws.
 */
export type BlogTranslateResult = {
  ok: boolean;
  langs: Record<'ru' | 'en' | 'tr', 'done' | 'failed' | 'skipped'>;
  error?: string;
};

const EMPTY_RESULT = (): BlogTranslateResult => ({
  ok: false,
  langs: { ru: 'skipped', en: 'skipped', tr: 'skipped' },
});

export async function autoTranslateBlogPost(id: number): Promise<BlogTranslateResult> {
  const result: BlogTranslateResult = {
    ok: true,
    langs: { ru: 'skipped', en: 'skipped', tr: 'skipped' },
  };
  if (!dbAvailable || !db) return { ...EMPTY_RESULT(), error: 'db-unavailable' };
  try {
    const [row] = await db.select().from(blogPosts).where(eq(blogPosts.id, id));
    if (!row) return { ...EMPTY_RESULT(), error: 'not-found' };

    const updates: Record<string, string> = {};
    const langs = ['ru', 'en', 'tr'] as const;

    for (const lang of langs) {
      const fields: Array<['title' | 'summary' | 'content', string]> = [];
      if (!row[`title_${lang}` as keyof typeof row] && row.title_az)
        fields.push(['title', row.title_az]);
      if (!row[`summary_${lang}` as keyof typeof row] && row.summary_az)
        fields.push(['summary', row.summary_az]);
      if (!row[`content_${lang}` as keyof typeof row] && row.content_az)
        fields.push(['content', row.content_az]);

      if (fields.length === 0) {
        result.langs[lang] = 'skipped';
        continue;
      }
      let anyFail = false;
      for (const [name, src] of fields) {
        const v = await translateText(src, lang);
        if (v) updates[`${name}_${lang}`] = v;
        else anyFail = true;
      }
      result.langs[lang] = anyFail ? 'failed' : 'done';
      if (anyFail) result.ok = false;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(blogPosts)
        .set({ ...updates, updatedAt: new Date() } as unknown as Partial<
          typeof blogPosts.$inferInsert
        >)
        .where(eq(blogPosts.id, id));
    }
    return result;
  } catch (e) {
    return { ...EMPTY_RESULT(), error: String(e).slice(0, 200) };
  }
}

/** Translate by slug (admin manual trigger). */
export async function translateBlogPostBySlug(slug: string): Promise<BlogTranslateResult> {
  if (!dbAvailable || !db) return { ...EMPTY_RESULT(), error: 'db-unavailable' };
  const [row] = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(eq(blogPosts.slug, slug));
  if (!row) return { ...EMPTY_RESULT(), error: 'not-found' };
  return autoTranslateBlogPost(row.id);
}
