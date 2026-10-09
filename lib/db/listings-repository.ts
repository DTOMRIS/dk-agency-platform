import { and, asc, desc, eq, gte, inArray, isNull, lte } from 'drizzle-orm';
import { db } from './index';
import { listingLeads, listingMedia, listingReviews, listings } from './schema';
import { type MockListing } from '@/lib/data/mockListings';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';

export interface ListingFilters {
  type?: string | null;
  sector?: string | null;
  city?: string | null;
  status?: string | null;
  showcase?: boolean;
  minPrice?: number | null;
  maxPrice?: number | null;
}

function normalizePhone(phone: string) {
  return phone.startsWith('+') ? phone : `+${phone}`;
}

function mapDbListing(row: typeof listings.$inferSelect, media: typeof listingMedia.$inferSelect[], leads: typeof listingLeads.$inferSelect[], reviews: typeof listingReviews.$inferSelect[], locale: ContentLocale = 'az'): MockListing {
  const r = row as unknown as Record<string, unknown>;
  const title = localizedField(r, 'title', locale) || row.title;
  const description = localizedField(r, 'description', locale) || row.description;

  return {
    id: row.id,
    slug: row.slug || row.trackingCode.toLowerCase(),
    trackingCode: row.trackingCode,
    type: row.type,
    sector: row.sector || null,
    status: row.status,
    title,
    description,
    price: row.price ?? 0,
    currency: (row.currency as 'AZN') || 'AZN',
    city: row.city,
    district: row.district || undefined,
    ownerName: row.ownerName,
    phone: row.phone,
    email: row.email,
    images: media
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => ({
        id: `${row.id}-${item.id}`,
        url: item.url,
        alt: `${row.title} - şəkil ${index + 1}`,
      })),
    isShowcase: row.isShowcase,
    isFeatured: row.isFeatured,
    typeSpecificData: (row.typeSpecificData as Record<string, string | number | boolean>) || {},
    reviewNotes: reviews.map((item) => ({
      reviewer: item.reviewerId ? `Reviewer #${item.reviewerId}` : 'Admin',
      note: item.notes || 'Qeyd əlavə edilməyib.',
      score: item.score || 0,
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
    })),
    leads: leads.map((item) => ({
      name: item.name,
      phone: item.phone || '',
      email: item.email || '',
      message: item.message || '',
      status: item.status === 'converted' ? 'contacted' : (item.status as 'new' | 'contacted'),
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
    })),
    createdAt: row.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: row.updatedAt?.toISOString() || new Date().toISOString(),
  };
}

export async function getListings(filters: ListingFilters = {}, locale?: string) {
  const loc = sanitizeLocale(locale);
  if (!db) return [];

  const conditions = [];
  if (filters.type) conditions.push(eq(listings.type, filters.type as typeof listings.$inferSelect.type));
  if (filters.sector) conditions.push(eq(listings.sector, filters.sector));
  if (filters.city) conditions.push(eq(listings.city, filters.city));
  if (filters.status) conditions.push(eq(listings.status, filters.status as typeof listings.$inferSelect.status));
  if (filters.showcase === true) conditions.push(eq(listings.isShowcase, true));
  if (typeof filters.minPrice === 'number') conditions.push(gte(listings.price, filters.minPrice));
  if (typeof filters.maxPrice === 'number') conditions.push(lte(listings.price, filters.maxPrice));

  const rows = await db
    .select()
    .from(listings)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(asc(listings.createdAt));

  if (!rows.length) return [];

  const ids = rows.map((item) => item.id);
  const [mediaRows, leadRows, reviewRows] = await Promise.all([
    db.select().from(listingMedia).where(inArray(listingMedia.listingId, ids)),
    db.select().from(listingLeads).where(inArray(listingLeads.listingId, ids)),
    db.select().from(listingReviews).where(inArray(listingReviews.listingId, ids)),
  ]);

  return rows.map((row) =>
    mapDbListing(
      row,
      mediaRows.filter((item) => item.listingId === row.id),
      leadRows.filter((item) => item.listingId === row.id),
      reviewRows.filter((item) => item.listingId === row.id),
      loc,
    ),
  );
}

export async function getListingBySlug(slug: string, locale?: string) {
  const loc = sanitizeLocale(locale);
  if (!db) return null;

  const row = await db.select().from(listings).where(eq(listings.slug, slug)).then((items) => items[0]);
  if (!row) return null;

  const [mediaRows, leadRows, reviewRows] = await Promise.all([
    db.select().from(listingMedia).where(eq(listingMedia.listingId, row.id)),
    db.select().from(listingLeads).where(eq(listingLeads.listingId, row.id)),
    db.select().from(listingReviews).where(eq(listingReviews.listingId, row.id)),
  ]);

  return mapDbListing(row, mediaRows, leadRows, reviewRows, loc);
}

export async function getListingById(id: number, locale?: string) {
  const loc = sanitizeLocale(locale);
  if (!db) return null;

  const row = await db.select().from(listings).where(eq(listings.id, id)).then((items) => items[0]);
  if (!row) return null;

  const [mediaRows, leadRows, reviewRows] = await Promise.all([
    db.select().from(listingMedia).where(eq(listingMedia.listingId, id)),
    db.select().from(listingLeads).where(eq(listingLeads.listingId, id)),
    db.select().from(listingReviews).where(eq(listingReviews.listingId, id)),
  ]);

  return mapDbListing(row, mediaRows, leadRows, reviewRows, loc);
}

export interface LatestListingCard {
  id: number;
  slug: string;
  type: string;
  title: string;
  city: string;
  price: number | null;
  priceLabel: string | null;
  currency: string;
}

/**
 * TASK-0515 — «Son İlanlar» box on /haberler/[slug]: the newest PUBLIC listings only
 * (status `showcase_ready`, same default as GET /api/listings, not deleted/expired). Selects just
 * the card fields — no contact data, leads or reviews. Empty array when the DB is unavailable.
 */
export async function getLatestShowcaseListings(limit = 3, locale?: string): Promise<LatestListingCard[]> {
  const loc = sanitizeLocale(locale);
  if (!db) return [];

  const rows = await db
    .select({
      id: listings.id,
      slug: listings.slug,
      trackingCode: listings.trackingCode,
      type: listings.type,
      title: listings.title,
      titleAz: listings.titleAz,
      titleRu: listings.titleRu,
      titleEn: listings.titleEn,
      titleTr: listings.titleTr,
      city: listings.city,
      price: listings.price,
      priceLabel: listings.priceLabel,
      currency: listings.currency,
    })
    .from(listings)
    .where(and(eq(listings.status, 'showcase_ready'), isNull(listings.deletedAt)))
    .orderBy(desc(listings.publishedAt), desc(listings.createdAt))
    .limit(limit);

  const pick: Record<ContentLocale, (r: (typeof rows)[number]) => string | null> = {
    az: (r) => r.titleAz,
    ru: (r) => r.titleRu,
    en: (r) => r.titleEn,
    tr: (r) => r.titleTr,
  };

  return rows.map((r) => ({
    id: r.id,
    slug: r.slug || r.trackingCode.toLowerCase(),
    type: r.type,
    title: (pick[loc](r) || r.titleAz || r.title).trim(),
    city: r.city,
    price: r.price,
    priceLabel: r.priceLabel,
    currency: r.currency,
  }));
}
