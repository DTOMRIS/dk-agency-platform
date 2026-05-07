'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Footer, KazanAIBot } from '@/components/layout/Footer';
import LazyCookiesBanner from '@/components/ui/LazyCookiesBanner';
import { stripLocalePrefix } from '@/i18n/config';

function isDashboardRoute(pathname: string) {
  const path = stripLocalePrefix(pathname);
  return path === '/dashboard' || path.startsWith('/dashboard/') || path === '/b2b-panel' || path.startsWith('/b2b-panel/');
}

export default function PublicChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  if (isDashboardRoute(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
      <KazanAIBot />
      <LazyCookiesBanner />
    </>
  );
}
