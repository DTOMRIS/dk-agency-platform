import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listings, listingMedia, listingLeads } from '@/lib/db/schema';
import { getListingDetail } from '@/lib/repositories/listingRepository';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { getServerMemberSession } from '@/lib/members/server-session';
import { isValidSector } from '@/lib/data/listingSectors';
import type { ListingWorkflowStatus } from '@/lib/utils/listingStatus';

/** TASK-0499: statuses a visitor may read through this public GET (matches the public showcase). */
const PUBLIC_READ_STATUSES: ListingWorkflowStatus[] = ['showcase_ready', 'sold'];

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await getListingDetail(Number(id));

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  // TASK-0497: private contact (e.g. WhatsApp import poster) + origin note — admin only.
  const session = await getServerMemberSession();
  if (session.loggedIn && session.plan === 'admin' && dbAvailable && db) {
    const [privateContact] = await db
      .select({
        contactName: listings.contactName,
        contactPhone: listings.contactPhone,
        contactEmail: listings.contactEmail,
        committeeNotes: listings.committeeNotes,
      })
      .from(listings)
      .where(eq(listings.id, Number(id)));
    return NextResponse.json({ success: true, data: { ...listing, privateContact: privateContact ?? null } });
  }

  // TASK-0499: this GET used to return any listing (drafts included) with its inquiry leads
  // (names, phones, emails of interested buyers) and review notes to anyone. The owner keeps full
  // access to their own listing (b2b-panel); everyone else gets a showcase listing without PII.
  const auth = await getAuthFromCookie();
  if (auth && dbAvailable && db) {
    const [row] = await db
      .select({ ownerId: listings.ownerId })
      .from(listings)
      .where(eq(listings.id, Number(id)));
    if (row && row.ownerId === auth.userId) {
      return NextResponse.json({ success: true, data: listing });
    }
  }

  if (!PUBLIC_READ_STATUSES.includes(listing.status as ListingWorkflowStatus)) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  const { leads: _leads, reviewNotes: _reviewNotes, email: _email, ...publicListing } = listing;
  void _leads;
  void _reviewNotes;
  void _email;
  return NextResponse.json({ success: true, data: { ...publicListing, leads: [], reviewNotes: [] } });
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
  'sector',
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

  // Admin bypass — admins can edit any listing in any status
  const session = await getServerMemberSession();
  const isAdmin = session.loggedIn && session.plan === 'admin';

  if (!isAdmin) {
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
  }

  const body = await request.json();

  // Sector validation if provided
  if (body.sector && !isValidSector(body.sector)) {
    return NextResponse.json(
      { success: false, error: `Yanlış sektor dəyəri: "${body.sector}".` },
      { status: 400 },
    );
  }

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

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: false, error: 'Verilənlər bazası əlçatmazdır.' }, { status: 503 });
  }

  const { id } = await params;
  const listingId = Number(id);

  const [row] = await db.select({ id: listings.id }).from(listings).where(eq(listings.id, listingId));
  if (!row) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  await db.delete(listingLeads).where(eq(listingLeads.listingId, listingId));
  await db.delete(listingMedia).where(eq(listingMedia.listingId, listingId));
  await db.delete(listings).where(eq(listings.id, listingId));

  return NextResponse.json({ success: true, source: 'db' });
}
