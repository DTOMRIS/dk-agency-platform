import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { sendEmail } from '@/lib/email/send';
import { buildListingApprovedEmail } from '@/lib/email/templates/listing-approved';
import { getServerMemberSession } from '@/lib/members/server-session';
import { updateListingStatus } from '@/lib/repositories/listingRepository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json() as {
    status?: string;
    isShowcase?: boolean;
    isFeatured?: boolean;
  };

  const result = await updateListingStatus(Number(id), {
    status: body.status as Parameters<typeof updateListingStatus>[1]['status'],
    isShowcase: body.isShowcase,
    isFeatured: body.isFeatured,
  });

  // Yalnız showcase_ready statusuna keçəndə sahibkara email göndər
  if (body.status === 'showcase_ready' && result.source === 'db' && dbAvailable && db) {
    const rows = await db
      .select({
        title: listings.title,
        trackingCode: listings.trackingCode,
        ownerName: listings.ownerName,
        email: listings.email,
      })
      .from(listings)
      .where(eq(listings.id, Number(id)))
      .limit(1);

    const listing = rows[0];

    if (listing?.email) {
      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      void sendEmail({
        to: listing.email,
        ...buildListingApprovedEmail({
          ownerName: listing.ownerName ?? 'Hörmətli sahibkar',
          listingTitle: listing.title,
          trackingCode: listing.trackingCode,
          listingUrl: `${baseUrl}/elanlar/${listing.trackingCode.toLowerCase()}`,
        }),
      });
    }
  }

  return NextResponse.json({ success: true, source: result.source });
}
