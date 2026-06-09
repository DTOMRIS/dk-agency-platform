import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

import { db } from '@/lib/db';
import { emailPreferences } from '@/lib/db/schema';
import { getBaseUrl } from '@/lib/utils/get-base-url';

const VALID_TYPES = ['all', 'newsletter', 'blog_digest', 'product_updates'] as const;
type UnsubscribeType = (typeof VALID_TYPES)[number];

function isValidType(value: string | null): value is UnsubscribeType {
  return VALID_TYPES.includes(value as UnsubscribeType);
}

async function unsubscribe(token: string, type: UnsubscribeType) {
  if (!db) return { ok: false as const, status: 503, error: 'Service unavailable.' };

  const preference = await db
    .select({ id: emailPreferences.id })
    .from(emailPreferences)
    .where(eq(emailPreferences.unsubscribeToken, token))
    .limit(1)
    .then((rows) => rows[0]);

  if (!preference) return { ok: false as const, status: 404, error: 'Token not found.' };

  const updates: Partial<typeof emailPreferences.$inferInsert> = { lastUpdatedAt: new Date() };
  if (type === 'all') {
    updates.newsletterSubscribed = false;
    updates.blogDigestSubscribed = false;
    updates.productUpdatesSubscribed = false;
    updates.adminDigestSubscribed = false;
  } else if (type === 'newsletter') {
    updates.newsletterSubscribed = false;
  } else if (type === 'blog_digest') {
    updates.blogDigestSubscribed = false;
  } else {
    updates.productUpdatesSubscribed = false;
  }

  await db.update(emailPreferences).set(updates).where(eq(emailPreferences.id, preference.id));
  return { ok: true as const };
}

function readRequest(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const type = request.nextUrl.searchParams.get('type') ?? 'all';
  if (!token) return { error: 'Token is required.', status: 400 as const };
  if (!isValidType(type)) return { error: 'Invalid subscription type.', status: 400 as const };
  return { token, type };
}

export async function GET(request: NextRequest) {
  const input = readRequest(request);
  if ('error' in input) return NextResponse.json({ error: input.error }, { status: input.status });

  const result = await unsubscribe(input.token, input.type);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  const redirectUrl = new URL('/email-preferences', getBaseUrl());
  redirectUrl.searchParams.set('success', 'true');
  redirectUrl.searchParams.set('token', input.token);
  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}

export async function POST(request: NextRequest) {
  const input = readRequest(request);
  if ('error' in input) return NextResponse.json({ error: input.error }, { status: input.status });

  const result = await unsubscribe(input.token, input.type);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: result.status });

  return NextResponse.json({ ok: true });
}
