'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { withLocale, normalizeLocale, type Locale } from '@/i18n/config';

interface ListingItem {
  id: number;
  title?: string;
  titleAz?: string;
  titleRu?: string;
  titleEn?: string;
  titleTr?: string;
  sector?: string;
  city?: string;
  price?: number | null;
  currency?: string;
  slug?: string;
}

function localizedTitle(item: ListingItem, locale: Locale): string {
  const map: Record<Locale, string | undefined> = {
    az: item.titleAz,
    ru: item.titleRu,
    en: item.titleEn,
    tr: item.titleTr,
  };
  return map[locale] || item.title || '';
}

export function RecentListings() {
  const t = useTranslations('home.listings');
  const locale = normalizeLocale(useLocale());
  const [items, setItems] = useState<ListingItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/listings?showcase=true&limit=3')
      .then((r) => r.json())
      .then((json: { data?: ListingItem[] }) => {
        if (active) setItems(Array.isArray(json.data) ? json.data.slice(0, 3) : []);
      })
      .catch(() => {})
      .finally(() => active && setLoaded(true));
    return () => {
      active = false;
    };
  }, []);

  // Hide the whole zone until we have listings (graceful empty — never a broken block)
  if (!loaded || items.length === 0) return null;

  return (
    <section className="bg-[var(--dk-paper)] py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-[var(--dk-gold)]">
              {t('badge')}
            </span>
            <h2 className="font-display text-3xl font-black tracking-tighter text-slate-900">
              {t('title')}
            </h2>
          </div>
          <Link
            href={withLocale(locale, '/ilanlar')}
            className="group inline-flex items-center gap-1 text-sm font-bold text-[var(--dk-red)] hover:underline"
          >
            {t('viewAll')}
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {items.map((item) => (
            <Link
              key={item.id}
              href={withLocale(locale, `/ilanlar/${item.id}`)}
              className="group flex flex-col rounded-2xl border border-[var(--dk-warm-border)] bg-white p-5 transition-all hover:-translate-y-1 hover:border-[var(--dk-red)]/30 hover:shadow-lg"
            >
              {item.sector && (
                <span className="text-[11px] font-bold uppercase tracking-wide text-[var(--dk-gold)]">
                  {item.sector}
                </span>
              )}
              <h3 className="mt-2 line-clamp-2 flex-1 text-sm font-bold text-slate-900 transition-colors group-hover:text-[var(--dk-red)]">
                {localizedTitle(item, locale)}
              </h3>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-slate-400">{item.city}</span>
                {item.price ? (
                  <span className="text-sm font-black text-[var(--dk-red)]">
                    {Number(item.price).toLocaleString()} {item.currency || 'AZN'}
                  </span>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
