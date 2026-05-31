import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { writeAuditLog } from '@/lib/audit';

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  const auth = await getAuthFromCookie();
  if (!auth || auth.role !== 'admin') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }
  if (!db) {
    return NextResponse.json({ error: 'database-unavailable' }, { status: 503 });
  }

  const { id } = await context.params;
  const profileId = parseInt(id, 10);
  if (isNaN(profileId)) {
    return NextResponse.json({ error: 'invalid-id' }, { status: 400 });
  }

  const body = await request.json();
  const action = body.action as string;

  if (!['approve', 'reject'].includes(action)) {
    return NextResponse.json({ error: 'invalid-action' }, { status: 400 });
  }

  const [existing] = await db
    .select({ id: memberProfiles.id, email: memberProfiles.email, approvalStatus: memberProfiles.approvalStatus })
    .from(memberProfiles)
    .where(eq(memberProfiles.id, profileId));

  if (!existing) {
    return NextResponse.json({ error: 'not-found' }, { status: 404 });
  }

  if (action === 'approve') {
    await db
      .update(memberProfiles)
      .set({
        approvalStatus: 'approved',
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
        rejectionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(memberProfiles.id, profileId));

    await writeAuditLog({
      adminEmail: auth.email,
      action: 'profile.approved',
      targetId: profileId,
      targetEmail: existing.email,
      metadata: {},
    });
  } else {
    const reason = body.reason || '';
    await db
      .update(memberProfiles)
      .set({
        approvalStatus: 'rejected',
        reviewedBy: auth.userId,
        reviewedAt: new Date(),
        rejectionReason: reason,
        updatedAt: new Date(),
      })
      .where(eq(memberProfiles.id, profileId));

    await writeAuditLog({
      adminEmail: auth.email,
      action: 'profile.rejected',
      targetId: profileId,
      targetEmail: existing.email,
      metadata: { reason },
    });
  }

  return NextResponse.json({ ok: true, action });
}
