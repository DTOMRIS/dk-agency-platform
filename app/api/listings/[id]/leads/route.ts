import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { ADMIN_EMAIL } from '@/lib/email/client';
import { sendEmail } from '@/lib/email/send';
import { buildLeadConfirmationEmail } from '@/lib/email/templates/lead-confirmation';
import { buildNewLeadEmail } from '@/lib/email/templates/new-lead';
import { listingLeads, listings } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getListingLeadsByListingId } from '@/lib/repositories/listingRepository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const data = await getListingLeadsByListingId(Number(id));
  return NextResponse.json({ success: true, data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json() as {
    name?: string;
    phone?: string;
    email?: string;
    message?: string;
  };
  const listingId = Number(id);

  if (!dbAvailable || !db) {
    return NextResponse.json({ success: true, source: 'mock' }, { status: 201 });
  }

  const listingRows = await db
    .select({ id: listings.id, title: listings.title, trackingCode: listings.trackingCode })
    .from(listings)
    .where(Number.isNaN(listingId) ? eq(listings.trackingCode, id) : eq(listings.id, listingId))
    .limit(1);

  const listing = listingRows[0];

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  const inserted = await db
    .insert(listingLeads)
    .values({
      listingId: listing.id,
      name: body.name ?? 'Naməlum',
      phone: body.phone ?? null,
      email: body.email ?? null,
      message: body.message ?? null,
      status: 'new',
    })
    .returning();

  const lead = inserted[0];
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

  // Admin bildirişi
  void sendEmail({
    to: ADMIN_EMAIL,
    ...buildNewLeadEmail({
      listingTitle: listing.title,
      trackingCode: listing.trackingCode,
      leadName: lead.name,
      leadPhone: lead.phone ?? undefined,
      leadEmail: lead.email ?? undefined,
      leadMessage: lead.message ?? undefined,
      adminPanelUrl: `${baseUrl}/dashboard/ilanlar/${listing.id}`,
    }),
  });

  // Müraciət edənə təsdiq
  if (lead.email) {
    void sendEmail({
      to: lead.email,
      ...buildLeadConfirmationEmail({
        leadName: lead.name,
        listingTitle: listing.title,
        trackingCode: listing.trackingCode,
      }),
    });
  }

  return NextResponse.json({ success: true, source: 'db', data: lead }, { status: 201 });
}
