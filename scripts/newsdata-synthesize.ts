/**
 * @file newsdata-synthesize.ts
 * @purpose CLI script: npm run news:synthesize
 * TASK-0402: DeepSeek Model-B — fetched signals → original DK HoReCa analysis.
 */

import { synthesizeFetchedNews } from '../lib/news/synthesize';
import { randomUUID } from 'node:crypto';

async function main() {
  console.log('[news:synthesize] Starting DeepSeek synthesis...');
  const start = Date.now();

  const result = await synthesizeFetchedNews(undefined, process.env.GITHUB_RUN_ID || randomUUID());

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

  if (result.warnings.length) {
    console.warn(`  Article warnings (${result.warnings.length}):`);
    for (const w of result.warnings) {
      console.warn(`    - ${w}`);
      console.log(`::warning title=News article skipped::${w}`);
    }
  }

  // TASK-0563: delivery/system failures still fail the job (owner gets the alert mail). A single article the AI
  // could not draft does not, while others shipped; if every attempted article failed, that is a real outage.
  const allDraftsFailed = result.warnings.length > 0 && result.synthesized === 0;
  process.exit(result.errors.length || allDraftsFailed ? 1 : 0);
}

main().catch((err) => {
  console.error('[news:synthesize] Fatal error:', err);
  process.exit(1);
});
