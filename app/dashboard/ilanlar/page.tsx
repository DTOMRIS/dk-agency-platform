'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  CheckSquare,
  Square,
  Loader2,
} from 'lucide-react';
import { LISTING_CATEGORIES } from '@/lib/data/listingCategories';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { getStatusBadge, type ListingWorkflowStatus } from '@/lib/utils/listingStatus';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getSectorLabel } from '@/lib/data/listingSectors';
import { AZ_NUMBER_LOCALE, formatAzDate } from '@/lib/i18n/format';

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
    newListing: string;
    selectedCount: string;
    batchToReview: string;
    batchToShowcase: string;
    rejectReasonPlaceholder: string;
    batchReject: string;
    batchCancel: string;
    colSector: string;
    colAge: string;
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
    newListing: 'Yeni elan yarat',
    selectedCount: 'elan seçildi',
    batchToReview: 'İncələməyə göndər',
    batchToShowcase: 'Vitrinə al',
    rejectReasonPlaceholder: 'Rədd səbəbi...',
    batchReject: 'Rədd et',
    batchCancel: 'Ləğv et',
    colSector: 'Sektor',
    colAge: 'Yaş',
  },
  ru: {
    pageTitle: 'Управление объявлениями',
    pageSubtitle:
      'Список объявлений работает с DB-запросом, фильтром статуса, поиском и пагинацией.',
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
    paginationSummary: (total, current, pages) =>
      `${total} результатов, страница ${current}/${pages}`,
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
    newListing: 'Создать объявление',
    selectedCount: 'объявл. выбрано',
    batchToReview: 'Отправить на рассмотрение',
    batchToShowcase: 'В витрину',
    rejectReasonPlaceholder: 'Причина отклонения...',
    batchReject: 'Отклонить',
    batchCancel: 'Отмена',
    colSector: 'Сектор',
    colAge: 'Возраст',
  },
  en: {
    pageTitle: 'Listing Management',
    pageSubtitle:
      'The listing table is powered by DB queries with status filtering, search, and pagination.',
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
    newListing: 'Create listing',
    selectedCount: 'listings selected',
    batchToReview: 'Send to review',
    batchToShowcase: 'Move to showcase',
    rejectReasonPlaceholder: 'Rejection reason...',
    batchReject: 'Reject',
    batchCancel: 'Cancel',
    colSector: 'Sector',
    colAge: 'Age',
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
    newListing: 'Yeni ilan oluştur',
    selectedCount: 'ilan seçildi',
    batchToReview: 'İncelemeye gönder',
    batchToShowcase: 'Vitrine al',
    rejectReasonPlaceholder: 'Ret sebebi...',
    batchReject: 'Reddet',
    batchCancel: 'İptal',
    colSector: 'Sektör',
    colAge: 'Yaş',
  },
};

type StatusFilter = (typeof STATUS_FILTERS)[number]['key'];

function formatPrice(price: number, currency: string, priceLabel?: string) {
  if (priceLabel) return priceLabel;
  return `${new Intl.NumberFormat(AZ_NUMBER_LOCALE).format(price)} ${currency}`;
}

