// Isolated real PostgreSQL (PGlite), never DATABASE_URL. No project dependency changes.
// PGLITE_ROOT=/private/tmp/dk-news-db-test/node_modules/@electric-sql/pglite node --import tsx e2e/news-pipeline-postgres.mjs
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { PgDialect } from 'drizzle-orm/pg-core';
import pipelineSql from '../lib/news/pipeline-sql.ts';
const { reserveQuery, claimDeliveryQuery, queueApprovalQuery } = pipelineSql;
if (!process.env.PGLITE_ROOT) throw new Error('Set PGLITE_ROOT to a temporary PGlite install');
const { PGlite } = await import(pathToFileURL(`${process.env.PGLITE_ROOT}/dist/index.js`).href);
const db = new PGlite();
const dialect = new PgDialect();
const run = (query) => { const q = dialect.sqlToQuery(query); return db.query(q.sql, q.params); };
await db.exec('CREATE TABLE news_articles(id integer PRIMARY KEY); INSERT INTO news_articles SELECT generate_series(1,40)');
await db.exec('INSERT INTO news_articles SELECT generate_series(41,80)');
const migration = await fs.readFile(new URL('../drizzle/0022_news_pipeline_reliability.sql', import.meta.url), 'utf8');
await db.exec(migration);
await db.exec(migration); // migration must be idempotent
// TASK-0557: before 0023 the old slot check stops the day at 12 (code treats the violation as "full").
let early = 0;
for (let id = 41; id <= 60; id++) {
  try { early += (await run(reserveQuery('2026-11-01', id, `pre-${id < 51 ? 'a' : 'b'}`))).rows.length; }
  catch (err) { assert.match(String(err.message), /news_pipeline_budget_slot_check/); }
}
assert.equal(early, 12, 'old 12/day check still holds before 0023');
const m23 = await fs.readFile(new URL('../drizzle/0023_news_budget_daily_30.sql', import.meta.url), 'utf8');
await db.exec(m23);
await db.exec(m23); // idempotent
let accepted = 0;
for (let id = 1; id <= 20; id++) accepted += (await run(reserveQuery('2026-11-03', id, 'run-a'))).rows.length;
assert.equal(accepted, 15, 'run cap');
assert.equal((await run(reserveQuery('2026-11-03', 1, 'run-b'))).rows.length, 0, 'same article/day');
for (let id = 21; id <= 40; id++) accepted += (await run(reserveQuery('2026-11-03', id, 'run-b'))).rows.length;
assert.equal(accepted, 30, 'daily cap');
assert.equal((await run(reserveQuery('2026-11-03', 30, 'manual'))).rows.length, 0);
assert.equal((await run(reserveQuery('2026-11-04', 30, 'next-day'))).rows.length, 1);
await run(queueApprovalQuery(1, 'review', ['https://report.az/a'], true));
assert.equal((await run(claimDeliveryQuery(1))).rows.length, 1);
assert.equal((await run(claimDeliveryQuery(1))).rows.length, 0, 'claim once');
await db.exec("UPDATE news_approval_delivery SET state='sent', message_id=42 WHERE article_id=1");
await run(queueApprovalQuery(1, 'review again', [], true));
assert.equal((await run(claimDeliveryQuery(1))).rows.length, 0, 'review never re-sent');
await run(queueApprovalQuery(1, 'resolved', [], false));
assert.equal((await run(claimDeliveryQuery(1))).rows.length, 1, 'resolved draft can send');
await db.exec("UPDATE news_approval_delivery SET state='uncertain' WHERE article_id=1");
await run(queueApprovalQuery(1, 'rerun', [], false));
assert.equal((await run(claimDeliveryQuery(1))).rows.length, 0, 'ambiguous outcome never retried');
await run(queueApprovalQuery(4, 'normal', [], false));
await db.exec("UPDATE news_approval_delivery SET state='sent', message_id=99 WHERE article_id=4");
await run(queueApprovalQuery(4, 'late contradiction', ['https://report.az/b'], true));
assert.equal((await run(claimDeliveryQuery(4))).rows.length, 1, 'late conflict alerts even after normal delivery');
assert.equal((await run(queueApprovalQuery(4, 'late contradiction', ['https://report.az/b'], true))).rows.length, 0, 'unchanged review does not consume selection allowance');
assert.equal((await run(queueApprovalQuery(4, 'wording changed by delivery guard', ['https://report.az/b'], true))).rows.length, 0, 'review wording does not starve other conflicts');
const concurrent = await Promise.all(Array.from({length: 40}, (_, i) => run(reserveQuery('2026-11-05', i + 1, 'concurrent'))));
assert.equal(concurrent.reduce((n, r) => n + r.rows.length, 0), 15, 'concurrent requests share fifteen slots');
await run(queueApprovalQuery(2, '', [], false));
for (let attempt = 1; attempt <= 3; attempt++) {
  assert.equal((await run(claimDeliveryQuery(2))).rows.length, 1);
  await db.exec("UPDATE news_approval_delivery SET state='failed' WHERE article_id=2");
}
assert.equal((await run(claimDeliveryQuery(2))).rows.length, 0, 'retry ceiling');
await run(queueApprovalQuery(3, '', [], false));
await db.exec("UPDATE news_approval_delivery SET next_attempt_at=now()+interval '1 hour' WHERE article_id=3");
assert.equal((await run(claimDeliveryQuery(3))).rows.length, 0, 'backoff');
await db.exec('DELETE FROM news_articles WHERE id=1');
assert.equal((await db.query('SELECT * FROM news_approval_delivery WHERE article_id=1')).rows.length, 0, 'cascade');
assert.equal((await run(reserveQuery('2026-11-03', 31, 'delete-bypass'))).rows.length, 0, 'deletion cannot refund daily budget');
await db.close();
console.log('news-pipeline-postgres: OK (migration twice, 0023 twice, 15/run, 30/day, manual cap, rollover, delivery state, retry/backoff/cascade)');
