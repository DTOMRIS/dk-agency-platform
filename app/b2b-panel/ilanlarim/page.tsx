// app/b2b-panel/ilanlarim/page.tsx
// DK Agency - B2B Portal - İlanlarım Sayfası (Real API + Edit/View Actions)

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plus, Search, Filter, Eye, MessageSquare,
  CheckCircle, Clock, AlertTriangle, Pencil, Share2,
  ChevronDown, Bot, Star, FileText, XCircle, BadgeCheck, TimerOff,
  Loader2, ExternalLink,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { getSectorLabel, SECTOR_KEYS } from '@/lib/data/listingSectors';

interface Listing {
  id: number;
  title: string;
  trackingCode: string;
  type: string;
  sector?: string | null;
  status: string;
  price: number;
  currency: string;
  city: string;
  isShowcase: boolean;
  images: Array<{ url: string }>;
  leads: Array<{ name: string }>;
  createdAt: string;
  updatedAt: string;
}

const pageCopy: Record<Locale, {
  heading: string;
  subheading: string;
  newListing: string;
  searchPlaceholder: string;
  allStatuses: string;
  allCategories: string;
  allSectors: string;
  noListings: string;
  noListingsHint: string;
  statTotal: string;
  statActive: string;
  statPending: string;
  statRejected: string;
  view: string;
  edit: string;
  loading: string;
  statusLabels: Record<string, string>;
  categoryLabels: Record<string, string>;
}> = {
  az: {
    heading: 'Elanlarım',
    subheading: 'Bütün elanlarınızı buradan idarə edin',
    newListing: 'Yeni Elan',
    searchPlaceholder: 'Elan axtar...',
    allStatuses: 'Bütün Statuslar',
    allCategories: 'Bütün Kateqoriyalar',
    allSectors: 'Bütün Sektorlar',
    noListings: 'Elan tapılmadı',
    noListingsHint: 'Filtrləri dəyişin və ya yeni elan yaradın',
    statTotal: 'Ümumi',
    statActive: 'Vitrində',
    statPending: 'Gözlənilir',
    statRejected: 'Rədd',
    view: 'Bax',
    edit: 'Redaktə',
    loading: 'Yüklənir...',
    statusLabels: {
      submitted: 'Göndərilib',
      ai_checked: 'AI Yoxlanılıb',
      committee_review: 'İncələnir',
      shortlisted: 'Qısa siyahıda',
      docs_requested: 'Sənəd İstənib',
      showcase_ready: 'Vitrində',
      rejected: 'Rədd edilib',
      sold: 'Satıldı',
      expired: 'Müddəti bitdi',
    },
    categoryLabels: {
      'devir': 'İşletmə Devri',
      'franchise-vermek': 'Franchise Vermək',
      'franchise-almaq': 'Franchise Almaq',
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
    allSectors: 'Все секторы',
    noListings: 'Объявления не найдены',
    noListingsHint: 'Измените фильтры или создайте новое объявление',
    statTotal: 'Всего',
    statActive: 'Витрина',
    statPending: 'На проверке',
    statRejected: 'Отклонено',
    view: 'Посмотреть',
    edit: 'Редактировать',
    loading: 'Загрузка...',
    statusLabels: {
      submitted: 'Отправлено',
      ai_checked: 'AI Проверено',
      committee_review: 'На рассмотрении',
      shortlisted: 'В шортлисте',
      docs_requested: 'Документы запрошены',
      showcase_ready: 'На витрине',
      rejected: 'Отклонено',
      sold: 'Продано',
      expired: 'Истекло',
    },
    categoryLabels: {
      'devir': 'Передача бизнеса',
      'franchise-vermek': 'Продать франшизу',
      'franchise-almaq': 'Купить франшизу',
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
    allSectors: 'All Sectors',
    noListings: 'No listings found',
    noListingsHint: 'Change filters or create a new listing',
    statTotal: 'Total',
    statActive: 'Showcase',
    statPending: 'Pending',
    statRejected: 'Rejected',
    view: 'View',
    edit: 'Edit',
    loading: 'Loading...',
    statusLabels: {
      submitted: 'Submitted',
      ai_checked: 'AI Checked',
      committee_review: 'Under Review',
      shortlisted: 'Shortlisted',
      docs_requested: 'Docs Requested',
      showcase_ready: 'Showcase',
      rejected: 'Rejected',
      sold: 'Sold',
      expired: 'Expired',
    },
    categoryLabels: {
      'devir': 'Business Transfer',
      'franchise-vermek': 'Sell Franchise',
      'franchise-almaq': 'Buy Franchise',
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
    allSectors: 'Tüm Sektörler',
    noListings: 'İlan bulunamadı',
    noListingsHint: 'Filtreleri değiştirin veya yeni ilan oluşturun',
    statTotal: 'Toplam',
    statActive: 'Vitrinde',
    statPending: 'Beklemede',
    statRejected: 'Reddedildi',
    view: 'Görüntüle',
    edit: 'Düzenle',
    loading: 'Yükleniyor...',
    statusLabels: {
      submitted: 'Gönderildi',
      ai_checked: 'AI Kontrol Edildi',
      committee_review: 'İnceleniyor',
      shortlisted: 'Kısa Listede',
      docs_requested: 'Belge İstendi',
      showcase_ready: 'Vitrinde',
      rejected: 'Reddedildi',
      sold: 'Satıldı',
      expired: 'Süresi Doldu',
    },
    categoryLabels: {
      'devir': 'İşletme Devri',
      'franchise-vermek': 'Franchise Vermek',
      'franchise-almaq': 'Franchise Almak',
      'ortak-tapmaq': 'Ortak Bulmak',
      'yeni-investisiya': 'Yeni Yatırım',
      'obyekt-icaresi': 'Mekan Kiralama',
      'horeca-ekipman': 'HORECA Ekipman',
    },
  },
};

const STATUS_ICON_MAP: Record<string, typeof Clock> = {
  submitted: Clock,
  ai_checked: Bot,
  committee_review: Eye,
  shortlisted: Star,
  docs_requested: FileText,
  showcase_ready: CheckCircle,
  rejected: XCircle,
  sold: BadgeCheck,
  expired: TimerOff,
};

const STATUS_COLOR_MAP: Record<string, string> = {
  submitted: 'text-slate-700 bg-slate-100',
  ai_checked: 'text-blue-700 bg-blue-50',
  committee_review: 'text-amber-700 bg-amber-50',
  shortlisted: 'text-purple-700 bg-purple-50',
  docs_requested: 'text-orange-700 bg-orange-50',
  showcase_ready: 'text-emerald-700 bg-emerald-50',
  rejected: 'text-rose-700 bg-rose-50',
  sold: 'text-teal-700 bg-teal-50',
  expired: 'text-gray-600 bg-gray-100',
};

const EDITABLE_STATUSES = ['submitted', 'docs_requested'];

export default function IlanlarimPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSector, setFilterSector] = useState<string>('all');

  useEffect(() => {
    fetch('/api/listings?scope=owner')
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setListings(data.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase())
      || listing.trackingCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || listing.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || listing.type === filterCategory;
    const matchesSector = filterSector === 'all' || listing.sector === filterSector;
    return matchesSearch && matchesStatus && matchesCategory && matchesSector;
  });

  const stats = {
    total: listings.length,
    active: listings.filter((l) => l.status === 'showcase_ready').length,
    pending: listings.filter((l) => ['submitted', 'ai_checked', 'committee_review', 'shortlisted', 'docs_requested'].includes(l.status)).length,
    rejected: listings.filter((l) => l.status === 'rejected').length,
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
          <p className="text-2xl font-bold text-rose-600">{stats.rejected}</p>
          <p className="text-xs text-gray-500">{copy.statRejected}</p>
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
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red text-slate-900 bg-white"
              >
                <option value="all">{copy.allStatuses}</option>
                {Object.entries(copy.statusLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red text-slate-900 bg-white"
              >
                <option value="all">{copy.allCategories}</option>
                {Object.entries(copy.categoryLabels).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterSector}
                onChange={(e) => setFilterSector(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red text-slate-900 bg-white"
              >
                <option value="all">{copy.allSectors}</option>
                {SECTOR_KEYS.map((key) => (
                  <option key={key} value={key}>{getSectorLabel(key, locale)}</option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 size={24} className="mx-auto animate-spin text-dk-red mb-3" />
            <p className="text-sm text-gray-500">{copy.loading}</p>
          </div>
        ) : filteredListings.length === 0 ? (
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
              const StatusIcon = STATUS_ICON_MAP[listing.status] || Clock;
              const statusColor = STATUS_COLOR_MAP[listing.status] || STATUS_COLOR_MAP.submitted;
              const statusLabel = copy.statusLabels[listing.status] || listing.status;
              const canEdit = EDITABLE_STATUSES.includes(listing.status);

              return (
                <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail */}
                    {listing.images?.[0]?.url ? (
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 hidden sm:block">
                        <img src={listing.images[0].url} alt="" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-gray-100 shrink-0 hidden sm:block" />
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <Link
                          href={`/b2b-panel/ilanlarim/${listing.id}`}
                          className="font-semibold text-gray-900 truncate hover:text-dk-red transition-colors"
                        >
                          {listing.title}
                        </Link>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg shrink-0 ${statusColor}`}>
                          <StatusIcon size={12} />
                          {statusLabel}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400 text-xs">#{listing.trackingCode}</span>
                        <span className="text-gray-500">{copy.categoryLabels[listing.type] || listing.type}</span>
                        {listing.sector ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                            {getSectorLabel(listing.sector, locale)}
                          </span>
                        ) : null}
                        {listing.price > 0 && (
                          <span className="font-semibold text-dk-red">
                            {listing.price.toLocaleString()} {listing.currency}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">
                          {listing.city}
                        </span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="hidden md:flex items-center gap-4">
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare size={14} />
                          <span className="font-semibold text-sm">{listing.leads?.length || 0}</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/b2b-panel/ilanlarim/${listing.id}`}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                        title={copy.view}
                      >
                        <ExternalLink size={14} />
                        <span className="hidden lg:inline">{copy.view}</span>
                      </Link>
                      {canEdit && (
                        <Link
                          href={`/b2b-panel/ilanlarim/${listing.id}/edit`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-dk-red hover:bg-red-50 rounded-lg transition-colors"
                          title={copy.edit}
                        >
                          <Pencil size={14} />
                          <span className="hidden lg:inline">{copy.edit}</span>
                        </Link>
                      )}
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
