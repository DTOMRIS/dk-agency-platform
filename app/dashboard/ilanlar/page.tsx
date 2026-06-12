'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, Plus, Search, CheckSquare, Square, Loader2 } from 'lucide-react';
import { LISTING_CATEGORIES } from '@/lib/data/listingCategories';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { getStatusBadge, type ListingWorkflowStatus } from '@/lib/utils/listingStatus';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getSectorLabel } from '@/lib/data/listingSectors';

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { key: 'all', apiStatus: 'all' },
  { key: 'submitted', apiStatus: 'submitted' },
  { key: 'ai_checked', apiStatus: 'ai_checked' },
  { key: 'committee_review', apiStatus: 'committee_review' },
  { key: 'showcase_ready', apiStatus: 'showcase_ready' },
  { key: 'rejected', apiStatus: 'rejected' },
] as const;

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    searchPlaceholder: string;
    statTotal: string;
    statPending: string;
    statShowcase: string;
    statRejected: string;
    colTrackingCode: string;
    colTitle: string;
    colCategory: string;
    colCity: string;
    colPrice: string;
    colStatus: string;
    colDate: string;
    colReview: string;
    reviewAction: string;
    emptyState: string;
    loading: string;
    paginationSummary: (total: number, current: number, pages: number) => string;
    prevPage: string;
    nextPage: string;
    statusLabels: Record<string, string>;
  }
> = {
  az: {
    pageTitle: 'Elan idarəetmə',
    pageSubtitle: 'Listing siyahısı DB sorğusu, status filteri, axtarış və səhifələmə ilə işləyir.',
    searchPlaceholder: 'Başlıq və ya tracking code ilə axtar',
    statTotal: 'Ümumi elan sayı',
    statPending: 'Gözləyən',
    statShowcase: 'Vitrində',
    statRejected: 'Rədd',
    colTrackingCode: 'Tracking code',
    colTitle: 'Başlıq',
    colCategory: 'Kateqoriya',
    colCity: 'Şəhər',
    colPrice: 'Qiymət',
    colStatus: 'Status',
    colDate: 'Tarix',
    colReview: 'İncələ',
    reviewAction: 'İncələ →',
    emptyState: 'Bu filtrə uyğun elan tapılmadı.',
    loading: 'Yüklənir...',
    paginationSummary: (total, current, pages) => `${total} nəticə, səhifə ${current}/${pages}`,
    prevPage: 'Geri',
    nextPage: 'İrəli',
    statusLabels: {
      all: 'Hamısı',
      submitted: 'Göndərildi',
      ai_checked: 'AI yoxlandı',
      committee_review: 'Komitə baxışı',
      showcase_ready: 'Vitrində',
      rejected: 'Rədd',
    },
  },
  ru: {
    pageTitle: 'Управление объявлениями',
    pageSubtitle: 'Список объявлений работает с DB-запросом, фильтром статуса, поиском и пагинацией.',
    searchPlaceholder: 'Поиск по заголовку или tracking code',
    statTotal: 'Всего объявлений',
    statPending: 'Ожидающие',
    statShowcase: 'В витрине',
    statRejected: 'Отклонённые',
    colTrackingCode: 'Tracking code',
    colTitle: 'Заголовок',
    colCategory: 'Категория',
    colCity: 'Город',
    colPrice: 'Цена',
    colStatus: 'Статус',
    colDate: 'Дата',
    colReview: 'Просмотр',
    reviewAction: 'Просмотр →',
    emptyState: 'Объявления по данному фильтру не найдены.',
    loading: 'Загрузка...',
    paginationSummary: (total, current, pages) => `${total} результатов, страница ${current}/${pages}`,
    prevPage: 'Назад',
    nextPage: 'Вперёд',
    statusLabels: {
      all: 'Все',
      submitted: 'Отправлено',
      ai_checked: 'Проверено AI',
      committee_review: 'На рассмотрении',
      showcase_ready: 'В витрине',
      rejected: 'Отклонено',
    },
  },
  en: {
    pageTitle: 'Listing Management',
    pageSubtitle: 'The listing table is powered by DB queries with status filtering, search, and pagination.',
    searchPlaceholder: 'Search by title or tracking code',
    statTotal: 'Total listings',
    statPending: 'Pending',
    statShowcase: 'In showcase',
    statRejected: 'Rejected',
    colTrackingCode: 'Tracking code',
    colTitle: 'Title',
    colCategory: 'Category',
    colCity: 'City',
    colPrice: 'Price',
    colStatus: 'Status',
    colDate: 'Date',
    colReview: 'Review',
    reviewAction: 'Review →',
    emptyState: 'No listings found for this filter.',
    loading: 'Loading...',
    paginationSummary: (total, current, pages) => `${total} results, page ${current}/${pages}`,
    prevPage: 'Back',
    nextPage: 'Next',
    statusLabels: {
      all: 'All',
      submitted: 'Submitted',
      ai_checked: 'AI checked',
      committee_review: 'Committee review',
      showcase_ready: 'In showcase',
      rejected: 'Rejected',
    },
  },
  tr: {
    pageTitle: 'İlan Yönetimi',
    pageSubtitle: 'İlan listesi DB sorgusu, durum filtresi, arama ve sayfalama ile çalışır.',
    searchPlaceholder: 'Başlık veya tracking code ile ara',
    statTotal: 'Toplam ilan sayısı',
    statPending: 'Bekleyen',
    statShowcase: 'Vitirinde',
    statRejected: 'Reddedilen',
    colTrackingCode: 'Tracking code',
    colTitle: 'Başlık',
    colCategory: 'Kategori',
    colCity: 'Şehir',
    colPrice: 'Fiyat',
    colStatus: 'Durum',
    colDate: 'Tarih',
    colReview: 'İncele',
    reviewAction: 'İncele →',
    emptyState: 'Bu filtreye uygun ilan bulunamadı.',
    loading: 'Yükleniyor...',
    paginationSummary: (total, current, pages) => `${total} sonuç, sayfa ${current}/${pages}`,
    prevPage: 'Geri',
    nextPage: 'İleri',
    statusLabels: {
      all: 'Hepsi',
      submitted: 'Gönderildi',
      ai_checked: 'AI kontrol edildi',
      committee_review: 'Komite incelemesi',
      showcase_ready: 'Vitirinde',
      rejected: 'Reddedildi',
    },
  },
};

