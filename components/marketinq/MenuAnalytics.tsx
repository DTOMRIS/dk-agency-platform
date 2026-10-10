'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { classifyMenu, menuThresholds, POPULARITY_FACTOR, type MenuCategory } from '@/lib/toolkit/menu-matrix';
import {
  AlertCircle,
  Download,
  Plus,
  RefreshCw,
  Sparkles,
  Table2,
  Trash2,
} from 'lucide-react';
import { getMenuAnalyticsTips, type MenuAnalyticsCategory } from '@/app/actions/menu-analytics-ai';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

type MenuRow = {
  id: string;
  name: string;
  price: string;
  cost: string;
  sales: string;
};

type AnalyzedItem = {
  id: string;
  name: string;
  price: number;
  cost: number;
  sales: number;
  contributionMargin: number;
  foodCostPercent: number;
  menuMixPercent: number;
  category: MenuAnalyticsCategory;
};

type ActiveTab = 'matrix' | 'table';

const CATEGORY_COLORS: Record<MenuAnalyticsCategory, { border: string; bg: string; text: string; dot: string }> = {
  star: { border: 'border-[#C5A022]', bg: 'bg-[#FFF8E7]', text: 'text-[#8A6D12]', dot: 'bg-[#C5A022]' },
  plowhorse: { border: 'border-[#3B82F6]', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-[#3B82F6]' },
  puzzle: { border: 'border-[#8B5CF6]', bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-[#8B5CF6]' },
  dog: { border: 'border-[#E94560]', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-[#E94560]' },
};

const DEMO_ROWS: MenuRow[] = [
  { id: 'demo-1', name: 'Plov', price: '8', cost: '2.5', sales: '120' },
  { id: 'demo-2', name: 'Dolma', price: '7', cost: '3', sales: '45' },
  { id: 'demo-3', name: 'Qutab', price: '4', cost: '1.2', sales: '90' },
  { id: 'demo-4', name: 'Bozbas', price: '6', cost: '2.8', sales: '30' },
];

function newRow(index: number): MenuRow {
  return { id: `row-${Date.now()}-${index}`, name: '', price: '', cost: '', sales: '' };
}

function parseNumber(value: string): number {
  return Number.parseFloat(value.replace(',', '.')) || 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

// TASK-0523: one menu engine — Kasavana & Smith from lib/toolkit/menu-matrix (popular = ≥ 70% of the
// equal share, profitable = ≥ the SALES-WEIGHTED average margin). Before: plain averages (100% rule).
const CATEGORY_FROM_MATRIX: Record<MenuCategory, MenuAnalyticsCategory> = {
  star: 'star',
  plowHorse: 'plowhorse',
  puzzle: 'puzzle',
  dog: 'dog',
};

function formatNumber(value: number, locale: string, maximumFractionDigits = 2): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value);
}

function CategoryBadge({ category, label }: { category: MenuAnalyticsCategory; label: string }) {
  const color = CATEGORY_COLORS[category];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${color.border} ${color.bg} ${color.text}`}>
      <span className={`h-2 w-2 rounded-full ${color.dot}`} />
      {label}
    </span>
  );
}

export default function MenuAnalytics({ backHref = '/b2b-panel/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.menuAnalytics');
  const locale = useLocale();
  const localeForIntl = locale === 'az' ? AZ_NUMBER_LOCALE : locale === 'tr' ? 'tr-TR' : locale === 'ru' ? 'ru-RU' : 'en-US';

  const [period, setPeriod] = useState('May 2026');
  const [rows, setRows] = useState<MenuRow[]>([newRow(1), newRow(2)]);
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('matrix');
  const [error, setError] = useState<string | null>(null);
  const [tips, setTips] = useState<string | null>(null);
  const [tipsError, setTipsError] = useState(false);
  const [isPending, startTransition] = useTransition();

  const validRows = useMemo(() => rows
    .map((row) => ({
      ...row,
      name: row.name.trim().slice(0, 50),
      priceValue: parseNumber(row.price),
      costValue: parseNumber(row.cost),
      salesValue: Math.max(0, Math.floor(parseNumber(row.sales))),
    }))
    .filter((row) => row.name && row.priceValue > 0 && row.costValue >= 0 && row.salesValue > 0)
    .slice(0, 20), [rows]);

  const analysis = useMemo(() => {
    if (validRows.length < 2) return null;

    const totalSales = validRows.reduce((sum, row) => sum + row.salesValue, 0);
    if (totalSales <= 0) return null;

    const preliminary = validRows.map((row) => {
      const contributionMargin = row.priceValue - row.costValue;
      return {
        id: row.id,
        name: row.name,
        price: row.priceValue,
        cost: row.costValue,
        sales: row.salesValue,
        contributionMargin,
        foodCostPercent: row.priceValue > 0 ? (row.costValue / row.priceValue) * 100 : 0,
        menuMixPercent: (row.salesValue / totalSales) * 100,
      };
    });

    const matrix = classifyMenu(preliminary.map((item) => ({ id: item.id, name: item.name, salesCount: item.sales, contributionMargin: item.contributionMargin })));
    const categoryById = new Map(matrix.map((entry) => [entry.item.id, CATEGORY_FROM_MATRIX[entry.category]]));
    const averageContributionMargin = menuThresholds(matrix.map((entry) => entry.item)).margin;
    const items: AnalyzedItem[] = preliminary.map((item) => ({
      ...item,
      contributionMargin: round(item.contributionMargin),
      foodCostPercent: round(item.foodCostPercent),
      menuMixPercent: round(item.menuMixPercent),
      category: categoryById.get(item.id) ?? 'dog',
    }));

    return {
      items,
      totalSales,
      averageContributionMargin: round(averageContributionMargin),
      // K&S popularity bar: 70% of the equal share (100 / n)
      averageMenuMixPercent: round((100 / preliminary.length) * POPULARITY_FACTOR),
    };
  }, [validRows]);

  const grouped = useMemo(() => {
    const empty: Record<MenuAnalyticsCategory, AnalyzedItem[]> = { star: [], plowhorse: [], puzzle: [], dog: [] };
    if (!analysis) return empty;
    return analysis.items.reduce((acc, item) => {
      acc[item.category].push(item);
      return acc;
    }, empty);
  }, [analysis]);

  function updateRow(id: string, field: keyof Omit<MenuRow, 'id'>, value: string) {
    setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  }

  function addRow() {
    setRows((prev) => (prev.length >= 20 ? prev : [...prev, newRow(prev.length + 1)]));
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length <= 2 ? prev : prev.filter((row) => row.id !== id)));
  }

  function loadDemoData() {
    setRows(DEMO_ROWS);
    setPeriod('May 2026');
    setHasAnalyzed(false);
    setError(null);
    setTips(null);
    setTipsError(false);
  }

  function analyze() {
    if (!analysis || validRows.length < 2) {
      setError(t('min_items_error'));
      return;
    }
    setError(null);
    setTips(null);
    setTipsError(false);
    setHasAnalyzed(true);
    setActiveTab('matrix');
  }

  function loadTips() {
    if (!analysis) return;
    setTipsError(false);
    startTransition(async () => {
      const result = await getMenuAnalyticsTips({
        averageContributionMargin: analysis.averageContributionMargin,
        items: analysis.items.map((item) => ({
          name: item.name,
          contributionMargin: item.contributionMargin,
          category: item.category,
        })),
      });

      if (result.ok && result.tips) {
        setTips(result.tips);
        setTipsError(false);
      } else {
        setTips(null);
        setTipsError(true);
      }
    });
  }

  // TASK-0523: no automatic AI call on «Analiz et» — runs now count against the monthly limit,
  // so a run is spent only when the owner presses the AI button.

  const categoryLabels: Record<MenuAnalyticsCategory, string> = {
    star: t('star'),
    plowhorse: t('plowhorse'),
    puzzle: t('puzzle'),
    dog: t('dog'),
  };

  const quadrantMeta: Record<MenuAnalyticsCategory, { title: string; hint: string }> = {
    puzzle: { title: t('puzzle'), hint: t('puzzle_hint') },
    star: { title: `${t('star')} ⭐`, hint: t('star_hint') },
    dog: { title: t('dog'), hint: t('dog_hint') },
    plowhorse: { title: t('plowhorse'), hint: t('plowhorse_hint') },
  };

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6 print:max-w-none print:px-0">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          header, nav, footer, .no-print { display: none !important; }
          .print-surface { box-shadow: none !important; border-color: #d1d5db !important; }
          .print-break { break-inside: avoid; }
        }
      `}</style>

      <ToolHeader
        slug="menyu-analitik"
        title={t('title')}
        subtitle={t('subtitle')}
        backHref={backHref}
        actions={
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!hasAnalyzed}
            className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#E4DCCD] bg-white px-4 py-2 text-sm font-bold text-[#0F172A] shadow-sm transition hover:border-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {t('export_pdf')}
          </button>
        }
      />

      <section className="print-surface print-break mb-6 rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="block">
            <span className="mb-1.5 block text-sm font-bold text-[#0F172A]">{t('period_label')}</span>
            <input
              value={period}
              onChange={(event) => setPeriod(event.target.value)}
              className="min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
              placeholder="May 2026"
            />
          </label>
          <button
            type="button"
            onClick={loadDemoData}
            className="no-print min-h-11 rounded-lg border border-dashed border-slate-300 px-4 text-sm font-bold text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A]"
          >
            {t('load_demo')}
          </button>
        </div>

        <div className="hidden rounded-lg border border-[#E4DCCD] bg-[#FBF8F3] px-3 py-2 text-xs font-bold uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1.5fr_1fr_1fr_0.8fr_44px] md:gap-3">
          <span>{t('item_name')}</span>
          <span>{t('sell_price')}</span>
          <span>{t('food_cost')}</span>
          <span>{t('sales_count')}</span>
          <span />
        </div>

        <div className="mt-3 space-y-3">
          {rows.map((row, index) => (
            <div key={row.id} className="grid gap-3 rounded-2xl border border-[#E4DCCD] bg-white p-3 md:grid-cols-[1.5fr_1fr_1fr_0.8fr_44px] md:items-end md:border-0 md:p-0">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-500 md:hidden">{t('item_name')}</span>
                <input
                  value={row.name}
                  onChange={(event) => updateRow(row.id, 'name', event.target.value)}
                  maxLength={50}
                  className="min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54]"
                  placeholder={`${t('item_name')} #${index + 1}`}
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-500 md:hidden">{t('sell_price')}</span>
                <input
                  value={row.price}
                  onChange={(event) => updateRow(row.id, 'price', event.target.value)}
                  inputMode="decimal"
                  className="min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54]"
                  placeholder="0.00"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-500 md:hidden">{t('food_cost')}</span>
                <input
                  value={row.cost}
                  onChange={(event) => updateRow(row.id, 'cost', event.target.value)}
                  inputMode="decimal"
                  className="min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54]"
                  placeholder="0.00"
                />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-500 md:hidden">{t('sales_count')}</span>
                <input
                  value={row.sales}
                  onChange={(event) => updateRow(row.id, 'sales', event.target.value)}
                  inputMode="numeric"
                  className="min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54]"
                  placeholder="0"
                />
              </label>
              <button
                type="button"
                onClick={() => removeRow(row.id)}
                disabled={rows.length <= 2}
                className="no-print inline-flex min-h-11 items-center justify-center rounded-lg border border-[#E4DCCD] text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                aria-label={t('remove_item')}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={addRow}
            disabled={rows.length >= 20}
            className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 text-sm font-bold text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus size={16} />
            {t('add_item')}
          </button>
          <button
            type="button"
            onClick={analyze}
            className="no-print inline-flex min-h-12 items-center justify-center rounded-lg bg-dk-red-strong px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--dk-red)]/90"
          >
            {t('analyze')}
          </button>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            {error}
          </div>
        )}
      </section>

      {hasAnalyzed && analysis && (
        <div className="space-y-6">
          <section className="print-surface print-break rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-[#FBF8F3] p-3">
                <p className="text-xs font-bold uppercase text-slate-500">{t('period_label')}</p>
                <p className="mt-1 text-lg font-bold text-[#0F172A]">{period || '-'}</p>
              </div>
              <div className="rounded-lg bg-[#FBF8F3] p-3">
                <p className="text-xs font-bold uppercase text-slate-500">{t('avg_cm')}</p>
                <p className="mt-1 text-lg font-bold text-[#0F172A]">{formatNumber(analysis.averageContributionMargin, localeForIntl)} AZN</p>
              </div>
              <div className="rounded-lg bg-[#FBF8F3] p-3">
                <p className="text-xs font-bold uppercase text-slate-500">{t('avg_mix')}</p>
                <p className="mt-1 text-lg font-bold text-[#0F172A]">{formatNumber(analysis.averageMenuMixPercent, localeForIntl)}%</p>
              </div>
            </div>

            <div className="no-print mb-4 grid grid-cols-2 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => setActiveTab('matrix')}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${activeTab === 'matrix' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500'}`}
              >
                <Sparkles size={16} />
                {t('matrix_view')}
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${activeTab === 'table' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500'}`}
              >
                <Table2 size={16} />
                {t('table_view')}
              </button>
            </div>

            {(activeTab === 'matrix') && (
              <div className="grid grid-cols-2 overflow-hidden rounded-xl border border-[#E4DCCD]">
                {(['puzzle', 'star', 'dog', 'plowhorse'] as MenuAnalyticsCategory[]).map((category) => {
                  const color = CATEGORY_COLORS[category];
                  return (
                    <div key={category} className={`min-h-44 border-[#E4DCCD] p-3 sm:p-4 ${category === 'puzzle' || category === 'dog' ? 'border-r' : ''} ${category === 'puzzle' || category === 'star' ? 'border-b' : ''} ${color.bg}`}>
                      <div className="mb-3">
                        <h3 className={`text-sm font-extrabold uppercase ${color.text}`}>{quadrantMeta[category].title}</h3>
                        <p className="mt-1 text-xs leading-5 text-slate-600">{quadrantMeta[category].hint}</p>
                      </div>
                      <div className="space-y-2">
                        {grouped[category].length ? grouped[category].map((item) => (
                          <div key={item.id} className="rounded-lg bg-white/80 px-3 py-2 text-xs font-bold text-[#0F172A] shadow-sm">
                            {item.name}
                          </div>
                        )) : (
                          <p className="text-xs font-medium text-slate-400">{t('empty_quadrant')}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {(activeTab === 'table') && (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full border-collapse text-left text-sm">
                  <thead>
                    <tr className="border-b border-[#E4DCCD] text-xs uppercase text-slate-500">
                      <th className="py-3 pr-3">{t('item')}</th>
                      <th className="py-3 pr-3">{t('price')}</th>
                      <th className="py-3 pr-3">{t('cost')}</th>
                      <th className="py-3 pr-3">CM</th>
                      <th className="py-3 pr-3">FC%</th>
                      <th className="py-3 pr-3">Mix%</th>
                      <th className="py-3 pr-3">{t('category')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.items.map((item) => (
                      <tr key={item.id} className="border-b border-[#EFE9DE]">
                        <td className="py-3 pr-3 font-bold text-[#0F172A]">{item.name}</td>
                        <td className="py-3 pr-3">{formatNumber(item.price, localeForIntl)} AZN</td>
                        <td className="py-3 pr-3">{formatNumber(item.cost, localeForIntl)} AZN</td>
                        <td className="py-3 pr-3">{formatNumber(item.contributionMargin, localeForIntl)} AZN</td>
                        <td className="py-3 pr-3">{formatNumber(item.foodCostPercent, localeForIntl)}%</td>
                        <td className="py-3 pr-3">{formatNumber(item.menuMixPercent, localeForIntl)}%</td>
                        <td className="py-3 pr-3"><CategoryBadge category={item.category} label={categoryLabels[item.category]} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="print-surface print-break rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0F172A]">{t('ai_tips')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('ai_tips_subtitle')}</p>
              </div>
              {tipsError && (
                <button
                  type="button"
                  onClick={loadTips}
                  className="no-print inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#E4DCCD] px-3 text-sm font-bold text-[#0F172A] transition hover:border-[#0F172A]"
                >
                  <RefreshCw size={15} />
                  {t('retry')}
                </button>
              )}
            </div>

            {isPending && (
              <div className="space-y-3">
                <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
              </div>
            )}

            {!isPending && tipsError && (
              <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                {t('ai_error')}
              </div>
            )}

            {!isPending && tips && (
              <div className="whitespace-pre-wrap rounded-lg bg-[#FBF8F3] p-4 text-sm leading-7 text-slate-700">
                {tips}
              </div>
            )}

            {!isPending && !tips && !tipsError && (
              <button
                type="button"
                onClick={loadTips}
                data-testid="menu-ai-tips"
                className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-dk-red-strong px-4 text-sm font-bold text-white transition hover:bg-dk-red-deep"
              >
                {t('ai_cta')}
              </button>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
