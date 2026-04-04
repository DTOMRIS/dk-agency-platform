import { eq } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { siteSettings } from '@/lib/db/schema';

export interface SiteSettingsPayload {
  siteName: string;
  slogan: string;
  logoUrl: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialYoutube: string;
  seoTitle: string;
  seoDescription: string;
}

const DEFAULT_SETTINGS: SiteSettingsPayload = {
  siteName: 'DK Agency',
  slogan: 'Ustaligin Nisani, Dijitalin Seddi',
  logoUrl: '',
  socialFacebook: '',
  socialInstagram: '',
  socialLinkedin: '',
  socialYoutube: '',
  seoTitle: 'DK Agency | Azerbaycanin ilk AI-destekli HoReCa platformasi',
  seoDescription: 'HoReCa, B2B marketplace, toolkit ve AI destekli emeliyyat platformasi.',
};

const SETTINGS_KEYS = {
  siteName: 'site.name',
  slogan: 'site.slogan',
  logoUrl: 'site.logo_url',
  socialFacebook: 'social.facebook',
  socialInstagram: 'social.instagram',
  socialLinkedin: 'social.linkedin',
  socialYoutube: 'social.youtube',
  seoTitle: 'seo.title',
  seoDescription: 'seo.description',
} as const;

export async function getSiteSettingsRecord() {
  if (!dbAvailable || !db) {
    return { ...DEFAULT_SETTINGS, source: 'mock' as const };
  }

  const rows = await db.select().from(siteSettings);
  const lookup = Object.fromEntries(rows.map((item) => [item.key, item.value_az || '']));

  return {
    siteName: lookup[SETTINGS_KEYS.siteName] || DEFAULT_SETTINGS.siteName,
    slogan: lookup[SETTINGS_KEYS.slogan] || DEFAULT_SETTINGS.slogan,
    logoUrl: lookup[SETTINGS_KEYS.logoUrl] || DEFAULT_SETTINGS.logoUrl,
    socialFacebook: lookup[SETTINGS_KEYS.socialFacebook] || DEFAULT_SETTINGS.socialFacebook,
    socialInstagram: lookup[SETTINGS_KEYS.socialInstagram] || DEFAULT_SETTINGS.socialInstagram,
    socialLinkedin: lookup[SETTINGS_KEYS.socialLinkedin] || DEFAULT_SETTINGS.socialLinkedin,
    socialYoutube: lookup[SETTINGS_KEYS.socialYoutube] || DEFAULT_SETTINGS.socialYoutube,
    seoTitle: lookup[SETTINGS_KEYS.seoTitle] || DEFAULT_SETTINGS.seoTitle,
    seoDescription: lookup[SETTINGS_KEYS.seoDescription] || DEFAULT_SETTINGS.seoDescription,
    source: 'db' as const,
  };
}

export async function updateSiteSettingsRecord(input: SiteSettingsPayload) {
  if (!dbAvailable || !db) {
    return { ...input, source: 'mock' as const };
  }

  const updates = Object.entries(SETTINGS_KEYS).map(([field, key]) => ({
    key,
    value: input[field as keyof SiteSettingsPayload] || '',
  }));

  for (const item of updates) {
    const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, item.key)).then((rows) => rows[0]);
    if (existing) {
      await db
        .update(siteSettings)
        .set({
          value_az: item.value,
          updatedAt: new Date(),
        })
        .where(eq(siteSettings.key, item.key));
    } else {
      await db.insert(siteSettings).values({
        key: item.key,
        value_az: item.value,
        updatedAt: new Date(),
      });
    }
  }

  return { ...input, source: 'db' as const };
}
