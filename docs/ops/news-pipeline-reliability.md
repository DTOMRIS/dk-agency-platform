# TASK-0553 — News pipeline rollout and recovery

Status: prepared for review; no production operations performed by this task.

## Rollout order (owner-controlled)

1. Review/merge only after checks. Hostinger auto-deploys main; merging also activates GitHub workflow code. Before merge, temporarily disable **News Ingest Pipeline** in GitHub Actions so no scheduled writer races the migration.
2. Use the established migration runner: `npm run db:migrate:status`, then `npm run db:migrate`. Migration 0022 is idempotent and does not modify existing news content. No env file changes.
3. Confirm both new tables exist. Hostinger build/restart and authenticated admin smoke are separate from merge. Re-enable News Ingest Pipeline after migration. Missing tables fail closed before AI.
4. Collect-only manual trigger first. Manual synthesis is opt-in; it shares daily/per-run reservations. Do not trigger production synthesis simply to test this PR.

Collection: 00/06/12/18 UTC. Writing/delivery: 05/14 UTC (09/18 Baku). GitHub schedules can be delayed. `cancel-in-progress:false` prevents killing a worker while it writes or sends.

## What the limits mean

- Six AI synthesis attempts/run, twelve/Baku calendar day. Errors consume allowance; deletion does not refund it. This is an upper bound, never a quota to fill.
- At most six Telegram delivery attempts/synthesis run (including retries), at most two newly queued review notices/run. Queued drafts wait for the next run if deliveries use the allowance.
- Failed explicit Telegram responses retry after one hour, at most three attempts. Timeouts, malformed replies, 5xx and killed in-flight workers become `uncertain`. These are never retried automatically and appear as workflow errors.
- Dashboard Telegram setup drains only the tracked outbox (max six). It no longer replays the historical translated queue. Existing historical rows are not automatically backfilled.

## Conflict handling

Original source rows and URLs are retained. The chosen draft uses the highest-priority eligible source: official AZ government/ATB, AZERTAC/Report, APA/Trend, then relevance. Source count is not proof of independence.

The title comparison detects opposite direction and differing percentages for the same narrowly identified statistic. AZ/EN/RU overnight-stay aliases and reporting windows are supported. This is not a universal semantic fact checker and does not fetch article bodies. Different dates/periods/countries stay separate where identified; unrecognised formulations can still escape matching.

A review notice contains source links and only a panel button. Reject inaccurate source rows in the panel. Publication through Telegram, single-admin PATCH and bulk approval re-evaluates current source rows. An already published article is **not automatically removed** when contrary evidence arrives; its review alert must be handled by the owner.

## Manual reconciliation of uncertain delivery

Read-only inspection in the trusted DB console:

```sql
SELECT article_id, state, attempts, message_id, editor_note, source_urls, updated_at
FROM news_approval_delivery
WHERE state = 'uncertain' OR (state = 'failed' AND attempts >= 3)
ORDER BY updated_at;
```

Check the owner's actual Telegram chat using the article `#id`. If a message exists, record its real message ID and mark the row `sent`. If it is confirmed absent, explicitly reset that single row to `pending`, `attempts=0`, `next_attempt_at=now()`. Do not bulk reset uncertain rows: Telegram does not offer a general idempotency key for sendMessage, so exactly-once delivery cannot be promised.

## Validation

- `npx tsx e2e/news-policy.test.ts`
- `npx tsx e2e/news-delivery.test.ts` (stubbed transport; no real Telegram messages)
- Isolated PostgreSQL: temporarily install `@electric-sql/pglite` outside the repo; set `PGLITE_ROOT` to that package directory and run `node --import tsx e2e/news-pipeline-postgres.mjs`. This executes production SQL and migration on an actual PostgreSQL WASM engine; never reads DATABASE_URL.
- `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 npm run dk:validate`

Rollback: disable workflow first; revert code PR. Additive operational tables may remain; do not delete content or tables to roll back code.
