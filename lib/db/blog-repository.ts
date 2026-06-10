import { and, desc, eq, inArray, or, sql } from 'drizzle-orm';
import { db, dbAvailable } from './index';
import { blogPosts, guruBoxes, slugRedirects } from './schema';
import {
  BLOG_ARTICLES as STATIC_BLOG_ARTICLES,
  getAllBlogArticles,
  getBlogArticleBySlug,
  type BlogArticle,
} from '@/lib/data/blogArticles';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';
import { translateText } from '@/lib/ai/translate';

/** Generate all slug variants to try — handles dirty slugs, ? suffix, URL encoding */
function getSlugsToTry(slug: string): string[] {
  const set = new Set<string>();
  set.add(slug);

  // ? is a query-string delimiter in URLs — DB may have slug WITH ? but URL strips it
  if (slug.endsWith('?')) {
    set.add(slug.slice(0, -1));
  } else {
    set.add(slug + '?');
  }

  // URL-decoded variant (Next.js usually decodes, but be safe)
  try {
    const decoded = decodeURIComponent(slug);
    if (decoded !== slug) {
      set.add(decoded);
      set.add(decoded.endsWith('?') ? decoded.slice(0, -1) : decoded + '?');
    }
  } catch { /* invalid encoding, skip */ }

  return [...set];
}

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

  const slugsToTry = getSlugsToTry(slug);
  const row = await db
    .select()
    .from(blogPosts)
    .where(or(...slugsToTry.map((s) => eq(blogPosts.slug, s))))
    .then((items) => items[0]);
  if (!row) return null;

  const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, row.id));
  return mapDbArticle(row, boxes, loc);
}

/**
 * Locale-aware related posts from DB (same category first, excludes current slug,
 * fills remaining from recent published). Replaces the static-AZ getRelatedArticles
 * so related-article titles/links follow the active locale (fixes "related hep AZ").
 */
export async function getRelatedBlogPosts(
  slug: string,
  category: string | undefined,
  locale?: string,
  limit = 3
): Promise<DbBlogPost[]> {
  const loc = sanitizeLocale(locale);
  const pool: DbBlogPost[] = [];
  const seen = new Set<string>([slug]);

  const push = (posts: DbBlogPost[]) => {
    for (const p of posts) {
      if (seen.has(p.slug)) continue;
      seen.add(p.slug);
      pool.push(p);
      if (pool.length >= limit) break;
    }
  };

  if (category) {
    const sameCat = await getBlogPostsFromDb(
      { category, status: 'published', limit: limit + 3 },
      loc
    );
    push(sameCat.posts);
  }
  if (pool.length < limit) {
    const recent = await getBlogPostsFromDb({ status: 'published', limit: limit + 6 }, loc);
    push(recent.posts);
  }
  return pool;
}

/** All blog post IDs (for admin batch re-translation). */
export async function getAllBlogPostIds(): Promise<number[]> {
  if (!dbAvailable || !db) return [];
  const rows = await db.select({ id: blogPosts.id }).from(blogPosts);
  return rows.map((r) => r.id);
}

/** Returns raw DB row with all locale columns — for admin editor */
export async function getBlogPostRaw(slug: string) {
  if (!dbAvailable || !db) return null;

  const slugsToTry = getSlugsToTry(slug);
  const row = await db
    .select()
    .from(blogPosts)
    .where(or(...slugsToTry.map((s) => eq(blogPosts.slug, s))))
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

  const slugsToTry = getSlugsToTry(slug);
  const existing = await db
    .select()
    .from(blogPosts)
    .where(or(...slugsToTry.map((s) => eq(blogPosts.slug, s))))
    .then((items) => items[0]);
  if (!existing) return null;

  // Slug dəyişibsə → köhnə slug-ı redirect cədvəlinə yaz
  if (input.slug && input.slug !== existing.slug) {
    await db.insert(slugRedirects).values({
      oldSlug: existing.slug,
      newSlug: input.slug,
      type: 'blog',
    }).onConflictDoNothing();
  }

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

  const slugsToTry = getSlugsToTry(slug);
  await db
    .update(blogPosts)
    .set({
      status: 'archived',
      updatedAt: new Date(),
    })
    .where(or(...slugsToTry.map((s) => eq(blogPosts.slug, s))));

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
  targetLang?: string
): boolean {
  if (!azSource || !azSource.trim()) return false;
  if (typeof targetValue !== 'string' || !targetValue.trim()) return true;
  const target = targetValue.trim();
  const source = azSource.trim();
  // Exact match
  if (target === source) return true;
  // Case-insensitive match (DeepSeek copies with case change = not translated)
  if (target.toLowerCase() === source.toLowerCase()) return true;
  // `ə` (schwa) is Azerbaijani-only (absent in tr/ru/en) → reliable AZ signal for ALL targets, incl tr
  if (/[əƏ]/.test(target)) return true;
  // Full AZ char set is only meaningful for ru/en (tr legitimately shares ö/ü/ğ/ı/ş/ç)
  if ((targetLang === 'ru' || targetLang === 'en') && AZ_CHARS.test(target)) return true;
  return false;
}

