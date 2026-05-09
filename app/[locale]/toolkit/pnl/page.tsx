'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Info,
  Lightbulb,
  RotateCcw,
  Shield,
  ShieldCheck,
} from 'lucide-react';

type InputKey =
  | 'revenue'
  | 'foodCost'
  | 'packaging'
  | 'staffCost'
  | 'management'
  | 'advertising'
  | 'promo'
  | 'outsource'
  | 'uniform'
  | 'supplies'
  | 'repair'
  | 'utilities'
  | 'otherControllable'
  | 'rent'
  | 'accounting'
  | 'insurance'
  | 'tax'
  | 'depreciation';

type SubtotalKey = 'operatingProfit' | 'controllableProfit' | 'netProfit';

interface PnlRow {
  kind: 'input';
  key: InputKey;
  value: number;
  setter: (value: number) => void;
  indent?: boolean;
  detailOnly?: boolean;
}

interface SubtotalRow {
  kind: 'subtotal';
  key: SubtotalKey;
  getValue: () => number;
  type: 'subtotal' | 'final';
}

type Row = PnlRow | SubtotalRow;
type PnlTranslator = ReturnType<typeof useTranslations>;

const inputDefaults: Record<InputKey, number> = {
  revenue: 50000,
  foodCost: 15000,
  packaging: 500,
  staffCost: 10000,
  management: 2500,
  advertising: 1500,
  promo: 800,
  outsource: 600,
  uniform: 200,
  supplies: 400,
  repair: 300,
  utilities: 2000,
  otherControllable: 500,
  rent: 5000,
  accounting: 800,
  insurance: 400,
  tax: 1200,
  depreciation: 600,
};

const sectionBefore: Partial<Record<InputKey, string>> = {
  foodCost: 'cogs',
  staffCost: 'controllable',
  rent: 'uncontrollable',
};

const relatedArticles = ['pnl', 'foodCost', 'breakEven'] as const;

function intlLocale(locale: string) {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'ru') return 'ru-RU';
  if (locale === 'tr') return 'tr-TR';
  return 'en-US';
}

function parseNumber(value: string, locale: string): number {
  const cleanValue = value.trim();
  if (!cleanValue) return 0;
  if (locale === 'az' || locale === 'ru' || locale === 'tr') {
    return Number.parseFloat(cleanValue.replace(/\s/g, '').replace(/\./g, '').replace(',', '.')) || 0;
  }
  return Number.parseFloat(cleanValue.replace(/\s/g, '').replace(/,/g, '')) || 0;
}

