/**
 * TASK-0498 — Təchizatçı bazası / Tələb lövhəsi: DB əməliyyatları (server-only).
 *
 * Bütün funksiyalar `database` parametrini qəbul edir (canlıda neon-http `db`,
 * testdə PGlite) — sorğular yalnız drizzle builder ilə yazılıb, sürücüdən asılı deyil.
 *
 * İdxal idempotentdir:
 *   • təchizatçı `dedupe_key` üzrə `INSERT … ON CONFLICT DO UPDATE` — telefon,
 *     kateqoriya, qrup, mesaj hash-ləri SQL-də birləşdirilir (DISTINCT);
 *     `post_count` = unikal mesaj hash-lərinin sayı → təkrar idxal onu şişirtmir;
 *     admin sahələri (status, razılıq, qeyd, şirkət) toxunulmur;
 *   • tələb `text_hash` üzrə `ON CONFLICT DO NOTHING`.
 */

import { and, asc, desc, eq, gte, ilike, inArray, or, sql, type SQL } from 'drizzle-orm';
import type { PgDatabase, PgQueryResultHKT } from 'drizzle-orm/pg-core';

import { supplyContacts, supplyRequests } from '@/lib/db/schema';
import type * as schema from '@/lib/db/schema';

import type { RequestStatus, RequestType, SupplierStatus, SupplyCategory } from './categories';
import type { ImportPlan, RequestDraft, SupplierDraft } from './wa-parser';

export type SupplyDb = PgDatabase<PgQueryResultHKT, typeof schema>;

export const SUPPLY_PAGE_SIZE = 50;
export const CSV_ROW_LIMIT = 5000;
const UPSERT_CHUNK = 100;

// ── Xəta: cədvəl yoxdur (miqrasiya tətbiq olunmayıb) ─────────────────

export class SupplyTablesMissingError extends Error {
  constructor() {
    super('supply_tables_missing');
    this.name = 'SupplyTablesMissingError';
  }
}

/** Postgres 42P01 «relation does not exist» — drizzle xətanı `cause`-a büküb ata bilər. */
export function isMissingTableError(error: unknown): boolean {
  let current: unknown = error;
  for (let depth = 0; depth < 5 && current; depth += 1) {
    if (typeof current === 'object' && current !== null) {
      const record = current as { code?: unknown; message?: unknown; cause?: unknown };
      if (record.code === '42P01') return true;
      if (
        typeof record.message === 'string' &&
        /relation "supply_[a-z_]+" does not exist/i.test(record.message)
      ) {
        return true;
      }
      current = record.cause;
    } else {
      break;
    }
  }
  return false;
}

async function guard<T>(run: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    if (isMissingTableError(error)) throw new SupplyTablesMissingError();
    throw error;
  }
}

// ── Köməkçilər ───────────────────────────────────────────────────────

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** jsonb massivlərini birləşdirir, dublikatsız və sıralı. */
function jsonbUnion(current: SQL, incoming: SQL): SQL {
  return sql`(SELECT COALESCE(jsonb_agg(DISTINCT u.v ORDER BY u.v), '[]'::jsonb) FROM jsonb_array_elements_text(${current} || ${incoming}) AS u(v))`;
}

/** Ən yeni 5 unikal nümunə (`k` açarı üzrə). */
function sampleUnion(current: SQL, incoming: SQL): SQL {
  return sql`(SELECT COALESCE(jsonb_agg(s.e ORDER BY s.e->>'date' DESC), '[]'::jsonb) FROM (
    SELECT d.e FROM (
      SELECT DISTINCT ON (x.e->>'k') x.e FROM jsonb_array_elements(${current} || ${incoming}) AS x(e)
      ORDER BY x.e->>'k', x.e->>'date' DESC
    ) AS d ORDER BY d.e->>'date' DESC LIMIT 5
  ) AS s)`;
}

