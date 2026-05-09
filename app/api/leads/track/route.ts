import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';

const ALLOWED_CHANNELS = ['kazan', 'whatsapp', 'telegram'] as const;
const ALLOWED_SOURCES = ['contact_page'] as const;
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
  return typeof value === 'string' && ALLOWED_LOCALES.includes(value as Locale) ? (value as Locale) : 'az';
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

export async function POST(req: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json({ error: 'Database unavailable' }, { status: 503 });
    }

    const body = (await req.json()) as { source?: unknown; channel?: unknown; locale?: unknown };
    const { source, channel } = body;

    if (!isAllowedChannel(channel)) {
      return NextResponse.json({ error: 'Invalid channel' }, { status: 400 });
    }

    if (!isAllowedSource(source)) {
      return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
    }

    const ip = getClientIp(req);
    const salt = process.env.IP_HASH_SALT ?? 'fallback-salt-change-me';
    const ipHash = crypto.createHash('sha256').update(ip + salt).digest('hex');

    await db.insert(leads).values({
      source,
      channel,
      locale: normalizeLocale(body.locale),
      userAgent: req.headers.get('user-agent'),
      ipHash,
      createdAt: new Date(),
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[leads/track]', error);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
