import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listingLeads, listings } from '@/lib/db/schema';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const body = await request.json();
  const listingId = Number(id);

  if (!dbAvailable || !db) {
    console.log('listing_lead_submit_mock', { id, body });
    return NextResponse.json({ success: true, source: 'mock' }, { status: 201 });
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

  console.log('Lead email notification would send:', inserted[0]?.id, body.email);
  return NextResponse.json({ success: true, source: 'db', data: inserted[0] }, { status: 201 });
}
