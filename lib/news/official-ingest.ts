import { db } from '@/lib/db';
import { hasStoredSourceUrl, storeRssCandidate, type Candidate } from './rss-ingest';
import { isBlockedTopic, scoreNewsItem, SCORE_THRESHOLD } from './scoring-config';
import { elementsByClass, htmlText, isOfficialTopic, parseOfficialListing } from './official-parser';
import { fetchOfficialHtml } from './official-fetch';
import { OFFICIAL_SOURCES, type OfficialSource } from './official-sources';

export type OfficialResult = {
  sourcesOk: number; failures: string[]; warnings: string[];
  accepted: Array<{ source: string; title: string; url: string }>;
  duplicates: number; tooOld: number; irrelevant: number; weak: number;
};

/** Safe default: real HTTP discovery without DB writes, AI calls or Telegram messages. */
export async function ingestOfficialNews(
  write = false,
  readHtml: typeof fetchOfficialHtml = fetchOfficialHtml,
  sources: OfficialSource[] = OFFICIAL_SOURCES,
): Promise<OfficialResult> {
  const result: OfficialResult = { sourcesOk: 0, failures: [], warnings: [], accepted: [],
    duplicates: 0, tooOld: 0, irrelevant: 0, weak: 0 };
  if (write && !db) throw new Error('Database not available');
  const now = Date.now();
  for (const source of sources) {
    let parsed: ReturnType<typeof parseOfficialListing>;
    try {
      parsed = parseOfficialListing(await readHtml(source), source);
      if (!parsed.items.length) throw new Error(`No dated press cards recognised (${parsed.cards} containers)`);
      result.sourcesOk++;
      if (parsed.invalid) result.warnings.push(`${source.name}: ${parsed.invalid} cards without a valid date/link`);
    } catch (error) {
      result.failures.push(`${source.name}: ${error instanceof Error ? error.message : 'Fetch/parse failed'}`);
      continue;
    }
    let perSource = 0, details = 0;
    for (const item of parsed.items) {
      if (perSource >= 3 || result.accepted.length >= 12) break;
      if (+item.publishedAt < now - 14 * 86400_000 || +item.publishedAt > now + 3600_000) { result.tooOld++; continue; }
      if (isBlockedTopic(item.title) || !isOfficialTopic(item.title, source)) { result.irrelevant++; continue; }
      if (write && await hasStoredSourceUrl(item.link)) { result.duplicates++; continue; }
      let summary = item.summary;
      if (source.detailClass && summary.length < 80) {
        if (details >= 3) { result.weak++; continue; }
        details++;
        try {
          const html = await readHtml(source, item.link);
          const fragment = elementsByClass(html, source.detailClass)[0] ?? '';
          summary = htmlText(fragment).slice(0, 2000);
          if (source.name === 'KOBİA') {
            const fullTitle = htmlText(elementsByClass(fragment, 'title')[0] ?? '');
            if (fullTitle) item.title = fullTitle;
          }
        } catch (error) {
          result.warnings.push(`${source.name}: detail unavailable (${error instanceof Error ? error.message : 'error'})`);
          continue;
        }
      }
      // A detail page may replace a truncated title; apply the same policy to that final title.
      if (isBlockedTopic(item.title) || !isOfficialTopic(item.title, source)) { result.irrelevant++; continue; }
      // Video-only/title-only records cannot support a reliable news article.
      if (summary.length < 80 || item.title.includes('...') || item.title.includes('…')) { result.weak++; continue; }
      const candidate: Candidate = {
        feed: { name: source.name, url: source.url, kind: 'trade', region: 'az' },
        ...item, summary,
        score: Math.max(SCORE_THRESHOLD, scoreNewsItem(item.title, summary, item.link)) + 3,
      };
      if (write) {
        const stored = await storeRssCandidate(candidate);
        if (stored.kind === 'duplicate') { result.duplicates++; continue; }
        if (stored.kind === 'error') { result.failures.push(`${source.name}: ${stored.error}`); continue; }
      }
      result.accepted.push({ source: source.name, title: item.title, url: item.link });
      perSource++;
    }
  }
  return result;
}
