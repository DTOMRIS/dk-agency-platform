import { and, desc, eq, gte, isNull, lte, or, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { ads } from '@/lib/db/schema';

export const AD_FORMATS = ['image', 'gif', 'video'] as const;
export type AdFormat = (typeof AD_FORMATS)[number];

// Slots where a banner can render. Extend as placements are added to pages.
export const AD_PLACEMENTS = [
  'home-mid',
  'news-sidebar',
  'news-inline',
  'blog-sidebar',
  'blog-inline',
] as const;
export type AdPlacement = (typeof AD_PLACEMENTS)[number];

export interface AdInput {
  title: string;
  format: AdFormat;
  mediaUrl: string;
  targetUrl: string;
  placement: string;
  altText?: string | null;
  advertiser?: string | null;
  isActive?: boolean;
  startsAt?: string | null;
  endsAt?: string | null;
}

export async function listAds() {
  if (!dbAvailable || !db) return [];
  try {
    return await db.select().from(ads).orderBy(desc(ads.createdAt));
  } catch {
    // Table may not exist yet (migration not run) — degrade to empty.
    return [];
  }
}

export async function getAdById(id: number) {
  if (!dbAvailable || !db) return null;
  try {
    const rows = await db.select().from(ads).where(eq(ads.id, id)).limit(1);
    return rows[0] || null;
  } catch {
    return null;
  }
}

// Public: active ads for a placement whose schedule window includes now.
// Must NEVER throw — a missing/empty ads table must not break a public page.
export async function getActiveAdsByPlacement(placement: string) {
  if (!dbAvailable || !db) return [];
  const now = new Date();
  try {
    return await db
      .select({
        id: ads.id,
        format: ads.format,
        mediaUrl: ads.mediaUrl,
        targetUrl: ads.targetUrl,
        altText: ads.altText,
        placement: ads.placement,
      })
      .from(ads)
      .where(
        and(
          eq(ads.placement, placement),
          eq(ads.isActive, true),
          or(isNull(ads.startsAt), lte(ads.startsAt, now)),
          or(isNull(ads.endsAt), gte(ads.endsAt, now))
        )
      )
      .orderBy(sql`random()`);
  } catch {
    return [];
  }
}

function toDate(value?: string | null): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createAd(input: AdInput) {
  if (!dbAvailable || !db) throw new Error('DB unavailable — cannot create ad');
  const [row] = await db
    .insert(ads)
    .values({
      title: input.title.trim(),
      format: input.format,
      mediaUrl: input.mediaUrl.trim(),
      targetUrl: input.targetUrl.trim(),
      placement: input.placement,
      altText: input.altText?.trim() || null,
      advertiser: input.advertiser?.trim() || null,
      isActive: input.isActive ?? false,
      startsAt: toDate(input.startsAt),
      endsAt: toDate(input.endsAt),
    })
    .returning({ id: ads.id });
  return row;
}

export async function updateAd(id: number, input: Partial<AdInput>) {
  if (!dbAvailable || !db) return { success: true, source: 'mock' as const };

  const setData: Record<string, unknown> = { updatedAt: new Date() };
  if (input.title !== undefined) setData.title = input.title.trim();
  if (input.format !== undefined) setData.format = input.format;
  if (input.mediaUrl !== undefined) setData.mediaUrl = input.mediaUrl.trim();
  if (input.targetUrl !== undefined) setData.targetUrl = input.targetUrl.trim();
  if (input.placement !== undefined) setData.placement = input.placement;
  if (input.altText !== undefined) setData.altText = input.altText?.trim() || null;
  if (input.advertiser !== undefined) setData.advertiser = input.advertiser?.trim() || null;
  if (input.isActive !== undefined) setData.isActive = input.isActive;
  if (input.startsAt !== undefined) setData.startsAt = toDate(input.startsAt);
  if (input.endsAt !== undefined) setData.endsAt = toDate(input.endsAt);

  await db.update(ads).set(setData).where(eq(ads.id, id));
  return { success: true, source: 'db' as const };
}

export async function deleteAd(id: number) {
  if (!dbAvailable || !db) return { success: true, source: 'mock' as const };
  await db.delete(ads).where(eq(ads.id, id));
  return { success: true, source: 'db' as const };
}

export async function incrementAdImpression(id: number) {
  if (!dbAvailable || !db) return;
  try {
    await db
      .update(ads)
      .set({ impressions: sql`${ads.impressions} + 1` })
      .where(eq(ads.id, id));
  } catch {
    // tracking is best-effort — never surface to the caller
  }
}

export async function incrementAdClick(id: number) {
  if (!dbAvailable || !db) return;
  try {
    await db
      .update(ads)
      .set({ clicks: sql`${ads.clicks} + 1` })
      .where(eq(ads.id, id));
  } catch {
    // tracking is best-effort
  }
}
