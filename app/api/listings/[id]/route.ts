import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listings, listingMedia } from '@/lib/db/schema';
import { getListingDetail } from '@/lib/repositories/listingRepository';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await getListingDetail(Number(id));

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: listing });
}

/** Statuses where the owner is allowed to edit their listing */
const OWNER_EDITABLE_STATUSES: ListingWorkflowStatus[] = ['submitted', 'docs_requested'];

/** Fields the owner may update (whitelist) */
const ALLOWED_FIELDS = [
  'description',
  'price',
  'priceLabel',
  'currency',
  'city',
  'district',
  'phone',
  'email',
  'contactName',
  'contactPhone',
  'contactEmail',
  'typeSpecificData',
  'equipment',
] as const;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  // Auth — JWT owner check
  const auth = await getAuthFromCookie();
  if (!auth) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: false, error: 'Verilənlər bazası əlçatmazdır.' }, { status: 503 });
  }

  const { id } = await params;
  const listingId = Number(id);

  // Fetch current listing
  const [row] = await db
    .select({ ownerId: listings.ownerId, status: listings.status })
    .from(listings)
    .where(eq(listings.id, listingId));

  if (!row) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  // Ownership check
  if (row.ownerId !== auth.userId) {
    return NextResponse.json({ success: false, error: 'Bu elana düzəliş etmək hüququnuz yoxdur.' }, { status: 403 });
  }

  // Status guard
  if (!OWNER_EDITABLE_STATUSES.includes(row.status as ListingWorkflowStatus)) {
    return NextResponse.json(
      { success: false, error: `"${row.status}" statusunda olan elanı redaktə etmək mümkün deyil.` },
      { status: 409 },
    );
  }

  const body = await request.json();

  // Build update payload from whitelist
  const update: Record<string, unknown> = { updatedAt: new Date() };
  for (const key of ALLOWED_FIELDS) {
    if (key in body) {
      update[key] = body[key];
    }
  }

  await db.update(listings).set(update).where(eq(listings.id, listingId));

  // Handle images update if provided
  if (Array.isArray(body.images)) {
    // Remove old media and re-insert (simple strategy for MVP)
    await db.delete(listingMedia).where(eq(listingMedia.listingId, listingId));
    for (const [index, image] of body.images.entries()) {
      await db.insert(listingMedia).values({
        listingId,
        url: typeof image === 'string' ? image : image.url || image.preview || '',
        type: 'image',
        isShowcase: index === 0,
        sortOrder: index,
      });
    }
  }

  return NextResponse.json({ success: true, source: 'db' });
}