function anyJsonbContains(column: SQL | typeof supplyContacts.categories, values: string[]): SQL {
  const parts = values.map((value) => sql`${column} @> ${JSON.stringify([value])}::jsonb`);
  return sql`(${sql.join(parts, sql` OR `)})`;
}

function monthsAgo(months: number): Date {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

/** Axtarış sorğusundan telefon rəqəmləri (0XX → XX, ən az 4 rəqəm). */
function phoneDigits(query: string): string | null {
  let digits = query.replace(/\D/g, '');
  if (digits.length < 4) return null;
  if (digits.startsWith('0') && digits.length >= 9) digits = digits.slice(1);
  return digits;
}

// ── İdxal ────────────────────────────────────────────────────────────

export interface ImportPreviewStatus {
  existingSuppliers: number;
  newSuppliers: number;
  existingRequests: number;
  newRequests: number;
}

export async function previewAgainstDb(
  database: SupplyDb,
  plan: ImportPlan
): Promise<ImportPreviewStatus> {
  return guard(async () => {
    const keys = plan.suppliers.map((s) => s.dedupeKey);
    const hashes = plan.requests.map((r) => r.textHash);
    let existingSuppliers = 0;
    let existingRequests = 0;
    for (const part of chunk(keys, 500)) {
      const rows = await database
        .select({ key: supplyContacts.dedupeKey })
        .from(supplyContacts)
        .where(inArray(supplyContacts.dedupeKey, part));
      existingSuppliers += rows.length;
    }
    for (const part of chunk(hashes, 500)) {
      const rows = await database
        .select({ hash: supplyRequests.textHash })
        .from(supplyRequests)
        .where(inArray(supplyRequests.textHash, part));
      existingRequests += rows.length;
    }
    return {
      existingSuppliers,
      newSuppliers: keys.length - existingSuppliers,
      existingRequests,
      newRequests: hashes.length - existingRequests,
    };
  });
}

export interface ImportResult {
  suppliersInserted: number;
  suppliersUpdated: number;
  requestsInserted: number;
  requestsSkipped: number;
}

async function upsertSuppliers(database: SupplyDb, drafts: SupplierDraft[]) {
  let inserted = 0;
  let updated = 0;
  for (const part of chunk(drafts, UPSERT_CHUNK)) {
    const rows = await database
      .insert(supplyContacts)
      .values(
        part.map((draft) => ({
          dedupeKey: draft.dedupeKey,
          displayName: draft.displayName,
          phones: draft.phones,
          categories: draft.categories,
          sourceGroups: draft.sourceGroups,
          firstSeen: new Date(draft.firstSeen),
          lastSeen: new Date(draft.lastSeen),
          postCount: draft.messageHashes.length,
          messageHashes: draft.messageHashes,
          sampleOffers: draft.sampleOffers,
        }))
      )
      .onConflictDoUpdate({
        target: supplyContacts.dedupeKey,
        set: {
          displayName: sql`CASE WHEN excluded.last_seen > ${supplyContacts.lastSeen} THEN excluded.display_name ELSE ${supplyContacts.displayName} END`,
          phones: jsonbUnion(sql`${supplyContacts.phones}`, sql`excluded.phones`),
          categories: jsonbUnion(sql`${supplyContacts.categories}`, sql`excluded.categories`),
          sourceGroups: jsonbUnion(
            sql`${supplyContacts.sourceGroups}`,
            sql`excluded.source_groups`
          ),
          firstSeen: sql`LEAST(${supplyContacts.firstSeen}, excluded.first_seen)`,
          lastSeen: sql`GREATEST(${supplyContacts.lastSeen}, excluded.last_seen)`,
          messageHashes: jsonbUnion(
            sql`${supplyContacts.messageHashes}`,
            sql`excluded.message_hashes`
          ),
          postCount: sql`jsonb_array_length(${jsonbUnion(sql`${supplyContacts.messageHashes}`, sql`excluded.message_hashes`)})`,
          sampleOffers: sampleUnion(
            sql`${supplyContacts.sampleOffers}`,
            sql`excluded.sample_offers`
          ),
          updatedAt: sql`now()`,
        },
      })
      .returning({ id: supplyContacts.id, inserted: sql<boolean>`(xmax = 0)` });
    for (const row of rows) {
      if (row.inserted) inserted += 1;
      else updated += 1;
    }
  }
  return { inserted, updated };
}

async function insertRequests(database: SupplyDb, drafts: RequestDraft[]) {
  let inserted = 0;
  for (const part of chunk(drafts, UPSERT_CHUNK)) {
    const rows = await database
      .insert(supplyRequests)
      .values(
        part.map((draft) => ({
          requesterName: draft.requesterName,
          phones: draft.phones,
          text: draft.text,
          categories: draft.categories,
          requestType: draft.requestType,
          sourceGroup: draft.sourceGroup.slice(0, 200),
          postedAt: new Date(draft.postedAt),
          textHash: draft.textHash,
        }))
      )
      .onConflictDoNothing({ target: supplyRequests.textHash })
      .returning({ id: supplyRequests.id });
    inserted += rows.length;
  }
  return { inserted, skipped: drafts.length - inserted };
}

export async function applyImport(database: SupplyDb, plan: ImportPlan): Promise<ImportResult> {
  return guard(async () => {
    const suppliers = await upsertSuppliers(
      database,
      plan.suppliers.map((s) => ({
        ...s,
        sourceGroups: s.sourceGroups.map((g) => g.slice(0, 200)),
      }))
    );
    const requests = await insertRequests(database, plan.requests);
    return {
      suppliersInserted: suppliers.inserted,
      suppliersUpdated: suppliers.updated,
      requestsInserted: requests.inserted,
      requestsSkipped: requests.skipped,
    };
  });
}

// ── Təchizatçılar siyahısı ───────────────────────────────────────────

export interface SupplierFilters {
  q?: string;
  categories?: SupplyCategory[];
  status?: SupplierStatus;
  activeMonths?: number;
  hasPhone?: boolean;
  group?: string;
  sort?: 'lastSeen' | 'postCount';
  page?: number;
}

const supplierColumns = {
  id: supplyContacts.id,
  displayName: supplyContacts.displayName,
  company: supplyContacts.company,
  phones: supplyContacts.phones,
  categories: supplyContacts.categories,
  sourceGroups: supplyContacts.sourceGroups,
  firstSeen: supplyContacts.firstSeen,
  lastSeen: supplyContacts.lastSeen,
  postCount: supplyContacts.postCount,
  sampleOffers: supplyContacts.sampleOffers,
  status: supplyContacts.status,
  publicConsent: supplyContacts.publicConsent,
  notes: supplyContacts.notes,
};

export type SupplierRow = {
  id: number;
  displayName: string;
  company: string | null;
  phones: string[];
  categories: string[];
  sourceGroups: string[];
  firstSeen: Date;
  lastSeen: Date;
  postCount: number;
  sampleOffers: Array<{ text: string; date: string; group: string; k: string }>;
  status: string;
  publicConsent: boolean;
  notes: string | null;
};

function supplierWhere(filters: SupplierFilters): SQL | undefined {
  const conditions: SQL[] = [];
  const q = filters.q?.trim();
  if (q) {
    const like = `%${q}%`;
    const digits = phoneDigits(q);
    const searchParts: SQL[] = [
      ilike(supplyContacts.displayName, like),
      ilike(supplyContacts.company, like),
    ];
    if (digits) searchParts.push(sql`${supplyContacts.phones}::text LIKE ${`%${digits}%`}`);
    const combined = or(...searchParts);
    if (combined) conditions.push(combined);
  }
  if (filters.categories?.length)
    conditions.push(anyJsonbContains(supplyContacts.categories, filters.categories));
  if (filters.status) conditions.push(eq(supplyContacts.status, filters.status));
  if (filters.activeMonths)
    conditions.push(gte(supplyContacts.lastSeen, monthsAgo(filters.activeMonths)));
  if (filters.hasPhone) conditions.push(sql`jsonb_array_length(${supplyContacts.phones}) > 0`);
  if (filters.group)
    conditions.push(
      sql`${supplyContacts.sourceGroups} @> ${JSON.stringify([filters.group])}::jsonb`
    );
  return conditions.length ? and(...conditions) : undefined;
}

export async function listSuppliers(
  database: SupplyDb,
  filters: SupplierFilters,
  limit = SUPPLY_PAGE_SIZE
) {
  return guard(async () => {
    const where = supplierWhere(filters);
    const page = Math.max(1, filters.page ?? 1);
    const order =
      filters.sort === 'postCount'
        ? [desc(supplyContacts.postCount), desc(supplyContacts.lastSeen), desc(supplyContacts.id)]
        : [desc(supplyContacts.lastSeen), desc(supplyContacts.id)];

    const [rows, totalRows, groupRows, summaryRows] = await Promise.all([
      database
        .select(supplierColumns)
        .from(supplyContacts)
        .where(where)
        .orderBy(...order)
        .limit(limit)
        .offset((page - 1) * limit),
      database
        .select({ count: sql<number>`count(*)::int` })
        .from(supplyContacts)
        .where(where),
      database
        .selectDistinct({
          group: sql<string>`jsonb_array_elements_text(${supplyContacts.sourceGroups})`,
        })
        .from(supplyContacts),
      database
        .select({
          total: sql<number>`count(*)::int`,
          withPhone: sql<number>`count(*) FILTER (WHERE jsonb_array_length(${supplyContacts.phones}) > 0)::int`,
          consented: sql<number>`count(*) FILTER (WHERE ${supplyContacts.publicConsent})::int`,
        })
        .from(supplyContacts),
    ]);

    return {
      rows: rows as SupplierRow[],
      total: totalRows[0]?.count ?? 0,
      page,
      pageSize: limit,
      groups: groupRows
        .map((row) => row.group)
        .filter(Boolean)
        .sort(),
      summary: summaryRows[0] ?? { total: 0, withPhone: 0, consented: 0 },
    };
  });
}

export async function updateSupplier(
  database: SupplyDb,
  id: number,
  patch: {
    status?: SupplierStatus;
    publicConsent?: boolean;
    notes?: string | null;
    company?: string | null;
  }
) {
  return guard(async () => {
    const rows = await database
      .update(supplyContacts)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(supplyContacts.id, id))
      .returning(supplierColumns);
    return (rows[0] as SupplierRow | undefined) ?? null;
  });
}

