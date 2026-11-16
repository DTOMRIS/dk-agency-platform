import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PgDialect } from 'drizzle-orm/pg-core';
import { saveSalesQuery, salesSummaryQuery } from '../lib/sales/repository';
import { type SalesInput, initialFollowup, escapeSalesSearch } from '../lib/sales/followup';

async function run() {
  // Optional PostgreSQL WASM test engine installed in an isolated verification directory, not production.
  if (!process.env.PGLITE_MODULE) { console.info('SKIP PostgreSQL engine test: set PGLITE_MODULE to installed @electric-sql/pglite entry'); return; }
  const { PGlite } = await import(process.env.PGLITE_MODULE);
  const pg = new PGlite();
  await pg.exec("CREATE TYPE kazan_lead_status AS ENUM ('new','contacted','qualified','converted','dismissed'); CREATE TABLE kazan_leads (id uuid PRIMARY KEY, status kazan_lead_status DEFAULT 'new', notes jsonb DEFAULT '[]', next_contact_at timestamp, updated_at timestamp DEFAULT now());");
  const migration = await readFile(new URL('../drizzle/0024_kazan_sales_followups.sql', import.meta.url), 'utf8');
  await pg.exec(migration); await pg.exec(migration);
  const id = '5c555555-5555-4555-8555-555555555555';
  await pg.query('INSERT INTO kazan_leads (id,notes) VALUES ($1,$2)', [id, JSON.stringify([{ at: 'old', text: 'Original note' }])]);
  const input: SalesInput = { ...initialFollowup({ id, status: 'new' }), ownerName: 'Doğan', nextAction: 'Call', nextContactOn: '2026-11-17', stage: 'proposal' as const, proposalAmount: 500, addNote: 'Proposal discussed' };
  const save = async (v: SalesInput) => { const q = new PgDialect().sqlToQuery(saveSalesQuery(v, '2026-11-16T10:00:00Z')); return pg.query(q.sql, q.params); };
  assert.equal((await save(input)).rows.length, 1);
  assert.equal((await save(input)).rows.length, 0, 'stale version must not append notes or overwrite');
  let result = (await pg.query('SELECT status, notes FROM kazan_leads WHERE id=$1', [id])).rows[0];
  assert.equal(result.status, 'qualified'); assert.equal(result.notes.length, 2); assert.equal(result.notes[0].text, 'Original note');
  assert.equal((await save({ ...input, version: 1, stage: 'won', collectedAmount: 250, addNote: 'Partial payment' })).rows.length, 1);
  result = (await pg.query('SELECT status,notes FROM kazan_leads WHERE id=$1', [id])).rows[0]; assert.equal(result.status, 'converted'); assert.equal(result.notes.length, 3);
  const sales = (await pg.query('SELECT collected_amount, version FROM kazan_sales_followups')).rows[0]; assert.equal(Number(sales.collected_amount), 250); assert.equal(sales.version, 2);
  assert.equal((await save({ ...input, leadId: '00000000-0000-4000-8000-000000000000' })).rows.length, 0);
  await assert.rejects(() => save({ ...input, version: 2, collectedAmount: -1 }), 'constraint failure must roll back whole statement');
  result = (await pg.query('SELECT status,notes FROM kazan_leads WHERE id=$1', [id])).rows[0]; assert.equal(result.status, 'converted'); assert.equal(result.notes.length, 3);
  for (let i = 0; i < 30; i++) await pg.query('INSERT INTO kazan_leads (id,status) VALUES ($1,$2)', [`00000000-0000-4000-8000-${String(i).padStart(12, '0')}`, i === 0 ? 'converted' : 'new']);
  await pg.query('INSERT INTO kazan_leads (id) VALUES ($1)', ['6c666666-6666-4666-8666-666666666666']);
  await save({ ...input, leadId: '6c666666-6666-4666-8666-666666666666', nextContactOn: '2000-01-01' });
  const q = new PgDialect().sqlToQuery(salesSummaryQuery('2026-11-16'));
  const summary = (await pg.query(q.sql,q.params)).rows[0];
  assert.equal(summary.total, 32); assert.equal(summary.won, 2); assert.equal(summary.overdue, 1); assert.equal(summary.unplanned, 29); assert.equal(Number(summary.pipeline), 500); assert.equal(Number(summary.collected), 250);
  for (const value of ['50% Cafe', 'x_y', String.raw`x\y`]) { const found = (await pg.query('SELECT $1::text ILIKE $2::text AS found', [value, `%${escapeSalesSearch(value)}%`])).rows[0].found; assert.equal(found, true); }
  await pg.close(); console.info('PostgreSQL: migration twice, atomic status/notes, stale version, partial collection, missing lead and rollback PASS');
}
run().catch(e => { console.error(e); process.exitCode = 1; });
