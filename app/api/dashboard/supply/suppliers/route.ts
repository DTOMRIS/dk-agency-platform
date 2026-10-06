/**
 * TASK-0498 — Təchizatçılar siyahısı (filtr, səhifələmə) və CSV ixracı. Yalnız admin.
 * GET ?q=&cat=et,icki&status=&active=6&phone=1&group=&sort=lastSeen|postCount&page=1[&format=csv]
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireApiAdmin } from '@/lib/api/guards';
import { IMPORT_WINDOWS, SUPPLIER_STATUSES, isSupplyCategory } from '@/lib/supply/categories';
import { dbUnavailable, supplyDb, supplyErrorResponse } from '@/lib/supply/api';
import { CSV_ROW_LIMIT, listSuppliers, suppliersToCsv } from '@/lib/supply/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  cat: z
    .string()
    .max(300)
    .optional()
    .transform((value) => (value ? value.split(',').filter(isSupplyCategory) : [])),
  status: z.enum(SUPPLIER_STATUSES).optional(),
  active: z.coerce
    .number()
    .int()
    .refine((value) => (IMPORT_WINDOWS as readonly number[]).includes(value))
    .optional(),
  phone: z.enum(['1']).optional(),
  group: z.string().trim().max(200).optional(),
  sort: z.enum(['lastSeen', 'postCount']).optional(),
  page: z.coerce.number().int().min(1).max(10000).optional(),
  format: z.enum(['json', 'csv']).optional(),
});

const CSV_HEADER = [
  'name',
  'company',
  'phones',
  'categories',
  'source_groups',
  'first_seen',
  'last_seen',
  'posts',
  'status',
  'public_consent',
  'notes',
];

export async function GET(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });

  const database = supplyDb();
  if (!database) return dbUnavailable();

  const query = parsed.data;
  const filters = {
    q: query.q,
    categories: query.cat,
    status: query.status,
    activeMonths: query.active,
    hasPhone: query.phone === '1',
    group: query.group || undefined,
    sort: query.sort,
    page: query.format === 'csv' ? 1 : query.page,
  };

  try {
    if (query.format === 'csv') {
      const result = await listSuppliers(database, filters, CSV_ROW_LIMIT);
      const csv = suppliersToCsv(result.rows, CSV_HEADER);
      const stamp = new Date().toISOString().slice(0, 10);
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="techizatcilar-${stamp}.csv"`,
          'Cache-Control': 'no-store',
        },
      });
    }
    const result = await listSuppliers(database, filters);
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return supplyErrorResponse(error);
  }
}
