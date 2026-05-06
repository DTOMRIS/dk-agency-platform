// app/dashboard/raporlar/page.tsx
// DK Agency Admin - Raporlar Sayfası

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
  refresh: string;
  newReport: string;
  dateWeek: string;
  dateMonth: string;
  dateQuarter: string;
  dateYear: string;
  catAll: string;
  catFinancial: string;
  catPartners: string;
  catListings: string;
  catTraffic: string;
  statTotalReports: string;
  statCreatedThisMonth: string;
  statDownloads: string;
  statActiveAnalysis: string;
  download: string;
  chartTitle: string;
  chartSubtitle: string;
  chartLoading: string;
  reportMonthlyRevenue: string;
  reportMonthlyRevenueDesc: string;
  reportPartnerPerf: string;
  reportPartnerPerfDesc: string;
  reportListingAnalytics: string;
  reportListingAnalyticsDesc: string;
  reportSiteTraffic: string;
  reportSiteTrafficDesc: string;
  reportDealFlow: string;
  reportDealFlowDesc: string;
  reportSectorComparison: string;
  reportSectorComparisonDesc: string;
}> = {
  az: {
    pageTitle: 'Hesabatlar',
    pageSubtitle: 'Platforma analitika və performans hesabatları',
    refresh: 'Yenilə',
    newReport: 'Yeni Hesabat',
    dateWeek: 'Bu Həftə',
    dateMonth: 'Bu Ay',
    dateQuarter: 'Bu Rüb',
    dateYear: 'Bu İl',
    catAll: 'Hamısı',
    catFinancial: 'Maliyyə',
    catPartners: 'Tərəfdaşlar',
    catListings: 'Elanlar',
    catTraffic: 'Trafik',
    statTotalReports: 'Ümumi Hesabat',
    statCreatedThisMonth: 'Bu Ay Yaradılan',
    statDownloads: 'Yükləmə Sayı',
    statActiveAnalysis: 'Aktiv Analiz',
    download: 'Yüklə',
    chartTitle: 'Performans Xülasəsi',
    chartSubtitle: 'Son 30 günlük trend',
    chartLoading: 'Qrafik məlumatı yüklənir...',
    reportMonthlyRevenue: 'Aylıq Gəlir Hesabatı',
    reportMonthlyRevenueDesc: 'Yanvar 2026 gəlir və xərc xülasəsi',
    reportPartnerPerf: 'Tərəfdaş Performans Hesabatı',
    reportPartnerPerfDesc: 'B2B tərəfdaş aktivliyi və konversiya analizi',
    reportListingAnalytics: 'Elan Analitik Hesabatı',
    reportListingAnalyticsDesc: 'Kateqoriya əsaslı elan performansı',
    reportSiteTraffic: 'Sayt Trafik Hesabatı',
    reportSiteTrafficDesc: 'Həftəlik ziyarətçi və səhifə baxışları',
    reportDealFlow: 'Deal Flow Hesabatı',
    reportDealFlowDesc: 'Pipeline və bağlanma nisbətləri',
    reportSectorComparison: 'Sektor Müqayisə Hesabatı',
    reportSectorComparisonDesc: 'HORECA sektoru benchmark analizi',
  },
  ru: {
    pageTitle: 'Отчёты',
    pageSubtitle: 'Аналитика платформы и отчёты о производительности',
    refresh: 'Обновить',
    newReport: 'Новый отчёт',
    dateWeek: 'Эта неделя',
    dateMonth: 'Этот месяц',
    dateQuarter: 'Этот квартал',
    dateYear: 'Этот год',
    catAll: 'Все',
    catFinancial: 'Финансовые',
    catPartners: 'Партнёры',
    catListings: 'Объявления',
    catTraffic: 'Трафик',
    statTotalReports: 'Всего отчётов',
    statCreatedThisMonth: 'Создано в этом месяце',
    statDownloads: 'Загрузок',
    statActiveAnalysis: 'Активных анализов',
    download: 'Скачать',
    chartTitle: 'Сводка производительности',
    chartSubtitle: 'Тренд за последние 30 дней',
    chartLoading: 'Загрузка данных графика...',
    reportMonthlyRevenue: 'Ежемесячный отчёт о доходах',
    reportMonthlyRevenueDesc: 'Сводка доходов и расходов за январь 2026',
    reportPartnerPerf: 'Отчёт об эффективности партнёров',
    reportPartnerPerfDesc: 'Анализ активности B2B-партнёров и конверсий',
    reportListingAnalytics: 'Аналитический отчёт по объявлениям',
    reportListingAnalyticsDesc: 'Производительность объявлений по категориям',
    reportSiteTraffic: 'Отчёт о трафике сайта',
    reportSiteTrafficDesc: 'Еженедельные посетители и просмотры страниц',
    reportDealFlow: 'Отчёт по Deal Flow',
    reportDealFlowDesc: 'Pipeline и коэффициенты закрытия',
    reportSectorComparison: 'Отраслевой сравнительный отчёт',
    reportSectorComparisonDesc: 'Бенчмарк-анализ сектора HORECA',
  },
  en: {
    pageTitle: 'Reports',
    pageSubtitle: 'Platform analytics and performance reports',
    refresh: 'Refresh',
    newReport: 'New Report',
    dateWeek: 'This Week',
    dateMonth: 'This Month',
    dateQuarter: 'This Quarter',
    dateYear: 'This Year',
    catAll: 'All',
    catFinancial: 'Financial',
    catPartners: 'Partners',
    catListings: 'Listings',
    catTraffic: 'Traffic',
    statTotalReports: 'Total Reports',
    statCreatedThisMonth: 'Created This Month',
    statDownloads: 'Downloads',
    statActiveAnalysis: 'Active Analysis',
    download: 'Download',
    chartTitle: 'Performance Summary',
    chartSubtitle: 'Last 30-day trend',
    chartLoading: 'Loading chart data...',
    reportMonthlyRevenue: 'Monthly Revenue Report',
    reportMonthlyRevenueDesc: 'January 2026 revenue and expense summary',
    reportPartnerPerf: 'Partner Performance Report',
    reportPartnerPerfDesc: 'B2B partner activity and conversion analysis',
    reportListingAnalytics: 'Listing Analytics Report',
    reportListingAnalyticsDesc: 'Category-based listing performance',
    reportSiteTraffic: 'Site Traffic Report',
    reportSiteTrafficDesc: 'Weekly visitors and page views',
    reportDealFlow: 'Deal Flow Report',
    reportDealFlowDesc: 'Pipeline and closing rates',
    reportSectorComparison: 'Sector Comparison Report',
    reportSectorComparisonDesc: 'HORECA sector benchmark analysis',
  },
  tr: {
    pageTitle: 'Raporlar',
    pageSubtitle: 'Platform analitik ve performans raporları',
    refresh: 'Yenile',
    newReport: 'Yeni Rapor',
    dateWeek: 'Bu Hafta',
    dateMonth: 'Bu Ay',
    dateQuarter: 'Bu Çeyrek',
    dateYear: 'Bu Yıl',
    catAll: 'Tümü',
    catFinancial: 'Finansal',
    catPartners: 'Partnerler',
    catListings: 'İlanlar',
    catTraffic: 'Trafik',
    statTotalReports: 'Toplam Rapor',
    statCreatedThisMonth: 'Bu Ay Oluşturulan',
    statDownloads: 'İndirme Sayısı',
    statActiveAnalysis: 'Aktif Analiz',
    download: 'İndir',
    chartTitle: 'Performans Özeti',
    chartSubtitle: 'Son 30 günlük trend',
    chartLoading: 'Grafik verisi yükleniyor...',
    reportMonthlyRevenue: 'Aylık Gelir Raporu',
    reportMonthlyRevenueDesc: 'Ocak 2026 gelir ve gider özeti',
    reportPartnerPerf: 'Partner Performans Raporu',
    reportPartnerPerfDesc: 'B2B partner aktivite ve dönüşüm analizi',
    reportListingAnalytics: 'İlan Analitik Raporu',
    reportListingAnalyticsDesc: 'Kategori bazlı ilan performansı',
    reportSiteTraffic: 'Site Trafik Raporu',
    reportSiteTrafficDesc: 'Haftalık ziyaretçi ve sayfa görüntüleme',
    reportDealFlow: 'Deal Flow Raporu',
    reportDealFlowDesc: 'Pipeline ve kapanış oranları',
    reportSectorComparison: 'Sektör Karşılaştırma Raporu',
    reportSectorComparisonDesc: 'HORECA sektör benchmark analizi',
  },
};

