// app/b2b-panel/page.tsx
// DK Agency - B2B Portal Dashboard

'use client';

import React from 'react';
import Link from 'next/link';
import {
  FileText, Eye, MessageSquare, TrendingUp,
  Plus, ArrowRight, Clock, CheckCircle,
  AlertTriangle, Star, Briefcase
} from 'lucide-react';

const STATS = [
  { label: 'Aktif İlanlar', value: 4, icon: FileText, color: 'bg-blue-500', change: '+1' },
  { label: 'Toplam Görüntülenme', value: 2847, icon: Eye, color: 'bg-green-500', change: '+12%' },
  { label: 'Gelen Teklifler', value: 8, icon: Briefcase, color: 'bg-purple-500', change: '+3' },
  { label: 'Mesajlar', value: 15, icon: MessageSquare, color: 'bg-amber-500', change: '+5' },
];

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

const STATUS_CONFIG = {
  active: { label: 'Aktif', icon: CheckCircle, color: 'text-green-600 bg-green-50' },
  pending: { label: 'Onay Bekliyor', icon: Clock, color: 'text-amber-600 bg-amber-50' },
  rejected: { label: 'Reddedildi', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
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

export default function B2BPanelPage() {
  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hoş Geldiniz!</h1>
          <p className="text-gray-500 mt-1">İstanbul HORECA Group - B2B Portal</p>
        </div>
        <Link
          href="/b2b-panel/yeni-ilan"
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-xl font-semibold transition-colors"
        >
          <Plus size={18} />
          Yeni İlan Oluştur
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
                {stat.value.toLocaleString('tr-TR')}
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
              <h2 className="font-bold text-gray-900">İlanlarım</h2>
              <Link href="/b2b-panel/ilanlarim" className="text-sm text-red-600 font-medium hover:text-red-700 flex items-center gap-1">
                Tümünü Gör <ArrowRight size={14} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {MY_LISTINGS.map((listing) => {
                const statusConfig = STATUS_CONFIG[listing.status as keyof typeof STATUS_CONFIG];
                const StatusIcon = statusConfig.icon;

                return (
                  <div key={listing.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{listing.title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500">{CATEGORY_LABELS[listing.category]}</span>
                          <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-lg ${statusConfig.color}`}>
                            <StatusIcon size={12} />
                            {statusConfig.label}
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
            <h3 className="font-bold text-gray-900 mb-4">Son Teklifler</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Briefcase size={18} className="text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Cafe Devri için yeni teklif</p>
                  <p className="text-xs text-gray-500">2 saat önce</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                  <MessageSquare size={18} className="text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Franchise sorusu</p>
                  <p className="text-xs text-gray-500">5 saat önce</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Star size={18} className="text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">İlanınız favorilere eklendi</p>
                  <p className="text-xs text-gray-500">1 gün önce</p>
                </div>
              </div>
            </div>
            <Link href="/b2b-panel/teklifler" className="mt-4 inline-flex items-center gap-1 text-sm text-red-600 font-medium hover:text-red-700">
              Tüm teklifler <ArrowRight size={14} />
            </Link>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white">
            <h3 className="font-bold mb-4">Hızlı İşlemler</h3>
            <div className="space-y-2">
              <Link href="/b2b-panel/yeni-ilan" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <Plus size={18} />
                <span className="text-sm font-medium">Yeni İlan</span>
              </Link>
              <Link href="/b2b-panel/toolkit" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <TrendingUp size={18} />
                <span className="text-sm font-medium">Analiz Araçları</span>
              </Link>
              <Link href="/b2b-panel/profil" className="flex items-center gap-3 p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                <FileText size={18} />
                <span className="text-sm font-medium">Profili Güncelle</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
