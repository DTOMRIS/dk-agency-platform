import { NextRequest, NextResponse } from 'next/server';
import { type MemberSession } from '@/lib/member-access';
import { loginMember } from '@/lib/members/auth-adapter';
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
  const action = body?.action as string;

  if (action === 'register') {
    return NextResponse.json(
      { ok: false, error: 'Bu endpoint-dən qeydiyyat deaktiv edilib. /api/auth/register istifadə edin.' },
      { status: 410 },
    );
  }

  if (action !== 'login') {
    return NextResponse.json({ ok: false, error: 'Yanlış auth action.' }, { status: 400 });
  }

  const result = await loginMember(body);

  if (!result.ok || !result.session) {
    if (result.ok && result.verificationRequired) {
      return NextResponse.json({
        ok: true,
        verificationRequired: true,
        verificationToken: result.verificationToken,
        message: result.message,
        provider: result.provider,
      });
    }

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
      message: result.message,
    }),
    result.session
  );
}
