/**
 * @file newsdata-synthesize.ts
 * @purpose CLI script: npm run news:synthesize
 * TASK-0402: DeepSeek Model-B — fetched signals → original DK HoReCa analysis.
 */

import { synthesizeFetchedNews } from '../lib/news/synthesize';

async function main() {
  console.log('[news:synthesize] Starting DeepSeek synthesis...');
  const start = Date.now();

  const result = await synthesizeFetchedNews();

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`[news:synthesize] Done in ${elapsed}s`);
  console.log(`  Synthesized:    ${result.synthesized}`);
  console.log(`  Unpublishable:  ${result.unpublishable}`);
  console.log(`  Skipped:        ${result.skipped}`);

  if (result.errors.length) {
    console.error(`  Errors (${result.errors.length}):`);
    for (const err of result.errors) {
      console.error(`    - ${err}`);
    }
  }

  // Only fail if ALL items errored (not just weak signals)
  const fatalErrors = result.errors.filter((e) => !e.includes('[validate]') && !e.includes('[parse]'));
  if (result.synthesized === 0 && fatalErrors.length > 0) {
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('[news:synthesize] Fatal error:', err);
  process.exit(1);
});
