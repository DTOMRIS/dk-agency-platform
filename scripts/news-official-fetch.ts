/** TASK-0554. Default is read-only; scheduled collection passes --commit explicitly. */
import { ingestOfficialNews } from '../lib/news/official-ingest';

const annotation = (message: string) => message.replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');

async function main() {
  const write = process.argv.includes('--commit');
  const result = await ingestOfficialNews(write);
  console.log(`[news:official] ${write ? 'COMMIT' : 'READ-ONLY'}: ${result.sourcesOk} sources read, ${result.accepted.length} ${write ? 'inserted' : 'candidates'}`);
  console.log(`  Duplicates: ${result.duplicates}; old: ${result.tooOld}; irrelevant: ${result.irrelevant}; weak: ${result.weak}`);
  for (const item of result.accepted) console.log(`  + ${item.source}: ${item.title} (${item.url})`);
  for (const message of [...result.failures, ...result.warnings]) {
    console.warn(`  ! ${message}`);
    if (process.env.GITHUB_ACTIONS === 'true') console.warn(`::warning title=Official news coverage::${annotation(message)}`);
  }
  // A broken collector/database must not quietly show green. Partial source outages stay annotated.
  process.exit(result.sourcesOk === 0 || result.failures.some((e) => e.includes('[insert]')) ? 1 : 0);
}

main().catch((error: unknown) => {
  console.error('[news:official]', error instanceof Error ? error.message : 'Unknown failure');
  process.exit(1);
});
