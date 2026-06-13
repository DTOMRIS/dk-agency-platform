import { NextResponse } from 'next/server';
import { getAdById, incrementAdClick } from '@/lib/repositories/adsRepository';

const HOME = 'https://dkagency.com.tr';

// Public click tracker → 302 to the ad's target. Only http(s) targets are
// honored (open-redirect guard); anything else falls back to the homepage.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const adId = Number(id);

  if (!Number.isInteger(adId) || adId <= 0) {
    return NextResponse.redirect(HOME, 302);
  }

  const ad = await getAdById(adId);
  if (!ad) {
    return NextResponse.redirect(HOME, 302);
  }

  await incrementAdClick(adId);

  let dest = HOME;
  try {
    const u = new URL(ad.targetUrl);
    if (u.protocol === 'http:' || u.protocol === 'https:') {
      dest = u.toString();
    }
  } catch {
    // invalid stored URL — fall back to home
  }

  return NextResponse.redirect(dest, 302);
}
