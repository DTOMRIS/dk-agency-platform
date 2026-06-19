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
import { BRANCH_OPENING_PRESETS } from '@/lib/financial/branch-opening-presets';
import {
  calculateBranchOpeningModel,
  type BranchOpeningResult,
  type BranchOpeningInput,
} from '@/lib/financial/branch-opening-model';
import { calculateFinancialViability, type BusinessType } from '@/lib/financial/viability';

export default function BasabasPage() {
  const t = useTranslations('toolkit.basabas');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  // Thousand-separated integer manat formatting, locale-aware (az/ru: "239 804", en: "239,804", tr: "239.804")
  const fmt0 = (n: number) => new Intl.NumberFormat(locale).format(Math.round(Number.isFinite(n) ? n : 0));
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

  const [branchFormat, setBranchFormat] = useState<BranchOpeningInput['format']>('cafe');
  const [areaSqm, setAreaSqm] = useState(100);
  const [seats, setSeats] = useState(25);
  const [branchRent, setBranchRent] = useState(3000);
  const [dailyChecks, setDailyChecks] = useState(100);
  const [branchAverageCheck, setBranchAverageCheck] = useState(25);
  const [openingBudget, setOpeningBudget] = useState(50000);
  const [fitoutCostPerSqm, setFitoutCostPerSqm] = useState(900);
  const [ventilationCostPerSqm, setVentilationCostPerSqm] = useState(250);
  const [kitchenEquipmentCost, setKitchenEquipmentCost] = useState(12000);
  const [barEquipmentCost, setBarEquipmentCost] = useState(4000);
  const [furnitureCostPerSeat, setFurnitureCostPerSeat] = useState(520);
  const [branchInventoryDays, setBranchInventoryDays] = useState(12);
  const [branchStaffCosts, setBranchStaffCosts] = useState(5000);
  const [branchUtilities, setBranchUtilities] = useState(800);
  const [branchOtherFixedCosts, setBranchOtherFixedCosts] = useState(700);
  const [branchVariableCostPct, setBranchVariableCostPct] = useState(36);
  const [rentTaxType, setRentTaxType] = useState<BranchOpeningInput['rentTaxType']>('individual');
  const [branchRampUpMonths, setBranchRampUpMonths] = useState(4);
  const [branchOpeningSalesPct, setBranchOpeningSalesPct] = useState(40);
  const [branchReserveMonths, setBranchReserveMonths] = useState(3);
  const [openingMarketingPct, setOpeningMarketingPct] = useState(12);
  const [documentsCost, setDocumentsCost] = useState(1200);
  const [unexpectedPct, setUnexpectedPct] = useState(10);
  const [startWorkingCapitalPct, setStartWorkingCapitalPct] = useState(20);

  const branchInput: BranchOpeningInput = useMemo(() => ({
    format: branchFormat,
    areaSqm,
    seats,
    monthlyRent: branchRent,
    dailyChecks,
    averageCheck: branchAverageCheck,
    openingBudget,
    fitoutCostPerSqm,
    ventilationCostPerSqm,
    kitchenEquipmentCost,
    barEquipmentCost,
    furnitureCostPerSeat,
    inventoryDays: branchInventoryDays,
    staffCosts: branchStaffCosts,
    utilities: branchUtilities,
    otherFixedCosts: branchOtherFixedCosts,
    variableCostPct: branchVariableCostPct,
    rentTaxType,
    rampUpMonths: branchRampUpMonths,
    openingSalesPct: branchOpeningSalesPct,
    reserveMonths: branchReserveMonths,
    operatingDays,
    openingMarketingPct,
    documentsCost,
    unexpectedPct,
    startWorkingCapitalPct,
  }), [branchFormat, areaSqm, seats, branchRent, dailyChecks, branchAverageCheck, openingBudget,
    fitoutCostPerSqm, ventilationCostPerSqm, kitchenEquipmentCost, barEquipmentCost,
    furnitureCostPerSeat, branchInventoryDays, branchStaffCosts, branchUtilities,
    branchOtherFixedCosts, branchVariableCostPct, rentTaxType, branchRampUpMonths,
    branchOpeningSalesPct, branchReserveMonths, operatingDays, openingMarketingPct,
    documentsCost, unexpectedPct, startWorkingCapitalPct]);

  const branchResult: BranchOpeningResult = useMemo(
    () => calculateBranchOpeningModel(branchInput),
    [branchInput],
  );

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

  const branchIsValid = openingBudget > 0 && areaSqm > 0 && seats > 0 && dailyChecks > 0 && branchAverageCheck > 0;

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
    setBranchFormat('cafe'); setAreaSqm(100); setSeats(25); setBranchRent(3000);
    setDailyChecks(100); setBranchAverageCheck(25); setOpeningBudget(50000);
    setFitoutCostPerSqm(BRANCH_OPENING_PRESETS.cafe.fitoutPerSqm);
    setVentilationCostPerSqm(BRANCH_OPENING_PRESETS.cafe.ventilationPerSqm);
    setKitchenEquipmentCost(12000); setBarEquipmentCost(4000); setFurnitureCostPerSeat(BRANCH_OPENING_PRESETS.cafe.furniturePerSeat);
    setBranchInventoryDays(BRANCH_OPENING_PRESETS.cafe.inventoryDays); setBranchStaffCosts(5000);
    setBranchUtilities(800); setBranchOtherFixedCosts(700); setBranchVariableCostPct(BRANCH_OPENING_PRESETS.cafe.variableCostPct);
    setRentTaxType('individual'); setBranchRampUpMonths(BRANCH_OPENING_PRESETS.cafe.rampUpMonths);
    setBranchOpeningSalesPct(BRANCH_OPENING_PRESETS.cafe.openingSalesPct); setBranchReserveMonths(BRANCH_OPENING_PRESETS.cafe.reserveMonths);
    setOpeningMarketingPct(12); setDocumentsCost(1200); setUnexpectedPct(10); setStartWorkingCapitalPct(20);
  };

  const conditionTexts = calc.conditionKeys.map((key) => t(`conditions.${key}`));
  const sensitivityTexts = calc.sensitivities.map((item) => t(`sensitivities.${item.key}`, {
    change: Math.abs(item.changePct),
    breakEven: Math.round(item.breakEvenRevenue),
    daily: item.dailyTransactions,
    profit: Math.round(item.monthlyOperatingProfit),
  }));

  function downloadReport() {
    if (!branchIsValid) return;
    const benchmarkClass = (band: 'green' | 'amber' | 'red') => ({
      green: 'background:#dcfce7;color:#166534',
      amber: 'background:#fef3c7;color:#92400e',
      red: 'background:#fee2e2;color:#991b1b',
    }[band]);
    const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${t('branchReportTitle')}</title><style>body{margin:0;background:#fafaf8;color:#172033;font-family:Arial,sans-serif;line-height:1.5}main{max-width:900px;margin:auto;padding:24px}.hero,.card{background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:22px;margin-bottom:16px}.hero{background:#1a1a2e;color:#fff}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #edf2f7}.row:last-child{border:0}.pill{display:inline-block;padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px}.muted{color:#64748b;font-size:12px}</style></head><body><main><section class="hero"><div class="muted">DK Agency · ${branchResult.preset.label}</div><h1>${t('branchReportTitle')}</h1><p>${t('branchReportGeneratedAt', { date: new Date().toLocaleDateString(locale) })}</p><span class="pill" style="background:#fff;color:#1a1a2e">${branchResult.paybackMonths === null ? t('notAvailable') : `${branchResult.paybackMonths.toFixed(1)} ${t('months')}`}</span></section><div class="grid"><section class="card"><h2>${t('capexTitle')}</h2><div class="row"><span>${t('branchStatTotalCapex')}</span><strong>${fmt0(branchResult.totalCapex)} ₼</strong></div><div class="row"><span>${t('branchStatOpeningInvestment')}</span><strong>${fmt0(branchResult.openingInvestment)} ₼</strong></div><div class="row"><span>${t('branchStatWorkingCapital')}</span><strong>${fmt0(branchResult.workingCapital)} ₼</strong></div><div class="row"><span>${t('branchStatRampLoss')}</span><strong>${fmt0(branchResult.rampUpLoss)} ₼</strong></div><div class="row"><span>${t('statFundingGap')}</span><strong>${fmt0(branchResult.fundingGap)} ₼</strong></div></section><section class="card"><h2>${t('benchmarkTitle')}</h2>${branchResult.benchmarkFlags.map((flag) => `<div class="row"><span>${t(`benchmark.${flag.key}`)}: ${t(`benchmarkState.${flag.key}.${flag.band}`)}</span><strong><span class="pill" style="${benchmarkClass(flag.band)}">${flag.value.toFixed(1)}${flag.key === 'payback' ? ` ${t('months')}` : '%'} </span></strong></div>`).join('')}</section></div><section class="card"><h2>${t('scenarioTitle')}</h2>${branchResult.scenarios.map((scenario) => `<div class="row"><span>${t(`scenario.${scenario.label}`)}</span><strong>${fmt0(scenario.monthlyRevenue)} ₼</strong></div>`).join('')}</section><section class="card muted">${t('branchReportMethodology')}</section></main></body></html>`;
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `dk-branch-opening-report-${branchFormat}.html`;
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('branchTitle')}</h3>
            <p className="mt-1 text-sm text-slate-500">{t('branchSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={resetAll}
            className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:text-slate-900"
          >
            {t('reset')}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="branch-format" className="mb-1.5 block text-xs font-medium text-slate-700">{t('formatLabel')}</label>
            <select
              id="branch-format"
              value={branchFormat}
              onChange={(event) => setBranchFormat(event.target.value as BranchOpeningInput['format'])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300"
            >
              {(['coffee', 'cafe', 'fastFood', 'bar', 'lounge', 'fineDining'] as BranchOpeningInput['format'][]).map((format) => (
                <option key={format} value={format}>{t(`formats.${format}`)}</option>
              ))}
            </select>
          </div>
          <NumberField label={t('areaLabel')} value={areaSqm} setValue={setAreaSqm} step={5} />
          <NumberField label={t('seatsLabel')} value={seats} setValue={setSeats} step={1} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <NumberField label={t('openingBudgetLabel')} value={openingBudget} setValue={setOpeningBudget} step={1000} />
          <NumberField label={t('branchRentLabel')} value={branchRent} setValue={setBranchRent} step={500} />
          <div>
            <label htmlFor="rent-tax-type" className="mb-1.5 block text-xs font-medium text-slate-700">{t('rentTaxTypeLabel')}</label>
            <select
              id="rent-tax-type"
              value={rentTaxType}
              onChange={(event) => setRentTaxType(event.target.value as BranchOpeningInput['rentTaxType'])}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none focus:border-amber-300"
            >
              <option value="individual">{t('rentTaxIndividual')}</option>
              <option value="legalEntity">{t('rentTaxLegal')}</option>
            </select>
          </div>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumberField label={t('dailyChecksLabel')} value={dailyChecks} setValue={setDailyChecks} step={5} />
          <NumberField label={t('labelAvgCheck')} value={branchAverageCheck} setValue={setBranchAverageCheck} step={0.5} />
          <NumberField label={t('labelOperatingDays')} value={operatingDays} setValue={setOperatingDays} step={1} />
          <NumberField label={t('branchInventoryDaysLabel')} value={branchInventoryDays} setValue={setBranchInventoryDays} step={1} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <NumberField label={t('labelFitoutPerSqm')} value={fitoutCostPerSqm} setValue={setFitoutCostPerSqm} step={50} />
          <NumberField label={t('labelVentilationPerSqm')} value={ventilationCostPerSqm} setValue={setVentilationCostPerSqm} step={50} />
          <NumberField label={t('labelFurniturePerSeat')} value={furnitureCostPerSeat} setValue={setFurnitureCostPerSeat} step={25} />
          <NumberField label={t('labelDocumentsCost')} value={documentsCost} setValue={setDocumentsCost} step={100} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumberField label={t('labelKitchenEquipment')} value={kitchenEquipmentCost} setValue={setKitchenEquipmentCost} step={250} />
          <NumberField label={t('labelBarEquipment')} value={barEquipmentCost} setValue={setBarEquipmentCost} step={250} />
          <NumberField label={t('labelOpeningMarketingPct')} value={openingMarketingPct} setValue={setOpeningMarketingPct} step={1} />
          <NumberField label={t('labelUnexpectedPct')} value={unexpectedPct} setValue={setUnexpectedPct} step={1} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumberField label={t('labelBranchStaffCosts')} value={branchStaffCosts} setValue={setBranchStaffCosts} step={100} />
          <NumberField label={t('labelUtilities')} value={branchUtilities} setValue={setBranchUtilities} step={50} />
          <NumberField label={t('labelOtherFixed')} value={branchOtherFixedCosts} setValue={setBranchOtherFixedCosts} step={50} />
          <NumberField label={t('labelVariablePct')} value={branchVariableCostPct} setValue={setBranchVariableCostPct} step={1} />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-4">
          <NumberField label={t('labelRampMonths')} value={branchRampUpMonths} setValue={setBranchRampUpMonths} step={1} />
          <NumberField label={t('labelOpeningSalesPct')} value={branchOpeningSalesPct} setValue={setBranchOpeningSalesPct} step={1} />
          <NumberField label={t('labelReserveMonths')} value={branchReserveMonths} setValue={setBranchReserveMonths} step={1} />
          <NumberField label={t('labelStartWorkingCapitalPct')} value={startWorkingCapitalPct} setValue={setStartWorkingCapitalPct} step={1} />
        </div>

        {!branchIsValid && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('branchValidationError')}</p>
        )}
      </div>

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
      <div className="rounded-2xl bg-slate-950 p-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t('branchTitle')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums">{fmt0(branchResult.totalFundingNeed)}<span className="ml-1 text-lg">₼</span></div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span>{t('branchStatTotalCapex')}: {fmt0(branchResult.totalCapex)} ₼</span>
          <span>{t('branchStatOpeningInvestment')}: {fmt0(branchResult.openingInvestment)} ₼</span>
          <span>{t('branchStatWorkingCapital')}: {fmt0(branchResult.workingCapital)} ₼</span>
          <span>{t('branchStatTaxBurden')}: {fmt0(branchResult.taxBurden)} ₼</span>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] text-slate-400">
          <div className="flex justify-between"><span>{t('branchStatPrimeCost')}</span><span>{branchResult.primeCostPct.toFixed(1)}%</span></div>
          <div className="flex justify-between"><span>{t('branchStatEbitda')}</span><span>{fmt0(branchResult.ebitda)} ₼</span></div>
          <div className="flex justify-between"><span>{t('branchStatNetProfit')}</span><span>{fmt0(branchResult.netProfit)} ₼</span></div>
          <div className="flex justify-between"><span>{t('branchStatPayback')}</span><span>{branchResult.paybackMonths === null ? t('notAvailable') : `${branchResult.paybackMonths.toFixed(1)} ${t('months')}`}</span></div>
          <div className="flex justify-between"><span>{t('branchStatRunway')}</span><span>{branchResult.runwayMonths.toFixed(1)} {t('months')}</span></div>
          <div className="flex justify-between"><span>{t('branchStatCashRunway')}</span><span>{branchResult.cashRunwayMonths.toFixed(1)} {t('months')}</span></div>
          <div className="flex justify-between"><span>{t('branchStatRampLoss')}</span><span>{fmt0(branchResult.rampUpLoss)} ₼</span></div>
          <div className="flex justify-between"><span>{t('statFundingGap')}</span><span>{fmt0(branchResult.fundingGap)} ₼</span></div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {branchResult.benchmarkFlags.map((flag) => {
          const colorClasses = {
            green: 'bg-emerald-50 ring-emerald-200 text-emerald-700',
            amber: 'bg-amber-50 ring-amber-200 text-amber-700',
            red: 'bg-red-50 ring-red-200 text-red-700',
          }[flag.band];
          return (
            <div key={flag.key} className={`rounded-xl p-3 ring-1 ${colorClasses}`}>
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t(`benchmark.${flag.key}`)}</div>
              <div className="mt-1 text-sm font-semibold">{t(`benchmarkState.${flag.key}.${flag.band}`)}</div>
              <div className="mt-1 text-lg font-black tabular-nums">{flag.value.toFixed(1)}{flag.key === 'payback' ? ` ${t('months')}` : '%'}</div>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
        <div className="text-xs font-black uppercase tracking-wider text-slate-700">{t('scenarioTitle')}</div>
        <div className="mt-3 space-y-2 text-xs text-slate-700">
          {branchResult.scenarios.map((scenario) => (
            <div key={scenario.label} className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
              <div className="flex items-center justify-between gap-3">
                <span className="font-bold uppercase tracking-wider text-slate-500">{t(`scenario.${scenario.label}`)}</span>
                <span className="font-black tabular-nums text-slate-900">{fmt0(scenario.monthlyRevenue)} ₼</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-500 sm:grid-cols-4">
                <span>{t('branchStatPrimeCost')}: {scenario.primeCostPct.toFixed(1)}%</span>
                <span>{t('branchStatEbitda')}: {fmt0(scenario.ebitda)} ₼</span>
                <span>{t('branchStatPayback')}: {scenario.paybackMonths === null ? t('notAvailable') : `${scenario.paybackMonths.toFixed(1)} ${t('months')}`}</span>
                <span>{t('branchStatRentShare')}: {scenario.rentSharePct.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statBreakEven')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-amber-600">
          {fmt0(calc.breakEvenRevenue)}<span className="ml-1 text-lg">₼</span>
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
          {fmt0(calc.totalFixedCosts)}<span className="ml-1 text-lg">₼</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="rounded-lg bg-amber-50 p-2.5 text-center ring-1 ring-amber-200/60">
          <div className="text-lg font-black text-amber-600">{fmt0(calc.contributionPct)}%</div>
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
        <div className="mt-1 text-3xl font-black tabular-nums">{fmt0(calc.workingCapitalNeed)} ₼</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span>{t('statTotalFunding')}: {fmt0(calc.totalFundingNeed)} ₼</span>
          <span>{t('statFundingGap')}: {fmt0(calc.fundingGap)} ₼</span>
          <span>{t('statRunway')}: {calc.runwayMonths.toFixed(1)} {t('months')}</span>
          <span>{t('statPayback')}: {calc.paybackMonths === null ? t('notAvailable') : `${calc.paybackMonths.toFixed(1)} ${t('months')}`}</span>
        </div>
        <div className="mt-3 space-y-1 border-t border-white/10 pt-3 text-[11px] text-slate-400">
          <div className="flex justify-between"><span>{t('breakdown.inventory')}</span><span>{fmt0(calc.inventoryInvestment)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.receivables')}</span><span>{fmt0(calc.receivablesFunding)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.supplierFinancing')}</span><span>-{fmt0(calc.supplierFinancing)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.deposits')}</span><span>{fmt0(depositsAndPrepaids)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.rampLoss')}</span><span>{fmt0(calc.rampUpLoss)} ₼</span></div>
          <div className="flex justify-between"><span>{t('breakdown.reserve')}</span><span>{fmt0(calc.operatingReserve)} ₼</span></div>
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
        disabled={!branchIsValid}
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
