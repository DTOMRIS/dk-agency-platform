import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getUserPriorities, setUserPriorities } from '@/lib/user/priorities';

async function resolveUserId(email: string): Promise<number | null> {
  const [row] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
  return row?.id ?? null;
}

export async function GET() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = await resolveUserId(session.email);
  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const priorities = await getUserPriorities(userId);
  return NextResponse.json({ priorities });
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { priorities } = body as { priorities?: unknown };

  if (!Array.isArray(priorities)) {
    return NextResponse.json({ error: 'priorities must be an array' }, { status: 400 });
  }

  try {
    await setUserPriorities(userId, priorities);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const errorMap: Record<string, string> = {
      INVALID_COUNT: 'Select between 1 and 3 priorities.',
      DUPLICATE_KEY: 'Duplicate priority detected.',
      INVALID_KEY: 'Invalid priority key.',
    };
    return NextResponse.json({ error: errorMap[message] ?? message }, { status: 400 });
  }

  const saved = await getUserPriorities(userId);
  return NextResponse.json({ priorities: saved });
}
