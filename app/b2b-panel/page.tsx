// app/b2b-panel/page.tsx
// DK Agency - B2B Portal Dashboard

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  FileText,
  Eye,
  MessageSquare,
  TrendingUp,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Inbox,
} from 'lucide-react';
import RecommendationWidget from '@/components/dashboard/RecommendationWidget';
import NudgeBanner from '@/components/dashboard/NudgeBanner';

// Shape returned by GET /api/listings?scope=owner (mapDbListing).
interface OwnerListing {
  id: number;
  title: string;
  type: string;
  status: string;
  viewCount?: number;
  leads?: Array<unknown>;
  createdAt: string;
}

// DB workflow status → the 3 UI buckets the sidebar copy defines.
function toUiStatus(dbStatus: string): 'active' | 'pending' | 'rejected' {
  if (dbStatus === 'showcase_ready') return 'active';
  if (dbStatus === 'rejected') return 'rejected';
  return 'pending';
}

const STATUS_ICON_MAP = {
  active: CheckCircle,
  pending: Clock,
  rejected: AlertTriangle,
} as const;

const STATUS_COLOR_MAP = {
  active: 'text-green-600 bg-green-50',
  pending: 'text-amber-600 bg-amber-50',
  rejected: 'text-red-600 bg-red-50',
} as const;

export default function B2BPanelPage() {
  const t = useTranslations('b2bPanel');
  // Pattern A (useTranslations) — local `copy` mirrors the old shape so all
  // downstream usages stay unchanged. Arrays/objects come via t.raw.
  const copy = {
    welcome: t('welcome'),
    subtitle: t('subtitle'),
    newListing: t('newListing'),
    myListings: t('myListings'),
    viewAll: t('viewAll'),
    recentOffers: t('recentOffers'),
    quickActions: t('quickActions'),
    statLabels: t.raw('statLabels') as string[],
    statusLabels: t.raw('statusLabels') as Record<string, string>,
    categoryLabels: t.raw('categoryLabels') as Record<string, string>,
    quickLinks: t.raw('quickLinks') as string[],
  };

  const [listings, setListings] = useState<OwnerListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/listings?scope=owner')
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data: { data?: OwnerListing[] }) => {
        if (!cancelled) setListings(Array.isArray(data.data) ? data.data : []);
      })
      .catch(() => {
        if (!cancelled) setListings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Real metrics derived from the owner's own listings. "Gələn Təkliflər" has no
  // backend yet → honest 0 (no fabricated offers).
  const activeCount = listings.filter((l) => l.status === 'showcase_ready').length;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount ?? 0), 0);
  const totalMessages = listings.reduce((sum, l) => sum + (l.leads?.length ?? 0), 0);

  const STATS = [
    {
      label: copy.statLabels[0],
      value: activeCount,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: copy.statLabels[1],
      value: totalViews,
      icon: Eye,
      color: 'bg-emerald-50 text-emerald-600',
    },
    { label: copy.statLabels[2], value: 0, icon: Briefcase, color: 'bg-purple-50 text-purple-600' },
    {
      label: copy.statLabels[3],
      value: totalMessages,
      icon: MessageSquare,
      color: 'bg-rose-50 text-[var(--dk-red)]',
    },
  ];

  const recentListings = listings.slice(0, 3);

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto">
      <NudgeBanner />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">{copy.welcome}</h1>
          <p className="text-slate-500 mt-1 text-sm">{copy.subtitle}</p>
        </div>
        <Link
          href="/b2b-panel/yeni-ilan"
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[var(--dk-red)] to-[var(--dk-red-strong)] hover:from-[var(--dk-red-strong)] hover:to-[var(--dk-red)] text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg active:scale-[0.98] duration-200"
        >
          <Plus size={18} />
          {copy.newListing}
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="group bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 hover:border-[var(--dk-red)]/35 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] transition-all duration-300"
            >
              <div
                className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}
              >
                <Icon size={20} />
              </div>
              <p className="text-3xl font-black tracking-tight text-slate-900 mt-4">
                {loading ? '—' : stat.value.toLocaleString()}
              </p>
              <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <RecommendationWidget />

      {/* Main Content Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* İlanlarım */}
        <div className="lg:col-span-2">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="font-black text-slate-950 tracking-tight">{copy.myListings}</h2>
              <Link
                href="/b2b-panel/ilanlarim"
                className="text-xs text-[var(--dk-red)] font-bold hover:text-[var(--dk-red-strong)] flex items-center gap-1 group/link transition-colors"
              >
                {copy.viewAll}{' '}
                <ArrowRight
                  size={13}
                  className="group-hover/link:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-sm font-semibold text-slate-400">
                  {copy.myListings}…
                </div>
              ) : recentListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                    <Inbox size={26} />
                  </div>
                  <p className="text-sm font-semibold text-slate-500">{t('noListings')}</p>
                  <Link
                    href="/b2b-panel/yeni-ilan"
                    className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white transition hover:bg-[var(--dk-red-strong)]"
                  >
                    <Plus size={14} />
                    {copy.newListing}
                  </Link>
                </div>
              ) : (
                recentListings.map((listing) => {
                  const status = toUiStatus(listing.status);
                  const StatusIcon = STATUS_ICON_MAP[status];
                  const statusColor = STATUS_COLOR_MAP[status];
                  const statusLabel = copy.statusLabels[status];

                  return (
                    <Link
                      key={listing.id}
                      href={`/b2b-panel/ilanlarim/${listing.id}`}
                      className="block p-5 hover:bg-slate-50/50 transition-colors duration-200"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-bold text-slate-900 truncate hover:text-[var(--dk-red)] transition-colors">
                            {listing.title}
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className="text-xs font-medium text-slate-500">
                              {copy.categoryLabels[listing.type] ?? listing.type}
                            </span>
                            <span className="text-slate-300 text-xs">•</span>
                            <span
                              className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md ${statusColor}`}
                            >
                              <StatusIcon size={10} />
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center sm:justify-end gap-4 text-xs font-semibold text-slate-500">
                          <span className="flex items-center gap-1 bg-slate-100/60 px-2 py-1 rounded-md">
                            <Eye size={12} className="text-slate-400" /> {listing.viewCount ?? 0}
                          </span>
                          <span className="flex items-center gap-1 bg-slate-100/60 px-2 py-1 rounded-md">
                            <MessageSquare size={12} className="text-slate-400" />{' '}
                            {listing.leads?.length ?? 0}
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Son Teklifler */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <h3 className="font-black text-slate-950 tracking-tight mb-4">{copy.recentOffers}</h3>
            {/* No offers backend yet — honest empty state instead of fabricated items. */}
            <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                <Inbox size={22} />
              </div>
              <p className="text-sm font-semibold text-slate-500">{t('noOffers')}</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--dk-red)]/10 rounded-full blur-2xl" />
            <h3 className="font-black tracking-tight mb-4 text-base">{copy.quickActions}</h3>
            <div className="space-y-3 relative z-10">
              <Link
                href="/b2b-panel/yeni-ilan"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200"
              >
                <Plus size={16} className="text-[var(--dk-red)]" />
                <span className="text-xs font-bold">{copy.quickLinks[0]}</span>
              </Link>
              <Link
                href="/b2b-panel/toolkit"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200"
              >
                <TrendingUp size={16} className="text-amber-400" />
                <span className="text-xs font-bold">{copy.quickLinks[1]}</span>
              </Link>
              <Link
                href="/b2b-panel/profil"
                className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 rounded-xl transition-all duration-200"
              >
                <FileText size={16} className="text-blue-400" />
                <span className="text-xs font-bold">{copy.quickLinks[2]}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
