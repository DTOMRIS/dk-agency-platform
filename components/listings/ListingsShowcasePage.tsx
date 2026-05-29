'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, PackageSearch, Search } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ListingModal from '@/components/listings/ListingModal';
import {
  CITY_OPTIONS,
  LISTING_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { getAllSectors } from '@/lib/data/listingSectors';

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
  const [listings, setListings] = useState<MockListing[]>(MOCK_LISTINGS);
  const [loadError, setLoadError] = useState('');
  const [activeListing, setActiveListing] = useState<MockListing | null>(null);
  const [initialized, setInitialized] = useState(false);

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
        const response = await fetch(`/api/listings?showcase=true&locale=${locale}`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing[] };
        if (!cancelled && Array.isArray(payload.data) && payload.data.length > 0) {
          setListings(payload.data);
          setLoadError('');
        }
      } catch {
        if (!cancelled) { setListings(MOCK_LISTINGS); setLoadError(t('loadingError')); }
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

  return (
    <>
      <div className="min-h-screen bg-[var(--dk-paper)] pb-24">
        {/* ── Hero ──────────────────────────────────────────── */}
        <section className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[var(--dk-navy)] to-slate-950 py-16 sm:py-20">
          <div className="absolute inset-0">
            <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--dk-gold)]/8 blur-[100px]" />
          </div>
          <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-[var(--dk-gold)]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dk-gold)]">
                {t('badge')}
              </span>
              <h1 className="mt-5 font-display text-4xl font-black text-white lg:text-5xl">
                {t('title')}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-400">{t('subtitle')}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={ilanVerHref} className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:opacity-90">
                  {t('ctaPost')} <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href={ilanlarimHref} className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-6 py-3 text-sm font-bold text-white transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-gold)]">
                  {t('ctaMyListings')}
                </Link>
              </div>
            </div>
            <Image
              src="/images/yatirimci-sunumu.png"
              alt={t('imageAlt')}
              width={640}
              height={480}
              priority
              className="hidden max-h-[400px] w-full object-contain lg:block"
            />
          </div>
        </section>

        {/* ── Filter Bar (sticky) ──────────────────────────── */}
        <section className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('filterSearch')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-4 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20"
              />
            </div>

            <select value={type} onChange={(e) => setType(e.target.value as FilterType)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]">
              <option value="all">{t('filterAll')}</option>
              {LISTING_CATEGORIES.map((cat) => (<option key={cat.id} value={cat.id}>{cat.label}</option>))}
            </select>

            <select value={sector} onChange={(e) => setSector(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]">
              <option value="all">{t('filterAllSectors')}</option>
              {getAllSectors(locale as 'az' | 'en' | 'ru' | 'tr').map((s) => (<option key={s.value} value={s.value}>{s.label}</option>))}
            </select>

            <select value={city} onChange={(e) => setCity(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]">
              {CITY_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>

            <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]">
              {PRICE_RANGE_OPTIONS.map((opt) => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>

            <button type="button" onClick={handleReset}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 transition hover:border-[var(--dk-red)] hover:text-[var(--dk-red)]">
              {t('filterReset')}
            </button>
          </div>
        </section>

        {/* ── Listing Grid ─────────────────────────────────── */}
        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="aspect-[16/9] animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 shadow-sm">
                <PackageSearch className="h-8 w-8 text-[var(--dk-gold)]" />
              </div>
              <h2 className="mt-5 font-display text-2xl font-black text-[var(--dk-navy)]">{t('emptyTitle')}</h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">{loadError || t('emptyBody')}</p>
              <button type="button" onClick={handleReset}
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)]">
                {t('emptyReset')}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">{t('activeTitle')}</h2>
                  <p className="mt-1 text-sm text-slate-500">{t('activeCount', { count: filteredListings.length })}</p>
                </div>
                <div className="hidden rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold text-emerald-700 md:inline-flex">
                  {t('verifiedOnly')}
                </div>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {filteredListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} onOpen={setActiveListing} />
                ))}
              </div>
            </>
          )}
        </section>
      </div>

      <ListingModal listing={activeListing} onClose={() => setActiveListing(null)} />
    </>
  );
}
