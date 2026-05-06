// app/dashboard/b2b-yonetimi/page.tsx
// DK Agency Dashboard - B2B Partner Yönetimi
// HORECA yatırımcı ve partner firma yönetim paneli

'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Building2, Search, Plus, MoreHorizontal,
  CheckCircle, Clock, XCircle, TrendingUp, Users,
  FileText, Star, ChevronDown, ExternalLink, Mail, Phone, X
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

interface Partner {
  id: string;
  name: string;
  type: 'investor' | 'franchisee' | 'supplier' | 'partner';
  sector: string;
  status: 'active' | 'pending' | 'inactive';
  contactPerson: string;
  email: string;
  phone: string;
  city: string;
  joinDate: string;
  deals: number;
  rating: number;
}

const MOCK_PARTNERS: Partner[] = [
  {
    id: '1',
    name: 'İstanbul HORECA Group',
    type: 'investor',
    sector: 'Restoran & Cafe',
    status: 'active',
    contactPerson: 'Ahmet Yılmaz',
    email: 'ahmet@ihoreca.com',
    phone: '+90 532 111 2233',
    city: 'İstanbul',
    joinDate: '2024-01-15',
    deals: 12,
    rating: 4.8,
  },
  {
    id: '2',
    name: 'Anadolu Franchise Ltd.',
    type: 'franchisee',
    sector: 'Fast Food',
    status: 'active',
    contactPerson: 'Mehmet Kaya',
    email: 'mehmet@anadolufranchise.com',
    phone: '+90 533 222 3344',
    city: 'Ankara',
    joinDate: '2024-02-20',
    deals: 5,
    rating: 4.5,
  },
  {
    id: '3',
    name: 'Ege Gastronomi A.Ş.',
    type: 'partner',
    sector: 'Otel & Konaklama',
    status: 'pending',
    contactPerson: 'Zeynep Demir',
    email: 'zeynep@ege-gastro.com',
    phone: '+90 534 333 4455',
    city: 'İzmir',
    joinDate: '2024-03-10',
    deals: 0,
    rating: 0,
  },
  {
    id: '4',
    name: 'Karadeniz Ekipman',
    type: 'supplier',
    sector: 'Ekipman',
    status: 'active',
    contactPerson: 'Ali Öztürk',
    email: 'ali@karadenizekipman.com',
    phone: '+90 535 444 5566',
    city: 'Trabzon',
    joinDate: '2024-01-05',
    deals: 28,
    rating: 4.9,
  },
  {
    id: '5',
    name: 'Akdeniz Yatırım Holding',
    type: 'investor',
    sector: 'Çoklu Sektör',
    status: 'inactive',
    contactPerson: 'Can Yıldız',
    email: 'can@akdeniz-holding.com',
    phone: '+90 536 555 6677',
    city: 'Antalya',
    joinDate: '2023-11-20',
    deals: 3,
    rating: 3.8,
  },
];

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    addPartnerBtn: string;
    statTotalPartners: string;
    statActivePartners: string;
    statPending: string;
    statTotalDeals: string;
    searchPlaceholder: string;
    filterAllTypes: string;
    filterInvestors: string;
    filterFranchisee: string;
    filterSuppliers: string;
    filterPartners: string;
    filterAllStatuses: string;
    filterActive: string;
    filterPending: string;
    filterInactive: string;
    colPartner: string;
    colType: string;
    colContact: string;
    colCity: string;
    colDeals: string;
    colRating: string;
    colStatus: string;
    emptyTitle: string;
    emptySubtitle: string;
    modalTitle: string;
    modalLabelCompany: string;
    modalPlaceholderCompany: string;
    modalLabelType: string;
    modalTypeSelect: string;
    modalLabelSector: string;
    modalPlaceholderSector: string;
    modalLabelContact: string;
    modalPlaceholderContact: string;
    modalLabelEmail: string;
    modalLabelPhone: string;
    modalLabelCity: string;
    modalPlaceholderCity: string;
    modalLabelNotes: string;
    modalPlaceholderNotes: string;
    modalBtnCancel: string;
    modalBtnAdd: string;
    modalAddedDemo: string;
    typeLabels: Record<string, string>;
    statusLabels: Record<string, string>;
  }
