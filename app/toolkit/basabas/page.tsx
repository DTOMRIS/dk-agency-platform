'use client';

import { useId, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  BookOpen,
  Download,
  Info,
  Lightbulb,
  RotateCcw,
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { calculateFinancialViability, type BusinessType } from '@/lib/financial/viability';
import { buildFinancialReportHtml } from '@/lib/financial/report-html';

export default function BasabasPage() {
  const t = useTranslations('toolkit.basabas');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const [businessType, setBusinessType] = useState<BusinessType>('cafe');
  const [availableBudget, setAvailableBudget] = useState(50000);
  const [openingInvestment, setOpeningInvestment] = useState(30000);
  const [rent, setRent] = useState(3000);
  const [salaries, setSalaries] = useState(5000);
  const [utilities, setUtilities] = useState(800);
  const [otherFixed, setOtherFixed] = useState(700);
  const [variablePct, setVariablePct] = useState(35);
  const [avgCheck, setAvgCheck] = useState(25);
  const [currentSales, setCurrentSales] = useState(18000);
  const [operatingDays, setOperatingDays] = useState(30);
  const [inventoryDays, setInventoryDays] = useState(14);
  const [receivableDays, setReceivableDays] = useState(0);
  const [payableDays, setPayableDays] = useState(15);
  const [depositsAndPrepaids, setDepositsAndPrepaids] = useState(6000);
  const [rampUpMonths, setRampUpMonths] = useState(3);
  const [openingSalesPct, setOpeningSalesPct] = useState(40);
  const [reserveMonths, setReserveMonths] = useState(3);

  const financialInput = useMemo(() => ({
    businessType,
    availableBudget,
    openingInvestment,
    monthlySales: currentSales,
    averageTransaction: avgCheck,
    operatingDays,
    rent,
    salaries,
    utilities,
    otherFixedCosts: otherFixed,
    variableCostPct: variablePct,
    inventoryDays,
    receivableDays,
    payableDays,
    depositsAndPrepaids,
    rampUpMonths,
    openingSalesPct,
    reserveMonths,
  }), [businessType, availableBudget, openingInvestment, currentSales, avgCheck, operatingDays,
    rent, salaries, utilities, otherFixed, variablePct, inventoryDays, receivableDays,
    payableDays, depositsAndPrepaids, rampUpMonths, openingSalesPct, reserveMonths]);
  const calc = useMemo(() => calculateFinancialViability(financialInput), [financialInput]);
  const status: 'safe' | 'warning' | 'danger' =
    calc.safetyMarginPct >= 20 ? 'safe' : calc.safetyMarginPct >= 0 ? 'warning' : 'danger';
  const isValid = availableBudget > 0 && currentSales > 0 && avgCheck > 0 &&
    operatingDays > 0 && variablePct >= 0 && variablePct < 100;

  const statusStyles = {
    safe: { ring: 'ring-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', label: t('statusSafe') },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-600', bg: 'bg-amber-50', label: t('statusWarning') },
    danger: { ring: 'ring-red-500/20', text: 'text-red-600', bg: 'bg-red-50', label: t('statusDanger') },
  }[status];

  const resetAll = () => {
    setBusinessType('cafe'); setAvailableBudget(50000); setOpeningInvestment(30000);
    setRent(3000); setSalaries(5000); setUtilities(800); setOtherFixed(700);
    setVariablePct(35); setAvgCheck(25); setCurrentSales(18000);
    setOperatingDays(30); setInventoryDays(14); setReceivableDays(0); setPayableDays(15);
    setDepositsAndPrepaids(6000); setRampUpMonths(3); setOpeningSalesPct(40); setReserveMonths(3);
  };

  const conditionTexts = calc.conditionKeys.map((key) => t(`conditions.${key}`));
  const sensitivityTexts = calc.sensitivities.map((item) => t(`sensitivities.${item.key}`, {
    change: Math.abs(item.changePct),
    breakEven: Math.round(item.breakEvenRevenue),
    daily: item.dailyTransactions,
    profit: Math.round(item.monthlyOperatingProfit),
  }));

  function downloadReport() {
    if (!isValid) return;
    const html = buildFinancialReportHtml(financialInput, calc, {
      locale,
      title: t('report.title'),
      generatedAt: t('report.generatedAt', { date: new Date().toLocaleDateString(locale) }),
      businessType: t(`businessTypes.${businessType}`),
      verdict: t(`verdicts.${calc.verdict}.title`),
      summary: t(`verdicts.${calc.verdict}.body`),
      fundingTitle: t('report.fundingTitle'),
      operatingTitle: t('report.operatingTitle'),
      sensitivityTitle: t('sensitivityTitle'),
      conditionsTitle: t('conditionsTitle'),
      methodology: t('report.methodology'),
      labels: {
        availableBudget: t('labelAvailableBudget'), openingInvestment: t('labelOpeningInvestment'),
        workingCapital: t('statWorkingCapital'), totalFunding: t('statTotalFunding'),
        inventory: t('breakdown.inventory'), receivables: t('breakdown.receivables'),
        supplierFinancing: t('breakdown.supplierFinancing'), deposits: t('breakdown.deposits'),
        rampLoss: t('breakdown.rampLoss'), reserve: t('breakdown.reserve'),
        fundingGap: t('statFundingGap'), runway: t('statRunway'), months: t('months'),
        monthlySales: t('labelCurrentSales'), breakEven: t('statBreakEven'),
        dailyTransactions: t('statDailyCustomers'), monthlyProfit: t('statMonthlyProfit'),
        safetyMargin: t('statSafetyMargin'), payback: t('statPayback'),
        notAvailable: t('notAvailable'),
      },
      conditions: conditionTexts.length > 0 ? conditionTexts : [t('conditions.ready')],
      sensitivities: sensitivityTexts,
    });
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dk-financial-report-${businessType}.html`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  const articles = [
    { title: t('article1Title'), slug: t('article1Slug'), tag: t('article1Tag') },
    { title: t('article2Title'), slug: t('article2Slug'), tag: t('article2Tag') },
    { title: t('article3Title'), slug: t('article3Slug'), tag: t('article3Tag') },
  ];

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('planningTitle')}</h3>
        <button
          type="button"
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs font-medium text-slate-700 transition-colors hover:text-red-600"
        >
          <RotateCcw size={13} /> {t('reset')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label htmlFor="financial-business-type" className="mb-1.5 block text-xs font-medium text-slate-700">{t('labelBusinessType')}</label>
          <select
            id="financial-business-type"
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value as BusinessType)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300"
          >
            {(['cafe', 'restaurant', 'hotel', 'retail', 'service'] as BusinessType[]).map((type) => (
              <option key={type} value={type}>{t(`businessTypes.${type}`)}</option>
            ))}
          </select>
        </div>
        <NumberField label={t('labelAvailableBudget')} value={availableBudget} setValue={setAvailableBudget} step={1000} />
        <NumberField label={t('labelOpeningInvestment')} value={openingInvestment} setValue={setOpeningInvestment} step={1000} />
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('fixedCostsTitle')}</h3>
        <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'financial-rent', label: t('labelRent'), value: rent, set: setRent, step: 100 },
          { id: 'financial-salaries', label: t('labelSalaries'), value: salaries, set: setSalaries, step: 100 },
          { id: 'financial-utilities', label: t('labelUtilities'), value: utilities, set: setUtilities, step: 50 },
          { id: 'financial-other-fixed', label: t('labelOtherFixed'), value: otherFixed, set: setOtherFixed, step: 50 },
        ].map((field) => (
          <div key={field.label}>
            <label htmlFor={field.id} className="mb-1.5 block text-xs font-medium text-slate-700">{field.label}</label>
            <input
              id={field.id}
              type="number"
              step={field.step}
              value={field.value || ''}
              onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('variableParamsTitle')}</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { id: 'financial-variable-pct', label: t('labelVariablePct'), value: variablePct, set: setVariablePct, min: 0, max: 99 },
            { id: 'financial-average-transaction', label: t('labelAvgCheck'), value: avgCheck, set: setAvgCheck, step: 0.5 },
            { id: 'financial-monthly-sales', label: t('labelCurrentSales'), value: currentSales, set: setCurrentSales, step: 500 },
            { id: 'financial-operating-days', label: t('labelOperatingDays'), value: operatingDays, set: setOperatingDays, step: 1 },
          ].map((field) => (
            <div key={field.label}>
              <label htmlFor={field.id} className="mb-1.5 block text-xs font-medium text-slate-700">{field.label}</label>
              <input
                id={field.id}
                type="number"
                min={('min' in field) ? field.min : undefined}
                max={('max' in field) ? field.max : undefined}
                step={('step' in field) ? field.step : undefined}
                value={field.value || ''}
                onChange={(e) => field.set(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('workingCapitalTitle')}</h3>
        <p className="mb-4 text-xs leading-5 text-slate-500">{t('workingCapitalHelp')}</p>
        <div className="grid gap-4 sm:grid-cols-4">
          <NumberField label={t('labelInventoryDays')} value={inventoryDays} setValue={setInventoryDays} />
          <NumberField label={t('labelReceivableDays')} value={receivableDays} setValue={setReceivableDays} />
          <NumberField label={t('labelPayableDays')} value={payableDays} setValue={setPayableDays} />
          <NumberField label={t('labelDeposits')} value={depositsAndPrepaids} setValue={setDepositsAndPrepaids} step={500} />
          <NumberField label={t('labelRampMonths')} value={rampUpMonths} setValue={setRampUpMonths} />
          <NumberField label={t('labelOpeningSalesPct')} value={openingSalesPct} setValue={setOpeningSalesPct} />
          <NumberField label={t('labelReserveMonths')} value={reserveMonths} setValue={setReserveMonths} />
        </div>
      </div>

      {!isValid && (
        <p className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('validationError')}</p>
      )}
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statBreakEven')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-amber-600">
          {calc.breakEvenRevenue.toFixed(0)}<span className="ml-1 text-lg">₼</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400">{t('statMonthlyMin')}</div>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statDailyCustomers')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-slate-900">
          {calc.dailyTransactions}<span className="ml-1 text-lg">{t(`businessUnits.${businessType}`)}</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-400">{t('statAvgCheck')} {avgCheck} ₼</div>
      </div>

      <div className={`${statusStyles.bg} rounded-xl p-4 ring-1 ${statusStyles.ring}`}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statSafetyMargin')}</div>
        <div className={`mt-1 text-3xl font-black tabular-nums ${statusStyles.text}`}>{calc.safetyMarginPct.toFixed(1)}%</div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${statusStyles.text}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusStyles.label}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statFixedCosts')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-slate-900">
          {calc.totalFixedCosts.toFixed(0)}<span className="ml-1 text-lg">₼</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="rounded-lg bg-amber-50 p-2.5 text-center ring-1 ring-amber-200/60">
          <div className="text-lg font-black text-amber-600">{calc.contributionPct.toFixed(0)}%</div>
          <div className="text-[9px] font-medium text-slate-500">{t('contributionLabel')}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5 text-center ring-1 ring-blue-200/60">
          <div className="text-lg font-black text-blue-600">≥20%</div>
          <div className="text-[9px] font-medium text-slate-500">{t('idealMarginLabel')}</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2.5 text-center ring-1 ring-emerald-200/60">
          <div className="text-lg font-black text-emerald-600">{t('calcPeriodValue')}</div>
          <div className="text-[9px] font-medium text-slate-500">{t('calcPeriodLabel')}</div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-950 p-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t('statWorkingCapital')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums">{calc.workingCapitalNeed.toFixed(0)} ₼</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span>{t('statTotalFunding')}: {calc.totalFundingNeed.toFixed(0)} ₼</span>
          <span>{t('statFundingGap')}: {calc.fundingGap.toFixed(0)} ₼</span>
          <span>{t('statRunway')}: {calc.runwayMonths.toFixed(1)} {t('months')}</span>
          <span>{t('statPayback')}: {calc.paybackMonths === null ? t('notAvailable') : `${calc.paybackMonths.toFixed(1)} ${t('months')}`}</span>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] text-slate-400">
          <div className="flex justify-between"><span>{t('breakdown.inventory')}</span><span>{calc.inventoryInvestment.toFixed(0)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.receivables')}</span><span>{calc.receivablesFunding.toFixed(0)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.supplierFinancing')}</span><span>-{calc.supplierFinancing.toFixed(0)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.deposits')}</span><span>{depositsAndPrepaids.toFixed(0)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.rampLoss')}</span><span>{calc.rampUpLoss.toFixed(0)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.reserve')}</span><span>{calc.operatingReserve.toFixed(0)} ₼</span></div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="text-xs font-black uppercase tracking-wider text-slate-700">{t(`verdicts.${calc.verdict}.title`)}</div>
        <p className="mt-2 text-xs leading-5 text-slate-600">{t(`verdicts.${calc.verdict}.body`)}</p>
        <ol className="mt-3 list-decimal space-y-1 pl-5 text-xs text-slate-700">
          {(conditionTexts.length > 0 ? conditionTexts : [t('conditions.ready')]).map((condition) => (
            <li key={condition}>{condition}</li>
          ))}
        </ol>
      </div>

      <div>
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('sensitivityTitle')}</div>
        <div className="space-y-2">
          {sensitivityTexts.map((text) => (
            <div key={text} className="rounded-lg bg-blue-50 p-3 text-xs leading-5 text-blue-900">{text}</div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={downloadReport}
        disabled={!isValid}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        <Download size={16} /> {t('downloadReport')}
      </button>
    </div>
  );

  // ── Bottom Section (Education + CTA + Blog) ───────────────────────

  const bottomSection = (
    <>
      {/* Education 3-block */}
      <div className="mb-10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 sm:text-3xl">
            {t('educationTitle')}{' '}
            <span className="bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              {t('educationTitleAccent')}
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('educationSubtitle')}</p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-amber-50/60 to-white p-6 ring-1 ring-amber-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                <Info size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('whatTitle')}</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">{t('whatBody')}</p>
            <div className="mt-auto space-y-2 rounded-xl bg-slate-900 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-amber-400">{t('formulaLabel')}</p>
              <div className="space-y-0.5 font-mono text-[12px] text-slate-300">
                <p className="text-white">{t('formulaLine1')}</p>
                <p>{t('formulaLine2')}</p>
                <p className="border-t border-slate-700 pt-1 font-bold text-amber-400">{t('formulaResult')}</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="font-mono text-[11px] font-bold text-white">{t('formulaCm')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-200/60">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <TrendingDown size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('fixedVsVariableTitle')}</h3>
            </div>
            <p className="mb-4 text-[12px] text-slate-500">{t('fixedVsVariableSubtitle')}</p>
            <div className="mt-auto space-y-2.5">
              <div className="rounded-xl bg-amber-50 p-3.5 ring-1 ring-amber-200/60">
                <p className="text-xs font-bold text-amber-700">{t('fixedCostsLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-600/80">{t('fixedCostsDesc')}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 ring-1 ring-blue-200/60">
                <p className="text-xs font-bold text-blue-700">{t('variableCostsLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-600/80">{t('variableCostsDesc')}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200/60">
                <p className="text-xs font-bold text-emerald-700">{t('contributionMarginLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-600/80">{t('contributionMarginDesc')}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-emerald-50/60 to-white p-6 ring-1 ring-emerald-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
                <ShieldCheck size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('safetyMarginTitle')}</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">{t('safetyMarginBody')}</p>
            <div className="mt-auto rounded-xl bg-white p-4 ring-1 ring-emerald-200/60">
              <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">{t('marginLevelsLabel')}</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="text-[11px] text-slate-600">{t('marginSafe')}</span></div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-amber-500" /><span className="text-[11px] text-slate-600">{t('marginWarning')}</span></div>
                <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-red-500" /><span className="text-[11px] text-slate-600">{t('marginDanger')}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA + Blog */}
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
          <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-amber-500/10 blur-[50px]" />
          <div className="relative">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                <Lightbulb size={16} className="text-amber-400" />
              </div>
              <h3 className="text-base font-bold text-amber-400">{t('dkAdviceTitle')}</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-400">{t('dkAdviceBody')}</p>
            <Link
              href="/blog/basabas-noqtesi-hesablama"
              className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
            >
              {t('readArticle')}
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 p-8 text-white shadow-xl shadow-orange-500/15">
          <div>
            <h3 className="mb-3 text-xl font-display font-black">{t('ocaqTitle')}</h3>
            <p className="mb-6 text-sm leading-relaxed text-white/85">{t('ocaqBody')}</p>
          </div>
          <Link
            href="/auth/register"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-600 transition-colors hover:bg-orange-50"
          >
            {t('ocaqCta')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Blog links */}
      <div className="mt-10 rounded-2xl bg-slate-50 p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-2.5">
          <BookOpen size={18} className="text-orange-600" />
          <h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-slate-300/60"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">{article.tag}</span>
              <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-600">
                {article.title}
              </h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-orange-600">
                {t('readLabel')} <ArrowRight size={12} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout
      toolId="basabas"
      toolName={t('title')}
      toolDescription={t('subtitle')}
      tier="kalfa"
      inputSection={inputSection}
      resultSection={resultSection}
      bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'basabas', locale, result: {
          businessType,
          breakEvenRevenue: calc.breakEvenRevenue,
          dailyTransactions: calc.dailyTransactions,
          safetyMargin: calc.safetyMarginPct,
          totalFixed: calc.totalFixedCosts,
          contributionPct: calc.contributionPct,
          workingCapitalNeed: calc.workingCapitalNeed,
          fundingGap: calc.fundingGap,
          runwayMonths: calc.runwayMonths,
        } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}

function NumberField({
  label,
  value,
  setValue,
  step = 1,
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  step?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-700">{label}</label>
      <input
        id={id}
        type="number"
        min={0}
        step={step}
        value={value || ''}
        onChange={(event) => setValue(Number(event.target.value) || 0)}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
      />
    </div>
  );
}
