'use client';

import Link from 'next/link';
import Image from 'next/image';
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
import { normalizeLocale, type Locale } from '@/i18n/config';

type FilterType = 'all' | ListingCategory;

interface PageCopy {
  badge: string;
  title: string;
  subtitle: string;
  imageAlt: string;
  ctaPost: string;
  ctaMyListings: string;
  filterAll: string;
  filterReset: string;
  loadingError: string;
  emptyTitle: string;
  emptyBody: string;
  emptyReset: string;
  activeTitle: string;
  activeCount: (n: number) => string;
  verifiedOnly: string;
}

const copy: Record<Locale, PageCopy> = {
  az: {
    badge: 'HoReCa Marketplace',
    title: 'HoReCa Elanları',
    subtitle:
      'Azərbaycanın ən böyük HoReCa elan platforması. Restoran devri, franchise, ortaq axtarışı, obyekt icarəsi və peşəkar avadanlıq bir vitrində.',
    imageAlt: 'HoReCa investor təqdimatı',
    ctaPost: 'Elan ver',
    ctaMyListings: 'Elanlarıma bax',
    filterAll: 'Bütün kateqoriyalar',
    filterReset: 'Sıfırla',
    loadingError: 'Elanlar yüklənə bilmədi',
    emptyTitle: 'Bu filtrə uyğun elan tapılmadı',
    emptyBody: 'Filtrləri sıfırla və ya başqa kateqoriya seç. Yeni elanlar vitrində davamlı yenilənəcək.',
    emptyReset: 'Filtrləri sıfırla',
    activeTitle: 'Vitrində olan elanlar',
    activeCount: (n) => `Hazırda ${n} aktiv showcase elanı görünür.`,
    verifiedOnly: 'Yalnız təsdiqlənmiş elanlar göstərilir',
  },
  tr: {
    badge: 'HoReCa Marketplace',
    title: 'HoReCa İlanları',
    subtitle:
      'Azerbaycan\'ın en büyük HoReCa ilan platforması. Restoran devri, franchise, ortak arayışı, mekan kiralaması ve profesyonel ekipman tek vitrinde.',
    imageAlt: 'HoReCa yatırımcı sunumu',
    ctaPost: 'İlan ver',
    ctaMyListings: 'İlanlarıma bak',
    filterAll: 'Tüm kategoriler',
    filterReset: 'Sıfırla',
    loadingError: 'İlanlar yüklenemedi',
    emptyTitle: 'Bu filtreye uygun ilan bulunamadı',
    emptyBody: 'Filtreleri sıfırla veya başka kategori seç. Yeni ilanlar vitrinde sürekli güncellenecek.',
    emptyReset: 'Filtreleri sıfırla',
    activeTitle: 'Vitrindeki ilanlar',
    activeCount: (n) => `Şu anda ${n} aktif showcase ilanı görünüyor.`,
    verifiedOnly: 'Yalnızca onaylı ilanlar gösteriliyor',
  },
  en: {
    badge: 'HoReCa Marketplace',
    title: 'HoReCa Listings',
    subtitle:
      "Azerbaijan's largest HoReCa listing platform. Restaurant transfers, franchise, partner search, venue lease, and professional equipment — all in one place.",
    imageAlt: 'HoReCa investor presentation',
    ctaPost: 'Post a listing',
    ctaMyListings: 'My listings',
    filterAll: 'All categories',
    filterReset: 'Reset',
    loadingError: 'Failed to load listings',
    emptyTitle: 'No listings match this filter',
    emptyBody: 'Reset the filters or choose another category. New listings are continuously added to the showcase.',
    emptyReset: 'Reset filters',
    activeTitle: 'Active listings',
    activeCount: (n) => `${n} active showcase listing${n === 1 ? '' : 's'} currently shown.`,
    verifiedOnly: 'Verified listings only',
  },
  ru: {
    badge: 'HoReCa Marketplace',
    title: 'Объявления HoReCa',
    subtitle:
      'Крупнейшая платформа объявлений HoReCa в Азербайджане. Передача ресторана, франшиза, поиск партнёра, аренда помещения и профессиональное оборудование — всё в одном месте.',
    imageAlt: 'Презентация для инвесторов HoReCa',
    ctaPost: 'Разместить объявление',
    ctaMyListings: 'Мои объявления',
    filterAll: 'Все категории',
    filterReset: 'Сбросить',
    loadingError: 'Не удалось загрузить объявления',
    emptyTitle: 'Объявления по этому фильтру не найдены',
    emptyBody: 'Сбросьте фильтры или выберите другую категорию. Новые объявления постоянно добавляются в витрину.',
    emptyReset: 'Сбросить фильтры',
    activeTitle: 'Объявления в витрине',
    activeCount: (n) => `Сейчас отображается ${n} активных объявлений.`,
    verifiedOnly: 'Показываются только верифицированные объявления',
  },
};

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

function useLocaleFromPath(): Locale {
  const pathname = usePathname();
  const match = pathname?.match(/^\/(ru|en|tr)\//);
  return normalizeLocale(match?.[1]);
}

export default function ListingsShowcasePage() {
  const locale = useLocaleFromPath();
  const c = copy[locale];
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
        const response = await fetch(`/api/listings?showcase=true&locale=${locale}`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: MockListing[] };
        if (!cancelled && Array.isArray(payload.data) && payload.data.length > 0) {
          setListings(payload.data);
          setLoadError('');
        }
      } catch {
        if (!cancelled) {
          setListings(MOCK_LISTINGS);
          setLoadError(c.loadingError);
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
  }, [locale, c.loadingError]);

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

  const ilanVerHref = locale === 'az' ? '/ilan-ver' : `/${locale}/ilan-ver`;
  const ilanlarimHref = locale === 'az' ? '/b2b-panel/ilanlarim' : `/${locale}/b2b-panel/ilanlarim`;

  return (
    <>
      <div className="min-h-screen bg-white pb-24">
        <section className="border-b border-slate-200 bg-[linear-gradient(180deg,rgba(26,26,46,0.05),rgba(255,255,255,1))] py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                {c.badge}
              </span>
              <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)] lg:text-6xl">
                {c.title}
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">{c.subtitle}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={ilanVerHref}
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white transition hover:opacity-95"
                >
                  {c.ctaPost}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={ilanlarimHref}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:border-[var(--dk-gold)]"
                >
                  {c.ctaMyListings}
                </Link>
              </div>
            </div>
            <Image
              src="/images/yatirimci-sunumu.png"
              alt={c.imageAlt}
              width={640}
              height={480}
              priority
              className="hidden max-h-[400px] w-full object-contain lg:block"
            />
          </div>
        </section>

        <section className="sticky top-16 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl gap-3 overflow-x-auto px-4 py-4 sm:px-6 lg:px-8">
            <select
              value={type}
              onChange={(event) => setType(event.target.value as FilterType)}
              className="min-w-[220px] rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[var(--dk-gold)]"
            >
              <option value="all">{c.filterAll}</option>
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
              {c.filterReset}
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
                {c.emptyTitle}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-slate-500">
                {loadError || c.emptyBody}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
              >
                {c.emptyReset}
              </button>
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">
                    {c.activeTitle}
                  </h2>
                  <p className="mt-2 text-sm text-slate-500">{c.activeCount(filteredListings.length)}</p>
                </div>
                <div className="hidden rounded-full bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-600 md:inline-flex">
                  {c.verifiedOnly}
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
