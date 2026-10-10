import { NextRequest, NextResponse, after } from 'next/server';
import { createHash, randomInt } from 'node:crypto';
import { WHATSAPP_NUMBER } from '@/lib/contact-channels';
import { isBotUserAgent } from '@/lib/leads/ref-code';
import { checkRateLimit, getClientIp, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { leadButtons, notifyOwner } from '@/lib/telegram/notify-owner';

/**
 * WhatsApp redirect. TASK-0511: every click is also counted in `leads`
 * (source `wa_redirect`, channel `whatsapp` — both free varchar) and pinged to the owner's
 * Telegram. Logging runs after the redirect response, so the redirect stays instant and
 * can never fail because of it.
 *
 * TASK-0529 (owner 10.10: «başvurdu, nasıl iletişim kuracağım?»): a click alone never tells us who the
 * visitor is — their name and number only reach the owner when they actually send the message in
 * WhatsApp. So each click gets a short reference code appended to the pre-filled text («Kod: DK-7K3Q»);
 * the same code is stored in `leads.prefill_text`, and the inbox / contact-tracking show it, so the owner
 * can match the chat on his phone to the page the visitor came from (click-ID-in-message attribution).
 */
const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
function refCode(): string {
  let out = '';
  for (let i = 0; i < 4; i += 1) out += REF_ALPHABET[randomInt(REF_ALPHABET.length)];
  return `DK-${out}`;
}

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
  const base = (req.nextUrl.searchParams.get('text') ?? '').slice(0, 900);
  const message = `${base ? `${base}\n\n` : ''}Kod: ${refCode()}`;
  const url = new URL(`https://wa.me/${WHATSAPP_NUMBER}`);
  url.searchParams.set('text', message);

  // public-ok: a plain link on every page; the redirect always works. TASK-0530: bots and more than
  // 20 clicks/hour from one IP are not counted and do not ping the owner.
  const counted = !isBotUserAgent(req.headers.get('user-agent')) && checkRateLimit(`lead-click:${getClientIp(req)}`, RATE_LIMITS.leadClick).success;
  if (counted) after(() => logClick(req, message));
  return NextResponse.redirect(url);
}