// ─── Live translation status (admin "self-proving" screen — no SQL needed) ───
export type FieldStatus = 'ok' | 'missing' | 'untranslated';

const TR_BRANDS = /DK Agency|KAZAN AI|OCAQ|AQTA|ASAN|KOB[İI]A|Sedd Rozeti|Doğan Tomris/g;

/** Per-field truth derived from the actual DB value (never a stored flag that can lie). */
function fieldStatus(
  target: unknown,
  azSource: string | null | undefined,
  lang: 'ru' | 'en' | 'tr'
): FieldStatus {
  if (!azSource || !azSource.trim()) return 'ok'; // nothing to translate
  if (typeof target !== 'string' || !target.trim()) return 'missing';
  const t = target.trim();
  if (needsTranslation(t, azSource, lang)) return 'untranslated';
  // ru must contain Cyrillic (brand names stripped so a Latin brand can't fool it)
  if (lang === 'ru' && !/[Ѐ-ӿ]/.test(t.replace(TR_BRANDS, ' '))) return 'untranslated';
  return 'ok';
}

export interface PostLangStatus {
  title: FieldStatus;
  summary: FieldStatus;
  content: FieldStatus;
  doganNote: FieldStatus;
  guru: FieldStatus;
}
export interface PostTranslationStatus {
  id: number;
  slug: string;
  titleAz: string;
  langs: Record<'ru' | 'en' | 'tr', PostLangStatus>;
}

/**
 * Every blog post × {ru,en,tr} × {title,summary,content,doganNote,guru} status,
 * computed live from DB values. Powers the admin status matrix so Doğan can SEE
 * green/red instead of running SQL.
 */
export async function getBlogTranslationMatrix(): Promise<PostTranslationStatus[]> {
  if (!dbAvailable || !db) return [];
  const rows = await db.select().from(blogPosts).orderBy(desc(blogPosts.createdAt));
  const out: PostTranslationStatus[] = [];

  for (const row of rows) {
    const r = row as unknown as Record<string, unknown>;
    const boxes = await db.select().from(guruBoxes).where(eq(guruBoxes.blogPostId, row.id));
    const langs = {} as Record<'ru' | 'en' | 'tr', PostLangStatus>;

    for (const lang of ['ru', 'en', 'tr'] as const) {
      // guru = worst status across every box's quote + name
      let guru: FieldStatus = 'ok';
      for (const box of boxes) {
        const b = box as unknown as Record<string, unknown>;
        for (const s of [
          fieldStatus(b[`quote_${lang}`], b.quote_az as string, lang),
          fieldStatus(b[`guruName_${lang}`], b.guruName as string, lang),
        ]) {
          if (s === 'missing') guru = 'missing';
          else if (s === 'untranslated' && guru !== 'missing') guru = 'untranslated';
        }
      }

      langs[lang] = {
        title: fieldStatus(r[`title_${lang}`], row.title_az, lang),
        summary: fieldStatus(r[`summary_${lang}`], row.summary_az, lang),
        content: fieldStatus(r[`content_${lang}`], row.content_az, lang),
        doganNote: fieldStatus(r[`doganNote_${lang}`], row.doganNote as string, lang),
        guru,
      };
    }

    out.push({ id: row.id, slug: row.slug, titleAz: row.title_az, langs });
  }
  return out;
}

// ─── Dual content-model migration (admin endpoint, server-run, no node CLI) ───
// Parse old markdown-embedded guru (╔═╗) + Doğan note into structured DB fields
// (guru_boxes + dogan_note) and strip them from content_az, so every post renders
// through the single structured path. Idempotent + supports dry-run preview.

const GURU_BLOCK = />\s*╔[═╗\n>║\s\S]*?╚[═╝]+/g;

