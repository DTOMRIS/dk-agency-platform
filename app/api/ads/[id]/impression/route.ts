import { NextResponse } from 'next/server';
import { incrementAdImpression } from '@/lib/repositories/adsRepository';

// Public, best-effort impression counter. Always 204 — never blocks a page.
export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adId = Number(id);
  if (Number.isInteger(adId) && adId > 0) {
    await incrementAdImpression(adId);
  }
  return new NextResponse(null, { status: 204 });
}
