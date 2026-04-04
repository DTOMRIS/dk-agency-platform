import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import { db, dbAvailable } from '@/lib/db';
import { listingLeads, listingMedia, listingReviews, listings } from '@/lib/db/schema';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

export interface AdminListingFilters {
  status?: string | null;
  query?: string | null;
  limit?: number;
  offset?: number;
}

export interface ListingReviewInput {
  reviewerId?: number | null;
  score?: number | null;
  notes?: string | null;
  decision?: 'approve' | 'conditional' | 'reject' | null;
}

function mapDbListing(
  row: typeof listings.$inferSelect,
  media: typeof listingMedia.$inferSelect[],
  leads: typeof listingLeads.$inferSelect[],
  reviews: typeof listingReviews.$inferSelect[],
): MockListing {
  return {
    id: row.id,
    slug: row.slug || row.trackingCode.toLowerCase(),
    trackingCode: row.trackingCode,
    type: row.type,
    status: row.status,
    title: row.title,
    description: row.description,
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
        alt: `${row.title} - sekil ${index + 1}`,
      })),
    isShowcase: row.isShowcase,
    isFeatured: row.isFeatured,
    typeSpecificData: (row.typeSpecificData as Record<string, string | number | boolean>) || {},
    reviewNotes: reviews
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map((item) => ({
        reviewer: item.reviewerId ? `Reviewer #${item.reviewerId}` : 'Admin',
        note: item.notes || 'Qeyd elave edilmeyib.',
        score: item.score || 0,
        createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
      })),
    leads: leads
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .map((item) => ({
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

async function hydrateListings(rows: Array<typeof listings.$inferSelect>) {
  if (!rows.length || !db) return [];

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
    ),
  );
}

export async function getAdminListings(filters: AdminListingFilters = {}) {
  if (!dbAvailable || !db) {
    const query = filters.query?.trim().toLowerCase();
    const filtered = MOCK_LISTINGS.filter((item) => {
      const matchesStatus = !filters.status || filters.status === 'all' ? true : item.status === filters.status;
      const matchesQuery =
        !query ||
        item.title.toLowerCase().includes(query) ||
        item.trackingCode.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

    const offset = filters.offset || 0;
    const limit = filters.limit || 20;
    return {
      items: filtered.slice(offset, offset + limit),
      total: filtered.length,
      source: 'mock' as const,
    };
  }

  const conditions = [];
  if (filters.status && filters.status !== 'all') {
    conditions.push(eq(listings.status, filters.status as typeof listings.$inferSelect.status));
  }
  if (filters.query?.trim()) {
    const query = `%${filters.query.trim()}%`;
    conditions.push(or(ilike(listings.title, query), ilike(listings.trackingCode, query))!);
  }

  const where = conditions.length ? and(...conditions) : undefined;
  const limit = filters.limit || 20;
  const offset = filters.offset || 0;

  const [rows, countResult] = await Promise.all([
    db.select().from(listings).where(where).orderBy(desc(listings.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(listings).where(where),
  ]);

  return {
    items: await hydrateListings(rows),
    total: countResult[0]?.count || 0,
    source: 'db' as const,
  };
}

export async function getListingDetail(id: number) {
  if (!dbAvailable || !db) {
    return MOCK_LISTINGS.find((item) => item.id === id) || null;
  }

  const row = await db.select().from(listings).where(eq(listings.id, id)).then((items) => items[0]);
  if (!row) return null;
  const [item] = await hydrateListings([row]);
  return item || null;
}

export async function updateListingStatus(
  id: number,
  input: {
    status: ListingWorkflowStatus;
    isShowcase?: boolean;
    isFeatured?: boolean;
  },
) {
  if (!dbAvailable || !db) {
    return { success: true, source: 'mock' as const };
  }

  await db
    .update(listings)
    .set({
      status: input.status,
      isShowcase: input.isShowcase ?? false,
      isFeatured: input.isFeatured ?? false,
      updatedAt: new Date(),
      publishedAt: input.status === 'showcase_ready' ? new Date() : null,
    })
    .where(eq(listings.id, id));

  return { success: true, source: 'db' as const };
}

export async function createListingReview(listingId: number, input: ListingReviewInput) {
  if (!dbAvailable || !db) {
    return {
      reviewer: input.reviewerId ? `Reviewer #${input.reviewerId}` : 'Admin',
      note: input.notes || 'Qeyd elave edilmeyib.',
      score: input.score || 0,
      createdAt: new Date().toISOString(),
      source: 'mock' as const,
    };
  }

  const inserted = await db
    .insert(listingReviews)
    .values({
      listingId,
      reviewerId: input.reviewerId ?? null,
      score: input.score ?? null,
      notes: input.notes ?? null,
      decision: input.decision ?? null,
    })
    .returning();

  const review = inserted[0];
  return {
    reviewer: review.reviewerId ? `Reviewer #${review.reviewerId}` : 'Admin',
    note: review.notes || 'Qeyd elave edilmeyib.',
    score: review.score || 0,
    createdAt: review.createdAt?.toISOString() || new Date().toISOString(),
    source: 'db' as const,
  };
}

export async function getListingLeadsByListingId(listingId: number) {
  if (!dbAvailable || !db) {
    return MOCK_LISTINGS.find((item) => item.id === listingId)?.leads || [];
  }

  const rows = await db
    .select()
    .from(listingLeads)
    .where(eq(listingLeads.listingId, listingId))
    .orderBy(desc(listingLeads.createdAt));

  return rows.map((item) => ({
    id: item.id,
    name: item.name,
    phone: item.phone || '',
    email: item.email || '',
    message: item.message || '',
    status: item.status,
    createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
  }));
}

export async function getDashboardListingMetrics() {
  if (!dbAvailable || !db) {
    const startOfWeek = new Date();
    startOfWeek.setDate(startOfWeek.getDate() - 7);

    return {
      total: MOCK_LISTINGS.length,
      active: MOCK_LISTINGS.filter((item) => item.status === 'showcase_ready').length,
      pending: MOCK_LISTINGS.filter((item) =>
        ['submitted', 'ai_checked', 'committee_review'].includes(item.status),
      ).length,
      rejected: MOCK_LISTINGS.filter((item) => item.status === 'rejected').length,
      weeklyLeads: MOCK_LISTINGS.flatMap((item) => item.leads).filter(
        (lead) => new Date(lead.createdAt) >= startOfWeek,
      ).length,
      latestListings: MOCK_LISTINGS.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
      latestLeads: MOCK_LISTINGS.flatMap((listing) =>
        listing.leads.map((lead) => ({ ...lead, trackingCode: listing.trackingCode, title: listing.title })),
      )
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, 5),
      source: 'mock' as const,
    };
  }

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  const [metricsRows, weeklyLeadCount, latestRows, latestLeadRows] = await Promise.all([
    db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`count(*) filter (where ${listings.status} = 'showcase_ready')::int`,
        pending: sql<number>`count(*) filter (where ${listings.status} in ('submitted','ai_checked','committee_review'))::int`,
        rejected: sql<number>`count(*) filter (where ${listings.status} = 'rejected')::int`,
      })
      .from(listings),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(listingLeads)
      .where(gte(listingLeads.createdAt, startOfWeek)),
    db.select().from(listings).orderBy(desc(listings.createdAt)).limit(5),
    db
      .select({
        id: listingLeads.id,
        name: listingLeads.name,
        phone: listingLeads.phone,
        email: listingLeads.email,
        message: listingLeads.message,
        status: listingLeads.status,
        createdAt: listingLeads.createdAt,
        trackingCode: listings.trackingCode,
        title: listings.title,
      })
      .from(listingLeads)
      .innerJoin(listings, eq(listings.id, listingLeads.listingId))
      .orderBy(desc(listingLeads.createdAt))
      .limit(5),
  ]);

  return {
    total: metricsRows[0]?.total || 0,
    active: metricsRows[0]?.active || 0,
    pending: metricsRows[0]?.pending || 0,
    rejected: metricsRows[0]?.rejected || 0,
    weeklyLeads: weeklyLeadCount[0]?.count || 0,
    latestListings: await hydrateListings(latestRows),
    latestLeads: latestLeadRows.map((item) => ({
      name: item.name,
      phone: item.phone || '',
      email: item.email || '',
      message: item.message || '',
      status: item.status,
      createdAt: item.createdAt?.toISOString() || new Date().toISOString(),
      trackingCode: item.trackingCode,
      title: item.title,
    })),
    source: 'db' as const,
  };
}
