import type { NextRequest } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';

function hasSameOriginHeader(request: NextRequest) {
  const origin = request.headers.get('origin');
  return Boolean(origin && origin === request.nextUrl.origin);
}

function hasDashboardReferer(request: NextRequest) {
  const referer = request.headers.get('referer');
  if (!referer) return false;

  try {
    const refererUrl = new URL(referer);
    return refererUrl.origin === request.nextUrl.origin && refererUrl.pathname.startsWith('/dashboard');
  } catch {
    return false;
  }
}

export async function canAccessNewsAdmin(request: NextRequest) {
  const session = await getServerMemberSession();
  const viaMemberAdmin = session.loggedIn && session.plan === 'admin';
  const viaSameOrigin = hasSameOriginHeader(request);
  const viaDashboardReferer = hasDashboardReferer(request);

  return {
    allowed: viaMemberAdmin || viaSameOrigin || viaDashboardReferer,
    session,
    viaSameOrigin,
    viaDashboardReferer,
  };
}
