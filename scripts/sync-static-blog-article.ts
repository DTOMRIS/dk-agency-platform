import { eq } from 'drizzle-orm';
import { BLOG_ARTICLES } from '../lib/data/blogArticles';
import { db, dbAvailable } from '../lib/db';
import { blogPosts } from '../lib/db/schema';

async function main() {
  const slug = process.argv[2];

  if (!slug) {
    throw new Error('Usage: npx tsx scripts/sync-static-blog-article.ts <slug>');
  }

  if (!dbAvailable || !db) {
    throw new Error('DATABASE_URL is required.');
  }

  const article = BLOG_ARTICLES.find((item) => item.slug === slug);

  if (!article) {
    throw new Error(`Static blog article not found: ${slug}`);
  }

  const existing = await db
  .select({ id: blogPosts.id })
  .from(blogPosts)
  .where(eq(blogPosts.slug, slug))
  .then((rows) => rows[0]);

  if (!existing) {
    throw new Error(`Database blog article not found: ${slug}`);
  }

  await db
  .update(blogPosts)
  .set({
    title_az: article.title,
    title_tr: null,
    title_en: null,
    title_ru: null,
    summary_az: article.summary,
    summary_tr: null,
    summary_en: null,
    summary_ru: null,
    content_az: article.content,
    content_tr: null,
    content_en: null,
    content_ru: null,
    category: article.category,
    stage: article.stage || null,
    author: article.author,
    readTime: article.readingTime,
    featuredImage: article.coverImage,
    seoTitle: article.title,
    seoDescription: article.metaDescription,
    hasPaywall: article.isPremium,
    status: 'published',
    updatedAt: new Date(),
  })
  .where(eq(blogPosts.id, existing.id));

  const updated = await db
  .select({
    slug: blogPosts.slug,
    status: blogPosts.status,
    stage: blogPosts.stage,
    category: blogPosts.category,
    readTime: blogPosts.readTime,
    featuredImage: blogPosts.featuredImage,
    hasPaywall: blogPosts.hasPaywall,
  })
  .from(blogPosts)
  .where(eq(blogPosts.id, existing.id))
  .then((rows) => rows[0]);

  console.log(JSON.stringify(updated, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
