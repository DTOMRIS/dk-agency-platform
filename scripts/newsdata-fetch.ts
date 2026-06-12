/**
 * @file newsdata-fetch.ts
 * @purpose CLI script: npm run news:fetch
 * TASK-0401: Fetch from NewsData.io, score, dedup, insert drafts.
 */

import { fetchAndScoreNews } from '../lib/news/newsdata-fetch';

async function main() {
  console.log('[news:fetch] Starting NewsData.io discovery...');
  const start = Date.now();

  const result = await fetchAndScoreNews();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[news:fetch] Done in ${elapsed}s`);
  console.log(`  Fetched (inserted): ${result.fetched}`);
  console.log(`  Below threshold:    ${result.belowThreshold}`);
  console.log(`  Duplicates:         ${result.duplicates}`);
  console.log(`  Skipped (no data):  ${result.skipped}`);

  if (result.errors.length) {
    console.error(`  Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      console.error(`    - ${err}`);
    }
  }

  // Exit with error code if nothing fetched and there were errors
  if (result.fetched === 0 && result.errors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[news:fetch] Fatal error:', err);
  process.exit(1);
});