// ── Tələblər ─────────────────────────────────────────────────────────

export interface RequestFilters {
  q?: string;
  type?: RequestType;
  categories?: SupplyCategory[];
  status?: RequestStatus;
  months?: number;
  page?: number;
}

export interface MatchSupplier {
  id: number;
  displayName: string;
  company: string | null;
  phones: string[];
  categories: string[];
  lastSeen: Date;
  status: string;
  overlap: number;
}

export const MATCHES_SHOWN = 5;

/** Kateqoriya kəsişməsi; sıra: kəsişmə sayı ↓, son aktivlik ↓. `imtina` statuslular çıxır. */
export function matchSuppliers(
  requestCategories: string[],
  suppliers: Array<Omit<MatchSupplier, 'overlap'>>
): MatchSupplier[] {
  if (!requestCategories.length) return [];
  const wanted = new Set(requestCategories);
  return suppliers
    .filter((supplier) => supplier.status !== 'imtina')
    .map((supplier) => ({
      ...supplier,
      overlap: supplier.categories.filter((c) => wanted.has(c)).length,
    }))
    .filter((supplier) => supplier.overlap > 0)
    .sort((a, b) => b.overlap - a.overlap || b.lastSeen.getTime() - a.lastSeen.getTime());
}

export async function listRequests(database: SupplyDb, filters: RequestFilters) {
  return guard(async () => {
    const conditions: SQL[] = [];
    const q = filters.q?.trim();
    if (q) {
      const combined = or(
        ilike(supplyRequests.text, `%${q}%`),
        ilike(supplyRequests.requesterName, `%${q}%`)
      );
      if (combined) conditions.push(combined);
    }
    if (filters.type) conditions.push(eq(supplyRequests.requestType, filters.type));
    if (filters.status) conditions.push(eq(supplyRequests.status, filters.status));
    if (filters.categories?.length) {
      conditions.push(
        anyJsonbContains(supplyRequests.categories as unknown as SQL, filters.categories)
      );
    }
    if (filters.months) conditions.push(gte(supplyRequests.postedAt, monthsAgo(filters.months)));
    const where = conditions.length ? and(...conditions) : undefined;
    const page = Math.max(1, filters.page ?? 1);

    const [rows, totalRows, suppliers] = await Promise.all([
      database
        .select({
          id: supplyRequests.id,
          requesterName: supplyRequests.requesterName,
          phones: supplyRequests.phones,
          text: supplyRequests.text,
          categories: supplyRequests.categories,
          requestType: supplyRequests.requestType,
          sourceGroup: supplyRequests.sourceGroup,
          postedAt: supplyRequests.postedAt,
          status: supplyRequests.status,
          notes: supplyRequests.notes,
        })
        .from(supplyRequests)
        .where(where)
        .orderBy(desc(supplyRequests.postedAt), desc(supplyRequests.id))
        .limit(SUPPLY_PAGE_SIZE)
        .offset((page - 1) * SUPPLY_PAGE_SIZE),
      database
        .select({ count: sql<number>`count(*)::int` })
        .from(supplyRequests)
        .where(where),
      database
        .select({
          id: supplyContacts.id,
          displayName: supplyContacts.displayName,
          company: supplyContacts.company,
          phones: supplyContacts.phones,
          categories: supplyContacts.categories,
          lastSeen: supplyContacts.lastSeen,
          status: supplyContacts.status,
        })
        .from(supplyContacts)
        .orderBy(desc(supplyContacts.lastSeen), asc(supplyContacts.id))
        .limit(CSV_ROW_LIMIT),
    ]);

    return {
      rows: rows.map((row) => {
        const matches = matchSuppliers(row.categories, suppliers);
        return { ...row, matchCount: matches.length, matches: matches.slice(0, MATCHES_SHOWN) };
      }),
      total: totalRows[0]?.count ?? 0,
      page,
      pageSize: SUPPLY_PAGE_SIZE,
    };
  });
}

