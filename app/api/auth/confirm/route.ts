import { NextRequest, NextResponse } from 'next/server';
import { eq, and, isNull } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { getBaseUrl } from '@/lib/utils/get-base-url';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`auth-verify:${ip}`, RATE_LIMITS.authVerifyEmail);
    if (!rl.success) return rateLimitExceeded(rl);

    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      return redirectWithMessage(request, 'error', 'Təsdiq linki etibarsızdır.');
    }

    if (!dbAvailable || !db) {
      return redirectWithMessage(request, 'error', 'Verilənlər bazası əlçatan deyil.');
    }

    // Find valid token
    const record = await db
      .select()
      .from(emailVerificationTokens)
      .where(
        and(
          eq(emailVerificationTokens.token, token),
          isNull(emailVerificationTokens.usedAt),
        ),
      )
      .then((rows) => rows[0]);

    if (!record) {
      return redirectWithMessage(request, 'error', 'Təsdiq linki etibarsız və ya artıq istifadə olunub.');
    }

    if (record.expiresAt < new Date()) {
      return redirectWithMessage(request, 'error', 'Təsdiq linkinin müddəti bitib. Yenidən qeydiyyatdan keçin.');
    }

    // Mark token as used
    await db
      .update(emailVerificationTokens)
      .set({ usedAt: new Date() })
      .where(eq(emailVerificationTokens.id, record.id));

    // Set user emailVerified = true and send welcome email
    if (record.userId) {
      const [user] = await db
        .update(users)
        .set({ emailVerified: true, updatedAt: new Date() })
        .where(eq(users.id, record.userId))
        .returning({ name: users.name, email: users.email });

      if (user?.email) {
        const baseUrl = getBaseUrl();
        const locale = request.nextUrl.searchParams.get('locale') || 'az';
        sendEmail(user.email, emailTemplates.welcome(user.name, baseUrl, locale)).catch(() => {});
      }
    }

    return redirectWithMessage(request, 'success', 'Email təsdiqləndi! İndi giriş edə bilərsiniz.');
  } catch (err) {
    console.error('[auth/confirm] Error:', err);
    return redirectWithMessage(request, 'error', 'Daxili xəta baş verdi.');
  }
}

function redirectWithMessage(_request: NextRequest, type: 'success' | 'error', message: string) {
  const url = new URL('/auth/login', getBaseUrl());
  url.searchParams.set(type, message);
  return NextResponse.redirect(url);
}
