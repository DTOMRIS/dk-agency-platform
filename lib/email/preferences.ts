import { randomBytes } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { db, dbAvailable } from '@/lib/db';
import { emailPreferences } from '@/lib/db/schema';

type PreferenceSource = 'registration' | 'homepage_newsletter' | 'blog_newsletter';

interface SaveEmailPreferencesInput {
  email: string;
  source: PreferenceSource;
  userId?: number;
  newsletterSubscribed: boolean;
  blogDigestSubscribed: boolean;
  productUpdatesSubscribed: boolean;
}

export async function saveEmailPreferences(input: SaveEmailPreferencesInput) {
  if (!dbAvailable || !db) throw new Error('Database is not available');

  const email = input.email.trim().toLowerCase();
  const existing = await db
    .select({
      id: emailPreferences.id,
      unsubscribeToken: emailPreferences.unsubscribeToken,
      newsletterSubscribed: emailPreferences.newsletterSubscribed,
      blogDigestSubscribed: emailPreferences.blogDigestSubscribed,
      productUpdatesSubscribed: emailPreferences.productUpdatesSubscribed,
      adminDigestSubscribed: emailPreferences.adminDigestSubscribed,
      consentGivenAt: emailPreferences.consentGivenAt,
    })
    .from(emailPreferences)
    .where(eq(emailPreferences.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  const unsubscribeToken = existing?.unsubscribeToken || randomBytes(32).toString('hex');
  const registrationWithoutMarketing = input.source === 'registration' && !input.newsletterSubscribed;
  const newsletterSubscribed = registrationWithoutMarketing
    ? existing?.newsletterSubscribed ?? false
    : input.newsletterSubscribed;
  const blogDigestSubscribed = registrationWithoutMarketing
    ? existing?.blogDigestSubscribed ?? false
    : input.blogDigestSubscribed;
  const productUpdatesSubscribed = input.source === 'registration'
    ? registrationWithoutMarketing
      ? existing?.productUpdatesSubscribed ?? false
      : input.productUpdatesSubscribed
    : existing?.productUpdatesSubscribed ?? false;
  const hasConsent = newsletterSubscribed || blogDigestSubscribed || productUpdatesSubscribed;
  const values = {
    userId: input.userId,
    email,
    newsletterSubscribed,
    blogDigestSubscribed,
    productUpdatesSubscribed,
    adminDigestSubscribed: existing?.adminDigestSubscribed ?? false,
    consentGivenAt: hasConsent ? existing?.consentGivenAt || new Date() : null,
    consentSource: input.source,
    unsubscribeToken,
    lastUpdatedAt: new Date(),
  };

  if (existing) {
    await db.update(emailPreferences).set(values).where(eq(emailPreferences.id, existing.id));
  } else {
    await db.insert(emailPreferences).values(values);
  }

  return { unsubscribeToken };
}
