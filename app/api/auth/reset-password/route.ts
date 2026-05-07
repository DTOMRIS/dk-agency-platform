import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq, and, isNull } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`auth-reset-password:${ip}`, RATE_LIMITS.authResetPassword);
    if (!rl.success) return rateLimitExceeded(rl);

    const body = await request.json();
    const token = String(body?.token || '');
    const newPassword = String(body?.newPassword || '');

    if (!token || !newPassword || newPassword.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Yeni şifrə minimum 8 simvol olmalıdır.' },
        { status: 400 },
      );
    }

    if (!dbAvailable || !db) {
      return NextResponse.json(
        { success: false, error: 'Verilənlər bazası əlçatan deyil.' },
        { status: 503 },
      );
    }

    // Find valid (unused) token
    const record = await db
      .select({
        id: passwordResetTokens.id,
        userId: passwordResetTokens.userId,
        expiresAt: passwordResetTokens.expiresAt,
      })
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          isNull(passwordResetTokens.usedAt),
        ),
      )
      .then((rows) => rows[0]);

    if (!record) {
      return NextResponse.json(
        { success: false, error: 'Link etibarsızdır.' },
        { status: 400 },
      );
    }

    if (record.expiresAt < new Date()) {
      return NextResponse.json(
        { success: false, error: 'Linkin müddəti bitib.' },
        { status: 400 },
      );
    }

    // Hash new password and update user
    const passwordHash = await hash(newPassword, 12);
    await db
      .update(users)
      .set({ passwordHash, updatedAt: new Date() })
      .where(eq(users.id, record.userId!));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ usedAt: new Date() })
      .where(eq(passwordResetTokens.id, record.id));

    return NextResponse.json({
      success: true,
      message: 'Şifrə yeniləndi. Yeni şifrənizlə daxil ola bilərsiniz.',
    });
  } catch (err) {
    console.error('[auth/reset-password] Error:', err);
    return NextResponse.json(
      { success: false, error: 'Daxili xəta baş verdi.' },
      { status: 500 },
    );
  }
}
