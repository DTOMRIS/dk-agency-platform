/**
 * TASK-0498 — Tələb lövhəsi: alıcı tələbləri + kateqoriya üzrə uyğun təchizatçılar. Yalnız admin.
 * GET ?q=&type=mehsul&cat=et&status=aciq&months=3&page=1
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireApiAdmin } from '@/lib/api/guards';
import {
  IMPORT_WINDOWS,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  isSupplyCategory,
} from '@/lib/supply/categories';
import { dbUnavailable, supplyDb, supplyErrorResponse } from '@/lib/supply/api';
import { listRequests } from '@/lib/supply/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const QuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  type: z.enum(REQUEST_TYPES).optional(),
  cat: z
    .string()
    .max(300)
    .optional()
    .transform((value) => (value ? value.split(',').filter(isSupplyCategory) : [])),
  status: z.enum(REQUEST_STATUSES).optional(),
  months: z.coerce
    .number()
    .int()
    .refine((value) => (IMPORT_WINDOWS as readonly number[]).includes(value))
    .optional(),
  page: z.coerce.number().int().min(1).max(10000).optional(),
});

export async function GET(request: NextRequest) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) return NextResponse.json({ error: 'invalid_query' }, { status: 400 });

  const database = supplyDb();
  if (!database) return dbUnavailable();

  try {
    const result = await listRequests(database, {
      q: parsed.data.q,
      type: parsed.data.type,
      categories: parsed.data.cat,
      status: parsed.data.status,
      months: parsed.data.months,
      page: parsed.data.page,
    });
    return NextResponse.json(result, { headers: { 'Cache-Control': 'no-store' } });
  } catch (error) {
    return supplyErrorResponse(error);
  }
}
