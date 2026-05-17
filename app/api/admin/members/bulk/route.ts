import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles, users } from '@/lib/db/schema';
import { inArray, eq, isNull } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/audit';

const MAX_BULK = 50;

export async function DELETE(request: NextRequest) {
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ error: 'not-authenticated' }, { status: 401 });
  }
  if (auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  let body: { ids?: number[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body' }, { status: 400 });
  }

  if (!Array.isArray(body.ids) || body.ids.length === 0) {
    return NextResponse.json({ error: 'ids-required' }, { status: 400 });
  }
  if (body.ids.length > MAX_BULK) {
    return NextResponse.json({ error: 'max-bulk-exceeded' }, { status: 400 });
  }

  // Filter out self (never delete own account, but don't block the whole request)
  const idsToDelete = body.ids.filter((id) => id !== auth.userId);
  const skipped = body.ids.length - idsToDelete.length;

  if (idsToDelete.length === 0) {
    return NextResponse.json({ success: true, deleted: 0, skipped });
  }

  // Get target profiles (non-deleted only) for audit
  const targets = await db
    .select({ id: memberProfiles.id, email: memberProfiles.email, fullName: memberProfiles.fullName, role: memberProfiles.role })
    .from(memberProfiles)
    .where(inArray(memberProfiles.id, idsToDelete));

  const activeTargets = targets.filter(Boolean);
  if (activeTargets.length === 0) {
    return NextResponse.json({ success: true, deleted: 0, skipped });
  }

  const now = new Date();
  const activeIds = activeTargets.map((t) => t.id);
  const activeEmails = activeTargets.map((t) => t.email);

  // Batch soft-delete both tables
  await db.update(memberProfiles).set({ deletedAt: now }).where(inArray(memberProfiles.id, activeIds));
  if (activeEmails.length > 0) {
    await db.update(users).set({ deletedAt: now }).where(inArray(users.email, activeEmails));
  }

  // Audit log for each deleted member
  for (const t of activeTargets) {
    writeAuditLog({
      adminId: auth.userId,
      adminEmail: auth.email,
      action: 'member.deleted',
      targetUserId: t.id,
      targetEmail: t.email,
      metadata: { name: t.fullName, role: t.role, bulk: true },
    });
  }

  return NextResponse.json({ success: true, deleted: activeTargets.length, skipped });
}
