'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wrench, Sparkles, Store, User } from 'lucide-react';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';

const NAV_LABELS: Record<Locale, Record<string, string>> = {
  az: { home: 'Ana səhifə', tools: 'Alətlər', ai: 'KAZAN AI', listings: 'İlanlar', profile: 'Profil' },
  tr: { home: 'Ana sayfa', tools: 'Araçlar', ai: 'KAZAN AI', listings: 'İlanlar', profile: 'Profil' },
  ru: { home: 'Главная', tools: 'Инструменты', ai: 'KAZAN AI', listings: 'Объявления', profile: 'Профиль' },
  en: { home: 'Home', tools: 'Tools', ai: 'KAZAN AI', listings: 'Listings', profile: 'Profile' },
};

export default function MobileBottomNav() {
  const pathname = usePathname();
  const currentLocale = normalizeLocale(pathname.split('/')[1]);
  const labels = NAV_LABELS[currentLocale] || NAV_LABELS.az;

  const items = [
    { label: labels.home, href: withLocale(currentLocale, '/'), icon: Home },
    { label: labels.tools, href: withLocale(currentLocale, '/toolkit'), icon: Wrench },
    { label: labels.ai, href: withLocale(currentLocale, '/kazan-ai'), icon: Sparkles, highlight: true },
    { label: labels.listings, href: withLocale(currentLocale, '/ilanlar'), icon: Store },
    { label: labels.profile, href: withLocale(currentLocale, '/settings'), icon: User },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 block border-t border-slate-200/80 bg-white/95 backdrop-blur-md lg:hidden pb-safe">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (item.href !== withLocale(currentLocale, '/') && pathname.startsWith(item.href));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-all ${
                isActive ? 'text-[var(--dk-navy)] font-bold' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <div className={item.highlight ? 'rounded-full bg-[var(--dk-gold)]/20 p-1.5 text-[var(--dk-navy)]' : ''}>
                <Icon className={`h-5 w-5 ${item.highlight ? 'text-[var(--dk-navy)]' : isActive ? 'text-[var(--dk-navy)]' : 'text-slate-400'}`} />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
