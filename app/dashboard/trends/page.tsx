// app/dashboard/trends/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Plus,
  MapPin,
  TrendingUp,
  Search,
  Filter,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Globe,
  Navigation,
  ArrowUpRight,
  Plane,
  Tag
} from 'lucide-react';
import { motion } from 'framer-motion';
import { normalizeLocale, type Locale } from '@/i18n/config';

import { initialDestinations } from '@/data/trends-mock';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageBadge: string;
  pageSubtitle: string;
  newDestination: string;
  statTotalDestinations: string;
  statTrending: string;
  statTotalViews: string;
  searchPlaceholder: string;
  filterButton: string;
  allCountries: string;
  statusActive: string;
  statusDraft: string;
  reservations: string;
  discount: string;
  showInTrend: string;
  modalAddTitle: string;
  modalEditTitle: string;
  fieldDestination: string;
  fieldDestinationPlaceholder: string;
  fieldCountry: string;
  fieldCountryPlaceholder: string;
  fieldPrice: string;
  fieldPricePlaceholder: string;
  fieldDiscount: string;
  fieldDiscountPlaceholder: string;
  fieldImageUrl: string;
  cancel: string;
  save: string;
  deleteConfirm: string;
}> = {
  az: {
    pageTitle: 'Trendlərin İdarəedilməsi',
    pageBadge: 'Aktual Səyahətlər',
    pageSubtitle: 'Populyar istiqamətləri və trend səyahət paketlərini buradan idarə edin.',
    newDestination: 'Yeni İstiqamət',
    statTotalDestinations: 'Ümumi İstiqamət',
    statTrending: 'Trenddə Olanlar',
    statTotalViews: 'Toplam Baxış (Bu Ay)',
    searchPlaceholder: 'İstiqamət və ya ölkə axtar...',
    filterButton: 'Filtr',
    allCountries: 'Bütün Ölkələr',
    statusActive: 'Aktual',
    statusDraft: 'Qaralama',
    reservations: 'Rezerv',
    discount: 'ENDİRİM',
    showInTrend: 'Trenddə göstər',
    modalAddTitle: 'Yeni İstiqamət Əlavə Et',
    modalEditTitle: 'İstiqaməti Redaktə Et',
    fieldDestination: 'İstiqamət',
    fieldDestinationPlaceholder: 'Məs: Bakı',
    fieldCountry: 'Ölkə',
    fieldCountryPlaceholder: 'Məs: Azərbaycan',
    fieldPrice: 'Qiymət',
    fieldPricePlaceholder: 'Məs: 450 ₼',
    fieldDiscount: 'Endirim (%)',
    fieldDiscountPlaceholder: 'Məs: 15',
    fieldImageUrl: 'Şəkil URL',
    cancel: 'Ləğv Et',
    save: 'Yadda Saxla',
    deleteConfirm: 'Bu istiqaməti silmək istədiyinizə əminsiniz?',
  },
  ru: {
    pageTitle: 'Управление трендами',
    pageBadge: 'Актуальные путешествия',
    pageSubtitle: 'Управляйте популярными направлениями и трендовыми пакетами путешествий.',
    newDestination: 'Новое направление',
    statTotalDestinations: 'Всего направлений',
    statTrending: 'В тренде',
    statTotalViews: 'Всего просмотров (за месяц)',
    searchPlaceholder: 'Поиск направлений или стран...',
    filterButton: 'Фильтр',
    allCountries: 'Все страны',
    statusActive: 'Активно',
    statusDraft: 'Черновик',
    reservations: 'Бронирований',
    discount: 'СКИДКА',
    showInTrend: 'Показать в тренде',
    modalAddTitle: 'Добавить новое направление',
    modalEditTitle: 'Редактировать направление',
    fieldDestination: 'Направление',
    fieldDestinationPlaceholder: 'Напр: Баку',
    fieldCountry: 'Страна',
    fieldCountryPlaceholder: 'Напр: Азербайджан',
    fieldPrice: 'Цена',
    fieldPricePlaceholder: 'Напр: 450 ₼',
    fieldDiscount: 'Скидка (%)',
    fieldDiscountPlaceholder: 'Напр: 15',
    fieldImageUrl: 'URL изображения',
    cancel: 'Отмена',
    save: 'Сохранить',
    deleteConfirm: 'Вы уверены, что хотите удалить это направление?',
  },
  en: {
    pageTitle: 'Trends Management',
    pageBadge: 'Current Trips',
    pageSubtitle: 'Manage popular destinations and trending travel packages from here.',
    newDestination: 'New Destination',
    statTotalDestinations: 'Total Destinations',
    statTrending: 'Trending',
    statTotalViews: 'Total Views (This Month)',
    searchPlaceholder: 'Search destinations or countries...',
    filterButton: 'Filter',
    allCountries: 'All Countries',
    statusActive: 'Active',
    statusDraft: 'Draft',
    reservations: 'Bookings',
    discount: 'DISCOUNT',
    showInTrend: 'Show in trends',
    modalAddTitle: 'Add New Destination',
    modalEditTitle: 'Edit Destination',
    fieldDestination: 'Destination',
    fieldDestinationPlaceholder: 'E.g: Baku',
    fieldCountry: 'Country',
    fieldCountryPlaceholder: 'E.g: Azerbaijan',
    fieldPrice: 'Price',
    fieldPricePlaceholder: 'E.g: 450 ₼',
    fieldDiscount: 'Discount (%)',
    fieldDiscountPlaceholder: 'E.g: 15',
    fieldImageUrl: 'Image URL',
    cancel: 'Cancel',
    save: 'Save',
    deleteConfirm: 'Are you sure you want to delete this destination?',
  },
  tr: {
    pageTitle: 'Trendlerin Yönetimi',
    pageBadge: 'Güncel Seyahatler',
    pageSubtitle: 'Popüler destinasyonları ve trend seyahat paketlerini buradan yönetin.',
    newDestination: 'Yeni Destinasyon',
    statTotalDestinations: 'Toplam Destinasyon',
    statTrending: 'Trendde Olanlar',
    statTotalViews: 'Toplam Görüntüleme (Bu Ay)',
    searchPlaceholder: 'Destinasyon veya ülke ara...',
    filterButton: 'Filtre',
    allCountries: 'Tüm Ülkeler',
    statusActive: 'Aktif',
    statusDraft: 'Taslak',
    reservations: 'Rezervasyon',
    discount: 'İNDİRİM',
    showInTrend: 'Trendde göster',
    modalAddTitle: 'Yeni Destinasyon Ekle',
    modalEditTitle: 'Destinasyonu Düzenle',
    fieldDestination: 'Destinasyon',
    fieldDestinationPlaceholder: 'Örn: Bakü',
    fieldCountry: 'Ülke',
    fieldCountryPlaceholder: 'Örn: Azerbaycan',
    fieldPrice: 'Fiyat',
    fieldPricePlaceholder: 'Örn: 450 ₼',
    fieldDiscount: 'İndirim (%)',
    fieldDiscountPlaceholder: 'Örn: 15',
    fieldImageUrl: 'Görsel URL',
    cancel: 'İptal',
    save: 'Kaydet',
    deleteConfirm: 'Bu destinasyonu silmek istediğinizden emin misiniz?',
  },
};

