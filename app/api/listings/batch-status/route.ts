import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';
import { db, dbAvailable } from '@/lib/db';
import { setListingsStatus } from '@/lib/listings/set-status';

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

  const results = await setListingsStatus(ids, targetStatus, rejectedReason);

  return NextResponse.json({ success: true, source: 'db', ...results });
}
