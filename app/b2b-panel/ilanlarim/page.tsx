// app/b2b-panel/ilanlarim/page.tsx
// DK Agency - B2B Portal - İlanlarım Sayfası

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Plus, Search, Filter, MoreHorizontal, Eye, MessageSquare,
  CheckCircle, Clock, AlertTriangle, Pencil, Trash2, Share2,
  ChevronDown
} from 'lucide-react';

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

const STATUS_CONFIG = {
  active: { label: 'Aktif', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  pending: { label: 'Onay Bekliyor', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  rejected: { label: 'Reddedildi', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
  draft: { label: 'Taslak', icon: Pencil, color: 'text-gray-600 bg-gray-100' },
};

const CATEGORY_LABELS: Record<string, string> = {
  'devir': 'İşletme Devri',
  'franchise-vermek': 'Franchise Vermek',
  'franchise-almak': 'Franchise Almak',
  'ortak-tapmaq': 'Ortak Bulmak',
  'yeni-investisiya': 'Yeni Yatırım',
  'obyekt-icaresi': 'Mekan Kiralama',
  'horeca-ekipman': 'HORECA Ekipman',
};

export default function IlanlarimPage() {
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
          <h1 className="text-2xl font-bold text-gray-900">İlanlarım</h1>
          <p className="text-gray-500 mt-1">Tüm ilanlarınızı buradan yönetin</p>
        </div>
        <Link
          href="/b2b-panel/yeni-ilan"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus size={18} />
          Yeni İlan
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Toplam</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.active}</p>
          <p className="text-xs text-gray-500">Aktif</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
          <p className="text-xs text-gray-500">Beklemede</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
          <p className="text-xs text-gray-500">Taslak</p>
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
              placeholder="İlan ara..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <div className="flex gap-3">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="pending">Beklemede</option>
                <option value="rejected">Reddedildi</option>
                <option value="draft">Taslak</option>
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="appearance-none pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
              >
                <option value="all">Tüm Kategoriler</option>
                {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
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
            <p className="text-gray-500 font-medium">İlan bulunamadı</p>
            <p className="text-sm text-gray-400 mt-1">Filtreleri değiştirin veya yeni ilan oluşturun</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {filteredListings.map((listing) => {
              const statusConfig = STATUS_CONFIG[listing.status];
              const StatusIcon = statusConfig.icon;

              return (
                <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">{listing.title}</h3>
                        <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${statusConfig.color}`}>
                          <StatusIcon size={12} />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-500">{CATEGORY_LABELS[listing.category]}</span>
                        {listing.price && (
                          <span className="font-semibold text-red-600">
                            {listing.price.toLocaleString('tr-TR')} ₺
                          </span>
                        )}
                        <span className="text-gray-400">
                          {new Date(listing.createdAt).toLocaleDateString('tr-TR')}
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
                        <p className="text-xs text-gray-400">görüntülenme</p>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center gap-1 text-gray-600">
                          <MessageSquare size={16} />
                          <span className="font-semibold">{listing.inquiries}</span>
                        </div>
                        <p className="text-xs text-gray-400">soru</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Düzenle">
                        <Pencil size={16} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Paylaş">
                        <Share2 size={16} className="text-gray-400" />
                      </button>
                      <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Sil">
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
