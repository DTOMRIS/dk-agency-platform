import { and, eq, ne } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { getListings } from '@/lib/db/listings-repository';
import { getAdminListings, getOwnerListings } from '@/lib/repositories/listingRepository';
import { listingMedia, listings } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { generateTrackingCode } from '@/lib/utils/tracking';
import { isValidSector } from '@/lib/data/listingSectors';

const MAX_FREE_LISTINGS = 2;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');
  const type = searchParams.get('type');
  const sector = searchParams.get('sector');
  const city = searchParams.get('city');
  const status = searchParams.get('status');
  const query = searchParams.get('q');
  const showcase = searchParams.get('showcase') === 'true';
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const limit = Number(searchParams.get('limit') || '20');
  const offset = Number(searchParams.get('offset') || '0');

  if (scope === 'admin') {
    const result = await getAdminListings({
      status,
      query,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      data: result.items,
      total: result.total,
      stats: (result as { stats?: unknown }).stats,
      source: result.source,
    });
  }

  if (scope === 'owner') {
    const auth = await getAuthFromCookie();
    if (!auth) {
      return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
    }
    const result = await getOwnerListings(auth.userId);
    return NextResponse.json({ success: true, data: result.items, source: result.source });
  }

  const locale = searchParams.get('locale') || 'az';

  const results = await getListings({
    type,
    sector,
    city,
    status: status || 'showcase_ready',
    showcase: showcase || undefined,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  }, locale);

  return NextResponse.json({ success: true, data: results, source: dbAvailable ? 'db' : 'mock' });
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn) {
    return NextResponse.json({ success: false, error: 'Giriş tələb olunur.' }, { status: 401 });
  }

  const auth = await getAuthFromCookie();
  const body = await request.json();
  const trackingCode = body?.trackingCode || generateTrackingCode();
  const isDraft = body?.status === 'draft';

  // Sector validation — required for new listings
  if (body.sector && !isValidSector(body.sector)) {
    return NextResponse.json(
      { success: false, error: `Yanlış sektor dəyəri: "${body.sector}". Düzgün sektor seçin.` },
      { status: 400 },
    );
  }

  if (!dbAvailable || !db) {
    return NextResponse.json({
      success: true,
      source: 'mock',
      data: { id: Date.now(), trackingCode, ...body },
    });
  }

  // Free listing limit: max 2 per non-admin user (until September 2026)
  const isAdmin = session.plan === 'admin';
  if (!isAdmin && auth?.userId) {
    const existingCount = await db
      .select({ id: listings.id })
      .from(listings)
      .where(and(eq(listings.ownerId, auth.userId), ne(listings.status, 'rejected')))
      .then((rows) => rows.length);

    if (existingCount >= MAX_FREE_LISTINGS) {
      return NextResponse.json(
        { success: false, error: `Pulsuz dövrdə maksimum ${MAX_FREE_LISTINGS} elan yerləşdirə bilərsiniz.` },
        { status: 403 },
      );
    }
  }

  const inserted = await db
    .insert(listings)
    .values({
      trackingCode,
      type: body.type,
      sector: body.sector || null,
      status: isDraft ? 'submitted' : 'submitted',
      isShowcase: false,
      isFeatured: false,
      ownerId: auth?.userId ?? null,
      slug: body.slug || null,
      title: body.title,
      description: body.description,
      price: body.price ? Number(body.price) : null,
      priceLabel: body.priceLabel || null,
      currency: body.currency || 'AZN',
      city: body.city,
      district: body.district || null,
      ownerName: body.ownerName || session.name,
      phone: body.phone,
      email: body.email || session.email,
      contactName: body.contactName || null,
      contactPhone: body.contactPhone || null,
      contactEmail: body.contactEmail || null,
      typeSpecificData: body.typeSpecificData || {},
      equipment: Array.isArray(body.equipment) ? body.equipment : [],
      aiAnalysis: null,
    })
    .returning({ id: listings.id, trackingCode: listings.trackingCode });

  const listing = inserted[0];
  const images = Array.isArray(body.images) ? body.images : [];

  for (const [index, image] of images.entries()) {
    await db.insert(listingMedia).values({
      listingId: listing.id,
      url: image.url || image.preview || image,
      type: 'image',
      isShowcase: index === 0,
      sortOrder: index,
    });
  }

  // Fire-and-forget: AI analysis via DeepSeek
  import('@/lib/listings/ai-analyze').then(({ analyzeListingAsync }) => {
    analyzeListingAsync(listing.id).catch((err) => console.error('[ai] Listing analysis failed:', err));
  }).catch((err) => console.error('[ai] Listing analysis import failed:', err));

  // Send confirmation email to submitter (fire-and-forget)
  const submitterEmail = body.email || session.email;
  if (submitterEmail) {
    import('@/lib/email/templates').then(({ emailTemplates, sendEmail }) => {
      sendEmail(submitterEmail, emailTemplates.listingSubmitted(trackingCode, body.ownerName || session.name || 'Üzv')).catch((err) => console.error('[email] Listing submitted mail failed:', err));
    }).catch((err) => console.error('[email] Listing submitted import failed:', err));
  }

  return NextResponse.json({ success: true, source: 'db', data: listing }, { status: 201 });
}
