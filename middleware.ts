import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export const runtime = 'nodejs';

export default createMiddleware(routing);

export const config = {
  matcher: [
    '/',
    '/(az|tr|en)/:path*',
    '/((?!api|auth|dashboard|b2b-panel|_next|_vercel|favicon\\.ico|.*\\..*).*)',
  ],
};
