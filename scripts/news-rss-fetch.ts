/**
 * @file news-rss-fetch.ts
 * @purpose CLI: npx tsx scripts/news-rss-fetch.ts — trade-press RSS → DB drafts (TASK-0480).
 * Never fails the workflow for a dead feed; only a missing DB is fatal.
 */

import { ingestTradeRss } from '../lib/news/rss-ingest';

async function main() {
  console.log('[news:rss] Fetching trade-press RSS...');
  const start = Date.now();
  const r = await ingestTradeRss();
  console.log(`[news:rss] Done in ${((Date.now() - start) / 1000).toFixed(1)}s`);
  console.log(`  Feeds OK:        ${r.feedsOk}  failed: ${r.feedsFailed.length}`);
  console.log(`  Inserted:        ${r.inserted.length}`);
  console.log(`  Below threshold: ${r.rejected.length}`);
  console.log(`  Too old:         ${r.tooOld}  duplicates: ${r.duplicates}  over cap: ${r.overCap}`);
  for (const f of r.feedsFailed) console.log(`  ! ${f}`);
  for (const i of r.inserted) console.log(`  + [${i.score}] ${i.title} (${i.source})`);
  for (const i of [...r.rejected].sort((a, b) => b.score - a.score).slice(0, 25)) {
    console.log(`  - [${i.score}] ${i.title} (${i.source})`);
  }
  for (const e of r.errors) console.error(`  ERROR ${e}`);
  if (r.errors.includes('Database not available')) process.exit(1);
}

main().catch((err) => {
  console.error('[news:rss] Fatal error:', err);
  process.exit(1);
});
