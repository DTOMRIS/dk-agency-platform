'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Footer, KazanAIBot } from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LazyCookiesBanner from '@/components/ui/LazyCookiesBanner';
import DeviceLanguageDetector from '@/components/DeviceLanguageDetector';
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
      <DeviceLanguageDetector />
      <Header />
      <main className="pb-16 lg:pb-0">{children}</main>
      <Footer />
      <KazanAIBot />
      <MobileBottomNav />
      <LazyCookiesBanner />
    </>
  );
}