interface Destination {
  id: number;
  name: string;
  country: string;
  price: string;
  discount: string | null;
  image: string;
  status: 'active' | 'draft';
  views: string;
  trending: boolean;
}

export default function TrendsPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [destinations, setDestinations] = useState<Destination[]>(initialDestinations as Destination[]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDestination, setEditingDestination] = useState<Destination | null>(null);

  const filteredDestinations = destinations.filter(dest =>
    dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    dest.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = (id: number) => {
    if (window.confirm(copy.deleteConfirm)) {
      setDestinations(prev => prev.filter(d => d.id !== id));
    }
  };

  const handleToggleStatus = (id: number) => {
    setDestinations(prev => prev.map(d =>
      d.id === id ? { ...d, status: d.status === 'active' ? 'draft' : 'active' } : d
    ));
  };

  const handleOpenAddModal = () => {
    setEditingDestination(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dest: Destination) => {
    setEditingDestination(dest);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const destinationData = {
      name: formData.get('name') as string,
      country: formData.get('country') as string,
      price: formData.get('price') as string,
      image: formData.get('image') as string || 'https://images.unsplash.com/photo-1527359443443-84a48abc7df0?auto=format&fit=crop&w=800&q=80',
      status: 'active' as const,
      trending: formData.get('trending') === 'on',
      views: '0',
      discount: formData.get('discount') as string || null,
    };

    if (editingDestination) {
      setDestinations(prev => prev.map(d =>
        d.id === editingDestination.id ? { ...d, ...destinationData } : d
      ));
    } else {
      const newDest: Destination = {
        id: Math.max(0, ...destinations.map(d => d.id)) + 1,
        ...destinationData
      };
      setDestinations(prev => [newDest, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="p-6 lg:p-10 bg-[var(--dk-paper)] min-h-screen">
      {/* Header */}
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-serif text-[var(--dk-navy)] tracking-tight">{copy.pageTitle}</h1>
            <div className="px-3 py-1 bg-[color:color-mix(in_srgb,var(--dk-gold)_6%,transparent)] text-[var(--dk-gold)] text-[10px] font-bold rounded-full flex items-center gap-1.5 border border-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)] uppercase tracking-widest">
              <TrendingUp size={12} />
              {copy.pageBadge}
            </div>
          </div>
          <p className="text-[var(--dk-ink-soft)] text-base font-normal max-w-xl">{copy.pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-6 py-3 bg-[var(--dk-red)] text-white rounded-xl hover:bg-[var(--dk-gold)] transition-all shadow-lg shadow-[var(--dk-red)]/10 text-sm font-bold"
          >
            <Plus size={18} />
            <span>{copy.newDestination}</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[24px] border border-[var(--dk-border-soft)] shadow-sm">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
            <Plane size={20} className="text-blue-600" />
          </div>
          <p className="text-3xl font-serif text-[var(--dk-navy)] mb-1">{destinations.length}</p>
          <p className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest">{copy.statTotalDestinations}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[var(--dk-border-soft)] shadow-sm">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center mb-4">
            <TrendingUp size={20} className="text-orange-500" />
          </div>
          <p className="text-3xl font-serif text-[var(--dk-navy)] mb-1">{destinations.filter(d => d.trending).length}</p>
          <p className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest">{copy.statTrending}</p>
        </div>
        <div className="bg-white p-6 rounded-[24px] border border-[var(--dk-border-soft)] shadow-sm">
          <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center mb-4">
            <Eye size={20} className="text-green-600" />
          </div>
          <p className="text-3xl font-serif text-[var(--dk-navy)] mb-1">7.4k</p>
          <p className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest">{copy.statTotalViews}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white rounded-[24px] border border-[var(--dk-border-soft)] p-4 mb-8 shadow-sm flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--dk-border-soft)]" size={18} />
          <input
            type="text"
            placeholder={copy.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[var(--dk-border-soft)] rounded-xl hover:bg-[var(--dk-paper)] transition-all text-sm font-semibold text-[var(--dk-navy)]">
            <Filter size={16} className="text-[var(--dk-muted)]" />
            {copy.filterButton}
          </button>
          <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-white border border-[var(--dk-border-soft)] rounded-xl hover:bg-[var(--dk-paper)] transition-all text-sm font-semibold text-[var(--dk-navy)]">
            <Globe size={16} className="text-[var(--dk-muted)]" />
            {copy.allCountries}
          </button>
        </div>
      </div>

      {/* Destinations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredDestinations.map((dest) => (
          <motion.div
            key={dest.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white rounded-[32px] overflow-hidden border border-[var(--dk-border-soft)] hover:shadow-2xl transition-all duration-500"
          >
            {/* Image Section */}
            <div className="relative h-56 overflow-hidden">
              <img
                src={dest.image}
                alt={dest.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--dk-navy)]/60 to-transparent opacity-60" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {dest.trending && (
                  <div className="px-3 py-1 bg-white/90 backdrop-blur-md text-[var(--dk-red)] text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                    <TrendingUp size={12} />
                    TREND
                  </div>
                )}
                {dest.discount && (
                  <div className="px-3 py-1 bg-[var(--dk-gold)] text-white text-[10px] font-bold rounded-full flex items-center gap-1.5 shadow-sm">
                    <Tag size={12} />
                    {dest.discount} {copy.discount}
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div
                onClick={() => handleToggleStatus(dest.id)}
                className="absolute top-4 right-4 cursor-pointer hover:scale-105 transition-transform"
              >
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border ${
                  dest.status === 'active'
                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                    : 'bg-gray-500/20 text-gray-400 border-gray-500/30'
                }`}>
                  {dest.status === 'active' ? copy.statusActive : copy.statusDraft}
                </div>
              </div>

              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  onClick={() => handleOpenEditModal(dest)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--dk-navy)] hover:bg-[var(--dk-red)] hover:text-white transition-all transform -translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => handleDelete(dest.id)}
                  className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[var(--dk-navy)] hover:bg-red-600 hover:text-white transition-all transform translate-y-4 group-hover:translate-y-0 duration-300"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 text-[var(--dk-muted)] mb-1">
                    <MapPin size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">{dest.country}</span>
                  </div>
                  <h3 className="text-2xl font-serif text-[var(--dk-navy)] group-hover:text-[var(--dk-red)] transition-colors">{dest.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold text-[color-mix(in srgb, var(--dk-muted) 70%, white)] line-through mb-0.5 leading-none">{dest.discount ? '550 ₼' : ''}</p>
                  <p className="text-xl font-bold text-[var(--dk-navy)] leading-none">{dest.price}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-[var(--dk-paper)]">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--dk-muted)]">
                    <Eye size={14} className="text-[var(--dk-border-soft)]" />
                    {dest.views}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--dk-muted)]">
                    <Navigation size={14} className="text-[var(--dk-border-soft)]" />
                    42 {copy.reservations}
                  </div>
                </div>
                <ArrowUpRight size={16} className="text-[var(--dk-border-soft)] group-hover:text-[var(--dk-gold)] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-[32px] w-full max-w-lg overflow-hidden shadow-2xl border border-[var(--dk-border-soft)]"
          >
            <div className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-serif text-[var(--dk-navy)]">
                  {editingDestination ? copy.modalEditTitle : copy.modalAddTitle}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors"
                >
                  <Plus className="rotate-45" size={24} />
                </button>
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest px-1">{copy.fieldDestination}</label>
                    <input
                      name="name"
                      defaultValue={editingDestination?.name}
                      placeholder={copy.fieldDestinationPlaceholder}
                      required
                      className="w-full px-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest px-1">{copy.fieldCountry}</label>
                    <input
                      name="country"
                      defaultValue={editingDestination?.country}
                      placeholder={copy.fieldCountryPlaceholder}
                      required
                      className="w-full px-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest px-1">{copy.fieldPrice}</label>
                    <input
                      name="price"
                      defaultValue={editingDestination?.price}
                      placeholder={copy.fieldPricePlaceholder}
                      required
                      className="w-full px-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest px-1">{copy.fieldDiscount}</label>
                    <input
                      name="discount"
                      defaultValue={editingDestination?.discount || ''}
                      placeholder={copy.fieldDiscountPlaceholder}
                      className="w-full px-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-[var(--dk-muted)] uppercase tracking-widest px-1">{copy.fieldImageUrl}</label>
                  <input
                    name="image"
                    defaultValue={editingDestination?.image}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-4 py-3 bg-[var(--dk-paper)] border border-[var(--dk-border-soft)] rounded-xl text-sm outline-none focus:border-[var(--dk-gold)] transition-colors"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-[var(--dk-paper)] rounded-2xl border border-[var(--dk-border-soft)]">
                  <input
                    type="checkbox"
                    name="trending"
                    id="trending"
                    defaultChecked={editingDestination?.trending}
                    className="w-5 h-5 rounded-md border-[var(--dk-border-soft)] text-[var(--dk-gold)] focus:ring-[var(--dk-gold)]"
                  />
                  <label htmlFor="trending" className="text-sm font-semibold text-[var(--dk-navy)]">{copy.showInTrend}</label>
                </div>

                <div className="pt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 px-6 py-4 bg-white border border-[var(--dk-border-soft)] text-[var(--dk-navy)] rounded-2xl hover:bg-gray-50 transition-all text-sm font-bold"
                  >
                    {copy.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-[2] px-6 py-4 bg-[var(--dk-navy)] text-white rounded-2xl hover:bg-[var(--dk-gold)] transition-all text-sm font-bold shadow-xl shadow-[var(--dk-navy)]/10"
                  >
                    {copy.save}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
