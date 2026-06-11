import type { NextRequest } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';

/**
 * News admin access guard.
 * SECURITY: Only authenticated admin sessions are allowed.
 * Origin/Referer header checks REMOVED — they are trivially spoofable.
 */
export async function canAccessNewsAdmin(_request: NextRequest) {
  const session = await getServerMemberSession();
  const allowed = session.loggedIn && session.plan === 'admin';

  return { allowed, session };
}
