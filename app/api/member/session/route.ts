import { NextRequest, NextResponse } from 'next/server';
import { getGuestSession, type MemberSession } from '@/lib/member-access';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import {
  MEMBER_COOKIE_NAME,
  encodeMemberSession,
  getServerMemberSession,
  sessionFromJwt,
} from '@/lib/members/server-session';

export async function GET() {
  const session = await getServerMemberSession();
  return NextResponse.json({ session });
}

// TASK-0457: bədəndən yalnız göstəriləcək ad götürülür. `loggedIn` və `plan`
// imzalı JWT-dən gəlir — əvvəl bədəndəki `plan: 'admin'` olduğu kimi yazılırdı.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as Partial<MemberSession>;
  const payload = await getAuthFromCookie();
  const session = sessionFromJwt(payload, typeof body.name === 'string' ? body.name : '');

  const response = NextResponse.json({ success: true, session });
  response.cookies.set(MEMBER_COOKIE_NAME, encodeMemberSession(session), {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, session: getGuestSession() });
  response.cookies.set(MEMBER_COOKIE_NAME, '', {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 0,
  });
  return response;
}
