'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { withLocale, normalizeLocale } from '@/i18n/config';

// Only restoran/kafe/otel have dedicated /sektor pages. fast-food → QSR tool,
// catering → listings (HALT-3: no 404 to a missing /sektor route).
const SECTORS = [
  { key: 'restoran', icon: '🍽️', href: '/sektor/restoran' },
  { key: 'kafe', icon: '☕', href: '/sektor/kafe' },
  { key: 'otel', icon: '🏨', href: '/sektor/otel' },
  { key: 'fastFood', icon: '🍔', href: '/toolkit/metbex-istasyon' },
  { key: 'catering', icon: '🎪', href: '/ilanlar' },
] as const;

export function SectorSelector() {
  const t = useTranslations('home.sectors');
  const locale = normalizeLocale(useLocale());

  return (
    <section className="border-t border-slate-100 bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <span className="mb-3 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dk-red)]">
            {t('badge')}
          </span>
          <h2 className="font-display text-3xl font-black tracking-tighter text-slate-900">
            {t('title')}
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {SECTORS.map((s) => (
            <Link
              key={s.key}
              href={withLocale(locale, s.href)}
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:border-[var(--dk-red)]/40 hover:shadow-lg"
            >
              <span className="mb-3 block text-3xl">{s.icon}</span>
              <span className="block text-sm font-bold text-slate-900 transition-colors group-hover:text-[var(--dk-red)]">
                {t(`items.${s.key}`)}
              </span>
              <span className="mt-1 block text-xs text-slate-400">{t(`items.${s.key}Sub`)}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
