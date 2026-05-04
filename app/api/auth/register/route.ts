import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { getBaseUrl } from '@/lib/utils/get-base-url';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const name = String(body?.name || '').trim();

    if (!email || !password || !name) {
      return NextResponse.json(
        { ok: false, error: 'Email, şifrə və ad tələb olunur.' },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Şifrə ən az 8 simvol olmalıdır.' },
        { status: 400 },
      );
    }

    if (!dbAvailable || !db) {
      return NextResponse.json(
        { ok: false, error: 'Verilənlər bazası əlçatan deyil.' },
        { status: 503 },
      );
    }

    // Check duplicate
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'Bu email artıq qeydiyyatdadır.' },
        { status: 409 },
      );
    }

    // Hash password and insert user
    const passwordHash = await hash(password, 12);
    const inserted = await db
      .insert(users)
      .values({
        email,
        name,
        passwordHash,
        phone: String(body?.phone || '').trim() || null,
        company: String(body?.company || '').trim() || null,
        role: 'member',
        emailVerified: false,
      })
      .returning({ id: users.id, email: users.email });

    const newUser = inserted[0];

    // Create email verification token
    const token = crypto.randomUUID();
    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    });

    // Send confirmation email
    const confirmUrl = `${getBaseUrl()}/api/auth/confirm?token=${token}`;
    await sendEmail(email, emailTemplates.emailVerification(confirmUrl, name));

    return NextResponse.json({
      ok: true,
      message: 'Hesabınız yaradıldı! Email ünvanınıza təsdiq linki göndərildi.',
      verificationRequired: true,
    });
  } catch (err) {
    console.error('[auth/register] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Daxili xəta baş verdi.' },
      { status: 500 },
    );
  }
}
