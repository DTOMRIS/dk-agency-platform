'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Loader2,
  Package,
  Receipt,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

// ── i18n ─────────────────────────────────────────────────────────────

interface PageCopy {
  pageTitle: string;
  pageSubtitle: string;
  kpiTotalCost: string;
  kpiMonthlyTrend: string;
  kpiAvgInvoice: string;
  kpiCategories: string;
  invoiceUnit: string;
  prevMonthLabel: string;
  noData: string;
  perInvoice: string;
  activeCategories: string;
  trendChartTitle: string;
  tabCategories: string;
  tabSuppliers: string;
  tabProducts: string;
  goToInvoices: string;
  emptyCategoriesMsg: string;
  productUnit: string;
  grandTotal: string;
  emptySuppliersMsg: string;
  supplierAvg: string;
  emptyProductsMsg: string;
  colProduct: string;
  colCategory: string;
  colQuantity: string;
  colAvgPrice: string;
  colTotal: string;
  months: string[];
  monthsShort: string[];
}

const pageCopy: Record<Locale, PageCopy> = {
  az: {
    pageTitle: 'Food Cost Analiz',
    pageSubtitle: 'Kateqoriya üzrə xərc dağılımı və trendlər',
    kpiTotalCost: 'Ümumi Xərc',
    kpiMonthlyTrend: 'Aylıq Trend',
    kpiAvgInvoice: 'Ort. Fatura',
    kpiCategories: 'Kateqoriya',
    invoiceUnit: 'fatura',
    prevMonthLabel: 'Keçən ay:',
    noData: 'Məlumat yox',
    perInvoice: 'fatura başına',
    activeCategories: 'aktiv kateqoriya',
    trendChartTitle: 'Aylıq Xərc Trendi',
    tabCategories: 'Kateqoriyalar',
    tabSuppliers: 'Tədarükçülər',
    tabProducts: 'Məhsullar',
    goToInvoices: 'Faturalara keç',
    emptyCategoriesMsg: 'Bu ay üçün kateqoriya məlumatı yoxdur.',
    productUnit: 'məhsul',
    grandTotal: 'CƏMİ',
    emptySuppliersMsg: 'Bu ay üçün tədarükçü məlumatı yoxdur.',
    supplierAvg: 'ort.',
    emptyProductsMsg: 'Bu ay üçün məhsul məlumatı yoxdur.',
    colProduct: 'Məhsul',
    colCategory: 'Kateqoriya',
    colQuantity: 'Miqdar',
    colAvgPrice: 'Ort. qiymət',
    colTotal: 'Cəmi',
    months: ['', 'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'],
    monthsShort: ['', 'Yan', 'Fev', 'Mar', 'Apr', 'May', 'İyn', 'İyl', 'Avq', 'Sen', 'Okt', 'Noy', 'Dek'],
  },
  ru: {
    pageTitle: 'Анализ Food Cost',
    pageSubtitle: 'Распределение расходов по категориям и тренды',
    kpiTotalCost: 'Общий расход',
    kpiMonthlyTrend: 'Месячный тренд',
    kpiAvgInvoice: 'Ср. счёт',
    kpiCategories: 'Категории',
    invoiceUnit: 'счёт',
    prevMonthLabel: 'Прошлый месяц:',
    noData: 'Нет данных',
    perInvoice: 'за счёт',
    activeCategories: 'активных категорий',
    trendChartTitle: 'Ежемесячный тренд расходов',
    tabCategories: 'Категории',
    tabSuppliers: 'Поставщики',
    tabProducts: 'Продукты',
    goToInvoices: 'Перейти к счетам',
    emptyCategoriesMsg: 'Нет данных по категориям за этот месяц.',
    productUnit: 'позиций',
    grandTotal: 'ИТОГО',
    emptySuppliersMsg: 'Нет данных по поставщикам за этот месяц.',
    supplierAvg: 'ср.',
    emptyProductsMsg: 'Нет данных по продуктам за этот месяц.',
    colProduct: 'Продукт',
    colCategory: 'Категория',
    colQuantity: 'Кол-во',
    colAvgPrice: 'Ср. цена',
    colTotal: 'Итого',
    months: ['', 'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['', 'Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'],
  },
  en: {
    pageTitle: 'Food Cost Analysis',
    pageSubtitle: 'Cost breakdown by category and trends',
    kpiTotalCost: 'Total Cost',
    kpiMonthlyTrend: 'Monthly Trend',
    kpiAvgInvoice: 'Avg. Invoice',
    kpiCategories: 'Categories',
    invoiceUnit: 'invoices',
    prevMonthLabel: 'Last month:',
    noData: 'No data',
    perInvoice: 'per invoice',
    activeCategories: 'active categories',
    trendChartTitle: 'Monthly Cost Trend',
    tabCategories: 'Categories',
    tabSuppliers: 'Suppliers',
    tabProducts: 'Products',
    goToInvoices: 'Go to Invoices',
    emptyCategoriesMsg: 'No category data for this month.',
    productUnit: 'items',
    grandTotal: 'TOTAL',
    emptySuppliersMsg: 'No supplier data for this month.',
    supplierAvg: 'avg.',
    emptyProductsMsg: 'No product data for this month.',
    colProduct: 'Product',
    colCategory: 'Category',
    colQuantity: 'Quantity',
    colAvgPrice: 'Avg. Price',
    colTotal: 'Total',
    months: ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
  tr: {
    pageTitle: 'Food Cost Analizi',
    pageSubtitle: 'Kategoriye göre maliyet dağılımı ve trendler',
    kpiTotalCost: 'Toplam Maliyet',
    kpiMonthlyTrend: 'Aylık Trend',
    kpiAvgInvoice: 'Ort. Fatura',
    kpiCategories: 'Kategoriler',
    invoiceUnit: 'fatura',
    prevMonthLabel: 'Geçen ay:',
    noData: 'Veri yok',
    perInvoice: 'fatura başına',
    activeCategories: 'aktif kategori',
    trendChartTitle: 'Aylık Maliyet Trendi',
    tabCategories: 'Kategoriler',
    tabSuppliers: 'Tedarikçiler',
    tabProducts: 'Ürünler',
    goToInvoices: 'Faturalara git',
    emptyCategoriesMsg: 'Bu ay için kategori verisi bulunamadı.',
    productUnit: 'ürün',
    grandTotal: 'TOPLAM',
    emptySuppliersMsg: 'Bu ay için tedarikçi verisi bulunamadı.',
    supplierAvg: 'ort.',
    emptyProductsMsg: 'Bu ay için ürün verisi bulunamadı.',
    colProduct: 'Ürün',
    colCategory: 'Kategori',
    colQuantity: 'Miktar',
    colAvgPrice: 'Ort. fiyat',
    colTotal: 'Toplam',
    months: ['', 'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
    monthsShort: ['', 'Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  },
};

// ── Types ───────────────────────────────────────────────────────────

interface CategoryCost {
  categoryId: number | null;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  totalAmount: number;
  itemCount: number;
  percentage: number;
}

interface FoodCostReport {
  categories: CategoryCost[];
  grandTotal: number;
  invoiceCount: number;
  dateFrom: string;
  dateTo: string;
}

interface MonthlyTrendItem {
  month: string;
  totalAmount: number;
  invoiceCount: number;
}

interface SupplierCostItem {
  supplierName: string;
  totalAmount: number;
  invoiceCount: number;
  avgAmount: number;
}

interface TopProductItem {
  name: string;
  categoryName: string;
  totalQuantity: number;
  unit: string;
  totalAmount: number;
  avgUnitPrice: number;
}

interface AllData {
  report: FoodCostReport | null;
  trend: MonthlyTrendItem[];
  suppliers: SupplierCostItem[];
  products: TopProductItem[];
}

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_REPORT: FoodCostReport = {
  categories: [
    { categoryId: 1, categoryName: 'Ət və balıq məhsulları', categoryColor: '#DC2626', categoryIcon: 'beef', totalAmount: 245000, itemCount: 47, percentage: 28.16 },
    { categoryId: 3, categoryName: 'Meyvə və tərəvəz', categoryColor: '#22C55E', categoryIcon: 'apple', totalAmount: 120000, itemCount: 61, percentage: 13.79 },
    { categoryId: 6, categoryName: 'İçkilər (alkoqolsuz)', categoryColor: '#06B6D4', categoryIcon: 'cup-soda', totalAmount: 110000, itemCount: 34, percentage: 12.64 },
    { categoryId: 2, categoryName: 'Süd və süd məhsulları', categoryColor: '#3B82F6', categoryIcon: 'milk', totalAmount: 89000, itemCount: 23, percentage: 10.23 },
    { categoryId: 4, categoryName: 'Dənli və un məhsulları', categoryColor: '#F59E0B', categoryIcon: 'wheat', totalAmount: 78000, itemCount: 18, percentage: 8.97 },
    { categoryId: 8, categoryName: 'Baharatlar və souslar', categoryColor: '#F97316', categoryIcon: 'flame', totalAmount: 45000, itemCount: 15, percentage: 5.17 },
    { categoryId: 5, categoryName: 'Yağlar', categoryColor: '#EAB308', categoryIcon: 'droplet', totalAmount: 38000, itemCount: 9, percentage: 4.37 },
    { categoryId: 7, categoryName: 'İçkilər (alkoqollu)', categoryColor: '#8B5CF6', categoryIcon: 'wine', totalAmount: 72000, itemCount: 12, percentage: 8.28 },
    { categoryId: 9, categoryName: 'Qablaşdırma materialları', categoryColor: '#78716C', categoryIcon: 'box', totalAmount: 35000, itemCount: 8, percentage: 4.02 },
    { categoryId: 10, categoryName: 'Təmizlik və gigiyena', categoryColor: '#14B8A6', categoryIcon: 'sparkles', totalAmount: 28000, itemCount: 6, percentage: 3.22 },
    { categoryId: 12, categoryName: 'Sair', categoryColor: '#6B7280', categoryIcon: 'package', totalAmount: 10000, itemCount: 4, percentage: 1.15 },
  ],
  grandTotal: 870000,
  invoiceCount: 156,
  dateFrom: '2026-04-01',
  dateTo: '2026-04-30',
};

const MOCK_TREND: MonthlyTrendItem[] = [
  { month: '2025-11', totalAmount: 720000, invoiceCount: 112 },
  { month: '2025-12', totalAmount: 890000, invoiceCount: 134 },
  { month: '2026-01', totalAmount: 780000, invoiceCount: 121 },
  { month: '2026-02', totalAmount: 810000, invoiceCount: 128 },
  { month: '2026-03', totalAmount: 850000, invoiceCount: 145 },
  { month: '2026-04', totalAmount: 870000, invoiceCount: 156 },
];

const MOCK_SUPPLIERS: SupplierCostItem[] = [
  { supplierName: 'Metro Cash & Carry', totalAmount: 285000, invoiceCount: 45, avgAmount: 6333 },
  { supplierName: 'Bravo Supermarket', totalAmount: 178000, invoiceCount: 23, avgAmount: 7739 },
  { supplierName: 'Araz Supermarket', totalAmount: 124000, invoiceCount: 18, avgAmount: 6889 },
  { supplierName: 'Qafqaz Distribusiya', totalAmount: 98000, invoiceCount: 12, avgAmount: 8167 },
  { supplierName: 'Bazarstore', totalAmount: 67000, invoiceCount: 15, avgAmount: 4467 },
  { supplierName: 'Şirin Çörək', totalAmount: 45000, invoiceCount: 20, avgAmount: 2250 },
];

const MOCK_PRODUCTS: TopProductItem[] = [
  { name: 'Toyuq eti', categoryName: 'Ət və balıq', totalQuantity: 120, unit: 'kq', totalAmount: 102000, avgUnitPrice: 850 },
  { name: 'Dana əti', categoryName: 'Ət və balıq', totalQuantity: 45, unit: 'kq', totalAmount: 81000, avgUnitPrice: 1800 },
  { name: 'Zeytun yağı', categoryName: 'Yağlar', totalQuantity: 30, unit: 'litr', totalAmount: 36000, avgUnitPrice: 1200 },
  { name: 'Coca Cola 1L', categoryName: 'İçkilər (alkoqolsuz)', totalQuantity: 200, unit: 'əd', totalAmount: 34000, avgUnitPrice: 170 },
  { name: 'Kartof', categoryName: 'Meyvə və tərəvəz', totalQuantity: 250, unit: 'kq', totalAmount: 30000, avgUnitPrice: 120 },
  { name: 'Pomidor', categoryName: 'Meyvə və tərəvəz', totalQuantity: 180, unit: 'kq', totalAmount: 27000, avgUnitPrice: 150 },
  { name: 'Pendir (ağ)', categoryName: 'Süd və süd məhsulları', totalQuantity: 40, unit: 'kq', totalAmount: 24000, avgUnitPrice: 600 },
  { name: 'Un (1 sort)', categoryName: 'Dənli və un', totalQuantity: 300, unit: 'kq', totalAmount: 21000, avgUnitPrice: 70 },
  { name: 'Soğan', categoryName: 'Meyvə və tərəvəz', totalQuantity: 200, unit: 'kq', totalAmount: 16000, avgUnitPrice: 80 },
  { name: 'Kərə yağı', categoryName: 'Süd və süd məhsulları', totalQuantity: 15, unit: 'kq', totalAmount: 15000, avgUnitPrice: 1000 },
];

// ── Helpers ─────────────────────────────────────────────────────────

function formatMoney(qepik: number) {
  return `${(qepik / 100).toFixed(2)}`;
}

function formatMoneyShort(qepik: number) {
  if (qepik >= 100000) return `${(qepik / 100000).toFixed(1)}K`;
  return `${(qepik / 100).toFixed(0)}`;
}

function formatMonth(ym: string, monthsShort: string[]) {
  const [, m] = ym.split('-');
  const idx = parseInt(m, 10);
  return monthsShort[idx] ?? m;
}

function getMonthRange(offset: number, months: string[]): { dateFrom: string; dateTo: string; label: string } {
  const d = new Date();
  d.setMonth(d.getMonth() + offset);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const lastDay = new Date(y, m, 0).getDate();
  const ms = String(m).padStart(2, '0');
  return {
    dateFrom: `${y}-${ms}-01`,
    dateTo: `${y}-${ms}-${String(lastDay).padStart(2, '0')}`,
    label: `${months[m]} ${y}`,
  };
}

// ── Component ───────────────────────────────────────────────────────

export default function FoodCostDashboard() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FoodCostReport | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierCostItem[]>([]);
  const [products, setProducts] = useState<TopProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'suppliers' | 'products'>('categories');

  const { dateFrom, dateTo, label } = getMonthRange(monthOffset, copy.months);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/food-cost?type=all&dateFrom=${dateFrom}&dateTo=${dateTo}&months=6`);
      const json = (await res.json()) as { data: AllData };
      const d = json.data;

      if (d.report && d.report.categories.length > 0) {
        setReport(d.report);
        setTrend(d.trend);
        setSuppliers(d.suppliers);
        setProducts(d.products);
      } else {
        // Mock fallback
        setReport(MOCK_REPORT);
        setTrend(MOCK_TREND);
        setSuppliers(MOCK_SUPPLIERS);
        setProducts(MOCK_PRODUCTS);
      }
    } catch {
      setReport(MOCK_REPORT);
      setTrend(MOCK_TREND);
      setSuppliers(MOCK_SUPPLIERS);
      setProducts(MOCK_PRODUCTS);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => { void fetchData(); }, [fetchData]);

  // ── Export handlers ──
  const handleExportCsv = async () => {
    const { exportFoodCostToCsv } = await import('@/lib/invoice-ocr/export-utils');
    const cats = (report?.categories ?? []).map((c) => ({
      categoryName: c.categoryName,
      totalAmount: c.totalAmount,
      itemCount: c.itemCount,
      percentage: c.percentage,
    }));
    exportFoodCostToCsv(cats, report?.grandTotal ?? 0, label, `food-cost-${dateFrom}.csv`);
  };

  const handleExportExcel = async () => {
    const { exportFoodCostToExcel } = await import('@/lib/invoice-ocr/export-utils');
    const cats = (report?.categories ?? []).map((c) => ({
      categoryName: c.categoryName,
      totalAmount: c.totalAmount,
      itemCount: c.itemCount,
      percentage: c.percentage,
    }));
    await exportFoodCostToExcel(cats, report?.grandTotal ?? 0, label, `food-cost-${dateFrom}.xlsx`);
  };

  const handleExportPdf = async () => {
    const { exportFoodCostToPdf } = await import('@/lib/invoice-ocr/export-utils');
    const cats = (report?.categories ?? []).map((c) => ({
      categoryName: c.categoryName,
      totalAmount: c.totalAmount,
      itemCount: c.itemCount,
      percentage: c.percentage,
    }));
    await exportFoodCostToPdf(cats, report?.grandTotal ?? 0, label, `food-cost-${dateFrom}.pdf`);
  };

  // Trend calculation: compare current month with previous
  const currentMonthTotal = report?.grandTotal ?? 0;
  const prevTrend = trend.length >= 2 ? trend[trend.length - 2] : null;
  const trendChange = prevTrend && prevTrend.totalAmount > 0
    ? Math.round(((currentMonthTotal - prevTrend.totalAmount) / prevTrend.totalAmount) * 100)
    : 0;

  // Chart: bar chart heights
  const maxTrend = Math.max(...trend.map((t) => t.totalAmount), 1);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export buttons */}
          <button type="button" onClick={handleExportCsv} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
            <Download size={14} /> CSV
          </button>
          <button type="button" onClick={handleExportExcel} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
            <FileSpreadsheet size={14} /> Excel
          </button>
          <button type="button" onClick={handleExportPdf} className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
            <FileText size={14} /> PDF
          </button>

          {/* Separator */}
          <div className="mx-1 h-6 w-px bg-slate-200" />

          {/* Month Selector */}
          <button
            type="button"
            onClick={() => setMonthOffset((p) => p - 1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="min-w-[140px] text-center text-sm font-bold text-[var(--dk-navy)]">{label}</span>
          <button
            type="button"
            onClick={() => setMonthOffset((p) => Math.min(p + 1, 0))}
            disabled={monthOffset >= 0}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <KpiCard
          title={copy.kpiTotalCost}
          value={`${formatMoney(currentMonthTotal)} ₼`}
          sub={`${report?.invoiceCount ?? 0} ${copy.invoiceUnit}`}
          icon={<Receipt size={20} />}
          color="text-[var(--dk-navy)]"
        />
        <KpiCard
          title={copy.kpiMonthlyTrend}
          value={`${trendChange >= 0 ? '+' : ''}${trendChange}%`}
          sub={prevTrend ? `${copy.prevMonthLabel} ${formatMoney(prevTrend.totalAmount)} ₼` : copy.noData}
          icon={trendChange >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
          color={trendChange > 5 ? 'text-red-600' : trendChange < -5 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <KpiCard
          title={copy.kpiAvgInvoice}
          value={`${report && report.invoiceCount > 0 ? formatMoney(Math.round(currentMonthTotal / report.invoiceCount)) : '0.00'} ₼`}
          sub={copy.perInvoice}
          icon={<ShoppingCart size={20} />}
          color="text-[var(--dk-navy)]"
        />
        <KpiCard
          title={copy.kpiCategories}
          value={`${report?.categories.length ?? 0}`}
          sub={copy.activeCategories}
          icon={<Package size={20} />}
          color="text-[var(--dk-navy)]"
        />
      </div>

      {/* Trend Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--dk-gold)]" />
          <h2 className="text-sm font-bold text-[var(--dk-navy)]">{copy.trendChartTitle}</h2>
        </div>
        <div className="flex items-end gap-3" style={{ height: 180 }}>
          {trend.map((t) => {
            const h = Math.max((t.totalAmount / maxTrend) * 160, 8);
            const isCurrentMonth = t.month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            return (
              <div key={t.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500">{formatMoneyShort(t.totalAmount)}₼</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'bg-[var(--dk-gold)]' : 'bg-slate-200'}`}
                  style={{ height: h }}
                  title={`${formatMoney(t.totalAmount)} ₼ — ${t.invoiceCount} ${copy.invoiceUnit}`}
                />
                <span className="text-[11px] font-medium text-slate-500">{formatMonth(t.month, copy.monthsShort)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs: Categories / Suppliers / Products */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'categories' as const, label: copy.tabCategories, icon: <BarChart3 size={16} /> },
            { key: 'suppliers' as const, label: copy.tabSuppliers, icon: <ShoppingCart size={16} /> },
            { key: 'products' as const, label: copy.tabProducts, icon: <Package size={16} /> },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
                activeTab === tab.key
                  ? 'border-[var(--dk-gold)] text-[var(--dk-navy)]'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {activeTab === 'categories' && (
            <CategoriesTab
              categories={report?.categories ?? []}
              grandTotal={currentMonthTotal}
              emptyMsg={copy.emptyCategoriesMsg}
              productUnit={copy.productUnit}
              grandTotalLabel={copy.grandTotal}
            />
          )}
          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              emptyMsg={copy.emptySuppliersMsg}
              invoiceUnit={copy.invoiceUnit}
              avgLabel={copy.supplierAvg}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              emptyMsg={copy.emptyProductsMsg}
              colProduct={copy.colProduct}
              colCategory={copy.colCategory}
              colQuantity={copy.colQuantity}
              colAvgPrice={copy.colAvgPrice}
              colTotal={copy.colTotal}
            />
          )}
        </div>
      </div>

      {/* Bottom Link */}
      <div className="flex justify-center">
        <Link
          href="/dashboard/faturalar"
          className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
        >
          {copy.goToInvoices} &rarr;
        </Link>
      </div>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function KpiCard({ title, value, sub, icon, color }: {
  title: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
        <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 ${color}`}>
          {icon}
        </span>
      </div>
      <p className={`mt-2 text-2xl font-black ${color}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{sub}</p>
    </div>
  );
}

function CategoriesTab({ categories, grandTotal, emptyMsg, productUnit, grandTotalLabel }: {
  categories: CategoryCost[];
  grandTotal: number;
  emptyMsg: string;
  productUnit: string;
  grandTotalLabel: string;
}) {
  if (categories.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyMsg}</p>;
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => (
        <div key={cat.categoryId ?? 'null'} className="flex items-center gap-4">
          {/* Color dot */}
          <div className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: cat.categoryColor }} />

          {/* Name + item count */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{cat.categoryName}</p>
            <p className="text-xs text-slate-400">{cat.itemCount} {productUnit}</p>
          </div>

          {/* Progress bar */}
          <div className="hidden w-40 sm:block">
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${Math.min(cat.percentage, 100)}%`, backgroundColor: cat.categoryColor }}
              />
            </div>
          </div>

          {/* Amount + Percentage */}
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{formatMoney(cat.totalAmount)} ₼</p>
            <p className="text-xs font-medium text-slate-500">{cat.percentage}%</p>
          </div>
        </div>
      ))}

      {/* Grand Total */}
      <div className="flex items-center gap-4 border-t border-slate-200 pt-3">
        <div className="h-3 w-3 shrink-0" />
        <p className="flex-1 text-sm font-black text-[var(--dk-navy)]">{grandTotalLabel}</p>
        <div className="hidden w-40 sm:block" />
        <p className="text-right text-sm font-black text-[var(--dk-navy)]">{formatMoney(grandTotal)} ₼</p>
      </div>
    </div>
  );
}

function SuppliersTab({ suppliers, emptyMsg, invoiceUnit, avgLabel }: {
  suppliers: SupplierCostItem[];
  emptyMsg: string;
  invoiceUnit: string;
  avgLabel: string;
}) {
  if (suppliers.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyMsg}</p>;
  }

  const maxAmount = Math.max(...suppliers.map((s) => s.totalAmount), 1);

  return (
    <div className="space-y-3">
      {suppliers.map((s, i) => (
        <div key={s.supplierName} className="flex items-center gap-4">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold text-slate-500">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-800">{s.supplierName}</p>
            <p className="text-xs text-slate-400">{s.invoiceCount} {invoiceUnit} &middot; {avgLabel} {formatMoney(s.avgAmount)} ₼</p>
          </div>
          <div className="hidden w-32 sm:block">
            <div className="h-2 rounded-full bg-slate-100">
              <div
                className="h-2 rounded-full bg-[var(--dk-gold)] transition-all"
                style={{ width: `${(s.totalAmount / maxAmount) * 100}%` }}
              />
            </div>
          </div>
          <p className="text-right text-sm font-bold text-slate-800">{formatMoney(s.totalAmount)} ₼</p>
        </div>
      ))}
    </div>
  );
}

function ProductsTab({ products, emptyMsg, colProduct, colCategory, colQuantity, colAvgPrice, colTotal }: {
  products: TopProductItem[];
  emptyMsg: string;
  colProduct: string;
  colCategory: string;
  colQuantity: string;
  colAvgPrice: string;
  colTotal: string;
}) {
  if (products.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-400">{emptyMsg}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
            <th className="pb-2 pr-4">#</th>
            <th className="pb-2 pr-4">{colProduct}</th>
            <th className="pb-2 pr-4">{colCategory}</th>
            <th className="pb-2 pr-4 text-right">{colQuantity}</th>
            <th className="pb-2 pr-4 text-right">{colAvgPrice}</th>
            <th className="pb-2 text-right">{colTotal}</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p, i) => (
            <tr key={`${p.name}-${p.unit}`} className="border-b border-slate-100 last:border-0">
              <td className="py-2.5 pr-4 text-xs font-bold text-slate-400">{i + 1}</td>
              <td className="py-2.5 pr-4 font-semibold text-slate-800">{p.name}</td>
              <td className="py-2.5 pr-4 text-slate-500">{p.categoryName}</td>
              <td className="py-2.5 pr-4 text-right text-slate-600">{p.totalQuantity} {p.unit}</td>
              <td className="py-2.5 pr-4 text-right text-slate-600">{formatMoney(p.avgUnitPrice)} ₼</td>
              <td className="py-2.5 text-right font-bold text-slate-800">{formatMoney(p.totalAmount)} ₼</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
