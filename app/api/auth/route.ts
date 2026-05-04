import { NextRequest, NextResponse } from 'next/server';
import { compare, hash } from 'bcryptjs';
import { eq, and, isNull } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, loginLogs, emailVerificationTokens, passwordResetTokens } from '@/lib/db/schema';
import { signToken, verifyToken, AUTH_COOKIE_NAME, authCookieOptions } from '@/lib/auth/jwt';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { getBaseUrl } from '@/lib/utils/get-base-url';

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

// POST — action-based dispatcher (backward compat)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'login':
        return handleLogin(request, body);
      case 'register':
        return handleRegister(body);
      case 'password-reset-request':
        return handlePasswordResetRequest(body);
      case 'password-reset-confirm':
        return handlePasswordResetConfirm(body);
      case 'logout':
        return handleLogout();
      case 'verify-token':
        return handleVerifyToken(request);
      default:
        return NextResponse.json({ error: 'Yanlış action.' }, { status: 400 });
    }
  } catch (err) {
    console.error('[auth] Error:', err);
    return NextResponse.json({ error: 'Daxili xəta.' }, { status: 500 });
  }
}

// GET — /api/auth (me)
export async function GET(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, message: 'Token expired' }, { status: 401 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ authenticated: true, userId: payload.userId, email: payload.email, role: payload.role });
  }

  const user = await db
    .select({ id: users.id, email: users.email, name: users.name, role: users.role })
    .from(users)
    .where(eq(users.id, payload.userId))
    .then((rows) => rows[0]);

  if (!user) {
    return NextResponse.json({ authenticated: false, message: 'User not found' }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, user });
}

// ── LOGIN ──────────────────────────────────────────
async function handleLogin(request: NextRequest, data: Record<string, unknown>) {
  const email = normalizeEmail(String(data.email || ''));
  const password = String(data.password || '');

  if (!email || !password) {
    return NextResponse.json({ error: 'Email və şifrə tələb olunur.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ error: 'DB əlçatan deyil.' }, { status: 503 });
  }

  const user = await db.select().from(users).where(eq(users.email, email)).then((r) => r[0]);

  if (!user || !user.passwordHash) {
    return NextResponse.json({ error: 'Email və ya şifrə yanlışdır.' }, { status: 401 });
  }

  const matches = await compare(password, user.passwordHash);
  if (!matches) {
    await db.insert(loginLogs).values({
      userId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      success: false,
    });
    return NextResponse.json({ error: 'Email və ya şifrə yanlışdır.' }, { status: 401 });
  }

  if (!user.emailVerified) {
    return NextResponse.json({ error: 'Email ünvanınızı təsdiqləyin.' }, { status: 403 });
  }

  await db.insert(loginLogs).values({
    userId: user.id,
    ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
    userAgent: request.headers.get('user-agent') || 'unknown',
    success: true,
  });

  const token = signToken({ userId: user.id, email: user.email, role: user.role || 'member' });
  const isProduction = process.env.NODE_ENV === 'production';

  const response = NextResponse.json({
    success: true,
    message: 'Giriş uğurludur.',
    user: { id: user.id, email: user.email, name: user.name, userType: user.role },
    token,
    expiresIn: 604800,
  });

  response.cookies.set(AUTH_COOKIE_NAME, token, authCookieOptions(isProduction));
  return response;
}

// ── REGISTER ──────────────────────────────────────
async function handleRegister(data: Record<string, unknown>) {
  const email = normalizeEmail(String(data.email || ''));
  const password = String(data.password || '');
  const name = String(data.name || '').trim();

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'Email, şifrə və ad tələb olunur.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Şifrə ən az 8 simvol olmalıdır.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ error: 'DB əlçatan deyil.' }, { status: 503 });
  }

  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).then((r) => r[0]);
  if (existing) {
    return NextResponse.json({ error: 'Bu email artıq qeydiyyatdadır.' }, { status: 409 });
  }

  const passwordHash = await hash(password, 12);
  const inserted = await db
    .insert(users)
    .values({
      email,
      name,
      passwordHash,
      phone: String(data.phone || '').trim() || null,
      company: String(data.company || '').trim() || null,
      role: 'member',
      emailVerified: false,
    })
    .returning({ id: users.id, email: users.email });

  const newUser = inserted[0];
  const verifyToken = crypto.randomUUID();

  await db.insert(emailVerificationTokens).values({
    userId: newUser.id,
    token: verifyToken,
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
  });

  const confirmUrl = `${getBaseUrl()}/api/auth/confirm?token=${verifyToken}`;
  await sendEmail(email, emailTemplates.emailVerification(confirmUrl, name));

  return NextResponse.json({
    success: true,
    message: 'Hesabınız yaradıldı! Email ünvanınıza təsdiq linki göndərildi.',
    user: { id: newUser.id, email: newUser.email, name },
  });
}

// ── PASSWORD RESET REQUEST ───────────────────────
async function handlePasswordResetRequest(data: Record<string, unknown>) {
  const email = normalizeEmail(String(data.email || ''));

  if (!email) {
    return NextResponse.json({ error: 'Email tələb olunur.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: true, message: 'Sıfırlama linki göndərildi.' });
  }

  const user = await db.select({ id: users.id, name: users.name }).from(users).where(eq(users.email, email)).then((r) => r[0]);

  if (user) {
    const token = crypto.randomUUID();
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    });

    const resetUrl = `${getBaseUrl()}/reset-password?token=${token}`;
    await sendEmail(email, emailTemplates.passwordReset(resetUrl, user.name));
  }

  // Always return success to prevent email enumeration
  return NextResponse.json({
    success: true,
    message: 'Sıfırlama linki email ünvanınıza göndərildi.',
  });
}

// ── PASSWORD RESET CONFIRM ───────────────────────
async function handlePasswordResetConfirm(data: Record<string, unknown>) {
  const token = String(data.token || '');
  const newPassword = String(data.newPassword || '');
  const confirmPassword = String(data.confirmPassword || '');

  if (!token || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'Bütün sahələr tələb olunur.' }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'Şifrələr uyğun deyil.' }, { status: 400 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json({ error: 'Şifrə ən az 8 simvol olmalıdır.' }, { status: 400 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ error: 'DB əlçatan deyil.' }, { status: 503 });
  }

  const record = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.token, token), isNull(passwordResetTokens.usedAt)))
    .then((r) => r[0]);

  if (!record) {
    return NextResponse.json({ error: 'Link etibarsızdır.' }, { status: 400 });
  }

  if (record.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Linkin müddəti bitib.' }, { status: 400 });
  }

  const passwordHash = await hash(newPassword, 12);

  await db.update(passwordResetTokens).set({ usedAt: new Date() }).where(eq(passwordResetTokens.id, record.id));

  if (record.userId) {
    await db.update(users).set({ passwordHash, updatedAt: new Date() }).where(eq(users.id, record.userId));
  }

  return NextResponse.json({
    success: true,
    message: 'Şifrəniz uğurla yeniləndi. Yeni şifrə ilə giriş edə bilərsiniz.',
  });
}

// ── LOGOUT ───────────────────────────────────────
function handleLogout() {
  const response = NextResponse.json({ success: true, message: 'Çıxış edildi.' });
  response.cookies.set(AUTH_COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
  return response;
}

// ── VERIFY TOKEN ─────────────────────────────────
function handleVerifyToken(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ valid: false, error: 'Token yoxdur.' });
  }

  const payload = verifyToken(token);
  if (!payload) {
    return NextResponse.json({ valid: false, error: 'Token etibarsızdır.' });
  }

  return NextResponse.json({ valid: true, userId: payload.userId, email: payload.email });
}
