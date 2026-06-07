// app/b2b-panel/page.tsx
// DK Agency - B2B Portal Dashboard

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText, Eye, MessageSquare, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle,
  AlertTriangle, Star, Briefcase
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import RecommendationWidget from '@/components/dashboard/RecommendationWidget';
import NudgeBanner from '@/components/dashboard/NudgeBanner';

const pageCopy: Record<Locale, {
  welcome: string;
  subtitle: string;
  newListing: string;
  myListings: string;
  viewAll: string;
  recentOffers: string;
  quickActions: string;
  statLabels: [string, string, string, string];
  statusLabels: { active: string; pending: string; rejected: string };
  categoryLabels: Record<string, string>;
  offerItems: [string, string, string];
  offerTimes: [string, string, string];
  quickLinks: [string, string, string];
}> = {
  az: {
    welcome: 'Xoş Gəldiniz!',
    subtitle: 'İstanbul HORECA Group - B2B Portalı',
    newListing: 'Yeni Elan Yarat',
    myListings: 'Elanlarım',
    viewAll: 'Hamısını Gör',
    recentOffers: 'Son Təkliflər',
    quickActions: 'Sürətli Əməliyyatlar',
    statLabels: ['Aktiv Elanlar', 'Ümumi Baxış', 'Gələn Təkliflər', 'Mesajlar'],
    statusLabels: { active: 'Aktiv', pending: 'Gözlənilir', rejected: 'Rədd Edildi' },
    categoryLabels: {
      'devir': 'İşletmə Devri',
      'franchise-vermek': 'Franchise Vermək',
      'franchise-almak': 'Franchise Almaq',
      'ortak-tapmaq': 'Ortaq Tapmaq',
      'yeni-investisiya': 'Yeni İnvestisiya',
      'obyekt-icaresi': 'Obyekt İcarəsi',
      'horeca-ekipman': 'HORECA Ekipman',
    },
    offerItems: ['Kafe Devri üçün yeni təklif', 'Franchise sualı', 'Elanınız seçilənlərə əlavə edildi'],
    offerTimes: ['2 saat əvvəl', '5 saat əvvəl', '1 gün əvvəl'],
    quickLinks: ['Yeni Elan', 'Analiz Alətləri', 'Profili Yenilə'],
  },
  ru: {
    welcome: 'Добро пожаловать!',
    subtitle: 'Istanbul HORECA Group - B2B Портал',
    newListing: 'Создать объявление',
    myListings: 'Мои объявления',
    viewAll: 'Показать все',
    recentOffers: 'Последние предложения',
    quickActions: 'Быстрые действия',
    statLabels: ['Активные объявления', 'Всего просмотров', 'Входящие предложения', 'Сообщения'],
    statusLabels: { active: 'Активно', pending: 'На проверке', rejected: 'Отклонено' },
    categoryLabels: {
      'devir': 'Передача бизнеса',
      'franchise-vermek': 'Продать франшизу',
      'franchise-almak': 'Купить франшизу',
      'ortak-tapmaq': 'Найти партнёра',
      'yeni-investisiya': 'Новые инвестиции',
      'obyekt-icaresi': 'Аренда объекта',
      'horeca-ekipman': 'Оборудование HORECA',
    },
    offerItems: ['Новое предложение по передаче кафе', 'Вопрос о франшизе', 'Объявление добавлено в избранное'],
    offerTimes: ['2 часа назад', '5 часов назад', '1 день назад'],
    quickLinks: ['Новое объявление', 'Аналитика', 'Обновить профиль'],
  },
  en: {
    welcome: 'Welcome!',
    subtitle: 'Istanbul HORECA Group - B2B Portal',
    newListing: 'Create Listing',
    myListings: 'My Listings',
    viewAll: 'View All',
    recentOffers: 'Recent Offers',
    quickActions: 'Quick Actions',
    statLabels: ['Active Listings', 'Total Views', 'Incoming Offers', 'Messages'],
    statusLabels: { active: 'Active', pending: 'Pending', rejected: 'Rejected' },
    categoryLabels: {
      'devir': 'Business Transfer',
      'franchise-vermek': 'Sell Franchise',
      'franchise-almak': 'Buy Franchise',
      'ortak-tapmaq': 'Find Partner',
      'yeni-investisiya': 'New Investment',
      'obyekt-icaresi': 'Venue Rental',
      'horeca-ekipman': 'HORECA Equipment',
    },
    offerItems: ['New offer for Cafe Transfer', 'Franchise enquiry', 'Your listing was favourited'],
    offerTimes: ['2 hours ago', '5 hours ago', '1 day ago'],
    quickLinks: ['New Listing', 'Analytics', 'Update Profile'],
  },
  tr: {
    welcome: 'Hoş Geldiniz!',
    subtitle: 'İstanbul HORECA Group - B2B Portal',
    newListing: 'Yeni İlan Oluştur',
    myListings: 'İlanlarım',
    viewAll: 'Tümünü Gör',
    recentOffers: 'Son Teklifler',
    quickActions: 'Hızlı İşlemler',
    statLabels: ['Aktif İlanlar', 'Toplam Görüntülenme', 'Gelen Teklifler', 'Mesajlar'],
    statusLabels: { active: 'Aktif', pending: 'Onay Bekliyor', rejected: 'Reddedildi' },
    categoryLabels: {
      'devir': 'İşletme Devri',
      'franchise-vermek': 'Franchise Vermek',
      'franchise-almak': 'Franchise Almak',
      'ortak-tapmaq': 'Ortak Bulmak',
      'yeni-investisiya': 'Yeni Yatırım',
      'obyekt-icaresi': 'Mekan Kiralama',
      'horeca-ekipman': 'HORECA Ekipman',
    },
    offerItems: ['Cafe Devri için yeni teklif', 'Franchise sorusu', 'İlanınız favorilere eklendi'],
    offerTimes: ['2 saat önce', '5 saat önce', '1 gün önce'],
    quickLinks: ['Yeni İlan', 'Analiz Araçları', 'Profili Güncelle'],
  },
};

