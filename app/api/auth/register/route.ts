import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db, dbAvailable } from '@/lib/db';
import { users, emailVerificationTokens } from '@/lib/db/schema';
import { sendEmail, emailTemplates } from '@/lib/email/templates';
import { saveEmailPreferences } from '@/lib/email/preferences';
import { getBaseUrl } from '@/lib/utils/get-base-url';
import { normalizeLocale } from '@/i18n/config';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { CONSENT_VERSION } from '@/lib/legal/consent-version';

const registerSchema = z.object({
  email: z.string().email().toLowerCase().trim(),
  password: z.string().min(8, 'Şifrə ən az 8 simvol olmalıdır.'),
  name: z.string().trim().min(1, 'Ad tələb olunur.'),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  locale: z.string().optional(),
  termsAccepted: z.literal(true),
  privacyAccepted: z.literal(true),
  marketingConsent: z.boolean().optional().default(false),
});

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rl = checkRateLimit(`auth-register:${ip}`, RATE_LIMITS.authRegister);
    if (!rl.success) return rateLimitExceeded(rl);

    const rawBody = await request.json();
    const parsed = registerSchema.safeParse(rawBody);

    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      const field = firstIssue.path[0];
      const message =
        field === 'termsAccepted'
          ? 'İstifadə şərtləri qəbul edilməlidir.'
          : field === 'privacyAccepted'
            ? 'Məxfilik siyasəti qəbul edilməlidir.'
            : firstIssue.message;
      return NextResponse.json(
        { ok: false, error: message },
        { status: 400 },
      );
    }

    const body = parsed.data;

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
      .where(eq(users.email, body.email))
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { ok: false, error: 'Bu email artıq qeydiyyatdadır.' },
        { status: 409 },
      );
    }

    // Hash password and insert user with consent tracking
    const passwordHash = await hash(body.password, 12);
    const now = new Date();

    const inserted = await db
      .insert(users)
      .values({
        email: body.email,
        name: body.name,
        passwordHash,
        phone: body.phone || null,
        company: body.company || null,
        role: 'member',
        emailVerified: false,
        termsAcceptedAt: now,
        termsAcceptedIp: ip,
        termsVersion: CONSENT_VERSION,
        privacyAcceptedAt: now,
        privacyAcceptedIp: ip,
        marketingConsent: body.marketingConsent,
      })
      .returning({ id: users.id, email: users.email });

    const newUser = inserted[0];

    await saveEmailPreferences({
      userId: newUser.id,
      email: body.email,
      source: 'registration',
      newsletterSubscribed: body.marketingConsent,
      blogDigestSubscribed: body.marketingConsent,
      productUpdatesSubscribed: body.marketingConsent,
    });

    // Create email verification token
    const token = crypto.randomUUID();
    await db.insert(emailVerificationTokens).values({
      userId: newUser.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    // Send confirmation email
    const confirmUrl = `${getBaseUrl()}/api/auth/confirm?token=${token}`;
    const locale = normalizeLocale(String(body.locale || ''));

    const delivery = await sendEmail(
      body.email,
      emailTemplates.emailVerification(confirmUrl, body.name, locale),
    );

    if (!delivery.success) {
      return NextResponse.json({
        ok: true,
        message: 'Hesabınız yaradıldı, amma təsdiq emaili göndərilə bilmədi. Bir az sonra yenidən cəhd edin.',
        verificationRequired: true,
        emailSent: false,
      });
    }

    return NextResponse.json({
      ok: true,
      message: 'Hesabınız yaradıldı! Email ünvanınıza təsdiq linki göndərildi.',
      verificationRequired: true,
      emailSent: true,
    });
  } catch (err) {
    console.error('[auth/register] Error:', err);
    return NextResponse.json(
      { ok: false, error: 'Daxili xəta baş verdi.' },
      { status: 500 },
    );
  }
}
