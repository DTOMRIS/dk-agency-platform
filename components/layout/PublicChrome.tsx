'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/layout/Header';
import { Footer, KazanAIBot } from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LazyCookiesBanner from '@/components/ui/LazyCookiesBanner';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
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
      <main className="pb-16 lg:pb-0">{children}</main>
      <Footer />
      {/* TASK-0529: one floating set on every public page (WhatsApp left, KAZAN AI right) — before,
          WhatsApp lived only on the home page. */}
      <WhatsAppButton />
      <KazanAIBot />
      <MobileBottomNav />
      <LazyCookiesBanner />
    </>
  );
}
