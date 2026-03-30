import { db, dbAvailable } from './index';
import { blogPosts, guruBoxes } from './schema';
import { BLOG_ARTICLES } from '../data/blogArticles';

async function seedBlog() {
  if (!dbAvailable || !db) {
    console.error('DATABASE_URL tapılmadı. Blog seed dayandırıldı.');
    process.exitCode = 1;
    return;
  }

  console.log('Blog seeding...');

  for (const article of BLOG_ARTICLES) {
    const inserted = await db
      .insert(blogPosts)
      .values({
        slug: article.slug,
        title_az: article.title,
        title_tr: null,
        title_en: null,
        summary_az: article.summary,
        summary_tr: null,
        summary_en: null,
        content_az: article.content,
        content_tr: null,
        content_en: null,
        category: article.category,
        author: article.author,
        readTime: article.readingTime,
        featuredImage: article.coverImage,
        doganNote: null,
        seoTitle: article.title,
        seoDescription: article.metaDescription,
        hasPaywall: article.isPremium ?? true,
        status: 'published',
        publishedAt: new Date(article.publishDate),
      })
      .onConflictDoNothing()
      .returning({ id: blogPosts.id });

    const postId = inserted[0]?.id;
    if (!postId) continue;

    if ('guruBoxes' in article && Array.isArray((article as { guruBoxes?: unknown[] }).guruBoxes)) {
      const boxes = (article as { guruBoxes?: Array<{ guru?: string; quote?: string; book?: string }> }).guruBoxes || [];
      for (const [index, box] of boxes.entries()) {
        await db.insert(guruBoxes).values({
          blogPostId: postId,
          guruName: box.guru || null,
          quote_az: box.quote || null,
          book: box.book || null,
          sortOrder: index,
        });
      }
    }
  }

  console.log('✅ Blog seed tamamlandı!');
}

seedBlog()
  .catch(console.error)
  .finally(() => process.exit());
