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
    })
    .from(emailPreferences)
    .where(eq(emailPreferences.email, email))
    .limit(1)
    .then((rows) => rows[0]);

  const unsubscribeToken = existing?.unsubscribeToken || randomBytes(32).toString('hex');
  const values = {
    userId: input.userId,
    email,
    newsletterSubscribed: input.newsletterSubscribed,
    blogDigestSubscribed: input.blogDigestSubscribed,
    productUpdatesSubscribed: input.productUpdatesSubscribed,
    adminDigestSubscribed: false,
    consentGivenAt: new Date(),
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
