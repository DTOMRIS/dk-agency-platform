'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { LISTING_CATEGORIES } from '@/lib/data/listingCategories';
import { MOCK_LISTINGS, type MockListing } from '@/lib/data/mockListings';
import { getStatusBadge } from '@/lib/utils/listingStatus';

const PAGE_SIZE = 20;

const STATUS_FILTERS = [
  { key: 'all', label: 'Hamisi', apiStatus: 'all' },
  { key: 'submitted', label: 'Submitted', apiStatus: 'submitted' },
  { key: 'ai_checked', label: 'AI checked', apiStatus: 'ai_checked' },
  { key: 'committee_review', label: 'Committee review', apiStatus: 'committee_review' },
  { key: 'showcase_ready', label: 'Vitrinde', apiStatus: 'showcase_ready' },
  { key: 'rejected', label: 'Redd', apiStatus: 'rejected' },
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
  const [listings, setListings] = useState<MockListing[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);

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
        const payload = (await response.json()) as { data?: MockListing[]; total?: number };

        if (!cancelled) {
          setListings(Array.isArray(payload.data) ? payload.data : []);
          setTotal(payload.total ?? 0);
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

          setTotal(fallback.length);
          setListings(fallback.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
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

  const stats = useMemo(() => {
    const pending = listings.filter((listing) =>
      ['submitted', 'ai_checked', 'committee_review'].includes(listing.status),
    ).length;
    const showcase = listings.filter((listing) => listing.status === 'showcase_ready').length;
    const rejected = listings.filter((listing) => listing.status === 'rejected').length;
    return { total, pending, showcase, rejected };
  }, [listings, total]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <span className="inline-flex rounded-full bg-slate-900 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              OCAQ
            </span>
            <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">Elan idareetme</h1>
            <p className="mt-2 text-sm text-slate-500">
              Listing siyahisi artik DB query, status filter, search ve pagination ile isleyir.
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
              placeholder="Basliq ve ya tracking code ile axtar"
              className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
            />
          </div>
        </div>

        <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: 'Umumi elan sayi', value: stats.total, tone: 'bg-slate-100 text-slate-700' },
            { label: 'Gozleyen', value: stats.pending, tone: 'bg-amber-50 text-amber-700' },
            { label: 'Vitrinde', value: stats.showcase, tone: 'bg-emerald-50 text-emerald-700' },
            { label: 'Redd', value: stats.rejected, tone: 'bg-rose-50 text-rose-700' },
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
                  <th className="px-5 py-4">Basliq</th>
                  <th className="px-5 py-4">Kategoriya</th>
                  <th className="px-5 py-4">Seher</th>
                  <th className="px-5 py-4">Qiymet</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Tarix</th>
                  <th className="px-5 py-4">Incele</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((listing) => {
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
                          Incele →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {!loading && listings.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Bu filtre uygun elan tapilmadi.</div>
          ) : null}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {loading ? 'Yuklenir...' : `${total} netice, sehife ${currentPage}/${totalPages}`}
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
                Ireli
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
