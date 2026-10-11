#!/usr/bin/env node
/**
 * @file scripts/ops/run-sql.mjs
 * @purpose TASK-0545: run a docs/ops/*.sql file against DATABASE_URL without psql (the owner's Mac has no
 *          psql/brew). Uses the project's @neondatabase/serverless Pool (WebSocket → real transactions).
 *
 *   node --env-file=.env.local scripts/ops/run-sql.mjs docs/ops/FILE.sql            # dry run: runs, prints, ROLLBACK
 *   node --env-file=.env.local scripts/ops/run-sql.mjs docs/ops/FILE.sql --commit   # really writes
 *
 * Dry run is the default: the file's own COMMIT is replaced with ROLLBACK, so nothing is saved.
 * Claude does not run this against production (owner rule) — Doğan runs it.
 */
import { readFileSync } from 'node:fs';
import { Pool } from '@neondatabase/serverless';

const [file, flag] = process.argv.slice(2);
if (!file) {
  console.error('İstifadə: node --env-file=.env.local scripts/ops/run-sql.mjs docs/ops/FILE.sql [--commit]');
  process.exit(1);
}
if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL yoxdur. Əmri «node --env-file=.env.local …» ilə işlədin.');
  process.exit(1);
}
const commit = flag === '--commit';
let text = readFileSync(file, 'utf8');
if (!/^\s*BEGIN\b/im.test(text)) text = `BEGIN;\n${text}\nCOMMIT;`;
if (!commit) text = text.replace(/^\s*COMMIT\s*;\s*$/gim, 'ROLLBACK;');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  const results = await client.query(text);
  const list = Array.isArray(results) ? results : [results];
  const tally = {};
  for (const r of list) {
    const key = r.command ? `${r.command}${r.command === 'UPDATE' || r.command === 'DELETE' ? ' ' + r.rowCount : ''}` : '?';
    tally[key] = (tally[key] || 0) + 1;
    if (r.command === 'SELECT' && r.rows?.length) console.table(r.rows);
  }
  console.log(tally);
  console.log(commit ? '✅ YAZILDI (COMMIT).' : 'ℹ️  QURU SINAQ — heç nə saxlanmadı (ROLLBACK). Hər şey qaydasındadırsa eyni əmri sonda --commit ilə işlədin.');
} catch (err) {
  console.error('❌ XƏTA — heç nə saxlanmadı:', err.message);
  process.exitCode = 1;
} finally {
  client.release();
  await pool.end();
}