> = {
  az: {
    pageTitle: 'B2B İdarəetmə',
    pageSubtitle: 'Partner və investor münasibətləri',
    addPartnerBtn: 'Yeni Partner Əlavə Et',
    statTotalPartners: 'Ümumi Partner',
    statActivePartners: 'Aktiv Partner',
    statPending: 'Gözləyən',
    statTotalDeals: 'Ümumi Əməliyyat',
    searchPlaceholder: 'Partner, şəxs və ya şəhər axtar...',
    filterAllTypes: 'Bütün Növlər',
    filterInvestors: 'İnvestorlar',
    filterFranchisee: 'Franchise',
    filterSuppliers: 'Təchizatçılar',
    filterPartners: 'Partnerlər',
    filterAllStatuses: 'Bütün Statuslar',
    filterActive: 'Aktiv',
    filterPending: 'Gözləyən',
    filterInactive: 'Passiv',
    colPartner: 'Partner',
    colType: 'Növ',
    colContact: 'Əlaqə',
    colCity: 'Şəhər',
    colDeals: 'Əməliyyat',
    colRating: 'Reytinq',
    colStatus: 'Status',
    emptyTitle: 'Partner tapılmadı',
    emptySubtitle: 'Filtrləri dəyişin və ya yeni partner əlavə edin',
    modalTitle: 'Yeni Partner Əlavə Et',
    modalLabelCompany: 'Şirkət Adı',
    modalPlaceholderCompany: 'Şirkət adını daxil edin',
    modalLabelType: 'Partner Növü',
    modalTypeSelect: 'Seçin',
    modalLabelSector: 'Sektor',
    modalPlaceholderSector: 'Sektor',
    modalLabelContact: 'Səlahiyyətli Şəxs',
    modalPlaceholderContact: 'Ad Soyad',
    modalLabelEmail: 'E-poçt',
    modalLabelPhone: 'Telefon',
    modalLabelCity: 'Şəhər',
    modalPlaceholderCity: 'Şəhər',
    modalLabelNotes: 'Qeydlər',
    modalPlaceholderNotes: 'Əlavə məlumat...',
    modalBtnCancel: 'Ləğv et',
    modalBtnAdd: 'Partner Əlavə Et',
    modalAddedDemo: 'Partner əlavə edildi! (Demo)',
    typeLabels: { investor: 'İnvestor', franchisee: 'Franchise', supplier: 'Təchizatçı', partner: 'Partner' },
    statusLabels: { active: 'Aktiv', pending: 'Gözləyən', inactive: 'Passiv' },
  },
  ru: {
    pageTitle: 'B2B Управление',
    pageSubtitle: 'Отношения с партнёрами и инвесторами',
    addPartnerBtn: 'Добавить партнёра',
    statTotalPartners: 'Всего партнёров',
    statActivePartners: 'Активных партнёров',
    statPending: 'Ожидающих',
    statTotalDeals: 'Всего сделок',
    searchPlaceholder: 'Поиск по партнёру, контакту или городу...',
    filterAllTypes: 'Все типы',
    filterInvestors: 'Инвесторы',
    filterFranchisee: 'Франшиза',
    filterSuppliers: 'Поставщики',
    filterPartners: 'Партнёры',
    filterAllStatuses: 'Все статусы',
    filterActive: 'Активный',
    filterPending: 'Ожидающий',
    filterInactive: 'Неактивный',
    colPartner: 'Партнёр',
    colType: 'Тип',
    colContact: 'Контакт',
    colCity: 'Город',
    colDeals: 'Сделки',
    colRating: 'Рейтинг',
    colStatus: 'Статус',
    emptyTitle: 'Партнёр не найден',
    emptySubtitle: 'Измените фильтры или добавьте нового партнёра',
    modalTitle: 'Добавить партнёра',
    modalLabelCompany: 'Название компании',
    modalPlaceholderCompany: 'Введите название компании',
    modalLabelType: 'Тип партнёра',
    modalTypeSelect: 'Выберите',
    modalLabelSector: 'Сектор',
    modalPlaceholderSector: 'Сектор',
    modalLabelContact: 'Контактное лицо',
    modalPlaceholderContact: 'Имя Фамилия',
    modalLabelEmail: 'E-mail',
    modalLabelPhone: 'Телефон',
    modalLabelCity: 'Город',
    modalPlaceholderCity: 'Город',
    modalLabelNotes: 'Заметки',
    modalPlaceholderNotes: 'Дополнительная информация...',
    modalBtnCancel: 'Отмена',
    modalBtnAdd: 'Добавить партнёра',
    modalAddedDemo: 'Партнёр добавлен! (Демо)',
    typeLabels: { investor: 'Инвестор', franchisee: 'Франшиза', supplier: 'Поставщик', partner: 'Партнёр' },
    statusLabels: { active: 'Активный', pending: 'Ожидающий', inactive: 'Неактивный' },
  },
  en: {
    pageTitle: 'B2B Management',
    pageSubtitle: 'Partner and investor relationships',
    addPartnerBtn: 'Add New Partner',
    statTotalPartners: 'Total Partners',
    statActivePartners: 'Active Partners',
    statPending: 'Pending',
    statTotalDeals: 'Total Deals',
    searchPlaceholder: 'Search partner, contact or city...',
    filterAllTypes: 'All Types',
    filterInvestors: 'Investors',
    filterFranchisee: 'Franchisee',
    filterSuppliers: 'Suppliers',
    filterPartners: 'Partners',
    filterAllStatuses: 'All Statuses',
    filterActive: 'Active',
    filterPending: 'Pending',
    filterInactive: 'Inactive',
    colPartner: 'Partner',
    colType: 'Type',
    colContact: 'Contact',
    colCity: 'City',
    colDeals: 'Deals',
    colRating: 'Rating',
    colStatus: 'Status',
    emptyTitle: 'No partner found',
    emptySubtitle: 'Change filters or add a new partner',
    modalTitle: 'Add New Partner',
    modalLabelCompany: 'Company Name',
    modalPlaceholderCompany: 'Enter company name',
    modalLabelType: 'Partner Type',
    modalTypeSelect: 'Select',
    modalLabelSector: 'Sector',
    modalPlaceholderSector: 'Sector',
    modalLabelContact: 'Contact Person',
    modalPlaceholderContact: 'Full Name',
    modalLabelEmail: 'Email',
    modalLabelPhone: 'Phone',
    modalLabelCity: 'City',
    modalPlaceholderCity: 'City',
    modalLabelNotes: 'Notes',
    modalPlaceholderNotes: 'Additional info...',
    modalBtnCancel: 'Cancel',
    modalBtnAdd: 'Add Partner',
    modalAddedDemo: 'Partner added! (Demo)',
    typeLabels: { investor: 'Investor', franchisee: 'Franchisee', supplier: 'Supplier', partner: 'Partner' },
    statusLabels: { active: 'Active', pending: 'Pending', inactive: 'Inactive' },
  },
  tr: {
    pageTitle: 'B2B Yönetimi',
    pageSubtitle: 'Partner ve yatırımcı ilişkileri',
    addPartnerBtn: 'Yeni Partner Ekle',
    statTotalPartners: 'Toplam Partner',
    statActivePartners: 'Aktif Partner',
    statPending: 'Bekleyen',
    statTotalDeals: 'Toplam İşlem',
    searchPlaceholder: 'Partner, kişi veya şehir ara...',
    filterAllTypes: 'Tüm Tipler',
    filterInvestors: 'Yatırımcılar',
    filterFranchisee: 'Franchise',
    filterSuppliers: 'Tedarikçiler',
    filterPartners: 'Partnerler',
    filterAllStatuses: 'Tüm Durumlar',
    filterActive: 'Aktif',
    filterPending: 'Beklemede',
    filterInactive: 'Pasif',
    colPartner: 'Partner',
    colType: 'Tip',
    colContact: 'İletişim',
    colCity: 'Şehir',
    colDeals: 'İşlem',
    colRating: 'Puan',
    colStatus: 'Durum',
    emptyTitle: 'Partner bulunamadı',
    emptySubtitle: 'Filtreleri değiştirin veya yeni partner ekleyin',
    modalTitle: 'Yeni Partner Ekle',
    modalLabelCompany: 'Firma Adı',
    modalPlaceholderCompany: 'Firma adını girin',
    modalLabelType: 'Partner Tipi',
    modalTypeSelect: 'Seçin',
    modalLabelSector: 'Sektör',
    modalPlaceholderSector: 'Sektör',
    modalLabelContact: 'Yetkili Kişi',
    modalPlaceholderContact: 'Ad Soyad',
    modalLabelEmail: 'E-posta',
    modalLabelPhone: 'Telefon',
    modalLabelCity: 'Şehir',
    modalPlaceholderCity: 'Şehir',
    modalLabelNotes: 'Notlar',
    modalPlaceholderNotes: 'Ek bilgiler...',
    modalBtnCancel: 'İptal',
    modalBtnAdd: 'Partner Ekle',
    modalAddedDemo: 'Partner eklendi! (Demo)',
    typeLabels: { investor: 'Yatırımcı', franchisee: 'Franchise', supplier: 'Tedarikçi', partner: 'Partner' },
    statusLabels: { active: 'Aktif', pending: 'Beklemede', inactive: 'Pasif' },
  },
};

