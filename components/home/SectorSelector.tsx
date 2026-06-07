'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';

import { normalizeLocale, withLocale } from '@/i18n/config';

const SECTORS = [
  { key: 'restoran', icon: '🍽️', href: '/sektor/restoran', featured: true },
  { key: 'kafe', icon: '☕', href: '/sektor/kafe', featured: false },
  { key: 'otel', icon: '🏨', href: '/sektor/otel', featured: false },
  { key: 'fastFood', icon: '🍔', href: '/toolkit?sector=fast-food', featured: false },
  { key: 'catering', icon: '🍱', href: '/toolkit?sector=catering', featured: false },
] as const;

export function SectorSelector() {
  const t = useTranslations('home.sectors');
  const locale = normalizeLocale(useLocale());

  return (
    <section className="border-t border-slate-100 bg-white py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <p className="mb-3 text-xs font-mono uppercase tracking-widest text-[var(--dk-red)]">
            {t('badge')}
          </p>
          <h2 className="mb-3 font-display text-3xl font-semibold text-slate-900">
            {t('title')}
          </h2>
          <p className="mx-auto max-w-lg text-slate-500">{t('subtitle')}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {SECTORS.map((sector) => (
            <Link
              key={sector.key}
              href={withLocale(locale, sector.href)}
              className={`group relative rounded-2xl bg-white p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${
                sector.featured
                  ? 'border-2 border-[var(--dk-red)]/40 shadow-sm'
                  : 'border border-slate-200 hover:border-[var(--dk-red)]/30'
              }`}
            >
              <span
                className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl text-2xl transition-colors ${
                  sector.featured
                    ? 'bg-[var(--dk-red)]/10'
                    : 'bg-slate-50 group-hover:bg-[var(--dk-red)]/5'
                }`}
                aria-hidden="true"
              >
                {sector.icon}
              </span>
              <h3 className="mb-1 text-sm font-semibold text-slate-900 transition-colors group-hover:text-[var(--dk-red)]">
                {t(`items.${sector.key}`)}
              </h3>
              <p className="mb-4 text-xs text-slate-400">{t(`items.${sector.key}Sub`)}</p>
              <span className="inline-flex items-center gap-1 text-xs font-mono uppercase tracking-wide text-[var(--dk-red)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                {t('explore')} <span aria-hidden="true">→</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
