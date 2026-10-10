import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { emailPreferences, users } from '@/lib/db/schema';
import { requireApiMember } from '@/lib/api/guards';

/**
 * GET/POST /api/member/email-preferences — the signed-in member's own e-mail subscriptions.
 * TASK-0528: the B2B settings toggles were saved nowhere (0.6 s wait, then «saxlanıldı»). The existing
 * /api/email/preferences only works with the unsubscribe-link token; this is the session-based twin
 * over the same email_preferences row. Transactional mail (account security, listing leads) is not
 * optional and has no switch here.
 */
type Prefs = { newsletter: boolean; blogDigest: boolean; productUpdates: boolean };

export async function GET() {
  const guard = await requireApiMember();
  if (!guard.ok) return guard.response;
  if (!db) return NextResponse.json({ error: 'Xidmət müvəqqəti əlçatmazdır.' }, { status: 503 });

  const email = guard.session.email.trim().toLowerCase();
  const row = await db
    .select({
      newsletter: emailPreferences.newsletterSubscribed,
      blogDigest: emailPreferences.blogDigestSubscribed,
      productUpdates: emailPreferences.productUpdatesSubscribed,
    })
    .from(emailPreferences)
    .where(eq(emailPreferences.email, email))
    .then((rows) => rows[0]);

  // No row = never subscribed: nothing is sent, so show everything off.
  const prefs: Prefs = row ?? { newsletter: false, blogDigest: false, productUpdates: false };
  return NextResponse.json({ ok: true, preferences: prefs });
}

export async function POST(request: NextRequest) {
  const guard = await requireApiMember();
  if (!guard.ok) return guard.response;
  if (!db) return NextResponse.json({ error: 'Xidmət müvəqqəti əlçatmazdır.' }, { status: 503 });

  const body = (await request.json().catch(() => null)) as Partial<Prefs> | null;
  if (!body || ['newsletter', 'blogDigest', 'productUpdates'].some((k) => typeof body[k as keyof Prefs] !== 'boolean')) {
    return NextResponse.json({ error: 'Abunəlik dəyərləri boolean olmalıdır.' }, { status: 400 });
  }

  const email = guard.session.email.trim().toLowerCase();
  const user = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).then((rows) => rows[0]);
  const now = new Date();

  await db
    .insert(emailPreferences)
    .values({
      email,
      userId: user?.id ?? null,
      newsletterSubscribed: body.newsletter!,
      blogDigestSubscribed: body.blogDigest!,
      productUpdatesSubscribed: body.productUpdates!,
      consentSource: 'b2b_settings',
      consentGivenAt: now,
      unsubscribeToken: randomBytes(24).toString('hex'),
      lastUpdatedAt: now,
    })
    .onConflictDoUpdate({
      target: emailPreferences.email,
      set: {
        newsletterSubscribed: body.newsletter!,
        blogDigestSubscribed: body.blogDigest!,
        productUpdatesSubscribed: body.productUpdates!,
        lastUpdatedAt: now,
      },
    });

  return NextResponse.json({ ok: true });
}
