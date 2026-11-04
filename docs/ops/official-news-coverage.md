# TASK-0554 — Official press coverage

Prepared for review. No production DB writes, AI calls, Telegram messages, merge or deploy performed in this task.

## Supported sources

The shared registry `lib/news/official-sources.ts` contains five verified public press-list templates:

| Source | Listing | Extracted evidence |
|---|---|---|
| Dövlət Turizm Agentliyi | https://tourism.gov.az/news | dated cards + bounded official article text |
| Azərbaycan Turizm Bürosu | https://www.tourismboard.az/news | dated cards + article-specific excerpt |
| AQTA | https://afsa.gov.az/az/xeberler | dated cards + article paragraphs |
| KOBİA | https://smb.gov.az/az/all-news | dated cards + relevant official article text |
| Dövlət Vergi Xidməti | https://www.taxes.gov.az/az/page/xeberler | dated cards + article body; video-only pages skipped |

Official discovery runs with the existing 00:00 UTC collection (04:00 Baku), once daily. Other RSS runs remain 06/12/18 UTC. AI remains 05/14 UTC (09/18 Baku). A manual `official_sources:true`, `synthesize:false` dispatch collects only official pages. If both flags are set, synthesis takes priority and official collection is skipped.

## Limits and failure semantics

- Three new signals per source, twelve per official collection. Sources retain distinct evidence rows; existing synthesis groups events and chooses sources. This is not universal multilingual semantic deduplication.
- Only source-dated articles from the last fourteen days; missing/invalid/future dates are not silently replaced with fetch time.
- At most three detail requests/source. Per response: 10-second timeout, three same-host redirects, 1 MB byte cap. Only configured HTTPS host (including www alias) and press paths are accepted.
- Agency-specific headline rules keep unrelated veterinary/political/financial boilerplate out. At least 80 characters of article-specific text required. Video-only tax notices without a transcript are skipped rather than invented.
- No AI or Telegram call in collection. Shared persistence writes `status=fetched`, `origin=rss`; source URL constraints preserve idempotency. Existing 6/run, 12/day synthesis limits and Telegram approval remain in force.
- HTTP/template failures are explicit. Partial outages produce GitHub warning annotations; all official sources failing or DB insert failure makes the collector fail. Official coverage still runs when NewsData/RSS fails earlier, provided dependency installation succeeded. RSS outages are annotated too; an all-RSS or DB failure no longer quietly passes.
- Counts on the source screen mean received signals in seven days, not live health. Manual entries are excluded. No fake active/health toggle.

## Evidence — 2026-11-04

Real read-only collection: **five sources read, nine candidates, eleven old, ten irrelevant, three weak**. Candidate counts are before production URL deduplication; no claim that these are nine new stories. Raw output saved locally in `/private/tmp/dk-official-dry-run.log`.

GitHub run 41779375896: 41 RSS OK; Report AZ/RU/EN HTTP 403, EHL HTTP 406. The current Report URL works from this Mac with the existing bot UA, so no unproven URL/UA workaround is shipped. Official press discovery reduces dependence on intermediaries but does not repair those blocks.

`https://www.stat.gov.az/news/` and `/news/index.php` returned HTTP 500 during investigation. Statistika adapter is deferred until a usable template is verified; it is not advertised as supported. The tourism statistics document catalogue is a different source and is not misrepresented as a news feed.

This covers press pages, not every event subsite or an exhaustive events calendar. Important news can still be missed; failures are made visible rather than promising perfect coverage.

## Validation / rollout

- `node --import tsx scripts/news-official-fetch.ts` is read-only by default; **no DB writes, AI or Telegram**.
- `node --import tsx scripts/news-official-fetch.ts --commit` writes fetched drafts; only scheduled workflow/owner-authorized collection should use it.
- Offline tests: `e2e/official-news.test.ts`, `e2e/official-ingest.test.ts` cover templates, dates, text isolation, relevance, redirects, byte caps, freshness and bounded output.
- Existing RSS/event/SQL tests and full dk-validator must pass. No migration or env changes needed for this task.
- After owner merge: inspect the next daily official step or explicitly run official-only manual collection, then inspect draft sources and warning annotations. Do not activate AI just to smoke-test collection.
