import { NextResponse } from 'next/server';
import { createPasswordResetToken, findMockUserByEmail } from '@/lib/auth/mock-state';

export async function POST(request: Request) {
  const body = await request.json();
  const normalizedEmail = String(body?.email || '').trim().toLowerCase();

  if (!normalizedEmail) {
    return NextResponse.json({ success: false, error: 'Email ünvanı tələb olunur.' }, { status: 400 });
  }

  let debugToken: string | undefined;
  const user = findMockUserByEmail(normalizedEmail);

  if (user) {
    const token = crypto.randomUUID();
    createPasswordResetToken(user.id, token, 1);
    debugToken = token;

    const origin = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    console.log('Password reset email would be sent to:', normalizedEmail, 'Token:', token);
    console.log('Reset URL:', `${origin}/reset-password?token=${token}`);
  }

  return NextResponse.json({
    success: true,
    message: 'Sıfırlama linki email ünvanınıza göndərildi. Zəhmət olmasa yoxlayın.',
    debugToken: process.env.NODE_ENV === 'production' ? undefined : debugToken,
    resetUrl:
      process.env.NODE_ENV === 'production' || !debugToken
        ? undefined
        : `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${debugToken}`,
  });
}