function parseGuruBlock(
  block: string
): { name: string; quote: string; source: string; isDogan: boolean } | null {
  const lines = block
    .split('\n')
    .map((l) =>
      l
        .replace(/^>\s*/, '')
        .replace(/[╔╗╚╝║═]/g, '')
        .trim()
    )
    .filter(Boolean);

  let name = '';
  let isDogan = false;
  const sourceParts: string[] = [];
  const quoteLines: string[] = [];
  let inQuote = false;

  for (const line of lines) {
    // Name line (🎤 or leading bold)
    if (line.includes('🎤') || (!name && line.startsWith('**'))) {
      name = line.replace(/🎤\s*/, '').replace(/\*\*/g, '').trim();
      if (/doğan|notu/i.test(name)) isDogan = true;
      continue;
    }
    // Source/book line
    if (line.includes('📖')) {
      sourceParts.push(
        line
          .replace('📖', '')
          .replace(/Mənbə:/i, '')
          .trim()
      );
      continue;
    }
    // Context line — ends the quote, not part of it
    if (line.includes('🔗')) {
      inQuote = false;
      continue;
    }
    // The real quote is the ITALIC block: starts at a line with *" and runs
    // (across continuation lines) until a line ending the italic ("* or trailing *).
    if (!inQuote && /\*\s*["'“]/.test(line)) inQuote = true;
    if (inQuote) {
      quoteLines.push(line);
      if (/["'”]\s*\*/.test(line) || line.endsWith('*')) inQuote = false;
      continue;
    }
    // Anything else (the plain-quoted byline/role) is intentionally ignored so it
    // does NOT leak into the quote.
  }

  const quote = quoteLines
    .join(' ')
    .replace(/\*+/g, '')
    .replace(/^["'“]+|["'”]+$/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  const source = sourceParts.join(' ').trim();

  if (!name || !quote) return null;
  return { name, quote, source, isDogan };
}

function extractDoganNote(content: string): { raw: string; text: string } | null {
  const lines = content.split('\n');
  let start = -1;
  let end = -1;
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].trim().startsWith('>')) {
      const probe = lines[i].toLowerCase();
      if (probe.includes('📝') && (probe.includes('doğan') || probe.includes('notu'))) {
        start = i;
        while (start > 0 && lines[start - 1].trim().startsWith('>')) start -= 1;
        end = i;
        while (end < lines.length - 1 && lines[end + 1].trim().startsWith('>')) end += 1;
        break;
      }
    }
  }
  if (start === -1) return null;

  const raw = lines.slice(start, end + 1).join('\n');
  const text = lines
    .slice(start, end + 1)
    .map((l) => l.replace(/^>\s*/, ''))
    .join('\n')
    .replace(/📝/g, '')
    .replace(/\*\*DOĞAN NOTU:\*\*/i, '')
    .replace(/DOĞAN NOTU:/i, '')
    .replace(/—\s*Doğan Tomris/i, '')
    .replace(/["“”]/g, '')
    .trim();

  return { raw, text };
}

export interface MigrationPostDetail {
  id: number;
  slug: string;
  guruExtracted: Array<{ name: string; quotePreview: string }>;
  doganPreview: string | null;
  contentStripped: boolean;
}
export interface MigrationResult {
  apply: boolean;
  postsScanned: number;
  guruInserted: number;
  doganSet: number;
  contentStripped: number;
  details: MigrationPostDetail[];
}

/**
 * Migrate every blog post's markdown-embedded guru/Doğan blocks into structured
 * fields. `apply=false` = dry-run preview (no writes). Idempotent: skips guru
 * insert if the post already has guru_boxes, skips dogan if dogan_note is set;
 * still strips leftover markdown duplicates either way.
 */
export async function migrateBlogStructure(apply: boolean): Promise<MigrationResult> {
  const result: MigrationResult = {
    apply,
    postsScanned: 0,
    guruInserted: 0,
    doganSet: 0,
    contentStripped: 0,
    details: [],
  };
  if (!dbAvailable || !db) return result;

  const rows = await db.select().from(blogPosts).orderBy(blogPosts.id);
  result.postsScanned = rows.length;

  for (const row of rows) {
    const content = row.content_az || '';
    let newContent = content;
    const detail: MigrationPostDetail = {
      id: row.id,
      slug: row.slug,
      guruExtracted: [],
      doganPreview: null,
      contentStripped: false,
    };

    // Guru boxes
    const existing = await db
      .select({ id: guruBoxes.id })
      .from(guruBoxes)
      .where(eq(guruBoxes.blogPostId, row.id));
    const hasBoxes = existing.length > 0;
    const guruMatches = content.match(GURU_BLOCK) || [];
    // A Doğan note written in guru-box ASCII (name = "DOĞAN NOTU") → routed to
    // dogan_note, NOT stored as a fake guru.
    let doganFromGuru: string | null = null;

    if (guruMatches.length > 0 && !hasBoxes) {
      let order = 0;
      for (const block of guruMatches) {
        const parsed = parseGuruBlock(block);
        if (!parsed) continue;
        if (parsed.isDogan) {
          if (!doganFromGuru) doganFromGuru = parsed.quote;
          newContent = newContent.replace(block, '').trim();
          continue;
        }
        detail.guruExtracted.push({ name: parsed.name, quotePreview: parsed.quote.slice(0, 80) });
        if (apply) {
          await db.insert(guruBoxes).values({
            blogPostId: row.id,
            guruName: parsed.name,
            quote_az: parsed.quote,
            book: parsed.source || null,
            sortOrder: order,
          });
        }
        order += 1;
        newContent = newContent.replace(block, '').trim();
      }
    } else if (guruMatches.length > 0 && hasBoxes) {
      for (const block of guruMatches) newContent = newContent.replace(block, '').trim();
    }

    // Doğan note: prefer the guru-format one, else the `>` 📝 blockquote.
    const doganAlreadySet = Boolean(row.doganNote && row.doganNote.trim());
    const blockquoteDogan = extractDoganNote(newContent);
    const doganText = doganFromGuru || blockquoteDogan?.text || null;
    if (doganText && !doganAlreadySet) {
      detail.doganPreview = doganText.slice(0, 80);
      if (apply) {
        await db.update(blogPosts).set({ doganNote: doganText }).where(eq(blogPosts.id, row.id));
      }
    }
    if (blockquoteDogan) {
      newContent = newContent.replace(blockquoteDogan.raw, '').trim();
    }

    // Persist stripped content
    if (newContent !== content) {
      newContent = newContent.replace(/\n{3,}/g, '\n\n');
      detail.contentStripped = true;
      if (apply) {
        await db.update(blogPosts).set({ content_az: newContent }).where(eq(blogPosts.id, row.id));
      }
    }

    if (detail.guruExtracted.length > 0 || detail.doganPreview || detail.contentStripped) {
      result.guruInserted += detail.guruExtracted.length;
      if (detail.doganPreview) result.doganSet += 1;
      if (detail.contentStripped) result.contentStripped += 1;
      result.details.push(detail);
    }
  }

  return result;
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
          console.log(
            `[translate] ✅ ${row.slug} ${name}_${lang} (${src.length}→${v.length} chars)`
          );
        } else {
          anyFail = true;
          failedFields.push(`${name}_${lang}`);
          console.error(
            `[translate] ❌ FAIL ${row.slug} ${name}_${lang} (${src.length} chars, 3 retries exhausted)`
          );
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
  const slugsToTry = getSlugsToTry(slug);
  const [row] = await db
    .select({ id: blogPosts.id })
    .from(blogPosts)
    .where(or(...slugsToTry.map((s) => eq(blogPosts.slug, s))));
  if (!row) return { ...EMPTY_RESULT(), error: 'not-found' };
  return autoTranslateBlogPost(row.id);
}

// ─── Bulk operations ─────────────────────────────────────────────

export type BulkBlogAction = 'archive' | 'publish' | 'draft' | 'delete';

export async function bulkUpdateBlogStatus(ids: number[], action: BulkBlogAction): Promise<number> {
  if (!dbAvailable || !db || ids.length === 0) return 0;

  if (action === 'delete') {
    await db.delete(guruBoxes).where(inArray(guruBoxes.blogPostId, ids));
    const result = await db.delete(blogPosts).where(inArray(blogPosts.id, ids));
    return result.rowCount ?? ids.length;
  }

  const statusMap: Record<string, string> = { archive: 'archived', publish: 'published', draft: 'draft' };
  const result = await db
    .update(blogPosts)
    .set({ status: statusMap[action], updatedAt: new Date() })
    .where(inArray(blogPosts.id, ids));
  return result.rowCount ?? ids.length;
}

/** Look up slug redirect — returns new slug if old slug has a redirect */
export async function getSlugRedirect(oldSlug: string): Promise<string | null> {
  if (!dbAvailable || !db) return null;
  const [row] = await db
    .select({ newSlug: slugRedirects.newSlug })
    .from(slugRedirects)
    .where(eq(slugRedirects.oldSlug, oldSlug))
    .limit(1);
  return row?.newSlug ?? null;
}
