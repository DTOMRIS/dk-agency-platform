import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

type PreferencesUpdateBody = {
  token: unknown;
  newsletter: unknown;
  blogDigest: unknown;
  productUpdates: unknown;
};

function isBooleanOrUndefined(value: unknown): value is boolean | undefined {
  return value === undefined || typeof value === 'boolean';
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');

  if (!token) {
    return NextResponse.json({ error: 'Token tələb olunur.' }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Xidmət müvəqqəti əlçatmazdır.' }, { status: 503 });
  }

  const rows = await db
    .select({
      email: emailPreferences.email,
      newsletterSubscribed: emailPreferences.newsletterSubscribed,
      blogDigestSubscribed: emailPreferences.blogDigestSubscribed,
      productUpdatesSubscribed: emailPreferences.productUpdatesSubscribed,
      lastUpdatedAt: emailPreferences.lastUpdatedAt,
    })
    .from(emailPreferences)
    .where(eq(emailPreferences.unsubscribeToken, token))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Token tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, preferences: rows[0] });
}

export async function POST(request: NextRequest) {
  let body: PreferencesUpdateBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Yanlış JSON formatı.' }, { status: 400 });
  }

  const { token, newsletter, blogDigest, productUpdates } = body;

  if (typeof token !== 'string' || !token) {
    return NextResponse.json({ error: 'Token tələb olunur.' }, { status: 400 });
  }

  if (
    !isBooleanOrUndefined(newsletter) ||
    !isBooleanOrUndefined(blogDigest) ||
    !isBooleanOrUndefined(productUpdates)
  ) {
    return NextResponse.json(
      { error: 'Abunəlik dəyərləri boolean olmalıdır.' },
      { status: 400 },
    );
  }

  if (!db) {
    return NextResponse.json({ error: 'Xidmət müvəqqəti əlçatmazdır.' }, { status: 503 });
  }

  const rows = await db
    .select({ id: emailPreferences.id })
    .from(emailPreferences)
    .where(eq(emailPreferences.unsubscribeToken, token))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Token tapılmadı.' }, { status: 404 });
  }

  const updates: Partial<typeof emailPreferences.$inferInsert> = {
    lastUpdatedAt: new Date(),
  };

  if (typeof newsletter === 'boolean') updates.newsletterSubscribed = newsletter;
  if (typeof blogDigest === 'boolean') updates.blogDigestSubscribed = blogDigest;
  if (typeof productUpdates === 'boolean') updates.productUpdatesSubscribed = productUpdates;

  await db
    .update(emailPreferences)
    .set(updates)
    .where(eq(emailPreferences.unsubscribeToken, token));

  return NextResponse.json({ ok: true, message: 'Tərcihlər yeniləndi.' });
}
