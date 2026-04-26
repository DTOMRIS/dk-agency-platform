import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { getListings } from '@/lib/db/listings-repository';
import { getAdminListings } from '@/lib/repositories/listingRepository';
import { listingMedia, listings } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';
import { generateTrackingCode } from '@/lib/utils/tracking';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const scope = searchParams.get('scope');
  const type = searchParams.get('type');
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
      source: result.source,
    });
  }

  const locale = searchParams.get('locale') || 'az';

  const results = await getListings({
    type,
    city,
    status,
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

  const body = await request.json();
  const trackingCode = body?.trackingCode || generateTrackingCode();

  if (!dbAvailable || !db) {
    console.log('listing_create_mock', { trackingCode, body, session });
    return NextResponse.json({
      success: true,
      source: 'mock',
      data: { id: Date.now(), trackingCode, ...body },
    });
  }

  const inserted = await db
    .insert(listings)
    .values({
      trackingCode,
      type: body.type,
      status: 'submitted',
      isShowcase: false,
      isFeatured: false,
      slug: body.slug || null,
      title: body.title,
      description: body.description,
      price: body.price ? Number(body.price) : null,
      currency: body.currency || 'AZN',
      city: body.city,
      district: body.district || null,
      ownerName: body.ownerName || session.name,
      phone: body.phone,
      email: body.email || session.email,
      typeSpecificData: body.typeSpecificData || {},
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

  // Send confirmation email to submitter (fire-and-forget)
  const submitterEmail = body.email || session.email;
  if (submitterEmail) {
    import('@/lib/email/templates').then(({ emailTemplates, sendEmail }) => {
      sendEmail(submitterEmail, emailTemplates.listingSubmitted(trackingCode, body.ownerName || session.name || 'Üzv')).catch(() => {});
    }).catch(() => {});
  }

  return NextResponse.json({ success: true, source: 'db', data: listing }, { status: 201 });
}
