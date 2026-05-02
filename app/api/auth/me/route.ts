import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth/jwt';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

    if (!token) {
      return NextResponse.json(
        { ok: false, error: 'Giriş etməmisiniz.' },
        { status: 401 },
      );
    }

    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json(
        { ok: false, error: 'Sessiya bitib. Yenidən giriş edin.' },
        { status: 401 },
      );
    }

    if (!dbAvailable || !db) {
      // Fallback: return JWT payload without DB lookup
      return NextResponse.json({
        ok: true,
        user: { id: payload.userId, email: payload.email, role: payload.role },
      });
    }

    const user = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        role: users.role,
        phone: users.phone,
        company: users.company,
        emailVerified: users.emailVerified,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, payload.userId))
      .then((rows) => rows[0]);

    if (!user) {
      return NextResponse.json(
        { ok: false, error: 'İstifadəçi tapılmadı.' },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (err) {
    console.error('[auth/me] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Daxili xəta baş verdi.' },
      { status: 500 },
    );
  }
}
