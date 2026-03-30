import { NextRequest, NextResponse } from 'next/server';
import { getListingById } from '@/lib/db/listings-repository';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const listing = await getListingById(Number(id));

  if (!listing) {
    return NextResponse.json({ success: false, error: 'Elan tapılmadı.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: listing });
}