export async function updateRequest(
  database: SupplyDb,
  id: number,
  patch: { status?: RequestStatus; notes?: string | null }
) {
  return guard(async () => {
    const rows = await database
      .update(supplyRequests)
      .set(patch)
      .where(eq(supplyRequests.id, id))
      .returning({
        id: supplyRequests.id,
        status: supplyRequests.status,
        notes: supplyRequests.notes,
      });
    return rows[0] ?? null;
  });
}

// ── CSV ──────────────────────────────────────────────────────────────

function csvCell(value: string): string {
  // Excel formula injection-a qarşı: = + - @ ilə başlayan xananı apostrofla qoru.
  const safe = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\n\r;]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function suppliersToCsv(rows: SupplierRow[], header: string[]): string {
  const lines = [header.map(csvCell).join(',')];
  for (const row of rows) {
    lines.push(
      [
        row.displayName,
        row.company ?? '',
        row.phones.join(' '),
        row.categories.join(' '),
        row.sourceGroups.join(' | '),
        row.firstSeen.toISOString().slice(0, 10),
        row.lastSeen.toISOString().slice(0, 10),
        String(row.postCount),
        row.status,
        row.publicConsent ? 'yes' : 'no',
        row.notes ?? '',
      ]
        .map(csvCell)
        .join(',')
    );
  }
  return `﻿${lines.join('\r\n')}\r\n`;
}
