import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { createListingReview } from '@/lib/repositories/listingRepository';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const review = await createListingReview(Number(id), {
    notes: body.notes,
    score: body.score,
    decision: body.decision,
  });

  return NextResponse.json({ success: true, data: review }, { status: 201 });
}
