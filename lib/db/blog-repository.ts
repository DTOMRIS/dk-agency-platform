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
    doganNote:
      (locale !== 'az' ? (r[`doganNote_${locale}`] as string | undefined) : undefined) ||
      row.doganNote ||
      '',
    status: row.status || 'draft',
    guruBoxes: boxRows
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
      .map((item) => {
        const boxR = item as unknown as Record<string, unknown>;
        return {
          guruName: localizedField(boxR, 'guruName', locale) || item.guruName || '',
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
 * Fills EMPTY target fields AND re-translates fields that are just an
 * untranslated copy of the AZ source (self-healing for polluted rows, e.g.
 * title_ru === title_az). Never overwrites a genuine manual translation.
 * Returns a per-language result so callers can show the admin what happened
 * (no silent failure). Never throws.
 */
export type BlogTranslateResult = {
  ok: boolean;
  langs: Record<'ru' | 'en' | 'tr', 'done' | 'failed' | 'skipped'>;
  error?: string;
};

// AZ-specific characters that don't exist in Russian or English.
// If a "translated" RU/EN field contains these → it's still AZ text, not translated.
const AZ_CHARS = /[əöüğışçƏÖÜĞIŞÇ]/;

// A target locale value needs (re)translation when:
// 1. Target is empty/null
// 2. Target is identical to AZ source (exact copy)
// 3. Target is case-insensitive equal to AZ (DeepSeek sometimes copies with case changes)
// 4. Target contains AZ-specific chars for ru/en targets (means it was never translated)
function needsTranslation(
  targetValue: unknown,
  azSource: string | null | undefined,
  targetLang?: string,
): boolean {
  if (!azSource || !azSource.trim()) return false;
  if (typeof targetValue !== 'string' || !targetValue.trim()) return true;
  const target = targetValue.trim();
  const source = azSource.trim();
  // Exact match
  if (target === source) return true;
  // Case-insensitive match (DeepSeek copies with case change = not translated)
  if (target.toLowerCase() === source.toLowerCase()) return true;
  // AZ chars in RU/EN target = still AZ text, not translated
  if ((targetLang === 'ru' || targetLang === 'en') && AZ_CHARS.test(target)) return true;
  return false;
}

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

    const langs = ['ru', 'en', 'tr'] as const;
    const failedFields: string[] = [];

    for (const lang of langs) {
      const langUpdates: Record<string, string> = {};
      const fields: Array<['title' | 'summary' | 'content', string]> = [];
      if (needsTranslation(row[`title_${lang}` as keyof typeof row], row.title_az, lang))
        fields.push(['title', row.title_az]);
      if (needsTranslation(row[`summary_${lang}` as keyof typeof row], row.summary_az, lang))
        fields.push(['summary', row.summary_az as string]);
      if (needsTranslation(row[`content_${lang}` as keyof typeof row], row.content_az, lang))
        fields.push(['content', row.content_az]);

      const needsDogan = needsTranslation(
        row[`doganNote_${lang}` as keyof typeof row],
        row.doganNote,
        lang
      );

      if (fields.length === 0 && !needsDogan) {
        result.langs[lang] = 'skipped';
        continue;
      }

      let anyFail = false;
      for (const [name, src] of fields) {
        const v = await translateText(src, lang);
        if (v) {
          langUpdates[`${name}_${lang}`] = v;
          console.log(`[translate] ✅ ${row.slug} ${name}_${lang} (${src.length}→${v.length} chars)`);
        } else {
          anyFail = true;
          failedFields.push(`${name}_${lang}`);
          console.error(`[translate] ❌ FAIL ${row.slug} ${name}_${lang} (${src.length} chars, 3 retries exhausted)`);
        }
      }
      if (needsDogan) {
        const v = await translateText(row.doganNote as string, lang);
        if (v) {
          langUpdates[`doganNote_${lang}`] = v;
          console.log(`[translate] ✅ ${row.slug} doganNote_${lang}`);
        } else {
          anyFail = true;
          failedFields.push(`doganNote_${lang}`);
          console.error(`[translate] ❌ FAIL ${row.slug} doganNote_${lang}`);
        }
      }

      // Write successful translations for THIS language immediately
      // (don't let one language failure block another)
      if (Object.keys(langUpdates).length > 0) {
        await db
          .update(blogPosts)
          .set({ ...langUpdates, updatedAt: new Date() } as unknown as Partial<
            typeof blogPosts.$inferInsert
          >)
          .where(eq(blogPosts.id, id));
      }

      result.langs[lang] = anyFail ? 'failed' : 'done';
      if (anyFail) result.ok = false;
    }

    // Guru sitat qutuları: quote_az + guruName → quote_<lang> + guruName_<lang>.
    const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, id));
    for (const box of boxes) {
      for (const lang of langs) {
        const boxUpdates: Record<string, string> = {};

        if (needsTranslation(box[`quote_${lang}` as keyof typeof box], box.quote_az, lang)) {
          const v = await translateText(box.quote_az as string, lang);
          if (v) {
            boxUpdates[`quote_${lang}`] = v;
            console.log(`[translate] ✅ guru_box#${box.id} quote_${lang}`);
          } else {
            result.ok = false;
            failedFields.push(`guru_box#${box.id}.quote_${lang}`);
            console.error(`[translate] ❌ FAIL guru_box#${box.id} quote_${lang}`);
          }
        }

        const nameKey = `guruName_${lang}` as keyof typeof box;
        if (needsTranslation(box[nameKey], box.guruName, lang)) {
          const v = await translateText(box.guruName as string, lang);
          if (v) {
            boxUpdates[`guruName_${lang}`] = v;
            console.log(`[translate] ✅ guru_box#${box.id} guruName_${lang}`);
          } else {
            result.ok = false;
            failedFields.push(`guru_box#${box.id}.guruName_${lang}`);
            console.error(`[translate] ❌ FAIL guru_box#${box.id} guruName_${lang}`);
          }
        }

        // Write each language for each box independently
        if (Object.keys(boxUpdates).length > 0) {
          await db
            .update(guruBoxes)
            .set(boxUpdates as unknown as Partial<typeof guruBoxes.$inferInsert>)
            .where(eq(guruBoxes.id, box.id));
        }
      }
    }

    if (failedFields.length > 0) {
      result.error = `Failed fields: ${failedFields.join(', ')}`;
      console.error(`[translate] ${row.slug} INCOMPLETE — failed: ${failedFields.join(', ')}`);
    }

    return result;
  } catch (e) {
    const msg = String(e).slice(0, 300);
    console.error(`[translate] CRASH for post id=${id}: ${msg}`);
    return { ...EMPTY_RESULT(), error: msg };
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
