'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Store, Bot, Newspaper, Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { normalizeLocale, stripLocalePrefix, withLocale } from '@/i18n/config';

// Apple-style bottom tab bar for the dashboard (thumb zone), mobile only.
// Mirrors the public MobileBottomNav pattern but points at dashboard routes.
// The 5th slot ("More") opens the full sidebar drawer so every item stays
// reachable without cramming 13 links into the bar.
export default function DashboardBottomNav({ onMore }: { onMore: () => void }) {
  const pathname = usePathname();
  const t = useTranslations('dashboardSidebar');

  const currentLocale = (() => {
    if (typeof document === 'undefined') return normalizeLocale(pathname.split('/')[1]);
    const match = document.cookie.match(/NEXT_LOCALE=(\w+)/);
    return match ? normalizeLocale(match[1]) : normalizeLocale(pathname.split('/')[1]);
  })();

  const strippedPath = stripLocalePrefix(pathname);
  const isActive = (href: string) => strippedPath === href || strippedPath.startsWith(`${href}/`);

  const links = [
    { key: 'home', href: '/dashboard', icon: LayoutDashboard, highlight: false },
    { key: 'listings', href: '/dashboard/ilanlar', icon: Store, highlight: false },
    { key: 'kazanLeads', href: '/dashboard/kazan-leads', icon: Bot, highlight: true },
    { key: 'news', href: '/dashboard/xeberler', icon: Newspaper, highlight: false },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-[var(--dk-warm-border)] bg-white/95 backdrop-blur-md pb-safe lg:hidden">
      <div className="flex items-stretch justify-around px-1">
        {links.map(({ key, href, icon: Icon, highlight }) => {
          const active = isActive(href);
          return (
            <Link
              key={key}
              href={withLocale(currentLocale, href)}
              className={`flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 ${
                active ? 'font-bold text-[var(--dk-navy)]' : 'text-slate-500'
              }`}
            >
              <span className={highlight ? 'rounded-full bg-[var(--dk-gold)]/20 p-1.5' : ''}>
                <Icon
                  className={`h-6 w-6 ${active || highlight ? 'text-[var(--dk-navy)]' : 'text-slate-400'}`}
                />
              </span>
              <span className="text-[10px] tracking-tight">{t(`nav.${key}`)}</span>
            </Link>
          );
        })}
        <button
          type="button"
          onClick={onMore}
          className="flex min-h-[44px] flex-1 flex-col items-center justify-center gap-1 py-2 text-slate-500"
        >
          <span>
            <Menu className="h-6 w-6 text-slate-400" />
          </span>
          <span className="text-[10px] tracking-tight">{t('nav.more')}</span>
        </button>
      </div>
    </nav>
  );
}
