import { NextRequest, NextResponse, after } from 'next/server';
import { createHash } from 'node:crypto';
import { WHATSAPP_NUMBER } from '@/lib/contact-channels';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { leadButtons, notifyOwner } from '@/lib/telegram/notify-owner';

/**
 * WhatsApp redirect. TASK-0511: every click is also counted in `leads`
 * (source `wa_redirect`, channel `whatsapp` — both free varchar) and pinged to the owner's
 * Telegram. Logging runs after the redirect response, so the redirect stays instant and
 * can never fail because of it.
 */
async function logClick(req: NextRequest, message: string): Promise<void> {
  const referer = req.headers.get('referer');
  let page: string | null = null;
  if (referer) {
    try {
      const u = new URL(referer);
      page = `${u.pathname}${u.search}`.slice(0, 2048);
    } catch {
      page = null;
    }
  }

  try {
    if (db) {
      const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
      const salt = process.env.IP_HASH_SALT ?? 'fallback-salt-change-me';
      await db.insert(leads).values({
        source: 'wa_redirect',
        channel: 'whatsapp',
        userAgent: req.headers.get('user-agent')?.slice(0, 500) ?? null,
        ipHash: createHash('sha256').update(ip + salt).digest('hex'),
        sourceUrl: page,
        prefillText: message ? message.slice(0, 1000) : null,
        destinationPhone: WHATSAPP_NUMBER.slice(0, 32),
      });
    }
  } catch {
    // counting is best-effort
  }

  await notifyOwner({
    title: '💬 WhatsApp kliki',
    lines: [page ? `Səhifə: ${page}` : null, message ? `Hazır mesaj: ${message}` : null],
    buttons: leadButtons(null, '/dashboard/contact-tracking'),
  });
}

export function GET(req: NextRequest) {
  const message = req.nextUrl.searchParams.get('text') ?? '';
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  if (message) {
    url.searchParams.set('text', message);
  }

  after(() => logClick(req, message));
  return NextResponse.redirect(url);
}
