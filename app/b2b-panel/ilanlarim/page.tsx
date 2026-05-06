// app/b2b-panel/ilanlarim/page.tsx
// DK Agency - B2B Portal - İlanlarım Sayfası

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plus, Search, Filter, MoreHorizontal, Eye, MessageSquare,
  CheckCircle, Clock, AlertTriangle, Pencil, Trash2, Share2,
  ChevronDown
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

interface Listing {
  id: string;
  title: string;
  category: string;
  status: 'active' | 'pending' | 'rejected' | 'draft';
  views: number;
  inquiries: number;
  createdAt: string;
  price?: number;
}

const pageCopy: Record<Locale, {
  heading: string;
  subheading: string;
  newListing: string;
  searchPlaceholder: string;
  allStatuses: string;
  allCategories: string;
  noListings: string;
  noListingsHint: string;
  statTotal: string;
  statActive: string;
  statPending: string;
  statDraft: string;
  views: string;
  inquiries: string;
  statusLabels: { active: string; pending: string; rejected: string; draft: string };
  categoryLabels: Record<string, string>;
}> = {
  az: {
    heading: 'Elanlarım',
    subheading: 'Bütün elanlarınızı buradan idarə edin',
    newListing: 'Yeni Elan',
    searchPlaceholder: 'Elan axtar...',
    allStatuses: 'Bütün Statuslar',
    allCategories: 'Bütün Kateqoriyalar',
    noListings: 'Elan tapılmadı',
    noListingsHint: 'Filtrləri dəyişin və ya yeni elan yaradın',
    statTotal: 'Ümumi',
    statActive: 'Aktiv',
    statPending: 'Gözlənilir',
    statDraft: 'Qaralama',
    views: 'baxış',
    inquiries: 'sual',
    statusLabels: { active: 'Aktiv', pending: 'Gözlənilir', rejected: 'Rədd Edildi', draft: 'Qaralama' },
    categoryLabels: {
      'devir': 'İşletmə Devri',
      'franchise-vermek': 'Franchise Vermək',
      'franchise-almak': 'Franchise Almaq',
      'ortak-tapmaq': 'Ortaq Tapmaq',
      'yeni-investisiya': 'Yeni İnvestisiya',
      'obyekt-icaresi': 'Obyekt İcarəsi',
      'horeca-ekipman': 'HORECA Ekipman',
    },
  },
  ru: {
    heading: 'Мои объявления',
    subheading: 'Управляйте всеми своими объявлениями здесь',
    newListing: 'Новое объявление',
    searchPlaceholder: 'Искать объявление...',
    allStatuses: 'Все статусы',
    allCategories: 'Все категории',
    noListings: 'Объявления не найдены',
    noListingsHint: 'Измените фильтры или создайте новое объявление',
    statTotal: 'Всего',
    statActive: 'Активных',
    statPending: 'На проверке',
    statDraft: 'Черновик',
    views: 'просм.',
    inquiries: 'запросов',
    statusLabels: { active: 'Активно', pending: 'На проверке', rejected: 'Отклонено', draft: 'Черновик' },
    categoryLabels: {
      'devir': 'Передача бизнеса',
      'franchise-vermek': 'Продать франшизу',
      'franchise-almak': 'Купить франшизу',
      'ortak-tapmaq': 'Найти партнёра',
      'yeni-investisiya': 'Новые инвестиции',
      'obyekt-icaresi': 'Аренда объекта',
      'horeca-ekipman': 'Оборудование HORECA',
    },
  },
  en: {
    heading: 'My Listings',
    subheading: 'Manage all your listings from here',
    newListing: 'New Listing',
    searchPlaceholder: 'Search listing...',
    allStatuses: 'All Statuses',
    allCategories: 'All Categories',
    noListings: 'No listings found',
    noListingsHint: 'Change filters or create a new listing',
    statTotal: 'Total',
    statActive: 'Active',
    statPending: 'Pending',
    statDraft: 'Draft',
    views: 'views',
    inquiries: 'inquiries',
    statusLabels: { active: 'Active', pending: 'Pending', rejected: 'Rejected', draft: 'Draft' },
    categoryLabels: {
      'devir': 'Business Transfer',
      'franchise-vermek': 'Sell Franchise',
      'franchise-almak': 'Buy Franchise',
      'ortak-tapmaq': 'Find Partner',
      'yeni-investisiya': 'New Investment',
      'obyekt-icaresi': 'Venue Rental',
      'horeca-ekipman': 'HORECA Equipment',
    },
  },
  tr: {
    heading: 'İlanlarım',
    subheading: 'Tüm ilanlarınızı buradan yönetin',
    newListing: 'Yeni İlan',
    searchPlaceholder: 'İlan ara...',
    allStatuses: 'Tüm Durumlar',
    allCategories: 'Tüm Kategoriler',
    noListings: 'İlan bulunamadı',
    noListingsHint: 'Filtreleri değiştirin veya yeni ilan oluşturun',
    statTotal: 'Toplam',
    statActive: 'Aktif',
    statPending: 'Beklemede',
    statDraft: 'Taslak',
    views: 'görüntülenme',
    inquiries: 'soru',
    statusLabels: { active: 'Aktif', pending: 'Onay Bekliyor', rejected: 'Reddedildi', draft: 'Taslak' },
    categoryLabels: {
      'devir': 'İşletme Devri',
      'franchise-vermek': 'Franchise Vermek',
      'franchise-almak': 'Franchise Almak',
      'ortak-tapmaq': 'Ortak Bulmak',
      'yeni-investisiya': 'Yeni Yatırım',
      'obyekt-icaresi': 'Mekan Kiralama',
      'horeca-ekipman': 'HORECA Ekipman',
    },
  },
};

