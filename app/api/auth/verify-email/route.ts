import { NextResponse } from 'next/server';
import { consumeEmailVerificationToken } from '@/lib/auth/mock-state';

export async function POST(request: Request) {
  const body = await request.json();
  const token = String(body?.token || '');

  if (!token) {
    return NextResponse.json({ success: false, error: 'Token tələb olunur.' }, { status: 400 });
  }

  const result = consumeEmailVerificationToken(token);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    message: 'Email ünvanınız təsdiqləndi!',
    email: result.user?.email,
  });
}
