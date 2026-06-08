import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { emailPreferences } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { getBaseUrl } from '@/lib/utils/get-base-url';

const VALID_TYPES = ['all', 'newsletter', 'blog_digest', 'product_updates'] as const;
type UnsubscribeType = (typeof VALID_TYPES)[number];

function isValidType(value: string | null): value is UnsubscribeType {
  return VALID_TYPES.includes(value as UnsubscribeType);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get('token');
  const typeParam = searchParams.get('type') ?? 'all';

  if (!token) {
    return NextResponse.json({ error: 'Token tələb olunur.' }, { status: 400 });
  }

  if (!isValidType(typeParam)) {
    return NextResponse.json({ error: 'Yanlış abunəlik növü.' }, { status: 400 });
  }

  if (!db) {
    return NextResponse.json({ error: 'Xidmət müvəqqəti əlçatmazdır.' }, { status: 503 });
  }

  const rows = await db
    .select()
    .from(emailPreferences)
    .where(eq(emailPreferences.unsubscribeToken, token))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: 'Token tapılmadı.' }, { status: 404 });
  }

  const updates: Partial<typeof emailPreferences.$inferInsert> = {
    lastUpdatedAt: new Date(),
  };

  if (typeParam === 'all') {
    updates.newsletterSubscribed = false;
    updates.blogDigestSubscribed = false;
    updates.productUpdatesSubscribed = false;
    updates.adminDigestSubscribed = false;
  } else if (typeParam === 'newsletter') {
    updates.newsletterSubscribed = false;
  } else if (typeParam === 'blog_digest') {
    updates.blogDigestSubscribed = false;
  } else if (typeParam === 'product_updates') {
    updates.productUpdatesSubscribed = false;
  }

  await db
    .update(emailPreferences)
    .set(updates)
    .where(eq(emailPreferences.unsubscribeToken, token));

  const base = getBaseUrl();
  const redirectUrl = new URL('/email-preferences', base);
  redirectUrl.searchParams.set('success', 'true');
  redirectUrl.searchParams.set('token', token);

  return NextResponse.redirect(redirectUrl.toString(), { status: 302 });
}
