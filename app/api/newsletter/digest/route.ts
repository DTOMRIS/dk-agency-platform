import { NextRequest, NextResponse } from 'next/server';
import { getNewsletterDigestStub } from '@/lib/data/newsletterDigest';

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale');
  const locale = localeParam === 'en' || localeParam === 'ru' || localeParam === 'tr' ? localeParam : 'az';

  return NextResponse.json({
    ok: true,
    source: 'newsletter-digest-stub',
    generatedAt: new Date().toISOString(),
    items: getNewsletterDigestStub(locale),
    note: 'Placeholder route. Selection logic can be replaced with DB-backed most-read query.',
  });
}
