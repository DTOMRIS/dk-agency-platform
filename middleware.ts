import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';
import { routing } from './i18n/routing';
import { isLocale } from './i18n/config';

export const runtime = 'nodejs';

const intlMiddleware = createMiddleware(routing);

export default function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const firstSegment = pathname.split('/')[1];

  if (pathname !== '/' && !isLocale(firstSegment)) {
    return NextResponse.next();
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: [
    '/',
    '/(az|ru|en|tr)/:path*',
  ],
};
