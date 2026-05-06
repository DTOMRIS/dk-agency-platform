import { NextRequest, NextResponse } from 'next/server';
import { compare } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, loginLogs } from '@/lib/db/schema';
import { signToken, AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/auth/jwt';
import { checkRateLimit, getClientIp, rateLimitExceeded, withRateLimitHeaders, RATE_LIMITS } from '@/lib/utils/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`auth-login:${ip}`, RATE_LIMITS.authLogin);
    if (!rl.success) return rateLimitExceeded(rl);

    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');

    if (!email || !password) {
      return NextResponse.json(
        { ok: false, error: 'Email və şifrə tələb olunur.' },
        { status: 400 },
      );
    }

    if (!dbAvailable || !db) {
      return NextResponse.json(
        { ok: false, error: 'Verilənlər bazası əlçatan deyil.' },
        { status: 503 },
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { ok: false, error: 'Email və ya şifrə yanlışdır.' },
        { status: 401 },
      );
    }

    const matches = await compare(password, user.passwordHash);
    if (!matches) {
      await db.insert(loginLogs).values({
        userId: user.id,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        success: false,
      });
      return NextResponse.json(
        { ok: false, error: 'Email və ya şifrə yanlışdır.' },
        { status: 401 },
      );
    }

    if (!user.emailVerified) {
      return NextResponse.json(
        { ok: false, error: 'Email ünvanınızı təsdiqləyin. Təsdiq linki email-inizə göndərilib.' },
        { status: 403 },
      );
    }

    // Log successful login
    await db.insert(loginLogs).values({
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: true,
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role || 'member' });
    const isProduction = process.env.NODE_ENV === 'production';

    const response = NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(isProduction));

    return withRateLimitHeaders(response, rl);
  } catch (err) {
    console.error('[auth/login] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Daxili xəta baş verdi.' },
      { status: 500 },
    );
  }
}
