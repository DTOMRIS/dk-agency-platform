// app/dashboard/raporlar/page.tsx
// DK Agency Admin - Raporlar Sayfası

'use client';

import { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  Filter,
  FileText,
  Users,
  Building2,
  DollarSign,
  Activity,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw
} from 'lucide-react';

const reportCategories = [
  { id: 'all', label: 'Tümü' },
  { id: 'financial', label: 'Finansal' },
  { id: 'partners', label: 'Partnerler' },
  { id: 'listings', label: 'İlanlar' },
  { id: 'traffic', label: 'Trafik' },
];

const reports = [
  {
    id: 1,
    title: 'Aylık Gelir Raporu',
    description: 'Ocak 2026 gelir ve gider özeti',
    category: 'financial',
    date: '15 Şubat 2026',
    icon: DollarSign,
    color: 'bg-green-100 text-green-600',
    trend: '+12.5%',
    trendUp: true,
  },
  {
    id: 2,
    title: 'Partner Performans Raporu',
    description: 'B2B partner aktivite ve dönüşüm analizi',
    category: 'partners',
    date: '14 Şubat 2026',
    icon: Users,
    color: 'bg-blue-100 text-blue-600',
    trend: '+8.3%',
    trendUp: true,
  },
  {
    id: 3,
    title: 'İlan Analitik Raporu',
    description: 'Kategori bazlı ilan performansı',
    category: 'listings',
    date: '13 Şubat 2026',
    icon: FileText,
    color: 'bg-purple-100 text-purple-600',
    trend: '+15.7%',
    trendUp: true,
  },
  {
    id: 4,
    title: 'Site Trafik Raporu',
    description: 'Haftalık ziyaretçi ve sayfa görüntüleme',
    category: 'traffic',
    date: '12 Şubat 2026',
    icon: Activity,
    color: 'bg-amber-100 text-amber-600',
    trend: '-2.1%',
    trendUp: false,
  },
  {
    id: 5,
    title: 'Deal Flow Raporu',
    description: 'Pipeline ve kapanış oranları',
    category: 'financial',
    date: '10 Şubat 2026',
    icon: TrendingUp,
    color: 'bg-red-100 text-red-600',
    trend: '+22.4%',
    trendUp: true,
  },
  {
    id: 6,
    title: 'Sektör Karşılaştırma Raporu',
    description: 'HORECA sektör benchmark analizi',
    category: 'partners',
    date: '8 Şubat 2026',
    icon: PieChart,
    color: 'bg-indigo-100 text-indigo-600',
    trend: '+5.8%',
    trendUp: true,
  },
];

const summaryCards = [
  { label: 'Toplam Rapor', value: '24', icon: FileText, color: 'bg-blue-500' },
  { label: 'Bu Ay Oluşturulan', value: '8', icon: Calendar, color: 'bg-green-500' },
  { label: 'İndirme Sayısı', value: '156', icon: Download, color: 'bg-purple-500' },
  { label: 'Aktif Analiz', value: '12', icon: Activity, color: 'bg-amber-500' },
];

export default function RaporlarPage() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [dateRange, setDateRange] = useState('month');

  const filteredReports = activeCategory === 'all' 
    ? reports 
    : reports.filter(r => r.category === activeCategory);

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Raporlar</h1>
          <p className="text-sm text-gray-500 mt-1">Platform analitik ve performans raporları</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="quarter">Bu Çeyrek</option>
            <option value="year">Bu Yıl</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Yenile</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
            <FileText size={16} />
            <span className="text-sm font-bold">Yeni Rapor</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {summaryCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className="bg-white rounded-xl border border-gray-200 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  <p className="text-sm text-gray-500 mt-1">{card.label}</p>
                </div>
                <div className={`w-12 h-12 ${card.color} rounded-xl flex items-center justify-center`}>
                  <Icon size={24} className="text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
        {reportCategories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.id
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Reports Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReports.map((report) => {
          const Icon = report.icon;
          return (
            <div
              key={report.id}
              className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-lg transition-all hover:border-gray-300 cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 ${report.color} rounded-xl flex items-center justify-center`}>
                  <Icon size={24} />
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  report.trendUp ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                }`}>
                  {report.trendUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {report.trend}
                </div>
              </div>
              <h3 className="font-bold text-gray-900 mb-1">{report.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{report.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span className="text-xs text-gray-400">{report.date}</span>
                <button className="flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium">
                  <Download size={14} />
                  İndir
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chart Placeholder */}
      <div className="mt-8 bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center">
              <BarChart3 size={20} className="text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900">Performans Özeti</h3>
              <p className="text-xs text-gray-500">Son 30 günlük trend</p>
            </div>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Grafik verisi yükleniyor...</p>
          </div>
        </div>
      </div>
    </div>
  );
}
