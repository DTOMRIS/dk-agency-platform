import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

/**
 * POST /api/auth/change-password — a signed-in user changes their own password.
 * TASK-0526: before, this compared a plain-text password against an in-memory mock list
 * (lib/auth/mock-state) and «changed» it there — real users could never change their password, and the
 * B2B settings page did not even call it. Now: the users table + bcrypt, same as login / reset-password.
 */
export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || !session.email) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  const rl = checkRateLimit(`auth-change-password:${getClientIp(request)}`, RATE_LIMITS.authLogin);
  if (!rl.success) return rateLimitExceeded(rl);

  const body = await request.json().catch(() => ({}));
  const currentPassword = String(body?.currentPassword || '');
  const newPassword = String(body?.newPassword || '');

  if (!newPassword || newPassword.length < 8) {
    return NextResponse.json({ success: false, error: 'Yeni şifrə minimum 8 simvol olmalıdır.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: false, error: 'Verilənlər bazası əlçatan deyil.' }, { status: 503 });
  }

  const user = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, session.email.trim().toLowerCase()))
    .then((rows) => rows[0]);

  if (!user?.passwordHash || !currentPassword || !(await compare(currentPassword, user.passwordHash))) {
    return NextResponse.json({ success: false, error: 'Mövcud şifrə yanlışdır.' }, { status: 400 });
  }

  if (await compare(newPassword, user.passwordHash)) {
    return NextResponse.json({ success: false, error: 'Yeni şifrə köhnəsi ilə eyni ola bilməz.' }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);
  await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, user.id));

  return NextResponse.json({ success: true, message: 'Şifrəniz dəyişdirildi.' });
}
