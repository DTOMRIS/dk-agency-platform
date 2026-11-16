import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { isBotUserAgent } from '@/lib/leads/ref-code';
import { checkRateLimit, rateLimitExceeded, RATE_LIMITS } from '@/lib/utils/rate-limit';
import { readAttribution, recordLeadSource } from '@/lib/analytics/attribution-server';

const ALLOWED_CHANNELS = ['kazan', 'whatsapp', 'telegram'] as const;
const ALLOWED_SOURCES = ['contact_page', 'home_join'] as const;

const ALLOWED_LOCALES = ['az', 'ru', 'en', 'tr'] as const;

type Channel = (typeof ALLOWED_CHANNELS)[number];
type Source = (typeof ALLOWED_SOURCES)[number];
type Locale = (typeof ALLOWED_LOCALES)[number];

function isAllowedChannel(value: unknown): value is Channel {
  return typeof value === 'string' && ALLOWED_CHANNELS.includes(value as Channel);
}

function isAllowedSource(value: unknown): value is Source {
  return typeof value === 'string' && ALLOWED_SOURCES.includes(value as Source);
}

function normalizeLocale(value: unknown): Locale {
  return typeof value === 'string' && ALLOWED_LOCALES.includes(value as Locale)
    ? (value as Locale)
    : 'az';
}

// Optional, client-supplied strings — trim, drop empties, cap length so a
// manipulated POST cannot bloat the row.
function cleanStr(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  // public-ok: contact-button click counter (no data returned). TASK-0530: it writes a row and e-mails /
  // pings the owner, so bots are ignored and one IP is limited to 20 an hour.
  if (isBotUserAgent(req.headers.get('user-agent'))) return new NextResponse(null, { status: 204 });
  const rl = checkRateLimit(`lead-click:${getClientIp(req)}`, RATE_LIMITS.leadClick);
  if (!rl.success) return rateLimitExceeded(rl);

  try {
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = (await req.json()) as {
      source?: unknown;
      channel?: unknown;
      locale?: unknown;
      sourceUrl?: unknown;
      prefillText?: unknown;
      destinationPhone?: unknown;
    };
    const { source, channel } = body;

    if (!isAllowedChannel(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    if (!isAllowedSource(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const salt = process.env.IP_HASH_SALT ?? 'fallback-salt-change-me';
    const ipHash = crypto
      .createHash('sha256')
      .update(ip + salt)
      .digest('hex');

    const locale = normalizeLocale(body.locale);
    const sourceUrl = cleanStr(body.sourceUrl, 2048);
    const prefillText = cleanStr(body.prefillText, 1000);
    const destinationPhone = cleanStr(body.destinationPhone, 32);
    const createdAt = new Date();

    await db.insert(leads).values({
      source,
      channel,
      locale,
      userAgent: req.headers.get('user-agent'),
      ipHash,
      sourceUrl,
      prefillText,
      destinationPhone,
      createdAt,
    });

    // Anonymous contact interest stays in the click history and daily summary.
    const leadAttr = readAttribution(req);
    after(() => recordLeadSource(leadAttr, 'channel_click', sourceUrl));

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[leads/track]', error);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
