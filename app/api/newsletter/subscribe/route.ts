// public-ok: newsletter sign-up, rate-limited
import { NextRequest, NextResponse, after } from 'next/server';
import { z } from 'zod';

import { saveEmailPreferences } from '@/lib/email/preferences';
import { notifyOwner } from '@/lib/telegram/notify-owner';
import { checkRateLimit, getClientIp, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { attributionLine } from '@/lib/analytics/attribution';
import { readAttribution, recordLeadSource } from '@/lib/analytics/attribution-server';

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

    const leadAttr = readAttribution(request);
    after(async () => {
      await recordLeadSource(leadAttr, 'newsletter', null);
      await notifyOwner({
        title: '📨 Yeni abunə · bülletən',
        lines: [`E-poçt: ${parsed.data.email}`, `Forma: ${parsed.data.source}`, attributionLine(leadAttr)],
      });
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
