'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import WeeklyActionsPanel from '@/components/toolkit/WeeklyActionsPanel';
import ToolkitStudioLayout from '@/components/toolkit/ToolkitStudioLayout';
import {
  ArrowRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Info,
  Lightbulb,
  Shield,
  ShieldCheck,
} from 'lucide-react';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import PnlScenarioPanel from '@/components/toolkit/pnl/PnlScenarioPanel';
import {
  FOOD_COST_MAX_PCT,
  LABOR_MAX_PCT,
  NET_MARGIN_LOW_PCT,
  NET_MARGIN_TARGET_PCT,
  PRIME_COST_MAX_PCT,
  RENT_MAX_PCT,
} from '@/lib/toolkit/benchmarks';

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

/** Example month (nümunə) loaded by «Nümunəni yüklə» — not a sector norm. */
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
  if (locale === 'az') return AZ_NUMBER_LOCALE;
  if (locale === 'ru') return 'ru-RU';
  if (locale === 'tr') return 'tr-TR';
  return 'en-US';
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
  // TASK-0515: a negative amount is rejected (value kept) and explained next to the field.
  const [negativeKey, setNegativeKey] = useState<InputKey | null>(null);

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
    !Number.isFinite(value)
      ? '—'
      : new Intl.NumberFormat(localeForIntl, {
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
    const pct = (value: number) => (revenue > 0 ? (value / revenue) * 100 : Number.NaN);
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

  const setInputValue = (key: InputKey, setter: (value: number) => void) => (value: number) => {
    if (value < 0) {
      setNegativeKey(key);
      return;
    }
    setNegativeKey((prev) => (prev === key ? null : prev));
    setter(value);
  };
  const hasRevenue = revenue > 0;

  // TASK-0517: one value map + one setter map so «Təmizlə» / «Nümunəni yüklə» / «Geri al» cover every field.
  const values: Record<InputKey, number> = {
    revenue, foodCost, packaging, staffCost, management, advertising, promo, outsource, uniform,
    supplies, repair, utilities, otherControllable, rent, accounting, insurance, tax, depreciation,
  };
  const setters: Record<InputKey, (value: number) => void> = {
    revenue: setRevenue, foodCost: setFoodCost, packaging: setPackaging, staffCost: setStaffCost,
    management: setManagement, advertising: setAdvertising, promo: setPromo, outsource: setOutsource,
    uniform: setUniform, supplies: setSupplies, repair: setRepair, utilities: setUtilities,
    otherControllable: setOtherControllable, rent: setRent, accounting: setAccounting,
    insurance: setInsurance, tax: setTax, depreciation: setDepreciation,
  };
  const applyValues = (next: Record<InputKey, number>) => {
    (Object.keys(setters) as InputKey[]).forEach((key) => setters[key](next[key]));
    setNegativeKey(null);
  };
  const clearAll = () =>
    applyValues(Object.fromEntries((Object.keys(setters) as InputKey[]).map((key) => [key, 0])) as Record<InputKey, number>);

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

  const inputSection = (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl ring-1 ring-slate-200/80">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-bold text-slate-900">{t('table.title')}</h2>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setDetailed(!detailed)}
                className="flex min-h-[32px] items-center gap-1.5 rounded-lg px-2 text-xs font-semibold text-blue-700 transition-colors hover:text-blue-800"
              >
                {detailed ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {detailed ? t('actions.simpleView') : t('actions.detailView')}
              </button>
            </div>
          </div>
          <div className="border-b border-slate-100 px-6 py-3">
            <ToolResetControls
              snapshot={() => ({ ...values })}
              restore={applyValues}
              onClear={clearAll}
              onLoadExample={() => applyValues(inputDefaults)}
            />
          </div>

          <div className="grid grid-cols-12 border-b border-slate-100 bg-slate-50/60 px-6 py-3 text-[10px] font-bold tracking-widest text-slate-600 uppercase">
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
                      <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase">
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
                        <DecimalInput
                          id={`pnl-${row.key}`}
                          blankZero
                          value={row.value}
                          onValueChange={setInputValue(row.key, row.setter)}
                          aria-invalid={negativeKey === row.key ? true : undefined}
                          aria-describedby={negativeKey === row.key ? `pnl-${row.key}-err` : undefined}
                          aria-label={t(`inputs.${row.key}.label`)}
                          placeholder={t('inputs.revenue.placeholder')}
                          className="w-full rounded-lg bg-slate-100/80 px-3 py-2 text-sm font-medium text-slate-900 transition-shadow outline-none focus:ring-2 focus:ring-blue-500/30 aria-[invalid=true]:ring-2 aria-[invalid=true]:ring-red-600"
                        />
                      </div>
                      <div className="col-span-3 text-right text-sm font-semibold text-slate-600 tabular-nums" data-testid={`pnl-pct-${row.key}`}>
                        {row.key === 'revenue' ? (hasRevenue ? formatPercent(100) : '—') : formatPercent(calc.pct(row.value))}
                      </div>
                      {negativeKey === row.key ? (
                        <p id={`pnl-${row.key}-err`} role="alert" className="col-span-12 mt-1 text-xs font-semibold text-red-700">
                          {t('validation.negative')}
                        </p>
                      ) : null}
                      {row.key === 'revenue' && !hasRevenue ? (
                        <p role="status" data-testid="pnl-revenue-hint" className="col-span-12 mt-1 text-xs font-semibold text-amber-800">
                          {t('validation.revenueRequired')}
                        </p>
                      ) : null}
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
                              ? 'text-emerald-700'
                              : 'text-red-700'
                            : 'text-slate-900'
                        }`}
                      >
                        {formatCurrency(row.getValue())}
                      </div>
                      <div
                        className={`col-span-3 text-right text-sm font-bold tabular-nums ${
                          row.type === 'final'
                            ? row.getValue() >= 0
                              ? 'text-emerald-700'
                              : 'text-red-700'
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

        {hasRevenue ? <InsightPanel netMargin={netMargin} foodCostPct={foodCostPct} staffCostPct={staffCostPct} t={t} formatPercent={formatPercent} /> : null}
    </div>
  );

  const resultSection = (
    <div className="space-y-4">
      {!hasRevenue ? (
        <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200" data-testid="pnl-kpi-hint">
          {t('validation.revenueRequired')}
        </p>
      ) : null}
      <KpiCard label={t('kpis.netProfit')} value={formatCurrency(calc.netProfit)} helper={formatPercent(netMargin)} positive={calc.netProfit >= 0} />
      <KpiCard label={t('kpis.primeCost')} value={formatPercent(calc.pct(calc.primeCost))} helper={t('kpis.targetMax', { value: PRIME_COST_MAX_PCT })} positive={hasRevenue && calc.pct(calc.primeCost) <= PRIME_COST_MAX_PCT} tone="blue" neutral={!hasRevenue} />
      <KpiCard label={t('kpis.foodCost')} value={formatPercent(foodCostPct)} helper={t('kpis.targetMax', { value: FOOD_COST_MAX_PCT })} positive={hasRevenue && foodCostPct <= FOOD_COST_MAX_PCT} tone="amber" neutral={!hasRevenue} />
      <KpiCard label={t('kpis.rent')} value={formatPercent(calc.pct(rent))} helper={t('kpis.targetMax', { value: RENT_MAX_PCT })} positive={hasRevenue && calc.pct(rent) <= RENT_MAX_PCT} tone="blue" neutral={!hasRevenue} />

      {/* TASK-0523: break-even + «what if» + USTA AI comment (the old PLSimulator merged in here). */}
      <PnlScenarioPanel
        revenue={revenue}
        variableCost={calc.cogs}
        labor={staffCost + management}
        otherFixed={calc.controllable - staffCost - management + calc.uncontrollable}
        formatCurrency={formatCurrency}
        formatPercent={formatPercent}
      />

      {/* WeeklyActions — TASK-0174 inteqrasiyası, TOXUNMA */}
      {revenue > 0 && (
        <div className="border-t border-slate-100 pt-4">
          <WeeklyActionsPanel
            metrics={{
              food_cost: Math.round(foodCostPct),
              labor_cost: Math.round(staffCostPct),
              net_profit: Math.round(netMargin),
              rent_ratio: Math.round(calc.pct(rent)),
            }}
            context="p_l_simulator"
          />
        </div>
      )}
    </div>
  );

  const bottomSection = (
    <>
      <div className="grid gap-6 lg:grid-cols-2 mb-10">
        <BenchmarkPanel t={t} />
        <EducationPanel t={t} />
      </div>

      <div className="mb-10">
        <div className="mb-8 text-center">
          <h2 className="font-display text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            {t('knowledge.title')} <span className="bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent">{t('knowledge.titleAccent')}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{t('knowledge.subtitle')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <ControlKnowledgeCard t={t} />
          <PrimeCostKnowledgeCard t={t} />
          <WarningKnowledgeCard t={t} />
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2 mb-10">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-blue-500/10 blur-[50px]" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20"><Lightbulb size={16} className="text-amber-400" /></div><h3 className="text-base font-bold text-amber-400">{t('advice.title')}</h3></div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-400">{t('advice.body')}</p>
            <Link href="/blog/pnl-oxuya-bilmirsen" className="group inline-flex min-h-[24px] items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300">{t('advice.readArticle')} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></Link>
          </div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-dk-red-strong to-dk-red-deep p-8 text-white shadow-xl shadow-red-500/15">
          <div><h3 className="mb-3 font-display text-xl font-black">{t('ocaq.title')}</h3><p className="mb-6 text-sm leading-relaxed text-white/80">{t('ocaq.body')}</p></div>
          <Link href="/auth/register" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-dk-red-deep hover:shadow-lg active:scale-[0.98]">{t('ocaq.cta')} <ArrowRight size={15} /></Link>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-2.5"><BookOpen size={18} className="text-dk-red-deep" /><h3 className="text-lg font-bold text-slate-900">{t('related.title')}</h3></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {relatedArticles.map((key) => (
            <Link key={key} href={`/blog/${t(`related.articles.${key}.slug`)}`} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 hover:shadow-md transition-all">
              <span className="text-[10px] font-bold tracking-widest text-dk-red-deep uppercase">{t(`related.articles.${key}.tag`)}</span>
              <h4 className="mt-2.5 text-sm leading-snug font-bold text-slate-900 group-hover:text-dk-red-deep">{t(`related.articles.${key}.title`)}</h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-dk-red-deep">{t('related.read')} <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="pnl" toolName={t('title')} toolDescription={t('description')} tier="usta"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection} showLiveBadge={false} />
  );
}

function KpiCard({
  label,
  value,
  helper,
  positive,
  tone = 'emerald',
  neutral = false,
}: {
  label: string;
  value: string;
  helper: string;
  positive: boolean;
  tone?: 'emerald' | 'blue' | 'amber';
  neutral?: boolean;
}) {
  // TASK-0515: text tones ≥ 4.5:1 on the tinted card (the -600 shades were below AA).
  const toneClass = neutral
    ? 'bg-slate-50 ring-slate-200 text-slate-700'
    : positive
      ? tone === 'blue'
        ? 'bg-blue-50 ring-blue-500/20 text-blue-700'
        : tone === 'amber'
          ? 'bg-amber-50 ring-amber-500/20 text-amber-800'
          : 'bg-emerald-50 ring-emerald-500/20 text-emerald-700'
      : 'bg-red-50 ring-red-500/20 text-red-700';

  return (
    <div className={`rounded-2xl p-5 ring-1 ${toneClass}`}>
      <div className="mb-2 text-[11px] font-bold tracking-widest text-slate-700 uppercase">{label}</div>
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
  else if (netMargin < NET_MARGIN_LOW_PCT) insights.push({ tone: 'amber', text: t('insights.lowMargin') });
  // TASK-0534 (calc audit): 5–10% is below the 10–15% shown in the benchmark panel — not «normal».
  else if (netMargin < NET_MARGIN_TARGET_PCT) insights.push({ tone: 'amber', text: t('insights.belowTargetMargin') });
  else insights.push({ tone: 'emerald', text: t('insights.healthyMargin') });
  if (foodCostPct > FOOD_COST_MAX_PCT) insights.push({ tone: 'amber', text: t('insights.foodCostHigh', { value: formatPercent(FOOD_COST_MAX_PCT) }) });
  if (staffCostPct > LABOR_MAX_PCT) insights.push({ tone: 'amber', text: t('insights.laborCostHigh', { value: formatPercent(LABOR_MAX_PCT) }) });

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
      <h3 className="mb-1 text-[11px] font-bold tracking-widest text-slate-700 uppercase">{t('benchmark.title')}</h3>
      <p className="mb-5 text-xs text-slate-600">{t('benchmark.ruleOfThumb')}</p>
      <div className="mb-5 grid grid-cols-2 gap-4">
        {benchmarks.map((key) => (
          <div key={key} className="rounded-xl bg-slate-50 p-4 text-center ring-1 ring-slate-200/60">
            <div className="text-2xl font-black text-blue-700">
              {key === 'primeCost' ? `≤${PRIME_COST_MAX_PCT}%` : key === 'rent' ? `≤${RENT_MAX_PCT}%` : t(`benchmark.${key}.value`)}
            </div>
            <div className="mt-1.5 text-xs font-medium text-slate-600">{t(`benchmark.${key}.label`)}</div>
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
          <p className="mt-1.5 text-[13px] leading-relaxed text-emerald-800">{t('knowledge.controllableBody')}</p>
        </div>
        <div className="rounded-xl bg-red-50 p-4 ring-1 ring-red-200/60">
          <p className="text-sm font-bold text-red-700">{t('knowledge.uncontrollableTitle')}</p>
          <p className="mt-1.5 text-[13px] leading-relaxed text-red-800">{t('knowledge.uncontrollableBody')}</p>
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
      <p className="mb-5 text-sm leading-relaxed text-slate-600">{t('knowledge.primeCostBody', { value: PRIME_COST_MAX_PCT })}</p>
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
            <p className="text-[13px] leading-relaxed text-slate-700">
              {t(`knowledge.warnings.${key}`, {
                prime: PRIME_COST_MAX_PCT,
                rent: RENT_MAX_PCT,
                low: NET_MARGIN_LOW_PCT,
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