export default function PnlSimulator() {
  const t = useTranslations('toolkit.pnl');
  const locale = useLocale();
  const localeForIntl = intlLocale(locale);

  const [revenue, setRevenue] = useState(inputDefaults.revenue);
  const [foodCost, setFoodCost] = useState(inputDefaults.foodCost);
  const [packaging, setPackaging] = useState(inputDefaults.packaging);
  const [staffCost, setStaffCost] = useState(inputDefaults.staffCost);
  const [management, setManagement] = useState(inputDefaults.management);
  const [advertising, setAdvertising] = useState(inputDefaults.advertising);
  const [promo, setPromo] = useState(inputDefaults.promo);
  const [outsource, setOutsource] = useState(inputDefaults.outsource);
  const [uniform, setUniform] = useState(inputDefaults.uniform);
  const [supplies, setSupplies] = useState(inputDefaults.supplies);
  const [repair, setRepair] = useState(inputDefaults.repair);
  const [utilities, setUtilities] = useState(inputDefaults.utilities);
  const [otherControllable, setOtherControllable] = useState(inputDefaults.otherControllable);
  const [rent, setRent] = useState(inputDefaults.rent);
  const [accounting, setAccounting] = useState(inputDefaults.accounting);
  const [insurance, setInsurance] = useState(inputDefaults.insurance);
  const [tax, setTax] = useState(inputDefaults.tax);
  const [depreciation, setDepreciation] = useState(inputDefaults.depreciation);
  const [detailed, setDetailed] = useState(false);

  const formatCurrency = (value: number) => {
    const formatted = new Intl.NumberFormat(localeForIntl, {
      style: 'currency',
      currency: 'AZN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
    return locale === 'az' || locale === 'tr' ? formatted.replace('AZN', '₼').trim() : formatted;
  };

  const formatPercent = (value: number) =>
    new Intl.NumberFormat(localeForIntl, {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);

  const calc = useMemo(() => {
    const cogs = foodCost + packaging;
    const operatingProfit = revenue - cogs;
    const controllable =
      staffCost + management + advertising + promo + outsource + uniform + supplies + repair + utilities + otherControllable;
    const controllableProfit = operatingProfit - controllable;
    const uncontrollable = rent + accounting + insurance + tax + depreciation;
    const netProfit = controllableProfit - uncontrollable;
    const pct = (value: number) => (revenue > 0 ? (value / revenue) * 100 : 0);
    const primeCost = foodCost + staffCost + management;
    return { cogs, operatingProfit, controllable, controllableProfit, uncontrollable, netProfit, pct, primeCost };
  }, [
    accounting,
    advertising,
    depreciation,
    foodCost,
    insurance,
    management,
    otherControllable,
    outsource,
    packaging,
    promo,
    rent,
    repair,
    revenue,
    staffCost,
    supplies,
    tax,
    uniform,
    utilities,
  ]);

  const setInputValue = (setter: (value: number) => void) => (value: string) => {
    setter(parseNumber(value, locale));
  };

  const resetAll = () => {
    setRevenue(inputDefaults.revenue);
    setFoodCost(inputDefaults.foodCost);
    setPackaging(inputDefaults.packaging);
    setStaffCost(inputDefaults.staffCost);
    setManagement(inputDefaults.management);
    setAdvertising(inputDefaults.advertising);
    setPromo(inputDefaults.promo);
    setOutsource(inputDefaults.outsource);
    setUniform(inputDefaults.uniform);
    setSupplies(inputDefaults.supplies);
    setRepair(inputDefaults.repair);
    setUtilities(inputDefaults.utilities);
    setOtherControllable(inputDefaults.otherControllable);
    setRent(inputDefaults.rent);
    setAccounting(inputDefaults.accounting);
    setInsurance(inputDefaults.insurance);
    setTax(inputDefaults.tax);
    setDepreciation(inputDefaults.depreciation);
  };

  const rows: Row[] = [
    { kind: 'input', key: 'revenue', value: revenue, setter: setRevenue },
    { kind: 'input', key: 'foodCost', value: foodCost, setter: setFoodCost, indent: true },
    { kind: 'input', key: 'packaging', value: packaging, setter: setPackaging, indent: true, detailOnly: true },
    { kind: 'subtotal', key: 'operatingProfit', getValue: () => calc.operatingProfit, type: 'subtotal' },
    { kind: 'input', key: 'staffCost', value: staffCost, setter: setStaffCost, indent: true },
    { kind: 'input', key: 'management', value: management, setter: setManagement, indent: true, detailOnly: true },
    { kind: 'input', key: 'advertising', value: advertising, setter: setAdvertising, indent: true },
    { kind: 'input', key: 'promo', value: promo, setter: setPromo, indent: true, detailOnly: true },
    { kind: 'input', key: 'outsource', value: outsource, setter: setOutsource, indent: true, detailOnly: true },
    { kind: 'input', key: 'uniform', value: uniform, setter: setUniform, indent: true, detailOnly: true },
    { kind: 'input', key: 'supplies', value: supplies, setter: setSupplies, indent: true, detailOnly: true },
    { kind: 'input', key: 'repair', value: repair, setter: setRepair, indent: true, detailOnly: true },
    { kind: 'input', key: 'utilities', value: utilities, setter: setUtilities, indent: true },
    {
      kind: 'input',
      key: 'otherControllable',
      value: otherControllable,
      setter: setOtherControllable,
      indent: true,
      detailOnly: true,
    },
    { kind: 'subtotal', key: 'controllableProfit', getValue: () => calc.controllableProfit, type: 'subtotal' },
    { kind: 'input', key: 'rent', value: rent, setter: setRent, indent: true },
    { kind: 'input', key: 'accounting', value: accounting, setter: setAccounting, indent: true, detailOnly: true },
    { kind: 'input', key: 'insurance', value: insurance, setter: setInsurance, indent: true, detailOnly: true },
    { kind: 'input', key: 'tax', value: tax, setter: setTax, indent: true, detailOnly: true },
    { kind: 'input', key: 'depreciation', value: depreciation, setter: setDepreciation, indent: true, detailOnly: true },
    { kind: 'subtotal', key: 'netProfit', getValue: () => calc.netProfit, type: 'final' },
  ];

  const visibleRows = detailed ? rows : rows.filter((row) => !('detailOnly' in row && row.detailOnly));
  const netMargin = calc.pct(calc.netProfit);
  const foodCostPct = calc.pct(foodCost);
  const staffCostPct = calc.pct(staffCost + management);

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-500/8 blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] h-[400px] w-[400px] rounded-full bg-indigo-500/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pt-8 pb-20">
          <Link
            href="/toolkit"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>{t('navigation.toolkit')}</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="mb-5 font-display text-4xl leading-[1.1] font-black tracking-tight text-white sm:text-5xl">
              {t('title')}{' '}
              <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent">
                {t('titleAccent')}
              </span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-400">{t('description')}</p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <KpiCard
            label={t('kpis.netProfit')}
            value={formatCurrency(calc.netProfit)}
            helper={formatPercent(netMargin)}
            positive={calc.netProfit >= 0}
          />
          <KpiCard
            label={t('kpis.primeCost')}
            value={formatPercent(calc.pct(calc.primeCost))}
            helper={t('kpis.targetMax', { value: 65 })}
            positive={calc.pct(calc.primeCost) <= 65}
            tone="blue"
          />
          <KpiCard
            label={t('kpis.foodCost')}
            value={formatPercent(foodCostPct)}
            helper={t('kpis.targetMax', { value: 32 })}
            positive={foodCostPct <= 32}
            tone="amber"
          />
          <KpiCard
            label={t('kpis.rent')}
            value={formatPercent(calc.pct(rent))}
            helper={t('kpis.targetMax', { value: 10 })}
            positive={calc.pct(rent) <= 10}
            tone="blue"
          />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl space-y-6 px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-slate-900">{t('table.title')}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-black text-white transition-colors hover:bg-blue-700"
              >
                {t('actions.calculate')}
              </button>
              <button
                type="button"
                onClick={() => setDetailed(!detailed)}
                className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 transition-colors hover:text-blue-700"
              >
                {detailed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {detailed ? t('actions.simpleView') : t('actions.detailView')}
              </button>
              <button
                type="button"
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
              >
                <RotateCcw size={13} /> {t('actions.reset')}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            <div className="col-span-5">{t('table.category')}</div>
            <div className="col-span-4">{t('table.amount')}</div>
            <div className="col-span-3 text-right">{t('table.percent')}</div>
          </div>

          <div>
            {visibleRows.map((row) => {
              const section = row.kind === 'input' ? sectionBefore[row.key] : undefined;
              return (
                <div key={row.key}>
                  {section ? (
                    <div className="border-b border-slate-100 bg-slate-50 px-6 py-2.5">
                      <span className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
                        {t(`sections.${section}`)}
                      </span>
                    </div>
                  ) : null}

                  {row.kind === 'input' ? (
                    <div
                      className={`grid grid-cols-12 items-center border-b border-slate-100 px-6 py-3 transition-colors hover:bg-slate-50/50 ${
                        row.key === 'revenue' ? 'bg-emerald-50/60' : ''
                      }`}
                    >
                      <label
                        htmlFor={`pnl-${row.key}`}
                        className={`col-span-5 text-sm font-medium text-slate-700 ${
                          row.indent ? 'pl-4' : 'font-bold text-slate-900'
                        }`}
                      >
                        {t(`inputs.${row.key}.label`)}
                      </label>
                      <div className="col-span-4">
                        <input
                          id={`pnl-${row.key}`}
                          type="text"
                          inputMode="decimal"
                          value={row.value || ''}
                          onChange={(event) => setInputValue(row.setter)(event.target.value)}
                          aria-label={t(`inputs.${row.key}.label`)}
                          placeholder={t('inputs.revenue.placeholder')}
                          className="w-full rounded-lg bg-slate-100/80 px-3 py-2 text-sm font-medium text-slate-900 transition-shadow outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                      </div>
                      <div className="col-span-3 text-right text-sm font-semibold text-slate-500 tabular-nums">
                        {row.key === 'revenue' ? formatPercent(100) : formatPercent(calc.pct(row.value))}
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`grid grid-cols-12 items-center border-b-2 border-slate-200 px-6 py-4 ${
                        row.type === 'final'
                          ? row.getValue() >= 0
                            ? 'bg-emerald-50'
                            : 'bg-red-50'
                          : 'bg-slate-50/80'
                      }`}
                    >
                      <div className="col-span-5 text-sm font-bold text-slate-900">{t(`outputs.${row.key}.label`)}</div>
                      <div
                        data-testid={row.key === 'operatingProfit' ? 'gross-profit' : undefined}
                        className={`col-span-4 text-lg font-black tabular-nums ${
                          row.type === 'final'
                            ? row.getValue() >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                            : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(row.getValue())}
                      </div>
                      <div
                        className={`col-span-3 text-right text-sm font-bold tabular-nums ${
                          row.type === 'final'
                            ? row.getValue() >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {formatPercent(calc.pct(row.getValue()))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <InsightPanel
          netMargin={netMargin}
          foodCostPct={foodCostPct}
          staffCostPct={staffCostPct}
          t={t}
          formatPercent={formatPercent}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <BenchmarkPanel t={t} />
          <EducationPanel t={t} />
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {t('knowledge.title')}{' '}
            <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">
              {t('knowledge.titleAccent')}
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('knowledge.subtitle')}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <ControlKnowledgeCard t={t} />
          <PrimeCostKnowledgeCard t={t} />
          <WarningKnowledgeCard t={t} />
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
            <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px]" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">{t('advice.title')}</h3>
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-slate-400">{t('advice.body')}</p>
              <Link
                href="/blog/pnl-oxuya-bilmirsen"
                className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
              >
                {t('advice.readArticle')} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15">
            <div>
              <h3 className="mb-3 font-display text-xl font-black">{t('ocaq.title')}</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/80">{t('ocaq.body')}</p>
            </div>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-[var(--dk-red)] transition-all hover:shadow-lg active:scale-[0.98]"
            >
              {t('ocaq.cta')} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-2xl bg-slate-50 p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5">
            <BookOpen size={18} className="text-[var(--dk-red)]" />
            <h3 className="text-lg font-bold text-slate-900">{t('related.title')}</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {relatedArticles.map((key) => (
              <Link
                key={key}
                href={`/blog/${t(`related.articles.${key}.slug`)}`}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:ring-slate-300/60 hover:shadow-md"
              >
                <span className="text-[10px] font-bold tracking-widest text-[var(--dk-red)] uppercase">
                  {t(`related.articles.${key}.tag`)}
                </span>
                <h4 className="mt-2.5 text-sm leading-snug font-bold text-slate-900 transition-colors group-hover:text-[var(--dk-red)]">
                  {t(`related.articles.${key}.title`)}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-[var(--dk-red)]">
                  {t('related.read')} <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  helper,
  positive,
  tone = 'emerald',
}: {
  label: string;
  value: string;
  helper: string;
  positive: boolean;
  tone?: 'emerald' | 'blue' | 'amber';
}) {
  const toneClass = positive
    ? tone === 'blue'
      ? 'bg-blue-50 ring-blue-500/20 text-blue-600'
      : tone === 'amber'
        ? 'bg-amber-50 ring-amber-500/20 text-amber-600'
        : 'bg-emerald-50 ring-emerald-500/20 text-emerald-600'
    : 'bg-red-50 ring-red-500/20 text-red-600';

  return (
    <div className={`rounded-2xl p-5 ring-1 ${toneClass}`}>
      <div className="mb-2 text-[11px] font-bold tracking-widest text-slate-500 uppercase">{label}</div>
      <div className="text-3xl font-black tabular-nums">{value}</div>
      <div className="mt-1 text-xs font-semibold">{helper}</div>
    </div>
  );
}

function InsightPanel({
  netMargin,
  foodCostPct,
  staffCostPct,
  t,
  formatPercent,
}: {
  netMargin: number;
  foodCostPct: number;
  staffCostPct: number;
  t: PnlTranslator;
  formatPercent: (value: number) => string;
}) {
  const insights = [];
  if (netMargin < 0) insights.push({ tone: 'red', text: t('insights.negativeMargin') });
  else if (netMargin < 5) insights.push({ tone: 'amber', text: t('insights.lowMargin') });
  else insights.push({ tone: 'emerald', text: t('insights.healthyMargin') });
  if (foodCostPct > 32) insights.push({ tone: 'amber', text: t('insights.foodCostHigh', { value: formatPercent(32) }) });
  if (staffCostPct > 35) insights.push({ tone: 'amber', text: t('insights.laborCostHigh', { value: formatPercent(35) }) });

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {insights.map((insight) => (
        <div
          key={insight.text}
          className={`rounded-xl p-4 text-sm font-semibold ${
            insight.tone === 'red'
              ? 'bg-red-50 text-red-700 ring-1 ring-red-200/70'
              : insight.tone === 'amber'
                ? 'bg-amber-50 text-amber-800 ring-1 ring-amber-200/70'
                : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/70'
          }`}
        >
          {insight.text}
        </div>
      ))}
    </div>
  );
}

function BenchmarkPanel({ t }: { t: PnlTranslator }) {
  const benchmarks = ['netProfit', 'primeCost', 'foodCost', 'rent'] as const;
  const chips = ['labor', 'marketing', 'utilities', 'repair'] as const;

  return (
    <div className="rounded-2xl bg-white p-6 shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
      <h3 className="mb-5 text-[11px] font-bold tracking-widest text-slate-400 uppercase">{t('benchmark.title')}</h3>
      <div className="mb-5 grid grid-cols-2 gap-4">
        {benchmarks.map((key) => (
          <div key={key} className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200/60">
            <div className="text-2xl font-black text-blue-600">{t(`benchmark.${key}.value`)}</div>
            <div className="mt-1.5 text-xs font-medium text-slate-500">{t(`benchmark.${key}.label`)}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2.5 text-sm text-slate-600">
        {chips.map((key) => (
          <div key={key} className="rounded-lg bg-slate-50 px-3 py-2.5">
            <strong>{t(`benchmark.chips.${key}.label`)}</strong> {t(`benchmark.chips.${key}.value`)}
          </div>
        ))}
      </div>
    </div>
  );
}

function EducationPanel({ t }: { t: PnlTranslator }) {
  const formulaLines = ['revenue', 'cogs', 'operatingProfit', 'controllable', 'controllableProfit', 'uncontrollable', 'netProfit'];

  return (
    <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-200/60">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <Info size={15} className="text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t('education.whatTitle')}</h3>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-600">{t('education.whatBody')}</p>
      <div className="space-y-2.5 rounded-xl bg-slate-900 p-5">
        <p className="text-xs font-bold tracking-widest text-blue-400 uppercase">{t('education.structureTitle')}</p>
        <div className="space-y-0.5 font-mono text-sm text-slate-300">
          {formulaLines.map((key) => (
            <p key={key} className={key === 'netProfit' ? 'font-bold text-emerald-400' : key.includes('Profit') ? 'text-blue-400' : ''}>
              {t(`education.structure.${key}`)}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

function ControlKnowledgeCard({ t }: { t: PnlTranslator }) {
  return (
    <div className="flex flex-col rounded-2xl bg-gradient-to-br from-blue-50/60 to-white p-6 ring-1 ring-blue-200/40">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
          <ShieldCheck size={15} className="text-blue-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t('knowledge.controlTitle')}</h3>
      </div>
      <div className="mt-auto space-y-3">
        <div className="rounded-xl bg-emerald-50 p-4 ring-1 ring-emerald-200/60">
          <p className="text-sm font-bold text-emerald-700">{t('knowledge.controllableTitle')}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-600/80">{t('knowledge.controllableBody')}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200/60">
          <p className="text-sm font-bold text-red-700">{t('knowledge.uncontrollableTitle')}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-red-600/80">{t('knowledge.uncontrollableBody')}</p>
        </div>
      </div>
    </div>
  );
}

function PrimeCostKnowledgeCard({ t }: { t: PnlTranslator }) {
  return (
    <div className="flex flex-col rounded-2xl bg-gradient-to-br from-amber-50/80 to-white p-6 ring-1 ring-amber-200/40">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
          <Shield size={15} className="text-amber-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t('knowledge.primeCostTitle')}</h3>
      </div>
      <p className="mb-5 text-sm leading-relaxed text-slate-600">{t('knowledge.primeCostBody')}</p>
      <div className="mt-auto space-y-2.5 rounded-xl bg-amber-900 p-5">
        <p className="text-xs font-bold tracking-widest text-amber-400 uppercase">{t('knowledge.formula')}</p>
        <div className="space-y-0.5 font-mono text-sm text-amber-100">
          <p>{t('knowledge.primeCostFormula.costs')}</p>
          <p className="font-bold text-amber-400">{t('knowledge.primeCostFormula.result')}</p>
        </div>
        <div className="border-t border-amber-700 pt-2.5">
          <p className="font-mono text-[13px] font-bold text-amber-200">{t('knowledge.primeCostFormula.percent')}</p>
        </div>
      </div>
    </div>
  );
}

function WarningKnowledgeCard({ t }: { t: PnlTranslator }) {
  const warnings = ['primeCost', 'lowNet', 'highRent', 'strongNet'] as const;
  return (
    <div className="flex flex-col rounded-2xl bg-gradient-to-br from-red-50/60 to-white p-6 ring-1 ring-red-200/40">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-100">
          <Info size={15} className="text-red-600" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{t('knowledge.warningTitle')}</h3>
      </div>
      <div className="mt-auto space-y-3">
        {warnings.map((key) => (
          <div key={key} className="rounded-xl bg-white p-4 ring-1 ring-amber-200/60">
            <p className="text-[13px] leading-relaxed text-slate-700">{t(`knowledge.warnings.${key}`)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
