'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
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
import { useTranslations } from 'next-intl';


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

// ── Mock Data (Empty Fallbacks) ───────────────────────────────────────

const MOCK_REPORT: FoodCostReport = {
  categories: [],
  grandTotal: 0,
  invoiceCount: 0,
  dateFrom: '',
  dateTo: '',
};

const MOCK_TREND: MonthlyTrendItem[] = [];

const MOCK_SUPPLIERS: SupplierCostItem[] = [];

const MOCK_PRODUCTS: TopProductItem[] = [];

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
  const t = useTranslations('dashboardFoodCost');
  const months = t.raw('months') as string[];
  const monthsShort = t.raw('monthsShort') as string[];

  const [monthOffset, setMonthOffset] = useState(0);
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<FoodCostReport | null>(null);
  const [trend, setTrend] = useState<MonthlyTrendItem[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierCostItem[]>([]);
  const [products, setProducts] = useState<TopProductItem[]>([]);
  const [activeTab, setActiveTab] = useState<'categories' | 'suppliers' | 'products'>('categories');

  const { dateFrom, dateTo, label } = getMonthRange(monthOffset, months);

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
          <h1 className="text-2xl font-black text-[var(--dk-navy)]">{t('pageTitle')}</h1>
          <p className="mt-1 text-sm text-slate-500">{t('pageSubtitle')}</p>
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
          title={t('kpiTotalCost')}
          value={`${formatMoney(currentMonthTotal)} ₼`}
          sub={`${report?.invoiceCount ?? 0} ${t('invoiceUnit')}`}
          icon={<Receipt size={20} />}
          color="text-[var(--dk-navy)]"
        />
        <KpiCard
          title={t('kpiMonthlyTrend')}
          value={`${trendChange >= 0 ? '+' : ''}${trendChange}%`}
          sub={prevTrend ? `${t('prevMonthLabel')} ${formatMoney(prevTrend.totalAmount)} ₼` : t('noData')}
          icon={trendChange >= 0 ? <ArrowUp size={20} /> : <ArrowDown size={20} />}
          color={trendChange > 5 ? 'text-red-600' : trendChange < -5 ? 'text-emerald-600' : 'text-amber-600'}
        />
        <KpiCard
          title={t('kpiAvgInvoice')}
          value={`${report && report.invoiceCount > 0 ? formatMoney(Math.round(currentMonthTotal / report.invoiceCount)) : '0.00'} ₼`}
          sub={t('perInvoice')}
          icon={<ShoppingCart size={20} />}
          color="text-[var(--dk-navy)]"
        />
        <KpiCard
          title={t('kpiCategories')}
          value={`${report?.categories.length ?? 0}`}
          sub={t('activeCategories')}
          icon={<Package size={20} />}
          color="text-[var(--dk-navy)]"
        />
      </div>

      {/* Trend Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center gap-2">
          <TrendingUp size={18} className="text-[var(--dk-gold)]" />
          <h2 className="text-sm font-bold text-[var(--dk-navy)]">{t('trendChartTitle')}</h2>
        </div>
        <div className="flex items-end gap-3" style={{ height: 180 }}>
          {trend.map((item) => {
            const h = Math.max((item.totalAmount / maxTrend) * 160, 8);
            const isCurrentMonth = item.month === `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
            return (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-[10px] font-semibold text-slate-500">{formatMoneyShort(item.totalAmount)}₼</span>
                <div
                  className={`w-full rounded-t-lg transition-all ${isCurrentMonth ? 'bg-[var(--dk-gold)]' : 'bg-slate-200'}`}
                  style={{ height: h }}
                  title={`${formatMoney(item.totalAmount)} ₼ — ${item.invoiceCount} ${t('invoiceUnit')}`}
                />
                <span className="text-[11px] font-medium text-slate-500">{formatMonth(item.month, monthsShort)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tabs: Categories / Suppliers / Products */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="flex border-b border-slate-200">
          {[
            { key: 'categories' as const, label: t('tabCategories'), icon: <BarChart3 size={16} /> },
            { key: 'suppliers' as const, label: t('tabSuppliers'), icon: <ShoppingCart size={16} /> },
            { key: 'products' as const, label: t('tabProducts'), icon: <Package size={16} /> },
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
              emptyMsg={t('emptyCategoriesMsg')}
              productUnit={t('productUnit')}
              grandTotalLabel={t('grandTotal')}
            />
          )}
          {activeTab === 'suppliers' && (
            <SuppliersTab
              suppliers={suppliers}
              emptyMsg={t('emptySuppliersMsg')}
              invoiceUnit={t('invoiceUnit')}
              avgLabel={t('supplierAvg')}
            />
          )}
          {activeTab === 'products' && (
            <ProductsTab
              products={products}
              emptyMsg={t('emptyProductsMsg')}
              colProduct={t('colProduct')}
              colCategory={t('colCategory')}
              colQuantity={t('colQuantity')}
              colAvgPrice={t('colAvgPrice')}
              colTotal={t('colTotal')}
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
          {t('goToInvoices')} &rarr;
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
