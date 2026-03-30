import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { db, dbAvailable } from '@/lib/db';
import { listings } from '@/lib/db/schema';
import { getServerMemberSession } from '@/lib/members/server-session';

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

  if (!dbAvailable || !db) {
    console.log('listing_status_patch_mock', { id, body, session });
    return NextResponse.json({ success: true, source: 'mock' });
  }

  await db
    .update(listings)
    .set({
      status: body.status,
      isShowcase: body.isShowcase,
      isFeatured: body.isFeatured,
      updatedAt: new Date(),
      publishedAt: body.status === 'showcase_ready' ? new Date() : null,
    })
    .where(eq(listings.id, Number(id)));

  return NextResponse.json({ success: true, source: 'db' });
}