type StatusFilter = (typeof STATUS_FILTERS)[number]['key'];

function formatPrice(price: number, currency: string, priceLabel?: string) {
  if (priceLabel) return priceLabel;
  return `${new Intl.NumberFormat('az-AZ').format(price)} ${currency}`;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('az-AZ', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value));
}

export default function DashboardIlanlarPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [listings, setListings] = useState<MockListing[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState({ total: 0, pending: 0, showcase: 0, rejected: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  // Batch selection
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchReason, setBatchReason] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadListings() {
      setLoading(true);
      try {
        const selected = STATUS_FILTERS.find((item) => item.key === statusFilter);
        const params = new URLSearchParams({
          scope: 'admin',
          limit: String(PAGE_SIZE),
          offset: String((page - 1) * PAGE_SIZE),
        });
        if (selected && selected.apiStatus !== 'all') params.set('status', selected.apiStatus);
        if (search.trim()) params.set('q', search.trim());

        const response = await fetch(`/api/listings?${params.toString()}`);
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as {
          data?: MockListing[];
          total?: number;
          stats?: { total: number; pending: number; showcase: number; rejected: number };
        };

        if (!cancelled) {
          setListings(Array.isArray(payload.data) ? payload.data : []);
          setTotal(payload.total ?? 0);
          if (payload.stats) {
            setStats(payload.stats);
          }
        }
      } catch {
        if (!cancelled) {
          const selected = STATUS_FILTERS.find((item) => item.key === statusFilter);
          const query = search.trim().toLowerCase();
          const fallback = MOCK_LISTINGS.filter((listing) => {
            const matchesStatus =
              !selected || selected.apiStatus === 'all' ? true : listing.status === selected.apiStatus;
            const matchesQuery =
              !query ||
              listing.title.toLowerCase().includes(query) ||
              listing.trackingCode.toLowerCase().includes(query);
            return matchesStatus && matchesQuery;
          }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

          const allStats = {
            total: MOCK_LISTINGS.length,
            pending: MOCK_LISTINGS.filter((item) =>
              ['submitted', 'ai_checked', 'committee_review'].includes(item.status),
            ).length,
            showcase: MOCK_LISTINGS.filter((item) => item.status === 'showcase_ready').length,
            rejected: MOCK_LISTINGS.filter((item) => item.status === 'rejected').length,
          };

          setTotal(fallback.length);
          setListings(fallback.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
          setStats(allStats);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadListings();
    return () => {
      cancelled = true;
    };
  }, [page, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  // Batch helpers
  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const toggleAll = useCallback(() => {
    if (selectedIds.size === listings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(listings.map((l) => l.id)));
    }
  }, [listings, selectedIds.size]);

  const handleBatchStatus = useCallback(async (targetStatus: ListingWorkflowStatus) => {
    if (selectedIds.size === 0) return;
    if (targetStatus === 'rejected' && !batchReason.trim()) return;
    setBatchLoading(true);
    try {
      const res = await fetch('/api/listings/batch-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          status: targetStatus,
          rejectedReason: targetStatus === 'rejected' ? batchReason.trim() : undefined,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh listings
        setSelectedIds(new Set());
        setBatchReason('');
        setPage(1);
        setStatusFilter('all');
      }
    } catch {
      // silent
    } finally {
      setBatchLoading(false);
    }
  }, [selectedIds, batchReason]);

  function getAgeBadge(createdAt: string) {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
    if (days === 0) return { label: 'Yeni', color: 'bg-emerald-50 text-emerald-700' };
    if (days <= 2) return { label: `${days} gün`, color: 'bg-blue-50 text-blue-700' };
    if (days <= 7) return { label: `${days} gün`, color: 'bg-amber-50 text-amber-700' };
    return { label: `${days} gün`, color: 'bg-rose-50 text-rose-700' };
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              OCAQ
            </span>
            <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
            <p className="mt-2 text-sm text-slate-500">
              {copy.pageSubtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/ilanlar/yarat"
              className="inline-flex items-center gap-2 rounded-2xl bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white shadow-sm transition hover:shadow-md"
            >
              <Plus className="h-4 w-4" />
              Yeni elan yarat
            </Link>
          </div>

          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={copy.searchPlaceholder}
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: copy.statTotal, value: stats.total, tone: 'bg-slate-100 text-slate-700' },
            { label: copy.statPending, value: stats.pending, tone: 'bg-amber-50 text-amber-700' },
            { label: copy.statShowcase, value: stats.showcase, tone: 'bg-emerald-50 text-emerald-700' },
            { label: copy.statRejected, value: stats.rejected, tone: 'bg-rose-50 text-rose-700' },
          ].map((card) => (
            <div key={card.label} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-bold ${card.tone}`}>
                {card.label}
              </div>
              <div className="mt-4 text-4xl font-black text-[var(--dk-navy)]">{card.value}</div>
            </div>
          ))}
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => {
                setStatusFilter(tab.key);
                setPage(1);
              }}
              className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                statusFilter === tab.key
                  ? 'bg-[var(--dk-red)] text-white'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-[var(--dk-gold)]'
              }`}
            >
              {copy.statusLabels[tab.key] ?? tab.key}
            </button>
          ))}
        </div>

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <span className="text-sm font-bold text-slate-700">
              {selectedIds.size} elan seçildi
            </span>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus('committee_review')}
              className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              İncələməyə göndər
            </button>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus('showcase_ready')}
              className="rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              Vitrinə al
            </button>
            <div className="flex items-center gap-2">
              <input
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
                placeholder="Rədd səbəbi..."
                className="rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs outline-none focus:border-rose-400 w-48"
              />
              <button
                type="button"
                disabled={batchLoading || !batchReason.trim()}
                onClick={() => handleBatchStatus('rejected')}
                className="rounded-full bg-rose-500 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
              >
                Rədd et
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedIds(new Set()); setBatchReason(''); }}
              className="ml-auto text-xs font-semibold text-slate-500 hover:text-slate-700"
            >
              Ləğv et
            </button>
            {batchLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          </div>
        )}

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-3 py-4 w-10">
                    <button type="button" onClick={toggleAll} className="text-slate-400 hover:text-slate-700">
                      {selectedIds.size === listings.length && listings.length > 0 ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="px-5 py-4">{copy.colTrackingCode}</th>
                  <th className="px-5 py-4">{copy.colTitle}</th>
                  <th className="px-5 py-4">{copy.colCategory}</th>
                  <th className="px-5 py-4">Sektor</th>
                  <th className="px-5 py-4">{copy.colCity}</th>
                  <th className="px-5 py-4">{copy.colPrice}</th>
                  <th className="px-5 py-4">{copy.colStatus}</th>
                  <th className="px-5 py-4">Yaş</th>
                  <th className="px-5 py-4">{copy.colReview}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((listing) => {
                  const category = LISTING_CATEGORIES.find((item) => item.id === listing.type);
                  const badge = getStatusBadge(listing.status);
                  const age = getAgeBadge(listing.createdAt);
                  const isSelected = selectedIds.has(listing.id);

                  return (
                    <tr key={listing.id} className={`text-sm text-slate-600 ${isSelected ? 'bg-blue-50/50' : ''}`}>
                      <td className="px-3 py-4">
                        <button type="button" onClick={() => toggleSelect(listing.id)} className="text-slate-400 hover:text-slate-700">
                          {isSelected ? <CheckSquare className="h-4 w-4 text-[var(--dk-red)]" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="px-5 py-4 font-bold text-[var(--dk-navy)]">{listing.trackingCode}</td>
                      <td className="max-w-[260px] px-5 py-4">
                        <div className="truncate font-semibold text-slate-900">{listing.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                          {category?.label ?? listing.type}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {listing.sector ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600">
                            {getSectorLabel(listing.sector, locale)}
                          </span>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                      <td className="px-5 py-4">{listing.city}</td>
                      <td className="px-5 py-4 font-semibold text-[var(--dk-gold)]">
                        {formatPrice(listing.price, listing.currency, listing.priceLabel)}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold ${age.color}`}>
                          {age.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/ilanlar/${listing.id}`}
                          className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white"
                        >
                          {copy.reviewAction}
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && listings.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">{copy.emptyState}</div>
          ) : null}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {loading ? copy.loading : copy.paginationSummary(total, currentPage, totalPages)}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {copy.prevPage}
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                {copy.nextPage}
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
