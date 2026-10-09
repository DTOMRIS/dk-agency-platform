'use client';

/**
 * Homepage listings board. Shows real approved listings from GET /api/listings (TASK-0472) —
 * it used to render invented sample listings from components/constants.ts as if they were real.
 * Empty state invites the visitor to post the first listing.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useLocale } from 'next-intl';
import { ArrowUpRight, MapPin, Plus, Store } from 'lucide-react';
import { normalizeLocale, withLocale, type Locale } from '@/i18n/config';
import { formatNumber } from '@/lib/i18n/format';

type PublicListing = {
  id: number | string;
  slug: string;
  title: string;
  price?: number | null;
  priceLabel?: string | null;
  currency?: string | null;
  city?: string | null;
  images?: Array<{ url: string; alt?: string }> | null;
};

const MAX_ITEMS = 6;

const copyByLocale: Record<
  Locale,
  {
    badge: string;
    title: [string, string];
    postListing: string;
    details: string;
    empty: string;
    emptyCta: string;
    allListings: string;
  }
> = {
  az: {
    badge: 'ELANLAR LÖVHƏSİ',
    title: ['Fürsətləri', 'qaçırmayın'],
    postListing: 'Elan yerləşdir',
    details: 'Təfərrüatlara bax',
    empty: 'Hələ dərc olunmuş elan yoxdur. İlk elanı siz yerləşdirin.',
    emptyCta: 'Elan yerləşdir',
    allListings: 'Bütün elanlar',
  },
  ru: {
    badge: 'ДОСКА ОБЪЯВЛЕНИЙ',
    title: ['Не упустите', 'возможности'],
    postListing: 'Разместить объявление',
    details: 'Смотреть детали',
    empty: 'Опубликованных объявлений пока нет. Разместите первое объявление.',
    emptyCta: 'Разместить объявление',
    allListings: 'Все объявления',
  },
  en: {
    badge: 'LISTINGS BOARD',
    title: ["Don't miss", 'the opportunities'],
    postListing: 'Post a listing',
    details: 'View details',
    empty: 'No listings have been published yet. Be the first to post one.',
    emptyCta: 'Post a listing',
    allListings: 'All listings',
  },
  tr: {
    badge: 'İLAN PANOSU',
    title: ['Fırsatları', 'kaçırmayın'],
    postListing: 'İlan ver',
    details: 'Detaylara bak',
    empty: 'Henüz yayınlanmış ilan yok. İlk ilanı siz verin.',
    emptyCta: 'İlan ver',
    allListings: 'Tüm ilanlar',
  },
};

export default function AdsPreview() {
  const locale = normalizeLocale(useLocale());
  const copy = copyByLocale[locale];
  const [listings, setListings] = useState<PublicListing[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/listings?locale=${locale}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((body: unknown) => {
        if (cancelled) return;
        const data = (body as { data?: unknown } | null)?.data;
        setListings(Array.isArray(data) ? (data as PublicListing[]).slice(0, MAX_ITEMS) : []);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      });
    return () => {
      cancelled = true;
    };
  }, [locale]);

  const priceText = (item: PublicListing) =>
    item.priceLabel ||
    (item.price ? `${formatNumber(item.price, locale)} ${item.currency || 'AZN'}` : '');

  return (
    <section id="ads" className="bg-slate-50 py-20 lg:py-28 overflow-x-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-rose-700">
              {copy.badge}
            </span>
            <h2 className="text-4xl font-display font-extrabold text-slate-900 lg:text-6xl">
              {copy.title[0]}
              <br />
              <span className="text-slate-600">{copy.title[1]}</span>
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href={withLocale(locale, '/ilanlar')}
              className="flex h-12 items-center rounded-2xl border border-slate-300 bg-white px-6 font-bold text-slate-900 transition-colors hover:border-slate-500"
            >
              {copy.allListings}
            </Link>
            <Link
              href={withLocale(locale, '/ilan-ver')}
              className="flex h-12 items-center gap-2 rounded-2xl bg-dk-red-strong px-6 font-bold text-white shadow-xl shadow-brand-red/20 transition-all hover:bg-dk-red-deep"
            >
              <Plus size={20} aria-hidden="true" /> {copy.postListing}
            </Link>
          </div>
        </div>

        {listings === null && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-[2.5rem] bg-white" />
            ))}
          </div>
        )}

        {listings && listings.length > 0 && (
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {listings.map((item) => {
              const image = item.images?.[0];
              const price = priceText(item);
              return (
                <Link
                  key={item.id}
                  href={withLocale(locale, `/ilanlar/${item.slug}`)}
                  className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-shadow duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {image?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element -- listing images come from user uploads on several hosts
                      <img
                        src={image.url}
                        alt={image.alt || item.title}
                        className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <Store className="h-12 w-12 text-slate-400" aria-hidden="true" />
                      </div>
                    )}
                    {price && (
                      <div className="absolute bottom-6 right-6 rounded-2xl bg-dk-red-strong px-5 py-2 text-lg font-extrabold text-white shadow-xl shadow-brand-red/20">
                        {price}
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    {item.city && (
                      <div className="mb-4 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-slate-600">
                        <MapPin size={14} className="text-rose-700" aria-hidden="true" />
                        {item.city}
                      </div>
                    )}
                    <h3 className="mb-4 line-clamp-2 text-xl font-display font-bold leading-tight text-slate-900 transition-colors group-hover:text-rose-700">
                      {item.title}
                    </h3>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
                        {copy.details}
                      </span>
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-900 transition-all group-hover:bg-dk-red-deep group-hover:text-white">
                        <ArrowUpRight size={20} aria-hidden="true" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {listings && listings.length === 0 && (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white py-16 text-center">
            <Store className="mx-auto mb-5 h-12 w-12 text-slate-400" aria-hidden="true" />
            <p className="mx-auto max-w-md px-4 text-lg font-medium text-slate-700">{copy.empty}</p>
            <Link
              href={withLocale(locale, '/ilan-ver')}
              className="mt-6 inline-flex h-12 items-center gap-2 rounded-2xl bg-dk-red-strong px-6 font-bold text-white hover:bg-dk-red-deep"
            >
              <Plus size={18} aria-hidden="true" /> {copy.emptyCta}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
