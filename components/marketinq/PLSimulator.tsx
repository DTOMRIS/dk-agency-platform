'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Clipboard,
  Download,
  Loader2,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { getPLAIAnalysis, type PLPeriod } from '@/app/actions/pl-ai-analysis';

type PLInputs = {
  foodSales: string;
  beverageSales: string;
  otherRevenue: string;
  beginInventory: string;
  purchases: string;
  endInventory: string;
  wages: string;
  taxesInsurance: string;
  rent: string;
  utilities: string;
  insurance: string;
  license: string;
  marketing: string;
  other: string;
};

type Status = 'good' | 'warning' | 'critical' | 'neutral';

const DEMO_INPUTS: PLInputs = {
  foodSales: '15000',
  beverageSales: '3000',
  otherRevenue: '0',
  beginInventory: '4000',
  purchases: '6000',
  endInventory: '3500',
  wages: '5000',
  taxesInsurance: '800',
  rent: '2000',
  utilities: '500',
  insurance: '0',
  license: '0',
  marketing: '300',
  other: '0',
};

const EMPTY_INPUTS: PLInputs = {
  foodSales: '',
  beverageSales: '',
  otherRevenue: '',
  beginInventory: '',
  purchases: '',
  endInventory: '',
  wages: '',
  taxesInsurance: '',
  rent: '',
  utilities: '',
  insurance: '',
  license: '',
  marketing: '',
  other: '',
};

const PERIODS: PLPeriod[] = ['weekly', 'monthly', 'yearly'];

function parseAmount(value: string): number {
  return Math.max(0, Number.parseFloat(value.replace(',', '.')) || 0);
}

