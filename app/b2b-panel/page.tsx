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

export default function B2BPanelPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const STATS = [
    { label: copy.statLabels[0], value: 4, icon: FileText, color: 'bg-blue-500', change: '+1' },
    { label: copy.statLabels[1], value: 2847, icon: Eye, color: 'bg-green-500', change: '+12%' },
    { label: copy.statLabels[2], value: 8, icon: Briefcase, color: 'bg-purple-500', change: '+3' },
    { label: copy.statLabels[3], value: 15, icon: MessageSquare, color: 'bg-amber-500', change: '+5' },
  ];

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.welcome}</h1>
          <p className="text-gray-500 mt-1">{copy.subtitle}</p>
        </div>
        <Link
          href="/b2b-panel/yeni-ilan"
          className="inline-flex items-center gap-2 bg-dk-red hover:bg-dk-red-strong text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus size={18} />
          {copy.newListing}
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STATS.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 rounded-xl ${stat.color} flex items-center justify-center`}>
                  <Icon size={22} className="text-white" />
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-gray-900 mt-4">
                {stat.value.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* İlanlarım */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900">{copy.myListings}</h2>
              <Link href="/b2b-panel/ilanlarim" className="text-sm text-dk-red font-medium hover:text-dk-red-strong flex items-center gap-1">
                {copy.viewAll} <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {MY_LISTINGS.map((listing) => {
                const status = listing.status as keyof typeof STATUS_ICON_MAP;
                const StatusIcon = STATUS_ICON_MAP[status];
                const statusColor = STATUS_COLOR_MAP[status];
                const statusLabel = copy.statusLabels[status];

                return (
                  <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{copy.categoryLabels[listing.category]}</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${statusColor}`}>
                            <StatusIcon size={12} />
                            {statusLabel}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Eye size={14} /> {listing.views}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare size={14} /> {listing.inquiries}
                          </span>
                        </div>
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
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{copy.recentOffers}</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Briefcase size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{copy.offerItems[0]}</p>
                  <p className="text-xs text-gray-500">{copy.offerTimes[0]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MessageSquare size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{copy.offerItems[1]}</p>
                  <p className="text-xs text-gray-500">{copy.offerTimes[1]}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{copy.offerItems[2]}</p>
                  <p className="text-xs text-gray-500">{copy.offerTimes[2]}</p>
                </div>
              </div>
            </div>
            <Link href="/b2b-panel/teklifler" className="mt-4 inline-flex items-center gap-1 text-sm text-dk-red font-medium hover:text-dk-red-strong">
              {copy.viewAll} <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4">{copy.quickActions}</h3>
            <div className="space-y-2">
              <Link href="/b2b-panel/yeni-ilan" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Plus size={18} />
                <span className="text-sm font-medium">{copy.quickLinks[0]}</span>
              </Link>
              <Link href="/b2b-panel/toolkit" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">{copy.quickLinks[1]}</span>
              </Link>
              <Link href="/b2b-panel/profil" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <FileText size={18} />
                <span className="text-sm font-medium">{copy.quickLinks[2]}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
