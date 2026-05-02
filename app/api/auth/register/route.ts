import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { sendSmtpEmail } from '@/lib/email/smtp';

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
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const confirmUrl = `${baseUrl}/api/auth/confirm?token=${token}`;

    await sendSmtpEmail(
      email,
      'DK Agency — Email Təsdiqi',
      `<div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 20px;">
        <h2 style="color:#1e3a5f;">Xoş gəldiniz, ${name}!</h2>
        <p style="color:#333;line-height:1.6;">DK Agency platformasına qeydiyyatınız uğurla tamamlandı.</p>
        <p style="color:#333;line-height:1.6;">Email ünvanınızı təsdiqləmək üçün aşağıdakı düyməyə basın:</p>
        <div style="text-align:center;margin:30px 0;">
          <a href="${confirmUrl}" style="background:linear-gradient(135deg,#1e3a5f,#0f172a);color:#d4af37;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;">
            Email-i Təsdiq Et
          </a>
        </div>
        <p style="color:#666;font-size:13px;">Link 24 saat ərzində etibarlıdır.</p>
        <hr style="border:none;border-top:1px solid #e5e5e5;margin:30px 0;" />
        <p style="color:#999;font-size:12px;text-align:center;">&copy; 2026 DK Agency. Bütün hüquqlar qorunur.</p>
      </div>`,
    );

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
