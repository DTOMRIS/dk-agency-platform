import { and, asc, eq, gte, inArray, lte } from 'drizzle-orm';
import { db } from './index';
import { listingLeads, listingMedia, listingReviews, listings } from './schema';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { type ContentLocale, localizedField, sanitizeLocale } from '@/lib/utils/locale-fields';

export interface ListingFilters {
  type?: string | null;
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
  if (!db) return MOCK_LISTINGS;

  const conditions = [];
  if (filters.type) conditions.push(eq(listings.type, filters.type as typeof listings.$inferSelect.type));
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

export async function getListingById(id: number, locale?: string) {
  const loc = sanitizeLocale(locale);
  if (!db) return MOCK_LISTINGS.find((item) => item.id === id) || null;

  const row = await db.select().from(listings).where(eq(listings.id, id)).then((items) => items[0]);
  if (!row) return null;

  const [mediaRows, leadRows, reviewRows] = await Promise.all([
    db.select().from(listingMedia).where(eq(listingMedia.listingId, id)),
    db.select().from(listingLeads).where(eq(listingLeads.listingId, id)),
    db.select().from(listingReviews).where(eq(listingReviews.listingId, id)),
  ]);

  return mapDbListing(row, mediaRows, leadRows, reviewRows, loc);
}
