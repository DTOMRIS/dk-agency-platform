/**
 * TASK-0498 — Təchizatçının admin sahələri: status, açıq kataloq razılığı, şirkət, qeyd. Yalnız admin.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { requireApiAdmin } from '@/lib/api/guards';
import { SUPPLIER_STATUSES } from '@/lib/supply/categories';
import { dbUnavailable, parseId, supplyDb, supplyErrorResponse } from '@/lib/supply/api';
import { updateSupplier } from '@/lib/supply/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const PatchSchema = z
  .object({
    status: z.enum(SUPPLIER_STATUSES).optional(),
    publicConsent: z.boolean().optional(),
    notes: z.string().max(4000).nullable().optional(),
    company: z.string().trim().max(200).nullable().optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0);

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const auth = await requireApiAdmin();
  if (!auth.ok) return auth.response;

  const id = parseId((await context.params).id);
  if (!id) return NextResponse.json({ error: 'invalid_id' }, { status: 400 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: 'invalid_body' }, { status: 400 });

  const database = supplyDb();
  if (!database) return dbUnavailable();

  try {
    const patch = { ...parsed.data };
    if (patch.company === '') patch.company = null;
    const row = await updateSupplier(database, id, patch);
    if (!row) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    return NextResponse.json({ row });
  } catch (error) {
    return supplyErrorResponse(error);
  }
}
