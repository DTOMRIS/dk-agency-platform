import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listings } from '@/lib/db/schema';
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
  const body = await request.json();

  const result = await updateListingStatus(Number(id), {
    status: body.status,
    isShowcase: body.isShowcase,
    isFeatured: body.isFeatured,
  });

  // Send status change emails (fire-and-forget)
  if (dbAvailable && db && (body.status === 'showcase_ready' || body.status === 'rejected')) {
    db.select({ email: listings.email, trackingCode: listings.trackingCode, title: listings.title, ownerName: listings.ownerName })
      .from(listings)
      .where(eq(listings.id, Number(id)))
      .then((rows) => {
        const row = rows[0];
        if (!row?.email) return;
        return import('@/lib/email/templates').then(({ emailTemplates, sendEmail }) => {
          const template = body.status === 'showcase_ready'
            ? emailTemplates.listingApproved(row.trackingCode || id, row.title || 'Elan', row.ownerName || 'Üzv')
            : emailTemplates.listingRejected(row.trackingCode || id, 'Admin qərarı ilə rədd edildi', row.ownerName || 'Üzv');
          return sendEmail(row.email!, template);
        });
      })
      .catch(() => {});
  }

  return NextResponse.json({ success: true, source: result.source });
}
