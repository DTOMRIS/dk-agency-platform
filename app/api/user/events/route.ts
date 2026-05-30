import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerMemberSession } from '@/lib/members/server-session';
import { logEvent } from '@/lib/user/events';
import { isValidEventType, type UserEventType } from '@/lib/data/userEvents';

// ── RATE LIMIT (in-memory, 10/min/user) ─────────────────────────────
const rateLimitMap = new Map<number, { count: number; resetAt: number }>();

function checkRateLimit(userId: number): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(userId);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(userId, { count: 1, resetAt: now + 60_000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count++;
  return true;
}

async function resolveUserId(email: string): Promise<number | null> {
  if (!db) return null;
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await resolveUserId(session.email);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (!checkRateLimit(userId)) {
    return NextResponse.json({ error: 'rate-limit-exceeded' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { type, payload } = body as { type?: unknown; payload?: unknown };

  if (!isValidEventType(type)) {
    return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
  }

  await logEvent(userId, type as UserEventType, payload as Record<string, unknown> | undefined);

  return NextResponse.json({ ok: true });
}
