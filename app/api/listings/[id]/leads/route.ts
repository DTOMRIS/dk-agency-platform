import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse, after } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listingLeads, listings } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getListingLeadsByListingId } from '@/lib/repositories/listingRepository';
import { attributionLine } from '@/lib/analytics/attribution';
import { readAttribution, recordLeadSource } from '@/lib/analytics/attribution-server';
import { leadButtons, notifyOwner } from '@/lib/telegram/notify-owner';

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
  const body = await request.json();
  const listingId = Number(id);

  if (!dbAvailable || !db) {
    // TASK-0538: was `success: true` (mock) — the lead was lost while the visitor saw «sent».
    return NextResponse.json({ success: false, error: 'Müraciət hazırda qəbul edilmir.' }, { status: 503 });
  }

  const resolvedListingId = Number.isNaN(listingId)
    ? await db
        .select({ id: listings.id })
        .from(listings)
        .where(eq(listings.trackingCode, id))
        .then((items) => items[0]?.id)
    : listingId;

  if (!resolvedListingId) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  const inserted = await db
    .insert(listingLeads)
    .values({
      listingId: resolvedListingId,
      name: body.name,
      phone: body.phone || null,
      email: body.email || null,
      message: body.message || null,
      status: 'new',
    })
    .returning();

  // Admin notification (fire-and-forget)
  const listing = await db
    .select({ trackingCode: listings.trackingCode, title: listings.title })
    .from(listings)
    .where(eq(listings.id, resolvedListingId))
    .then((items) => items[0]);

  // TASK-0541: listing enquiries only went by e-mail — now also the owner's Telegram, with the source.
  const leadAttr = readAttribution(request);
  after(async () => {
    await recordLeadSource(leadAttr, 'listing_lead', listing?.trackingCode ? `/ilanlar/${listing.trackingCode}` : null);
    await notifyOwner({
      title: '🔔 Yeni elan müraciəti',
      lines: [
        listing?.title ? `Elan: ${listing.title}` : null,
        listing?.trackingCode ? `Kod: ${listing.trackingCode}` : null,
        `Ad: ${body.name || 'Anonim'}`,
        body.phone ? `Telefon: ${body.phone}` : null,
        body.email ? `E-poçt: ${body.email}` : null,
        body.message ? `Mesaj: ${body.message}` : null,
        attributionLine(leadAttr),
      ],
      buttons: leadButtons(body.phone, `/dashboard/ilanlar/${resolvedListingId}`),
    });
  });

  if (listing) {
    import('@/lib/email/templates').then(({ emailTemplates, sendEmail }) => {
      const adminEmail = process.env.ADMIN_EMAIL || 'info@dkagency.com.tr';
      sendEmail(
        adminEmail,
        emailTemplates.listingLeadAdmin(
          listing.trackingCode || String(resolvedListingId),
          listing.title || 'Elan',
          body.name || 'Anonim',
          body.phone || '-',
          body.message || '',
        ),
      ).catch((err) => console.error('[email] Listing lead admin mail failed:', err));
    }).catch((err) => console.error('[email] Listing lead admin import failed:', err));
  }

  return NextResponse.json({ success: true, source: 'db', data: inserted[0] }, { status: 201 });
}
