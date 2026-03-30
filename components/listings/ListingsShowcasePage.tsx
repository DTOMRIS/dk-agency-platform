'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, PackageSearch } from 'lucide-react';
import ListingCard from '@/components/listings/ListingCard';
import ListingModal from '@/components/listings/ListingModal';
import {
  CITY_OPTIONS,
  LISTING_CATEGORIES,
  PRICE_RANGE_OPTIONS,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';

type FilterType = 'all' | ListingCategory;

function normalizeParam(value: string | null) {
  return value ?? 'all';
}

function normalizeCityForQuery(city: string) {
  const map: Record<string, string> = {
    Bakı: 'baki',
    Sumqayıt: 'sumqayit',
    Gəncə: 'gence',
    Mingəçevir: 'mingecevir',
    Lənkəran: 'lenkeran',
    Şəki: 'seki',
    Qusar: 'qusar',
  };

  return map[city] ?? city.toLowerCase();
}

export default function ListingsShowcasePage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<FilterType>('all');
  const [city, setCity] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<MockListing[]>(MOCK_LISTINGS);
  const [loadError, setLoadError] = useState('');
  const [activeListing, setActiveListing] = useState<MockListing | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setType(normalizeParam(searchParams.get('type')) as FilterType);
    setCity(normalizeParam(searchParams.get('city')));
    setPriceRange(normalizeParam(searchParams.get('price')));
    setInitialized(true);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      try {
        const response = await fetch('/api/listings?showcase=true');
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing[] };
        if (!cancelled && Array.isArray(payload.data) && payload.data.length > 0) {
          setListings(payload.data);
          setLoadError('');
        }
      } catch {
        if (!cancelled) {
          setListings(MOCK_LISTINGS);
          setLoadError('Elanlar yüklənə bilmədi');
        }
      } finally {
        if (!cancelled) {
          window.setTimeout(() => setLoading(false), 220);
        }
      }
    }

    void loadListings();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!initialized) return;

    const params = new URLSearchParams();
    if (type !== 'all') params.set('type', type);
    if (city !== 'all') params.set('city', city);
    if (priceRange !== 'all') params.set('price', priceRange);

    const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(next, { scroll: false });
  }, [city, initialized, pathname, priceRange, router, type]);

  const filteredListings = useMemo(() => {
    const range = PRICE_RANGE_OPTIONS.find((item) => item.value === priceRange) ?? PRICE_RANGE_OPTIONS[0];

    return listings.filter((listing) => {
      const typeMatch = type === 'all' || listing.type === type;
      const cityMatch = city === 'all' || normalizeCityForQuery(listing.city) === city;
      const priceMatch =
        priceRange === 'all'
          ? true
          : listing.price >= range.min && (range.max === null || listing.price <= range.max);

      return listing.isShowcase && typeMatch && cityMatch && priceMatch;
    });
  }, [city, listings, priceRange, type]);

  const handleReset = () => {
    setType('all');
    setCity('all');
    setPriceRange('all');
  };

  return (
    <>
      <div className="min-h-screen bg-white pb-24">
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(26,26,46,0.05),rgba(255,255,255,1))] py-16 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl">
              <span className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                HoReCa Marketplace
              </span>
              <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)] lg:text-6xl">
                HoReCa Elanları
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Azərbaycanın ən böyük HoReCa elan platforması. Restoran devri, franchise,
                ortaq axtarışı, obyekt icarəsi və peşəkar avadanlıq bir vitrində.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/ilan-ver"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-95"
                >
                  Elan ver
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/b2b-panel/ilanlarim"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:border-[var(--dk-gold)]"
                >
                  Elanlarıma bax
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as FilterType)}
              className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]"
            >
              <option value="all">Bütün kateqoriyalar</option>
              {LISTING_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>

            <select
              value={city}
              onChange={(event) => setCity(event.target.value)}
              className="min-w-[180px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]"
            >
              {CITY_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              value={priceRange}
              onChange={(event) => setPriceRange(event.target.value)}
              className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]"
            >
              {PRICE_RANGE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleReset}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:border-[var(--dk-red)] hover:text-[var(--dk-red)]"
            >
              Sıfırla
            </button>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm"
                >
                  <div className="aspect-[16/9] animate-pulse bg-slate-200" />
                  <div className="space-y-3 p-5">
                    <div className="h-6 w-3/4 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-1/2 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-5 w-1/3 animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-full animate-pulse rounded-full bg-slate-200" />
                    <div className="h-4 w-4/5 animate-pulse rounded-full bg-slate-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-slate-300 bg-slate-50 px-6 py-16 text-center">
              <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-sm">
                <PackageSearch className="h-8 w-8 text-[var(--dk-gold)]" />
              </div>
              <h2 className="mt-5 font-display text-3xl font-black text-[var(--dk-navy)]">
                Bu filtrə uyğun elan tapılmadı
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                {loadError || 'Filtrləri sıfırla və ya başqa kateqoriya seç. Yeni elanlar vitrində davamlı yenilənəcək.'}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
              >
                Filtrləri sıfırla
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">
                    Vitrində olan elanlar
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Hazırda {filteredListings.length} aktiv showcase elanı görünür.
                  </p>
                </div>
                <div className="hidden rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 md:inline-flex">
                  Yalnız təsdiqlənmiş elanlar göstərilir
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
