/**
 * @file scripts/approve-translated-news.ts
 * @purpose Batch approve translated news articles in the DB.
 *
 * Usage:
 *   npx tsx scripts/approve-translated-news.ts           # dry-run (shows, does NOT change)
 *   npx tsx scripts/approve-translated-news.ts --execute  # real DB update
 *
 * npm shorthand:
 *   npm run approve-news              # dry-run
 *   npm run approve-news -- --execute # execute
 *
 * Criteria for approval:
 *   - status = 'translated'
 *   - title_az is non-null and non-empty (trimmed)
 *   - summary_az is non-null and non-empty (trimmed)
 */

import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { and, eq, isNotNull, sql } from 'drizzle-orm';
import * as schema from '../lib/db/schema';

// ── bootstrap ──────────────────────────────────────────────────────────────

const DATABASE_URL = process.env.DATABASE_URL?.trim();

if (!DATABASE_URL) {
  console.error('[approve-translated-news] DATABASE_URL tapılmadı.');
  console.error('  .env.local faylını yoxla və ya --env-file flag istifadə et:');
  console.error('  node --env-file=.env.local node_modules/.bin/tsx scripts/approve-translated-news.ts');
  process.exit(1);
}

const connection = neon(DATABASE_URL);
const db = drizzle(connection, { schema });

// ── helpers ─────────────────────────────────────────────────────────────────

const { newsArticles } = schema;

type ArticleRow = {
  id: number;
  title: string;
  titleAz: string | null;
  summaryAz: string | null;
  status: 'fetched' | 'translated' | 'approved' | 'rejected';
};

function hasValidTranslation(row: ArticleRow): boolean {
  return (
    typeof row.titleAz === 'string' &&
    row.titleAz.trim().length > 0 &&
    typeof row.summaryAz === 'string' &&
    row.summaryAz.trim().length > 0
  );
}

// ── main ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const isDryRun = !process.argv.includes('--execute');

  console.log('');
  console.log('='.repeat(60));
  console.log('  DK Agency — News Batch Approval Script');
  console.log(`  Mode: ${isDryRun ? 'DRY-RUN (dəyişiklik yoxdur)' : 'EXECUTE (real DB update)'}`);
  console.log('='.repeat(60));
  console.log('');

  // Fetch all articles with status='translated'
  const candidates = await db
    .select({
      id: newsArticles.id,
      title: newsArticles.title,
      titleAz: newsArticles.titleAz,
      summaryAz: newsArticles.summaryAz,
      status: newsArticles.status,
    })
    .from(newsArticles)
    .where(
      and(
        eq(newsArticles.status, 'translated'),
        isNotNull(newsArticles.titleAz),
        sql`trim(coalesce(${newsArticles.titleAz}, '')) <> ''`,
      ),
    )
    .orderBy(newsArticles.id);

  // Partition into approvable vs skipped
  const toApprove: ArticleRow[] = [];
  const skipped: ArticleRow[] = [];

  for (const row of candidates) {
    if (hasValidTranslation(row as ArticleRow)) {
      toApprove.push(row as ArticleRow);
    } else {
      skipped.push(row as ArticleRow);
    }
  }

  // Print candidates
  console.log(`Tapılan xəbərlər (status=translated): ${candidates.length}`);
  console.log('');

  if (toApprove.length > 0) {
    console.log(`Approve ediləcək (${toApprove.length}):`);
    for (const row of toApprove) {
      const preview = (row.titleAz ?? row.title).slice(0, 70);
      console.log(`  [${row.id}] ${preview}${preview.length >= 70 ? '…' : ''}`);
    }
  } else {
    console.log('Approve ediləcək xəbər yoxdur.');
  }

  if (skipped.length > 0) {
    console.log('');
    console.log(`Keçildi — tam tərcümə yoxdur (${skipped.length}):`);
    for (const row of skipped) {
      console.log(`  [${row.id}] ${row.title.slice(0, 70)} — summaryAz boşdur`);
    }
  }

  console.log('');

  if (isDryRun) {
    console.log(`Would approve ${toApprove.length} article(s). (Dry-run — heç nə dəyişdirilmədi)`);
    console.log('  Real update üçün: npm run approve-news -- --execute');
    console.log('');
    return;
  }

  // Execute mode: update each article
  if (toApprove.length === 0) {
    console.log('Execute: Approve ediləcək xəbər yoxdur. Çıxılır.');
    console.log('');
    return;
  }

  let approved = 0;
  let failed = 0;

  for (const row of toApprove) {
    try {
      await db
        .update(newsArticles)
        .set({ status: 'approved' })
        .where(
          and(
            eq(newsArticles.id, row.id),
            eq(newsArticles.status, 'translated'), // guard: yalnız hələ translated olanları dəyişdir
          ),
        );
      approved++;
      const preview = (row.titleAz ?? row.title).slice(0, 60);
      console.log(`  ✓ [${row.id}] ${preview}`);
    } catch (err: unknown) {
      failed++;
      const message = err instanceof Error ? err.message : String(err);
      console.error(`  ✗ [${row.id}] XƏTA: ${message}`);
    }
  }

  console.log('');
  console.log('─'.repeat(60));
  console.log(`Nəticə: ${approved} approve edildi, ${skipped.length} keçildi (tam tərcümə yoxdur), ${failed} xəta`);
  console.log('─'.repeat(60));
  console.log('');
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  console.error('[approve-translated-news] Fatal xəta:', message);
  process.exit(1);
});
