import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';
import { canTransition } from '@/lib/utils/listingStatus';
import { db, dbAvailable } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { inArray } from 'drizzle-orm';

export async function PATCH(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const body = await request.json();
  const ids: number[] = body.ids;
  const targetStatus: ListingWorkflowStatus = body.status;
  const rejectedReason: string | undefined = body.rejectedReason;

  if (!Array.isArray(ids) || ids.length === 0 || !targetStatus) {
    return NextResponse.json({ success: false, error: 'ids və status tələb olunur.' }, { status: 400 });
  }

  if (ids.length > 50) {
    return NextResponse.json({ success: false, error: 'Maksimum 50 elan seçilə bilər.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: true, source: 'mock', updated: ids.length });
  }

  // Fetch current statuses to validate transitions
  const rows = await db
    .select({ id: listings.id, status: listings.status })
    .from(listings)
    .where(inArray(listings.id, ids));

  const validIds: number[] = [];
  const results = { updated: 0, skipped: 0, errors: [] as string[] };

  for (const row of rows) {
    const currentStatus = row.status as ListingWorkflowStatus;
    if (!canTransition(currentStatus, targetStatus)) {
      results.skipped++;
      results.errors.push(`#${row.id}: ${currentStatus} → ${targetStatus} keçid mümkün deyil`);
      continue;
    }
    validIds.push(row.id);
  }

  if (validIds.length > 0) {
    const set: Record<string, unknown> = {
      status: targetStatus,
      updatedAt: new Date(),
      publishedAt: targetStatus === 'showcase_ready' ? new Date() : null,
    };

    if (targetStatus === 'rejected' && rejectedReason) {
      set.rejectedReason = rejectedReason;
    }

    if (targetStatus === 'showcase_ready') {
      set.approvedAt = new Date();
    }

    await db
      .update(listings)
      .set(set)
      .where(inArray(listings.id, validIds));

    results.updated = validIds.length;
  }

  return NextResponse.json({ success: true, source: 'db', ...results });
}
