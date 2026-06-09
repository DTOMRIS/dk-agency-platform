import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { saveEmailPreferences } from '@/lib/email/preferences';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';

const subscribeSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  source: z.enum(['homepage_newsletter', 'blog_newsletter']).default('homepage_newsletter'),
});

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const rateLimit = checkRateLimit(`newsletter-subscribe:${ip}`, RATE_LIMITS.authForgotPassword);
  if (!rateLimit.success) return rateLimitExceeded(rateLimit);

  const parsed = subscribeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Düzgün email ünvanı daxil edin.' }, { status: 400 });
  }

  try {
    await saveEmailPreferences({
      email: parsed.data.email,
      source: parsed.data.source,
      newsletterSubscribed: true,
      blogDigestSubscribed: true,
      productUpdatesSubscribed: false,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[newsletter/subscribe] Error:', error);
    return NextResponse.json(
      { ok: false, error: 'Abunəlik hazırda tamamlanmadı. Yenidən cəhd edin.' },
      { status: 503 },
    );
  }
}
