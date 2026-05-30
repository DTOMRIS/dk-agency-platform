import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getServerMemberSession } from '@/lib/members/server-session';
import { pickNudge } from '@/lib/nudge/rules';
import { type PriorityKey, isValidPriorityKey } from '@/lib/data/priorities';

export async function GET() {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ nudge: null });
  }

  const [user] = await db
    .select({ id: users.id, priorities: users.priorities })
    .from(users)
    .where(eq(users.email, session.email));

  if (!user) {
    return NextResponse.json({ nudge: null });
  }

  const priorities = user.priorities?.filter(isValidPriorityKey) as PriorityKey[] | null;

  const nudge = await pickNudge({
    userId: user.id,
    email: session.email,
    priorities: priorities && priorities.length > 0 ? priorities : null,
    locale: 'az',
  });

  return NextResponse.json({ nudge });
}
