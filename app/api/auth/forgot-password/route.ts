import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, passwordResetTokens } from '@/lib/db/schema';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { getBaseUrl } from '@/lib/utils/get-base-url';
import { normalizeLocale } from '@/i18n/config';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`auth-forgot-password:${ip}`, RATE_LIMITS.authForgotPassword);
    if (!rl.success) return rateLimitExceeded(rl);

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const locale = normalizeLocale(String(body?.locale || ''));

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email ünvanı tələb olunur.' },
        { status: 400 },
      );
    }

    // Always return 200 to prevent email enumeration
    const successMessage = 'Sıfırlama linki email ünvanınıza göndərildi. Zəhmət olmasa yoxlayın.';

    if (!dbAvailable || !db) {
      return NextResponse.json({ success: true, message: successMessage });
    }

    const user = await db
      .select({ id: users.id, name: users.name, email: users.email })
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);

    if (!user) {
      // User not found — still return 200 (security: no email enumeration)
      return NextResponse.json({ success: true, message: successMessage });
    }

    // Create token (1 hour expiry)
    const token = crypto.randomUUID();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    // Send password reset email
    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
    await sendEmail(
      user.email,
      emailTemplates.passwordReset(resetUrl, user.name, locale),
    );

    return NextResponse.json({ success: true, message: successMessage });
  } catch (err) {
    console.error('[auth/forgot-password] Error:', err);
    return NextResponse.json(
      { success: true, message: 'Sıfırlama linki email ünvanınıza göndərildi.' },
    );
  }
}
