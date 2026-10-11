'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, Briefcase, ChevronDown, ChevronUp, PackageSearch, Search, SlidersHorizontal } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ListingModal from '@/components/listings/ListingModal';
import {
  CITY_OPTIONS,
  LISTING_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import { type MockListing } from '@/lib/data/mockListings';
import { getAllSectors } from '@/lib/data/listingSectors';
import PageBack from '@/components/inner/PageBack';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';

type FilterType = 'all' | ListingCategory;

function normalizeParam(value: string | null) {
  return value ?? 'all';
}

function normalizeCityForQuery(city: string) {
  const map: Record<string, string> = {
    Bakı: 'baki', Sumqayıt: 'sumqayit', Gəncə: 'gence',
    Mingəçevir: 'mingecevir', Lənkəran: 'lenkeran', Şəki: 'seki', Qusar: 'qusar',
  };
  return map[city] ?? city.toLowerCase();
}

export default function ListingsShowcasePage() {
  const t = useTranslations('devir');
  const tJobs = useTranslations('jobs');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [type, setType] = useState<FilterType>('all');
  const [sector, setSector] = useState('all');
  const [city, setCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MockListing[]>([]);
  const [loadError, setLoadError] = useState('');
  const [activeListing, setActiveListing] = useState<MockListing | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setType(normalizeParam(searchParams.get('type')) as FilterType);
    setSector(normalizeParam(searchParams.get('sector')));
    setCity(normalizeParam(searchParams.get('city')));
    setPriceRange(normalizeParam(searchParams.get('price')));
    setSearchQuery(searchParams.get('q') ?? '');
    setInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;
    async function loadListings() {
      setLoading(true);
      try {
        const response = await fetch(`/api/listings?showcase=true&locale=${locale}&limit=500`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing[] };
        if (!cancelled && Array.isArray(payload.data) && payload.data.length > 0) {
          setListings(payload.data);
          setLoadError('');
        }
      } catch {
        if (!cancelled) { setListings([]); setLoadError(t('loadingError')); }
      } finally {
        if (!cancelled) window.setTimeout(() => setLoading(false), 220);
      }
    }
    void loadListings();
    return () => { cancelled = true; };
  }, [locale, t]);

  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (sector !== 'all') params.set('sector', sector);
    if (city !== 'all') params.set('city', city);
    if (priceRange !== 'all') params.set('price', priceRange);
    if (searchQuery) params.set('q', searchQuery);
    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [city, initialized, pathname, priceRange, router, searchQuery, sector, type]);

  const filteredListings = useMemo(() => {
    const range = PRICE_RANGE_OPTIONS.find((item) => item.value === priceRange) ?? PRICE_RANGE_OPTIONS[0];
    const query = searchQuery.toLowerCase().trim();

    return listings.filter((listing) => {
      const typeMatch = type === 'all' || listing.type === type;
      const sectorMatch = sector === 'all' || listing.sector === sector;
      const cityMatch = city === 'all' || normalizeCityForQuery(listing.city) === city;
      const priceMatch = priceRange === 'all' ? true : listing.price >= range.min && (range.max === null || listing.price <= range.max);
      const searchMatch = !query || listing.title.toLowerCase().includes(query) || listing.description?.toLowerCase().includes(query);
      return listing.isShowcase && typeMatch && sectorMatch && cityMatch && priceMatch && searchMatch;
    });
  }, [city, listings, priceRange, searchQuery, sector, type]);

  const handleReset = () => { setType('all'); setSector('all'); setCity('all'); setPriceRange('all'); setSearchQuery(''); };

  const ilanVerHref = locale === 'az' ? '/ilan-ver' : `/${locale}/ilan-ver`;
  const ilanlarimHref = locale === 'az' ? '/b2b-panel/ilanlarim' : `/${locale}/b2b-panel/ilanlarim`;
  const jobsHref = locale === 'az' ? '/is-elanlari' : `/${locale}/is-elanlari`;

  const activeFilterCount = [type !== 'all', sector !== 'all', city !== 'all', priceRange !== 'all', !!searchQuery].filter(Boolean).length;
  const fieldClass =
    'w-full min-w-0 rounded-full border border-[#E4DCCD] bg-white px-4 py-2.5 text-sm font-medium text-[#0F172A] outline-none transition focus:border-[#0F172A] lg:w-auto';

  return (
    <div className={s.page}>
      <PageBack />

      {/* ── Hero ──────────────────────────────────────────── */}
      <section className={home.wrap}>
        <div className="grid items-center gap-8 pb-8 pt-2 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
          <div className="min-w-0">
            <span className={home.eyebrow}>
              <span className={home.dot} />
              {t('badge')}
            </span>
            <h1 className="mt-4 text-[clamp(34px,4.6vw,56px)] font-black leading-none tracking-[-0.05em] text-[#0F172A]">
              {t('title')}
            </h1>
            <p className={`${s.lead} mt-4`}>{t('subtitle')}</p>
            <div className="mt-7 flex flex-wrap gap-2.5">
              <Link href={ilanVerHref} className="inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white transition hover:bg-dk-red-deep">
                {t('ctaPost')} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href={ilanlarimHref} className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-bold text-[#0F172A] transition hover:border-[#0F172A]">
                {t('ctaMyListings')}
              </Link>
            </div>
            <Link
              href={jobsHref}
              className="mt-5 inline-flex max-w-full items-center gap-3 rounded-[22px] border border-[#E4DCCD] bg-white px-4 py-3 text-left transition hover:border-[#0F172A]"
            >
              <Briefcase className="h-5 w-5 shrink-0 text-[#BE2F47]" aria-hidden="true" />
              <span className="min-w-0">
                <span className="block text-sm font-bold text-[#0F172A]">{tJobs('listingsLinkTitle')} →</span>
                <span className="block text-xs text-slate-600">{tJobs('listingsLinkBody')}</span>
              </span>
            </Link>
          </div>
          <div className="hidden overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-[#FBF8F3] p-4 lg:block">
            <Image
              src="/images/yatirimci-sunumu.png"
              alt={t('imageAlt')}
              width={640}
              height={480}
              priority
              className="max-h-[360px] w-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* ── Filter Bar (sticky) ──────────────────────────── */}
      <section className="sticky top-[68px] z-20 border-y border-[#E4DCCD] bg-[#FBF8F3]/95 backdrop-blur-md xl:top-[76px]">
        {/* Mobile toggle button */}
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          aria-expanded={filtersOpen}
          className="flex w-full items-center justify-between px-4 py-3 text-sm font-bold text-[#0F172A] lg:hidden"
        >
          <span className="flex items-center gap-2">
            <SlidersHorizontal size={16} />
            {t('filterSearch')}
            {activeFilterCount > 0 && (
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#BE2F47] text-[10px] font-black text-white">
                {activeFilterCount}
              </span>
            )}
          </span>
          {filtersOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {/* Filter controls — always visible on lg+, collapsible on mobile */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} border-t border-[#EFE9DE] px-4 pb-3 lg:block lg:border-t-0 lg:px-0 lg:pb-0`}>
          <div className={`${home.wrap} grid grid-cols-1 items-center gap-2.5 py-3 sm:grid-cols-2 lg:flex`}>
            <div className="relative min-w-[180px] flex-1">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filterSearch')}
                aria-label={t('filterSearch')}
                className="w-full rounded-full border border-[#E4DCCD] bg-white py-2.5 pl-10 pr-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A]"
              />
            </div>

            <select value={type} onChange={(e) => setType(e.target.value as FilterType)} aria-label={t('filterAll')} className={fieldClass}>
              <option value="all">{t('filterAll')}</option>
              {LISTING_CATEGORIES.map((cat) => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}
            </select>

            <select value={sector} onChange={(e) => setSector(e.target.value)} aria-label={t('filterAllSectors')} className={fieldClass}>
              <option value="all">{t('filterAllSectors')}</option>
              {getAllSectors(locale as 'az' | 'en' | 'ru' | 'tr').map((sec) => (<option key={sec.value} value={sec.value}>{sec.label}</option>))}
            </select>

            <select value={city} onChange={(e) => setCity(e.target.value)} className={fieldClass}>
              {CITY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>

            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className={fieldClass}>
              {PRICE_RANGE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>

            <button type="button" onClick={handleReset}
              className="w-full rounded-full border border-[#E4DCCD] bg-white px-4 py-2.5 text-sm font-bold text-[#0F172A] transition hover:border-[#BE2F47] hover:text-[#BE2F47] sm:col-span-2 lg:w-auto">
              {t('filterReset')}
            </button>
          </div>
        </div>
      </section>

      {/* ── Listing Grid ─────────────────────────────────── */}
      <section className={`${home.wrap} py-10`}>
        {loading ? (
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white">
                <div className="aspect-[16/9] animate-pulse bg-[#EFE9DE]" />
                <div className="space-y-3 p-5">
                  <div className="h-6 w-3/4 animate-pulse rounded-full bg-[#EFE9DE]" />
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#EFE9DE]" />
                  <div className="h-5 w-1/3 animate-pulse rounded-full bg-[#EFE9DE]" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="rounded-[22px] border border-dashed border-[#E4DCCD] bg-white px-6 py-16 text-center">
            <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#FBF8F3] ring-1 ring-[#E4DCCD]">
              <PackageSearch className="h-8 w-8 text-[#BE2F47]" />
            </div>
            <h2 className="mt-5 text-[22px] font-black tracking-[-0.02em] text-[#0F172A]">{t('emptyTitle')}</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-600">{loadError || t('emptyBody')}</p>
            <button type="button" onClick={handleReset}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-sm font-bold text-white transition hover:bg-dk-red-deep">
              {t('emptyReset')}
            </button>
          </div>
        ) : (
          <>
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <h2 className="text-[clamp(22px,2.6vw,30px)] font-black leading-tight tracking-[-0.03em] text-[#0F172A]">{t('activeTitle')}</h2>
                <p className="mt-1 text-sm text-slate-600">{t('activeCount', { count: filteredListings.length })}</p>
              </div>
              <div className="hidden rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-800 md:inline-flex">
                {t('verifiedOnly')}
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} onOpen={setActiveListing} tone="v2" />
              ))}
            </div>
          </>
        )}
      </section>

      <ListingModal listing={activeListing} onClose={() => setActiveListing(null)} tone="v2" />
    </div>
  );
}
