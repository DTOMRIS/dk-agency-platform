'use client';

import { usePathname } from 'next/navigation';
import HolidayBanner from '@/components/brand/HolidayBanner';
import Header from '@/components/layout/Header';
import { Footer, KazanAIBot } from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import LazyCookiesBanner from '@/components/ui/LazyCookiesBanner';
import WhatsAppButton from '@/components/ui/WhatsAppButton';
import MessageFormModal from '@/components/contact/MessageFormModal';
import KazanNudge from '@/components/kazan-ai/KazanNudge';
import AttributionCapture from '@/components/analytics/AttributionCapture';
import CloudflareWebAnalytics from '@/components/analytics/CloudflareWebAnalytics';
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
      <HolidayBanner />
      <Header />
      <main className="pb-16 lg:pb-0">{children}</main>
      <Footer />
      {/* TASK-0529: one floating set on every public page (WhatsApp left, KAZAN AI right) — before,
          WhatsApp lived only on the home page. */}
      <WhatsAppButton />
      {/* TASK-0558: WhatsApp buttons open the site message form first — the text reaches Telegram + e-mail. */}
      <MessageFormModal />
      <KazanAIBot />
      {/* TASK-0536: proactive one-question bubble above the KAZAN launcher (desktop). */}
      <KazanNudge />
      <MobileBottomNav />
      <LazyCookiesBanner />
      {/* TASK-0541: remembers where the visitor came from (utm / ad / referring site) for lead sources. */}
      <AttributionCapture />
      {/* TASK-0551: cookieless visitor counts (countries, pages, referrers) in Cloudflare Web Analytics. */}
      <CloudflareWebAnalytics />
    </>
  );
}