function pct(part: number, total: number): number {
  return total > 0 ? (part / total) * 100 : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function getLocale(locale: string) {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function statusColor(status: Status) {
  if (status === 'good') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'critical') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function percentStatus(value: number, goodMax: number, warningMax: number): Status {
  if (value <= goodMax) return 'good';
  if (value <= warningMax) return 'warning';
  return 'critical';
}

function Slider({ label, value, min, max, suffix, onChange }: { label: string; value: number; min: number; max: number; suffix: string; onChange: (value: number) => void }) {
  return (
    <label className="block">
      <div className="mb-2 flex items-center justify-between gap-3 text-sm font-bold text-[var(--dk-navy)]">
        <span>{label}</span>
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{value > 0 && min < 0 ? `+${value}` : value}{suffix}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-[var(--dk-red)]"
      />
    </label>
  );
}

export default function PLSimulator({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.plSimulator');
  const locale = useLocale();
  const localeForIntl = getLocale(locale);

  const [period, setPeriod] = useState<PLPeriod>('monthly');
  const [inputs, setInputs] = useState<PLInputs>(DEMO_INPUTS);
  const [showOverhead, setShowOverhead] = useState(true);
  const [salesGrowth, setSalesGrowth] = useState(0);
  const [foodReduction, setFoodReduction] = useState(0);
  const [laborReduction, setLaborReduction] = useState(0);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const calc = useMemo(() => {
    const foodSales = parseAmount(inputs.foodSales);
    const beverageSales = parseAmount(inputs.beverageSales);
    const otherRevenue = parseAmount(inputs.otherRevenue);
    const totalSales = foodSales + beverageSales + otherRevenue;
    const cogs = Math.max(0, parseAmount(inputs.beginInventory) + parseAmount(inputs.purchases) - parseAmount(inputs.endInventory));
    const labor = parseAmount(inputs.wages) + parseAmount(inputs.taxesInsurance);
    const primeCost = cogs + labor;
    const overhead = parseAmount(inputs.rent) + parseAmount(inputs.utilities) + parseAmount(inputs.insurance) + parseAmount(inputs.license) + parseAmount(inputs.marketing) + parseAmount(inputs.other);
    const grossProfit = totalSales - cogs;
    const operatingProfit = grossProfit - labor - overhead;
    const variableCostPercent = totalSales > 0 ? primeCost / totalSales : 0;
    const breakevenSales = variableCostPercent < 1 ? overhead / (1 - variableCostPercent) : 0;

    return {
      totalSales,
      cogs,
      foodCostPercent: pct(cogs, totalSales),
      labor,
      laborPercent: pct(labor, totalSales),
      primeCost,
      primeCostPercent: pct(primeCost, totalSales),
      overhead,
      grossProfit,
      grossProfitPercent: pct(grossProfit, totalSales),
      operatingProfit,
      netProfitPercent: pct(operatingProfit, totalSales),
      breakevenSales,
      variableCostPercent,
    };
  }, [inputs]);

  const scenario = useMemo(() => {
    const scenarioSales = calc.totalSales * (1 + salesGrowth / 100);
    const scenarioCogs = calc.cogs * (1 - foodReduction / 100);
    const scenarioLabor = calc.labor * (1 - laborReduction / 100);
    const scenarioNet = scenarioSales - scenarioCogs - scenarioLabor - calc.overhead;
    return {
      totalSales: scenarioSales,
      cogs: scenarioCogs,
      labor: scenarioLabor,
      netProfit: scenarioNet,
      netProfitPercent: pct(scenarioNet, scenarioSales),
    };
  }, [calc, foodReduction, laborReduction, salesGrowth]);

  const hasSales = calc.totalSales > 0;

  function updateInput(field: keyof PLInputs, value: string) {
    setInputs((prev) => ({ ...prev, [field]: value }));
    setAiText(null);
    setAiError(null);
  }

  function formatMoney(value: number) {
    return `${new Intl.NumberFormat(localeForIntl, { maximumFractionDigits: 0 }).format(round(value))} AZN`;
  }

  function formatPercent(value: number) {
    return `${new Intl.NumberFormat(localeForIntl, { maximumFractionDigits: 1 }).format(round(value))}%`;
  }

  function statusLabel(status: Status) {
    if (status === 'good') return t('status_good');
    if (status === 'warning') return t('status_warning');
    if (status === 'critical') return t('status_critical');
    return '-';
  }

  const kpis = [
    { label: t('total_sales'), value: formatMoney(calc.totalSales), status: 'neutral' as Status, hint: '' },
    { label: 'COGS', value: formatMoney(calc.cogs), status: percentStatus(calc.foodCostPercent, 30, 35), hint: t('benchmark_food') },
    { label: t('food_cost_pct'), value: formatPercent(calc.foodCostPercent), status: percentStatus(calc.foodCostPercent, 30, 35), hint: t('benchmark_food') },
    { label: t('labor_cost_pct'), value: formatPercent(calc.laborPercent), status: percentStatus(calc.laborPercent, 30, 35), hint: t('benchmark_labor') },
    { label: t('prime_cost'), value: formatPercent(calc.primeCostPercent), status: percentStatus(calc.primeCostPercent, 60, 70), hint: t('benchmark_prime') },
    { label: t('gross_profit'), value: formatMoney(calc.grossProfit), status: 'neutral' as Status, hint: formatPercent(calc.grossProfitPercent) },
    { label: t('net_profit'), value: formatMoney(calc.operatingProfit), status: calc.operatingProfit > 0 ? 'good' as Status : 'critical' as Status, hint: formatPercent(calc.netProfitPercent) },
    { label: t('net_profit_pct'), value: formatPercent(calc.netProfitPercent), status: calc.netProfitPercent >= 5 ? 'good' as Status : calc.netProfitPercent >= 3 ? 'warning' as Status : 'critical' as Status, hint: t('benchmark_net') },
    { label: t('breakeven'), value: formatMoney(calc.breakevenSales), status: calc.totalSales > calc.breakevenSales ? 'good' as Status : 'critical' as Status, hint: t('benchmark_breakeven') },
  ];

  const chartSegments = [
    { label: 'COGS', value: calc.cogs, color: 'bg-red-500' },
    { label: t('labor_section'), value: calc.labor, color: 'bg-blue-500' },
    { label: t('overhead_section'), value: calc.overhead, color: 'bg-purple-500' },
    { label: t('net_profit'), value: Math.max(0, calc.operatingProfit), color: 'bg-emerald-500' },
  ].map((segment) => ({
    ...segment,
    width: hasSales ? Math.max(0, Math.min(100, pct(segment.value, calc.totalSales))) : 0,
  }));

  function loadAI() {
    if (!hasSales) {
      setAiError(t('validation_error'));
      return;
    }
    setAiError(null);
    startTransition(async () => {
      const result = await getPLAIAnalysis({
        period,
        totalSales: round(calc.totalSales),
        cogs: round(calc.cogs),
        foodCostPercent: round(calc.foodCostPercent),
        labor: round(calc.labor),
        laborPercent: round(calc.laborPercent),
        primeCost: round(calc.primeCost),
        primeCostPercent: round(calc.primeCostPercent),
        overhead: round(calc.overhead),
        netProfit: round(calc.operatingProfit),
        netProfitPercent: round(calc.netProfitPercent),
        breakevenSales: round(calc.breakevenSales),
      });
      if (result.ok && result.analysis) {
        setAiText(result.analysis);
        setAiError(null);
      } else {
        setAiText(null);
        setAiError(t(`errors.${result.error ?? 'ai-failed'}`));
      }
    });
  }

  const copyText = `${t('title')}
${t('total_sales')}: ${formatMoney(calc.totalSales)}
COGS: ${formatMoney(calc.cogs)} (${formatPercent(calc.foodCostPercent)})
${t('labor_section')}: ${formatMoney(calc.labor)} (${formatPercent(calc.laborPercent)})
${t('prime_cost')}: ${formatMoney(calc.primeCost)} (${formatPercent(calc.primeCostPercent)})
${t('overhead_section')}: ${formatMoney(calc.overhead)}
${t('net_profit')}: ${formatMoney(calc.operatingProfit)} (${formatPercent(calc.netProfitPercent)})
${t('breakeven')}: ${formatMoney(calc.breakevenSales)}`;

  async function copyResult() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  const renderMoneyInput = (field: keyof PLInputs, label: string) => (
    <label className="block">
      <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{label}</span>
      <input
        value={inputs[field]}
        onChange={(event) => updateInput(field, event.target.value)}
        inputMode="decimal"
        className={inputClass}
        placeholder="0"
      />
    </label>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:px-0">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          header, nav, footer, .no-print { display: none !important; }
          .print-surface { box-shadow: none !important; border-color: #d1d5db !important; break-inside: avoid; }
        }
      `}</style>

      <Link href={backHref} className="no-print mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            {t('tierBadge')}
          </div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="no-print flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyResult}
            disabled={!hasSales}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clipboard size={16} />
            {copied ? t('copied') : t('copy_result')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!hasSales}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {t('export_pdf')}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)]">
        <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-5 grid grid-cols-3 rounded-lg bg-slate-100 p-1">
            {PERIODS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPeriod(item)}
                className={`min-h-10 rounded-md text-sm font-bold transition ${period === item ? 'bg-white text-[var(--dk-navy)] shadow-sm' : 'text-slate-500'}`}
              >
                {t(`period_${item}`)}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="mb-3 text-base font-extrabold text-[var(--dk-navy)]">{t('revenue_section')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {renderMoneyInput('foodSales', t('food_sales'))}
                {renderMoneyInput('beverageSales', t('beverage_sales'))}
                {renderMoneyInput('otherRevenue', t('other_revenue'))}
              </div>
            </div>

            <div>
              <h2 className="mb-3 text-base font-extrabold text-[var(--dk-navy)]">{t('cogs_section')}</h2>
              <div className="grid gap-3 sm:grid-cols-3">
                {renderMoneyInput('beginInventory', t('begin_inventory'))}
                {renderMoneyInput('purchases', t('purchases'))}
                {renderMoneyInput('endInventory', t('end_inventory'))}
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-500">COGS = {formatMoney(calc.cogs)}</p>
            </div>

            <div>
              <h2 className="mb-3 text-base font-extrabold text-[var(--dk-navy)]">{t('labor_section')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {renderMoneyInput('wages', t('wages'))}
                {renderMoneyInput('taxesInsurance', t('taxes_insurance'))}
              </div>
            </div>

            <div>
              <button
                type="button"
                onClick={() => setShowOverhead((value) => !value)}
                className="flex w-full min-h-11 items-center justify-between rounded-lg bg-slate-50 px-3 text-left text-base font-extrabold text-[var(--dk-navy)]"
              >
                {t('overhead_section')}
                <ChevronDown size={18} className={`transition ${showOverhead ? 'rotate-180' : ''}`} />
              </button>
              {showOverhead && (
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {renderMoneyInput('rent', t('rent'))}
                  {renderMoneyInput('utilities', t('utilities'))}
                  {renderMoneyInput('insurance', t('insurance'))}
                  {renderMoneyInput('license', t('license'))}
                  {renderMoneyInput('marketing', t('marketing'))}
                  {renderMoneyInput('other', t('other'))}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => setInputs(EMPTY_INPUTS)}
              className="no-print min-h-11 w-full rounded-lg border border-dashed border-slate-300 text-sm font-bold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
            >
              {t('clear_form')}
            </button>
          </div>
        </section>

        <div className="space-y-6">
          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-[var(--dk-red)]" />
              <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('kpi_title')}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {kpis.map((kpi) => (
                <div key={kpi.label} className={`rounded-lg border p-3 ${statusColor(kpi.status)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide">{kpi.label}</p>
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold">{statusLabel(kpi.status)}</span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-[var(--dk-navy)]">{kpi.value}</p>
                  {kpi.hint && <p className="mt-1 text-xs font-semibold opacity-80">{kpi.hint}</p>}
                </div>
              ))}
            </div>

            <div className="mt-5">
              <h3 className="mb-3 text-sm font-extrabold text-[var(--dk-navy)]">{t('chart_title')}</h3>
              <div className="flex h-6 overflow-hidden rounded-full bg-slate-100">
                {chartSegments.map((segment) => (
                  <div key={segment.label} className={`${segment.color}`} style={{ width: `${segment.width}%` }} title={`${segment.label}: ${formatPercent(segment.width)}`} />
                ))}
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {chartSegments.map((segment) => (
                  <div key={segment.label} className="flex items-center gap-2 text-xs font-bold text-slate-600">
                    <span className={`h-2.5 w-2.5 rounded-full ${segment.color}`} />
                    {segment.label}: {formatPercent(segment.width)}
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('whatif_title')}</h2>
            <div className="space-y-4">
              <Slider label={t('sales_growth')} value={salesGrowth} min={-20} max={50} suffix="%" onChange={setSalesGrowth} />
              <Slider label={t('food_reduction')} value={foodReduction} min={0} max={10} suffix="%" onChange={setFoodReduction} />
              <Slider label={t('labor_reduction')} value={laborReduction} min={0} max={15} suffix="%" onChange={setLaborReduction} />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-[520px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-2 pr-3">{t('metric')}</th>
                    <th className="py-2 pr-3">{t('current')}</th>
                    <th className="py-2 pr-3">{t('scenario')}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="py-2 pr-3 font-bold">{t('total_sales')}</td><td>{formatMoney(calc.totalSales)}</td><td>{formatMoney(scenario.totalSales)}</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 pr-3 font-bold">COGS</td><td>{formatMoney(calc.cogs)}</td><td>{formatMoney(scenario.cogs)}</td></tr>
                  <tr className="border-b border-slate-100"><td className="py-2 pr-3 font-bold">{t('labor_section')}</td><td>{formatMoney(calc.labor)}</td><td>{formatMoney(scenario.labor)}</td></tr>
                  <tr><td className="py-2 pr-3 font-bold">{t('net_profit_pct')}</td><td>{formatPercent(calc.netProfitPercent)}</td><td>{formatPercent(scenario.netProfitPercent)}</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('ai_title')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('ai_subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={loadAI}
                disabled={isPending || !hasSales}
                className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--dk-red)] px-4 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {t('ai_analysis_btn')}
              </button>
            </div>

            {isPending && (
              <div className="space-y-3">
                <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
              </div>
            )}

            {!isPending && aiError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                {aiError}
                <button type="button" onClick={loadAI} className="ml-2 inline-flex items-center gap-1 font-extrabold text-[var(--dk-navy)]">
                  <RefreshCw size={14} /> {t('retry')}
                </button>
              </div>
            )}

            {!isPending && aiText && (
              <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700">{aiText}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );

}
