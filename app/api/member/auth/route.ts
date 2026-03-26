import { NextRequest, NextResponse } from 'next/server';
import { type MemberSession } from '@/lib/member-access';
import { loginMember, registerMember } from '@/lib/members/auth-adapter';
import { MEMBER_COOKIE_NAME, encodeMemberSession } from '@/lib/members/server-session';

function withSession(response: NextResponse, session: MemberSession) {
  response.cookies.set(MEMBER_COOKIE_NAME, encodeMemberSession(session), {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24 * 30,
  });

  return response;
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const action = body?.action as 'login' | 'register';

  if (action !== 'login' && action !== 'register') {
    return NextResponse.json({ ok: false, error: 'Yanlış auth action.' }, { status: 400 });
  }

  const result = action === 'login' ? await loginMember(body) : await registerMember(body);

  if (!result.ok || !result.session) {
    return NextResponse.json(
      { ok: false, error: result.error || 'Auth xətası', provider: result.provider },
      { status: 400 }
    );
  }

  return withSession(
    NextResponse.json({
      ok: true,
      session: result.session,
      provider: result.provider,
    }),
    result.session
  );
}
