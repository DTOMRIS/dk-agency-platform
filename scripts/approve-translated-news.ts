/**
 * @file scripts/approve-translated-news.ts
 * @description Batch approve translated news articles — status: translated → approved, set approvedAt
 * @usage npm run approve-news [--execute]
 */

import { db, dbAvailable } from '../lib/db';
import { newsArticles } from '../lib/db/schema';
import { and, eq, isNotNull } from 'drizzle-orm';

async function approveBatchTranslatedNews() {
  const dryRun = !process.argv.includes('--execute');

  if (!dbAvailable || !db) {
    console.error('DATABASE_URL tapılmadı. Skript dayandırıldı.');
    process.exitCode = 1;
    return;
  }

  console.log(`[News Batch Approval] ${dryRun ? 'DRY RUN' : 'EXECUTE'} mode`);

  // Get all articles with status='translated' and titleAz is not null
  const translatedArticles = await db
    .select({
      id: newsArticles.id,
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      status: newsArticles.status,
    })
    .from(newsArticles)
    .where(
      and(
        eq(newsArticles.status, 'translated'),
        isNotNull(newsArticles.titleAz),
      ),
    );

  console.log(`[News Batch Approval] Found ${translatedArticles.length} articles to approve`);

  if (translatedArticles.length === 0) {
    console.log('[News Batch Approval] Nothing to do.');
    process.exitCode = 0;
    return;
  }

  if (dryRun) {
    console.log('[News Batch Approval] DRY RUN — sample articles:');
    translatedArticles.slice(0, 3).forEach((article) => {
      console.log(`  - [${article.id}] ${article.titleAz || article.title}`);
    });
    console.log(`  ... and ${Math.max(0, translatedArticles.length - 3)} more`);
    console.log('[News Batch Approval] Run with --execute to proceed.');
  } else {
    // Update all translated articles to 'approved'
    const updateResult = await db
      .update(newsArticles)
      .set({
        status: 'approved',
      })
      .where(
        and(
          eq(newsArticles.status, 'translated'),
          isNotNull(newsArticles.titleAz),
        ),
      )
      .returning({ id: newsArticles.id });

    console.log(`[News Batch Approval] ✅ Successfully approved ${updateResult.length} articles.`);
    console.log(
      `[News Batch Approval] IDs: ${updateResult.map((a) => a.id).join(', ')}`,
    );
  }

  process.exitCode = 0;
}

approveBatchTranslatedNews().catch((err: unknown) => {
  console.error('[News Batch Approval] Exception:', err);
  process.exitCode = 1;
});
