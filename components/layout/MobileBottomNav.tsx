'use client';

/**
 * Mobile bottom navigation (below lg). TASK-0519: v2 look — white bar with a cream hairline,
 * ink icons, active item in brand red (white-surface text uses dk-red-strong for AA contrast),
 * KAZAN AI as the highlighted centre action (ink disc). Bar is exactly 64px (63 + 1px border) + safe-area padding:
 * the cookie bar (components/inner/inner.module.css `.ck`) sits at bottom: 64px + safe area.
 */

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Sparkles, Store, User } from 'lucide-react';
import { normalizeLocale, stripLocalePrefix, withLocale, type Locale } from '@/i18n/config';

const NAV_LABELS: Record<Locale, Record<string, string>> = {
  az: { home: 'Ana səhifə', tools: 'Alətlər', ai: 'KAZAN AI', listings: 'İlanlar', profile: 'Profil', nav: 'Əsas naviqasiya' },
  tr: { home: 'Ana sayfa', tools: 'Araçlar', ai: 'KAZAN AI', listings: 'İlanlar', profile: 'Profil', nav: 'Ana gezinme' },
  ru: { home: 'Главная', tools: 'Инструменты', ai: 'KAZAN AI', listings: 'Объявления', profile: 'Профиль', nav: 'Основная навигация' },
  en: { home: 'Home', tools: 'Tools', ai: 'KAZAN AI', listings: 'Listings', profile: 'Profile', nav: 'Main navigation' },
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const labels = NAV_LABELS[currentLocale] || NAV_LABELS.az;
  const path = stripLocalePrefix(pathname) || '/';

  const items = [
    { key: 'home', label: labels.home, base: '/', icon: Home },
    { key: 'tools', label: labels.tools, base: '/toolkit', icon: Wrench },
    { key: 'ai', label: labels.ai, base: '/kazan-ai', icon: Sparkles, highlight: true },
    { key: 'listings', label: labels.listings, base: '/ilanlar', icon: Store },
    { key: 'profile', label: labels.profile, base: '/settings', icon: User },
  ];

  return (
    <nav
      aria-label={labels.nav}
      data-testid="mobile-bottom-nav"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E4DCCD] bg-white/95 pb-[env(safe-area-inset-bottom,0px)] shadow-[0_-8px_24px_-16px_rgba(15,23,42,0.18)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid h-[63px] max-w-xl grid-cols-5">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.base === '/' ? path === '/' : path === item.base || path.startsWith(`${item.base}/`);
          const href = withLocale(currentLocale, item.base);

          if (item.highlight) {
            return (
              <li key={item.key} className="flex justify-center">
                <Link
                  href={href}
                  aria-current={isActive ? 'page' : undefined}
                  data-active={isActive ? 'true' : undefined}
                  className="flex h-full min-w-0 flex-col items-center justify-center gap-0.5 px-1"
                >
                  <span
                    className={`grid h-10 w-10 place-items-center rounded-full text-white shadow-[0_8px_18px_-8px_rgba(15,23,42,0.6)] transition-colors ${
                      isActive ? 'bg-dk-red-strong' : 'bg-[#0F172A]'
                    }`}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className={`max-w-full truncate text-[11px] font-extrabold tracking-tight ${isActive ? 'text-dk-red-strong' : 'text-[#0F172A]'}`}>
                    {item.label}
                  </span>
                </Link>
              </li>
            );
          }

          return (
            <li key={item.key} className="flex justify-center">
              <Link
                href={href}
                aria-current={isActive ? 'page' : undefined}
                data-active={isActive ? 'true' : undefined}
                className={`relative flex h-full min-w-0 flex-col items-center justify-center gap-1 px-0.5 transition-colors ${
                  isActive ? 'text-dk-red-strong' : 'text-[#334155] hover:text-[#0F172A]'
                }`}
              >
                {isActive && <span aria-hidden="true" className="absolute top-0 h-[3px] w-7 rounded-b-full bg-dk-red-strong" />}
                <Icon className={`h-[22px] w-[22px] ${isActive ? 'text-dk-red-strong' : 'text-[#0F172A]'}`} strokeWidth={isActive ? 2.4 : 2} aria-hidden="true" />
                <span className={`max-w-full truncate text-[10.5px] tracking-tight ${isActive ? 'font-bold' : 'font-semibold'}`}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
