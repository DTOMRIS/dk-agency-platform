import { NextRequest, NextResponse } from 'next/server';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { db } from '@/lib/db';
import { memberProfiles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

const VALID_ROLES = ['member', 'admin'] as const;
type Role = (typeof VALID_ROLES)[number];

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id: rawId } = await params;
  const targetId = parseInt(rawId, 10);
  if (isNaN(targetId)) {
    return NextResponse.json({ error: 'invalid-id' }, { status: 400 });
  }

  // Self-role change protection
  if (targetId === auth.userId) {
    return NextResponse.json({ error: 'self-role-forbidden' }, { status: 403 });
  }

  let body: { role?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid-body' }, { status: 400 });
  }

  if (!body.role || !VALID_ROLES.includes(body.role as Role)) {
    return NextResponse.json({ error: 'invalid-role' }, { status: 400 });
  }

  // Check user exists
  const existing = await db
    .select({ id: memberProfiles.id })
    .from(memberProfiles)
    .where(eq(memberProfiles.id, targetId))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'user-not-found' }, { status: 404 });
  }

  // Update role
  await db
    .update(memberProfiles)
    .set({ role: body.role, updatedAt: new Date() })
    .where(eq(memberProfiles.id, targetId));

  return NextResponse.json({ success: true, updatedRole: body.role });
}
