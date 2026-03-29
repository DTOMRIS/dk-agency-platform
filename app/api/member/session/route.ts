import { NextRequest, NextResponse } from 'next/server';
import { getGuestSession, type MemberSession } from '@/lib/member-access';
import { MEMBER_COOKIE_NAME, encodeMemberSession, getServerMemberSession } from '@/lib/members/server-session';

export async function GET() {
  const session = await getServerMemberSession();
  return NextResponse.json({ session });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<MemberSession>;

  const session: MemberSession = {
    email: body.email ?? '',
    name: body.name ?? '',
    loggedIn: body.loggedIn === true,
    plan: body.plan === 'admin' || body.plan === 'member' ? body.plan : 'free',
  };

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