const STATUS_ICON_MAP = {
  active: CheckCircle,
  pending: Clock,
  rejected: AlertTriangle,
  draft: Pencil,
} as const;

const STATUS_COLOR_MAP = {
  active: 'text-green-600 bg-green-50',
  pending: 'text-amber-600 bg-amber-50',
  rejected: 'text-red-600 bg-red-50',
  draft: 'text-gray-600 bg-gray-100',
} as const;

const MOCK_LISTINGS: Listing[] = [
  {
    id: '1',
    title: 'Kadıköy Merkez Lokasyonda Cafe Devri',
    category: 'devir',
    status: 'active',
    views: 1250,
    inquiries: 5,
    createdAt: '2024-01-15',
    price: 850000,
  },
  {
    id: '2',
    title: 'Franchise Partner Aranıyor - Fast Food Markası',
    category: 'franchise-vermek',
    status: 'active',
    views: 890,
    inquiries: 3,
    createdAt: '2024-01-20',
    price: 450000,
  },
  {
    id: '3',
    title: '500.000₺ Yatırım İle Ortaklık Teklifi',
    category: 'ortak-tapmaq',
    status: 'pending',
    views: 0,
    inquiries: 0,
    createdAt: '2024-02-01',
    price: 500000,
  },
  {
    id: '4',
    title: 'Endüstriyel Mutfak Ekipmanları Satılık',
    category: 'horeca-ekipman',
    status: 'active',
    views: 567,
    inquiries: 8,
    createdAt: '2024-02-05',
    price: 120000,
  },
  {
    id: '5',
    title: 'Beşiktaş Restoran Uygun Mekan Kiralık',
    category: 'obyekt-icaresi',
    status: 'draft',
    views: 0,
    inquiries: 0,
    createdAt: '2024-02-08',
    price: 45000,
  },
];

export default function IlanlarimPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filteredListings = MOCK_LISTINGS.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || listing.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: MOCK_LISTINGS.length,
    active: MOCK_LISTINGS.filter(l => l.status === 'active').length,
    pending: MOCK_LISTINGS.filter(l => l.status === 'pending').length,
    draft: MOCK_LISTINGS.filter(l => l.status === 'draft').length,
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{copy.heading}</h1>
          <p className="text-gray-500 mt-1">{copy.subheading}</p>
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
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">{copy.statTotal}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500">{copy.statActive}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">{copy.statPending}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          <p className="text-xs text-gray-500">{copy.statDraft}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={copy.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red bg-white"
              >
                <option value="all">{copy.allStatuses}</option>
                {(Object.keys(copy.statusLabels) as Array<keyof typeof copy.statusLabels>).map((key) => (
                  <option key={key} value={key}>{copy.statusLabels[key]}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red bg-white"
              >
                <option value="all">{copy.allCategories}</option>
                {Object.entries(copy.categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredListings.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Filter size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">{copy.noListings}</p>
            <p className="text-sm text-gray-400 mt-1">{copy.noListingsHint}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredListings.map((listing) => {
              const StatusIcon = STATUS_ICON_MAP[listing.status];
              const statusColor = STATUS_COLOR_MAP[listing.status];
              const statusLabel = copy.statusLabels[listing.status];

              return (
                <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${statusColor}`}>
                          <StatusIcon size={12} />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{copy.categoryLabels[listing.category]}</span>
                        {listing.price && (
                          <span className="font-semibold text-dk-red">
                            {listing.price.toLocaleString()} ₺
                          </span>
                        )}
                        <span className="text-gray-400">
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden sm:flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <Eye size={16} />
                          <span className="font-semibold">{listing.views}</span>
                        </div>
                        <p className="text-xs text-gray-400">{copy.views}</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare size={16} />
                          <span className="font-semibold">{listing.inquiries}</span>
                        </div>
                        <p className="text-xs text-gray-400">{copy.inquiries}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Edit">
                        <Pencil size={16} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Share">
                        <Share2 size={16} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                        <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <MoreHorizontal size={16} className="text-gray-400" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
