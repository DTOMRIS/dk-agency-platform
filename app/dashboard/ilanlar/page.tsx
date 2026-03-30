'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { LISTING_CATEGORIES } from '@/lib/data/listingCategories';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';
import { getStatusBadge } from '@/lib/utils/listingStatus';

const PAGE_SIZE = 10;

const STATUS_FILTERS = [
  { key: 'all', label: 'Hamısı' },
  { key: 'pending', label: 'Gözləyən' },
  { key: 'review', label: 'İncələnir' },
  { key: 'showcase', label: 'Vitrində' },
  { key: 'rejected', label: 'Rədd' },
] as const;

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
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

  const stats = useMemo(() => {
    const total = MOCK_LISTINGS.length;
    const pending = MOCK_LISTINGS.filter((listing) =>
      ['submitted', 'ai_checked', 'committee_review'].includes(listing.status)
    ).length;
    const showcase = MOCK_LISTINGS.filter((listing) => listing.status === 'showcase_ready').length;
    const rejected = MOCK_LISTINGS.filter((listing) => listing.status === 'rejected').length;
    return { total, pending, showcase, rejected };
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return MOCK_LISTINGS.filter((listing) => {
      const matchesQuery =
        !query ||
        listing.trackingCode.toLowerCase().includes(query) ||
        listing.title.toLowerCase().includes(query);

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'pending'
            ? ['submitted', 'ai_checked', 'committee_review'].includes(listing.status)
            : statusFilter === 'review'
              ? ['committee_review', 'docs_requested', 'shortlisted'].includes(listing.status)
              : statusFilter === 'showcase'
                ? listing.status === 'showcase_ready'
                : listing.status === 'rejected';

      return matchesQuery && matchesStatus;
    });
  }, [search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              OCAQ
            </span>
            <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">
              Elan İdarəetmə
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              Bütün elanlar, status axını və vitrin qərarları buradan idarə olunur.
            </p>
          </div>

          <div className="relative max-w-md flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Tracking code və ya başlıq ilə axtar"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Ümumi elan sayı', value: stats.total, tone: 'bg-slate-100 text-slate-700' },
            { label: 'Gözləyən', value: stats.pending, tone: 'bg-amber-50 text-amber-700' },
            { label: 'Vitrində', value: stats.showcase, tone: 'bg-emerald-50 text-emerald-700' },
            { label: 'Rədd', value: stats.rejected, tone: 'bg-rose-50 text-rose-700' },
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
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                  <th className="px-5 py-4">Tracking code</th>
                  <th className="px-5 py-4">Başlıq</th>
                  <th className="px-5 py-4">Kateqoriya</th>
                  <th className="px-5 py-4">Şəhər</th>
                  <th className="px-5 py-4">Qiymət</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Tarix</th>
                  <th className="px-5 py-4">İncələ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paged.map((listing) => {
                  const category = LISTING_CATEGORIES.find((item) => item.id === listing.type);
                  const badge = getStatusBadge(listing.status);

                  return (
                    <tr key={listing.id} className="text-sm text-slate-600">
                      <td className="px-5 py-4 font-bold text-[var(--dk-navy)]">{listing.trackingCode}</td>
                      <td className="max-w-[260px] px-5 py-4">
                        <div className="truncate font-semibold text-slate-900">{listing.title}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${category?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                          {category?.label ?? listing.type}
                        </span>
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
                      <td className="px-5 py-4">{formatDate(listing.createdAt)}</td>
                      <td className="px-5 py-4">
                        <Link
                          href={`/dashboard/ilanlar/${listing.id}`}
                          className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white"
                        >
                          İncələ →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filtered.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">
              Bu filtrə uyğun elan tapılmadı.
            </div>
          ) : null}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {filtered.length} nəticə, səhifə {currentPage}/{totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Geri
              </button>
              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 disabled:opacity-40"
              >
                İrəli
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