export default function B2BYonetimiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const TYPE_LABELS = {
    investor: { label: copy.typeLabels.investor, color: 'bg-blue-100 text-blue-700' },
    franchisee: { label: copy.typeLabels.franchisee, color: 'bg-purple-100 text-purple-700' },
    supplier: { label: copy.typeLabels.supplier, color: 'bg-amber-100 text-amber-700' },
    partner: { label: copy.typeLabels.partner, color: 'bg-green-100 text-green-700' },
  };

  const STATUS_CONFIG = {
    active: { label: copy.statusLabels.active, icon: CheckCircle, color: 'text-green-600' },
    pending: { label: copy.statusLabels.pending, icon: Clock, color: 'text-amber-600' },
    inactive: { label: copy.statusLabels.inactive, icon: XCircle, color: 'text-gray-400' },
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPartners = MOCK_PARTNERS.filter((partner) => {
    const matchesSearch =
      partner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner.city.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filterType === 'all' || partner.type === filterType;
    const matchesStatus = filterStatus === 'all' || partner.status === filterStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  const stats = {
    total: MOCK_PARTNERS.length,
    active: MOCK_PARTNERS.filter(p => p.status === 'active').length,
    pending: MOCK_PARTNERS.filter(p => p.status === 'pending').length,
    totalDeals: MOCK_PARTNERS.reduce((sum, p) => sum + p.deals, 0),
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-xl">
            <Building2 size={24} className="text-dk-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{copy.pageSubtitle}</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 bg-dk-red hover:bg-dk-red-strong text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus size={18} />
          {copy.addPartnerBtn}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">{copy.statTotalPartners}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">{copy.statActivePartners}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">{copy.statPending}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingUp size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalDeals}</p>
              <p className="text-xs text-gray-500">{copy.statTotalDeals}</p>
            </div>
          </div>
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
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red bg-white"
              >
                <option value="all">{copy.filterAllTypes}</option>
                <option value="investor">{copy.filterInvestors}</option>
                <option value="franchisee">{copy.filterFranchisee}</option>
                <option value="supplier">{copy.filterSuppliers}</option>
                <option value="partner">{copy.filterPartners}</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red bg-white"
              >
                <option value="all">{copy.filterAllStatuses}</option>
                <option value="active">{copy.filterActive}</option>
                <option value="pending">{copy.filterPending}</option>
                <option value="inactive">{copy.filterInactive}</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* Partners Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colPartner}</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colType}</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colContact}</th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colCity}</th>
                <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colDeals}</th>
                <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colRating}</th>
                <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">{copy.colStatus}</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredPartners.map((partner) => {
                const typeConfig = TYPE_LABELS[partner.type];
                const statusConfig = STATUS_CONFIG[partner.status];
                const StatusIcon = statusConfig.icon;

                return (
                  <tr key={partner.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-sm">
                          {partner.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{partner.name}</p>
                          <p className="text-xs text-gray-500">{partner.sector}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${typeConfig.color}`}>
                        {typeConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{partner.contactPerson}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <a href={`mailto:${partner.email}`} className="text-gray-400 hover:text-dk-red transition-colors">
                            <Mail size={14} />
                          </a>
                          <a href={`tel:${partner.phone}`} className="text-gray-400 hover:text-dk-red transition-colors">
                            <Phone size={14} />
                          </a>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{partner.city}</span>
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-gray-900">
                        <FileText size={14} className="text-gray-400" />
                        {partner.deals}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      {partner.rating > 0 ? (
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600">
                          <Star size={14} fill="currentColor" />
                          {partner.rating.toFixed(1)}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <ExternalLink size={16} className="text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredPartners.length === 0 && (
          <div className="p-12 text-center">
            <Building2 size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">{copy.emptyTitle}</p>
            <p className="text-sm text-gray-400 mt-1">{copy.emptySubtitle}</p>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">{copy.modalTitle}</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelCompany}</label>
                <input
                  type="text"
                  placeholder={copy.modalPlaceholderCompany}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelType}</label>
                  <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red bg-white">
                    <option value="">{copy.modalTypeSelect}</option>
                    <option value="investor">{copy.typeLabels.investor}</option>
                    <option value="franchisee">{copy.typeLabels.franchisee}</option>
                    <option value="supplier">{copy.typeLabels.supplier}</option>
                    <option value="partner">{copy.typeLabels.partner}</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelSector}</label>
                  <input
                    type="text"
                    placeholder={copy.modalPlaceholderSector}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelContact}</label>
                <input
                  type="text"
                  placeholder={copy.modalPlaceholderContact}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelEmail}</label>
                  <input
                    type="email"
                    placeholder="email@firma.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelPhone}</label>
                  <input
                    type="tel"
                    placeholder="+90 5XX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelCity}</label>
                <input
                  type="text"
                  placeholder={copy.modalPlaceholderCity}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{copy.modalLabelNotes}</label>
                <textarea
                  rows={3}
                  placeholder={copy.modalPlaceholderNotes}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red resize-none"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                {copy.modalBtnCancel}
              </button>
              <button
                onClick={() => {
                  alert(copy.modalAddedDemo);
                  setShowAddModal(false);
                }}
                className="px-5 py-2.5 bg-dk-red hover:bg-dk-red-strong text-white rounded-xl font-semibold transition-colors"
              >
                {copy.modalBtnAdd}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
