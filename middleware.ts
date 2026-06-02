import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { isLocale } from './i18n/config';

export const runtime = 'nodejs';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split('/')[1];

  // Only run intlMiddleware for locale-prefixed paths (e.g. /ru/..., /en/...).
  // All other paths (including /) bypass to root-level page aliases.
  // This prevents the Next 16 proxy redirect loop on / (BUG-001 / L-036).
  if (!isLocale(firstSegment)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/(az|ru|en|tr)/:path*',
  ],
};