const MY_LISTINGS = [
  {
    id: '1',
    title: 'Kadıköy Merkez Lokasyonda Cafe Devri',
    category: 'devir',
    status: 'active',
    views: 1250,
    inquiries: 5,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Franchise Partner Aranıyor - Fast Food',
    category: 'franchise-vermek',
    status: 'active',
    views: 890,
    inquiries: 3,
    createdAt: '2024-01-20',
  },
  {
    id: '3',
    title: '500.000₺ Yatırım - Ortaklık Teklifi',
    category: 'ortak-tapmaq',
    status: 'pending',
    views: 0,
    inquiries: 0,
    createdAt: '2024-02-01',
  },
];

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

// Sparkline helper component for trend graphs
function Sparkline({ points, color }: { points: number[]; color: string }) {
  const width = 60;
  const height = 24;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const strokePoints = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * width;
      const y = height - ((p - min) / range) * height + 2; // padding
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible opacity-80">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={strokePoints}
      />
    </svg>
  );
}

export default function B2BPanelPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const STATS = [
    {
      label: copy.statLabels[0],
      value: 4,
      icon: FileText,
      color: 'bg-indigo-50 text-indigo-600',
      sparklineColor: '#6366f1',
      sparklineData: [2, 3, 3, 4, 4],
      change: '+1',
    },
    {
      label: copy.statLabels[1],
      value: 2847,
      icon: Eye,
      color: 'bg-emerald-50 text-emerald-600',
      sparklineColor: '#10b981',
      sparklineData: [1800, 2100, 2400, 2600, 2847],
      change: '+12%',
    },
    {
      label: copy.statLabels[2],
      value: 8,
      icon: Briefcase,
      color: 'bg-purple-50 text-purple-600',
      sparklineColor: '#a855f7',
      sparklineData: [4, 5, 6, 7, 8],
      change: '+3',
    },
    {
      label: copy.statLabels[3],
      value: 15,
      icon: MessageSquare,
      color: 'bg-rose-50 text-[var(--dk-red)]',
      sparklineColor: '#e94560',
      sparklineData: [9, 11, 10, 13, 15],
      change: '+5',
    },
  ];

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
              className="group bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-5 hover:border-[var(--dk-red)]/35 shadow-[0_8px_30px_rgb(0,0,0,0.015)] hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-xl ${stat.color} flex items-center justify-center`}>
                    <Icon size={20} />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                    {stat.change}
                  </span>
                </div>
                <p className="text-3xl font-black tracking-tight text-slate-900 mt-4">
                  {stat.value.toLocaleString()}
                </p>
                <p className="text-xs font-semibold text-slate-500 mt-1">{stat.label}</p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Trend (Son 7 gün)</span>
                <Sparkline points={stat.sparklineData} color={stat.sparklineColor} />
              </div>
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
                <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {MY_LISTINGS.map((listing) => {
                const status = listing.status as keyof typeof STATUS_ICON_MAP;
                const StatusIcon = STATUS_ICON_MAP[status];
                const statusColor = STATUS_COLOR_MAP[status];
                const statusLabel = copy.statusLabels[status];

                return (
                  <div
                    key={listing.id}
                    className="p-5 hover:bg-slate-50/50 transition-colors duration-200"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex-1 min-w-0 space-y-1">
                        <p className="font-bold text-slate-900 truncate hover:text-[var(--dk-red)] transition-colors">
                          {listing.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2.5">
                          <span className="text-xs font-medium text-slate-500">
                            {copy.categoryLabels[listing.category]}
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
                          <Eye size={12} className="text-slate-400" /> {listing.views}
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100/60 px-2 py-1 rounded-md">
                          <MessageSquare size={12} className="text-slate-400" /> {listing.inquiries}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sağ Panel */}
        <div className="space-y-6">
          {/* Son Teklifler */}
          <div className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 p-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
            <h3 className="font-black text-slate-950 tracking-tight mb-4">{copy.recentOffers}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                  <Briefcase size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{copy.offerItems[0]}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{copy.offerTimes[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <MessageSquare size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{copy.offerItems[1]}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{copy.offerTimes[1]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                  <Star size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{copy.offerItems[2]}</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-0.5">{copy.offerTimes[2]}</p>
                </div>
              </div>
            </div>
            <Link
              href="/b2b-panel/teklifler"
              className="mt-4 inline-flex items-center gap-1 text-xs text-[var(--dk-red)] font-bold hover:text-[var(--dk-red-strong)] group/link transition-colors"
            >
              {copy.viewAll}{' '}
              <ArrowRight size={13} className="group-hover/link:translate-x-0.5 transition-transform" />
            </Link>
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