export default function RaporlarPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const reportCategories = [
    { id: 'all', label: copy.catAll },
    { id: 'financial', label: copy.catFinancial },
    { id: 'partners', label: copy.catPartners },
    { id: 'listings', label: copy.catListings },
    { id: 'traffic', label: copy.catTraffic },
  ];

  const reports = [
    {
      id: 1,
      title: copy.reportMonthlyRevenue,
      description: copy.reportMonthlyRevenueDesc,
      category: 'financial',
      date: '15 Şubat 2026',
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
      trend: '+12.5%',
      trendUp: true,
    },
    {
      id: 2,
      title: copy.reportPartnerPerf,
      description: copy.reportPartnerPerfDesc,
      category: 'partners',
      date: '14 Şubat 2026',
      icon: Users,
      color: 'bg-blue-100 text-blue-600',
      trend: '+8.3%',
      trendUp: true,
    },
    {
      id: 3,
      title: copy.reportListingAnalytics,
      description: copy.reportListingAnalyticsDesc,
      category: 'listings',
      date: '13 Şubat 2026',
      icon: FileText,
      color: 'bg-purple-100 text-purple-600',
      trend: '+15.7%',
      trendUp: true,
    },
    {
      id: 4,
      title: copy.reportSiteTraffic,
      description: copy.reportSiteTrafficDesc,
      category: 'traffic',
      date: '12 Şubat 2026',
      icon: Activity,
      color: 'bg-amber-100 text-amber-600',
      trend: '-2.1%',
      trendUp: false,
    },
    {
      id: 5,
      title: copy.reportDealFlow,
      description: copy.reportDealFlowDesc,
      category: 'financial',
      date: '10 Şubat 2026',
      icon: TrendingUp,
      color: 'bg-red-100 text-red-600',
      trend: '+22.4%',
      trendUp: true,
    },
    {
      id: 6,
      title: copy.reportSectorComparison,
      description: copy.reportSectorComparisonDesc,
      category: 'partners',
      date: '8 Şubat 2026',
      icon: PieChart,
      color: 'bg-indigo-100 text-indigo-600',
      trend: '+5.8%',
      trendUp: true,
    },
  ];

  const summaryCards = [
    { label: copy.statTotalReports, value: '24', icon: FileText, color: 'bg-blue-500' },
    { label: copy.statCreatedThisMonth, value: '8', icon: Calendar, color: 'bg-green-500' },
    { label: copy.statDownloads, value: '156', icon: Download, color: 'bg-purple-500' },
    { label: copy.statActiveAnalysis, value: '12', icon: Activity, color: 'bg-amber-500' },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{copy.pageSubtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-dk-red/20"
          >
            <option value="week">{copy.dateWeek}</option>
            <option value="month">{copy.dateMonth}</option>
            <option value="quarter">{copy.dateQuarter}</option>
            <option value="year">{copy.dateYear}</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">{copy.refresh}</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-dk-red text-white rounded-xl hover:bg-dk-red-strong transition-colors">
            <FileText size={16} />
            <span className="text-sm font-bold">{copy.newReport}</span>
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
                ? 'bg-dk-red text-white'
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
                <button className="flex items-center gap-1 text-dk-red hover:text-dk-red-strong text-sm font-medium">
                  <Download size={14} />
                  {copy.download}
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
              <h3 className="font-bold text-gray-900">{copy.chartTitle}</h3>
              <p className="text-xs text-gray-500">{copy.chartSubtitle}</p>
            </div>
          </div>
        </div>
        <div className="h-64 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <BarChart3 size={48} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{copy.chartLoading}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