function formatDate(value: string) {
  return formatAzDate(value, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
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
              !selected || selected.apiStatus === 'all'
                ? true
                : listing.status === selected.apiStatus;
            const matchesQuery =
              !query ||
              listing.title.toLowerCase().includes(query) ||
              listing.trackingCode.toLowerCase().includes(query);
            return matchesStatus && matchesQuery;
          }).sort((a, b) => b.createdAt.localeCompare(a.createdAt));

          const allStats = {
            total: MOCK_LISTINGS.length,
            pending: MOCK_LISTINGS.filter((item) =>
              ['submitted', 'ai_checked', 'committee_review'].includes(item.status)
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

  const handleBatchStatus = useCallback(
    async (targetStatus: ListingWorkflowStatus) => {
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
    },
    [selectedIds, batchReason]
  );

  function getAgeBadge(createdAt: string) {
    const days = Math.floor((Date.now() - new Date(createdAt).getTime()) / 86400000);
    if (days === 0) return { label: 'Yeni', color: 'bg-emerald-50 text-emerald-700' };
    if (days <= 2) return { label: `${days} gün`, color: 'bg-blue-50 text-blue-700' };
    if (days <= 7) return { label: `${days} gün`, color: 'bg-amber-50 text-amber-700' };
    return { label: `${days} gün`, color: 'bg-rose-50 text-rose-700' };
  }

  const cardCls =
    'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]';

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">{copy.pageTitle}</h1>
            <p className="mt-1 text-[15px] text-slate-600">{copy.pageSubtitle}</p>
          </div>
          <Link
            href="/dashboard/ilanlar/yarat"
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E11D48] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C]"
          >
            <Plus className="h-4 w-4" />
            {copy.newListing}
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: copy.statTotal, value: stats.total, dot: 'bg-slate-400' },
            { label: copy.statPending, value: stats.pending, dot: 'bg-amber-500' },
            { label: copy.statShowcase, value: stats.showcase, dot: 'bg-emerald-500' },
            { label: copy.statRejected, value: stats.rejected, dot: 'bg-rose-500' },
          ].map((card) => (
            <div key={card.label} className={`${cardCls} p-5`}>
              <div className="flex items-center gap-2">
                <span className={`h-2 w-2 shrink-0 rounded-full ${card.dot}`} aria-hidden="true" />
                <p className="truncate text-[14px] font-medium text-slate-600">{card.label}</p>
              </div>
              <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
                {card.value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="inline-flex gap-1 rounded-full bg-white p-1 shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
              {STATUS_FILTERS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  aria-pressed={statusFilter === tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setPage(1);
                  }}
                  className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
                    statusFilter === tab.key ? 'bg-[#EEF4FF] text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {copy.statusLabels[tab.key] ?? tab.key}
                </button>
              ))}
            </div>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" aria-hidden="true" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder={copy.searchPlaceholder}
              aria-label={copy.searchPlaceholder}
              className="h-11 w-full rounded-full border-0 bg-white pl-10 pr-4 text-[14px] text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition focus:ring-2 focus:ring-[#0A7AFF]/30"
            />
          </div>
        </div>

        {/* Batch action bar */}
        {selectedIds.size > 0 && (
          <div className={`${cardCls} flex flex-wrap items-center gap-2 p-3 sm:p-4`}>
            <span className="inline-flex h-8 items-center rounded-full bg-[#EEF4FF] px-3 text-[13px] font-semibold text-[#0A5BD6]">
              {selectedIds.size} {copy.selectedCount}
            </span>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus('committee_review')}
              className="inline-flex h-8 items-center rounded-full bg-amber-50 px-3 text-[12px] font-semibold text-amber-800 transition-colors hover:bg-amber-100 disabled:opacity-50"
            >
              {copy.batchToReview}
            </button>
            <button
              type="button"
              disabled={batchLoading}
              onClick={() => handleBatchStatus('showcase_ready')}
              className="inline-flex h-8 items-center rounded-full bg-emerald-50 px-3 text-[12px] font-semibold text-emerald-700 transition-colors hover:bg-emerald-100 disabled:opacity-50"
            >
              {copy.batchToShowcase}
            </button>
            <div className="flex w-full items-center gap-2 sm:w-auto">
              <input
                value={batchReason}
                onChange={(e) => setBatchReason(e.target.value)}
                placeholder={copy.rejectReasonPlaceholder}
                aria-label={copy.rejectReasonPlaceholder}
                className="h-8 min-w-0 flex-1 rounded-full border border-rose-200 bg-white px-3 text-[12px] text-slate-800 outline-none focus:border-rose-400 sm:w-48 sm:flex-none"
              />
              <button
                type="button"
                disabled={batchLoading || !batchReason.trim()}
                onClick={() => handleBatchStatus('rejected')}
                className="inline-flex h-8 shrink-0 items-center rounded-full bg-rose-50 px-3 text-[12px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
              >
                {copy.batchReject}
              </button>
            </div>
            <button
              type="button"
              onClick={() => { setSelectedIds(new Set()); setBatchReason(''); }}
              className="ml-auto inline-flex h-8 items-center rounded-full px-3 text-[12px] font-semibold text-slate-700 hover:bg-slate-100"
            >
              {copy.batchCancel}
            </button>
            {batchLoading && <Loader2 className="h-4 w-4 animate-spin text-slate-500" />}
          </div>
        )}

        <div className={`${cardCls} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-sm">
              <thead>
                <tr className="text-left text-[12px] uppercase tracking-wide text-slate-500">
                  <th className="w-10 px-4 py-4">
                    <button type="button" onClick={toggleAll} className="text-slate-600 hover:text-slate-900">
                      {selectedIds.size === listings.length && listings.length > 0 ? <CheckSquare className="h-4 w-4 text-[#0A5BD6]" /> : <Square className="h-4 w-4" />}
                    </button>
                  </th>
                  <th className="px-4 py-4 font-semibold">{copy.colTrackingCode}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colTitle}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colCategory}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colSector}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colCity}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colPrice}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colStatus}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colAge}</th>
                  <th className="px-4 py-4 font-semibold">{copy.colReview}</th>
                </tr>
              </thead>
              <tbody>
                {listings.map((listing) => {
                  const category = LISTING_CATEGORIES.find((item) => item.id === listing.type);
                  const badge = getStatusBadge(listing.status);
                  const age = getAgeBadge(listing.createdAt);
                  const isSelected = selectedIds.has(listing.id);

                  return (
                    <tr
                      key={listing.id}
                      className={`border-t border-slate-100 text-slate-600 transition-colors ${isSelected ? 'bg-[#EEF4FF]/60' : 'hover:bg-[#F9F9FB]'}`}
                    >
                      <td className="px-4 py-3.5">
                        <button type="button" onClick={() => toggleSelect(listing.id)} className="text-slate-600 hover:text-slate-900">
                          {isSelected ? <CheckSquare className="h-4 w-4 text-[#0A5BD6]" /> : <Square className="h-4 w-4" />}
                        </button>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-mono text-[12px] font-semibold text-slate-700">{listing.trackingCode}</td>
                      <td className="max-w-[260px] px-4 py-3.5">
                        <div className="truncate font-medium text-slate-900">{listing.title}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                          {category?.label ?? listing.type}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {listing.sector ? (
                          <span className="inline-flex whitespace-nowrap rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-700">
                            {getSectorLabel(listing.sector, locale)}
                          </span>
                        ) : (
                          <span className="text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{listing.city}</td>
                      <td className="whitespace-nowrap px-4 py-3.5 font-semibold text-slate-900 tabular-nums">
                        {formatPrice(listing.price, listing.currency, listing.priceLabel)}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex whitespace-nowrap rounded-full border px-2.5 py-1 text-[12px] font-semibold ${badge.color}`}>
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${age.color}`}>
                          {age.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <Link
                          href={`/dashboard/ilanlar/${listing.id}`}
                          className="inline-flex h-8 items-center whitespace-nowrap rounded-full bg-[#EEF4FF] px-3 text-[12px] font-semibold text-[#0A5BD6] transition-colors hover:bg-[#E0EBFF]"
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
            <div className="px-6 py-16 text-center text-sm text-slate-600">{copy.emptyState}</div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-5 py-4">
            <p className="text-[13px] text-slate-600">
              {loading ? copy.loading : copy.paginationSummary(total, currentPage, totalPages)}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-[#F2F2F7] px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                {copy.prevPage}
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex h-9 items-center gap-1 rounded-full bg-[#F2F2F7] px-4 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-40"
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
