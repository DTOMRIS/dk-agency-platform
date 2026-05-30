import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerMemberSession } from '@/lib/members/server-session';

async function resolveUserId(email: string): Promise<number | null> {
  if (!db) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

export async function GET() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await resolveUserId(session.email);
  if (!userId || !db) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const [user] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      phone: users.phone,
      company: users.company,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, userId));

  return NextResponse.json({ profile: user });
}

export async function PATCH(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await resolveUserId(session.email);
  if (!userId || !db) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const body = await request.json();
  const allowedFields = ['name', 'phone', 'company'];
  const updates: Record<string, unknown> = {};

  for (const key of allowedFields) {
    if (body[key] !== undefined) {
      updates[key] = String(body[key]).trim() || null;
    }
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
  }

  updates.updatedAt = new Date();

  await db.update(users).set(updates).where(eq(users.id, userId));

  return NextResponse.json({ ok: true });
}
