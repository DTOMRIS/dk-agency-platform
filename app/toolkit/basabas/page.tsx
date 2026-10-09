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
  ShieldCheck,
  TrendingDown,
} from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import {
  calculateBranchOpeningModel,
  type BranchOpeningResult,
  type BranchOpeningInput,
} from '@/lib/financial/branch-opening-model';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import { calculateFinancialViability, type BusinessType } from '@/lib/financial/viability';
import { numberLocale } from '@/lib/i18n/format';

/** Every input of the tool (both the branch model and the business plan). */
interface BasabasState {
  businessType: BusinessType;
  availableBudget: number;
  openingInvestment: number;
  rent: number;
  salaries: number;
  utilities: number;
  otherFixed: number;
  variablePct: number;
  avgCheck: number;
  currentSales: number;
  operatingDays: number;
  inventoryDays: number;
  receivableDays: number;
  payableDays: number;
  depositsAndPrepaids: number;
  rampUpMonths: number;
  openingSalesPct: number;
  reserveMonths: number;
  branchFormat: BranchOpeningInput['format'];
  areaSqm: number;
  seats: number;
  branchRent: number;
  dailyChecks: number;
  branchAverageCheck: number;
  openingBudget: number;
  fitoutCostPerSqm: number;
  ventilationCostPerSqm: number;
  kitchenEquipmentCost: number;
  barEquipmentCost: number;
  furnitureCostPerSeat: number;
  branchInventoryDays: number;
  branchStaffCosts: number;
  branchUtilities: number;
  branchOtherFixedCosts: number;
  branchVariableCostPct: number;
  rentTaxType: BranchOpeningInput['rentTaxType'];
  branchRampUpMonths: number;
  branchOpeningSalesPct: number;
  branchReserveMonths: number;
  openingMarketingPct: number;
  documentsCost: number;
  unexpectedPct: number;
  startWorkingCapitalPct: number;
}

/** Example values (nümunə — a 100 m², 25-seat café) loaded by «Nümunəni yüklə». Not a sector norm. */
const EXAMPLE_STATE: BasabasState = {
  businessType: 'cafe',
  availableBudget: 50000,
  openingInvestment: 30000,
  rent: 3000,
  salaries: 5000,
  utilities: 800,
  otherFixed: 700,
  variablePct: 35,
  avgCheck: 25,
  currentSales: 18000,
  operatingDays: 30,
  inventoryDays: 14,
  receivableDays: 0,
  payableDays: 15,
  depositsAndPrepaids: 6000,
  rampUpMonths: 3,
  openingSalesPct: 40,
  reserveMonths: 3,
  branchFormat: 'cafe',
  areaSqm: 100,
  seats: 25,
  branchRent: 3000,
  dailyChecks: 100,
  branchAverageCheck: 25,
  openingBudget: 50000,
  fitoutCostPerSqm: 900,
  ventilationCostPerSqm: 250,
  kitchenEquipmentCost: 12000,
  barEquipmentCost: 4000,
  furnitureCostPerSeat: 520,
  branchInventoryDays: 12,
  branchStaffCosts: 5000,
  branchUtilities: 800,
  branchOtherFixedCosts: 700,
  branchVariableCostPct: 36,
  rentTaxType: 'individual',
  branchRampUpMonths: 4,
  branchOpeningSalesPct: 40,
  branchReserveMonths: 3,
  openingMarketingPct: 12,
  documentsCost: 1200,
  unexpectedPct: 10,
  startWorkingCapitalPct: 20,
};

/** «Təmizlə»: every number → 0; the three dropdowns keep their current choice. */
function emptyState(state: BasabasState): BasabasState {
  return {
    businessType: state.businessType,
    availableBudget: 0,
    openingInvestment: 0,
    rent: 0,
    salaries: 0,
    utilities: 0,
    otherFixed: 0,
    variablePct: 0,
    avgCheck: 0,
    currentSales: 0,
    operatingDays: 0,
    inventoryDays: 0,
    receivableDays: 0,
    payableDays: 0,
    depositsAndPrepaids: 0,
    rampUpMonths: 0,
    openingSalesPct: 0,
    reserveMonths: 0,
    branchFormat: state.branchFormat,
    areaSqm: 0,
    seats: 0,
    branchRent: 0,
    dailyChecks: 0,
    branchAverageCheck: 0,
    openingBudget: 0,
    fitoutCostPerSqm: 0,
    ventilationCostPerSqm: 0,
    kitchenEquipmentCost: 0,
    barEquipmentCost: 0,
    furnitureCostPerSeat: 0,
    branchInventoryDays: 0,
    branchStaffCosts: 0,
    branchUtilities: 0,
    branchOtherFixedCosts: 0,
    branchVariableCostPct: 0,
    rentTaxType: state.rentTaxType,
    branchRampUpMonths: 0,
    branchOpeningSalesPct: 0,
    branchReserveMonths: 0,
    openingMarketingPct: 0,
    documentsCost: 0,
    unexpectedPct: 0,
    startWorkingCapitalPct: 0,
  };
}

export default function BasabasPage() {
  const t = useTranslations('toolkit.basabas');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  // Thousand-separated integer manat formatting, locale-aware (az/ru: "239 804", en: "239,804", tr: "239.804")
  const fmt0 = (n: number) => new Intl.NumberFormat(numberLocale(locale)).format(Math.round(Number.isFinite(n) ? n : 0));
  // TASK-0518: one-decimal values (%, months) with the page language's decimal mark (az/ru/tr «12,5», en «12.5»).
  const fmt1 = (n: number) => new Intl.NumberFormat(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(Number.isFinite(n) ? n : 0);
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  // TASK-0517: the whole form is one state object so «Təmizlə» / «Nümunəni yüklə» / «Geri al» cover every field.
  const [form, setForm] = useState<BasabasState>(EXAMPLE_STATE);
  const { businessType, availableBudget, openingInvestment, rent, salaries, utilities, otherFixed, variablePct, avgCheck, currentSales, operatingDays, inventoryDays, receivableDays, payableDays, depositsAndPrepaids, rampUpMonths, openingSalesPct, reserveMonths, branchFormat, areaSqm, seats, branchRent, dailyChecks, branchAverageCheck, openingBudget, fitoutCostPerSqm, ventilationCostPerSqm, kitchenEquipmentCost, barEquipmentCost, furnitureCostPerSeat, branchInventoryDays, branchStaffCosts, branchUtilities, branchOtherFixedCosts, branchVariableCostPct, rentTaxType, branchRampUpMonths, branchOpeningSalesPct, branchReserveMonths, openingMarketingPct, documentsCost, unexpectedPct, startWorkingCapitalPct } = form;
  const setBusinessType = (value: BasabasState['businessType']) => setForm((prev) => ({ ...prev, businessType: value }));
  const setAvailableBudget = (value: BasabasState['availableBudget']) => setForm((prev) => ({ ...prev, availableBudget: value }));
  const setOpeningInvestment = (value: BasabasState['openingInvestment']) => setForm((prev) => ({ ...prev, openingInvestment: value }));
  const setRent = (value: BasabasState['rent']) => setForm((prev) => ({ ...prev, rent: value }));
  const setSalaries = (value: BasabasState['salaries']) => setForm((prev) => ({ ...prev, salaries: value }));
  const setUtilities = (value: BasabasState['utilities']) => setForm((prev) => ({ ...prev, utilities: value }));
  const setOtherFixed = (value: BasabasState['otherFixed']) => setForm((prev) => ({ ...prev, otherFixed: value }));
  const setVariablePct = (value: BasabasState['variablePct']) => setForm((prev) => ({ ...prev, variablePct: value }));
  const setAvgCheck = (value: BasabasState['avgCheck']) => setForm((prev) => ({ ...prev, avgCheck: value }));
  const setCurrentSales = (value: BasabasState['currentSales']) => setForm((prev) => ({ ...prev, currentSales: value }));
  const setOperatingDays = (value: BasabasState['operatingDays']) => setForm((prev) => ({ ...prev, operatingDays: value }));
  const setInventoryDays = (value: BasabasState['inventoryDays']) => setForm((prev) => ({ ...prev, inventoryDays: value }));
  const setReceivableDays = (value: BasabasState['receivableDays']) => setForm((prev) => ({ ...prev, receivableDays: value }));
  const setPayableDays = (value: BasabasState['payableDays']) => setForm((prev) => ({ ...prev, payableDays: value }));
  const setDepositsAndPrepaids = (value: BasabasState['depositsAndPrepaids']) => setForm((prev) => ({ ...prev, depositsAndPrepaids: value }));
  const setRampUpMonths = (value: BasabasState['rampUpMonths']) => setForm((prev) => ({ ...prev, rampUpMonths: value }));
  const setOpeningSalesPct = (value: BasabasState['openingSalesPct']) => setForm((prev) => ({ ...prev, openingSalesPct: value }));
  const setReserveMonths = (value: BasabasState['reserveMonths']) => setForm((prev) => ({ ...prev, reserveMonths: value }));
  const setBranchFormat = (value: BasabasState['branchFormat']) => setForm((prev) => ({ ...prev, branchFormat: value }));
  const setAreaSqm = (value: BasabasState['areaSqm']) => setForm((prev) => ({ ...prev, areaSqm: value }));
  const setSeats = (value: BasabasState['seats']) => setForm((prev) => ({ ...prev, seats: value }));
  const setBranchRent = (value: BasabasState['branchRent']) => setForm((prev) => ({ ...prev, branchRent: value }));
  const setDailyChecks = (value: BasabasState['dailyChecks']) => setForm((prev) => ({ ...prev, dailyChecks: value }));
  const setBranchAverageCheck = (value: BasabasState['branchAverageCheck']) => setForm((prev) => ({ ...prev, branchAverageCheck: value }));
  const setOpeningBudget = (value: BasabasState['openingBudget']) => setForm((prev) => ({ ...prev, openingBudget: value }));
  const setFitoutCostPerSqm = (value: BasabasState['fitoutCostPerSqm']) => setForm((prev) => ({ ...prev, fitoutCostPerSqm: value }));
  const setVentilationCostPerSqm = (value: BasabasState['ventilationCostPerSqm']) => setForm((prev) => ({ ...prev, ventilationCostPerSqm: value }));
  const setKitchenEquipmentCost = (value: BasabasState['kitchenEquipmentCost']) => setForm((prev) => ({ ...prev, kitchenEquipmentCost: value }));
  const setBarEquipmentCost = (value: BasabasState['barEquipmentCost']) => setForm((prev) => ({ ...prev, barEquipmentCost: value }));
  const setFurnitureCostPerSeat = (value: BasabasState['furnitureCostPerSeat']) => setForm((prev) => ({ ...prev, furnitureCostPerSeat: value }));
  const setBranchInventoryDays = (value: BasabasState['branchInventoryDays']) => setForm((prev) => ({ ...prev, branchInventoryDays: value }));
  const setBranchStaffCosts = (value: BasabasState['branchStaffCosts']) => setForm((prev) => ({ ...prev, branchStaffCosts: value }));
  const setBranchUtilities = (value: BasabasState['branchUtilities']) => setForm((prev) => ({ ...prev, branchUtilities: value }));
  const setBranchOtherFixedCosts = (value: BasabasState['branchOtherFixedCosts']) => setForm((prev) => ({ ...prev, branchOtherFixedCosts: value }));
  const setBranchVariableCostPct = (value: BasabasState['branchVariableCostPct']) => setForm((prev) => ({ ...prev, branchVariableCostPct: value }));
  const setRentTaxType = (value: BasabasState['rentTaxType']) => setForm((prev) => ({ ...prev, rentTaxType: value }));
  const setBranchRampUpMonths = (value: BasabasState['branchRampUpMonths']) => setForm((prev) => ({ ...prev, branchRampUpMonths: value }));
  const setBranchOpeningSalesPct = (value: BasabasState['branchOpeningSalesPct']) => setForm((prev) => ({ ...prev, branchOpeningSalesPct: value }));
  const setBranchReserveMonths = (value: BasabasState['branchReserveMonths']) => setForm((prev) => ({ ...prev, branchReserveMonths: value }));
  const setOpeningMarketingPct = (value: BasabasState['openingMarketingPct']) => setForm((prev) => ({ ...prev, openingMarketingPct: value }));
  const setDocumentsCost = (value: BasabasState['documentsCost']) => setForm((prev) => ({ ...prev, documentsCost: value }));
  const setUnexpectedPct = (value: BasabasState['unexpectedPct']) => setForm((prev) => ({ ...prev, unexpectedPct: value }));
  const setStartWorkingCapitalPct = (value: BasabasState['startWorkingCapitalPct']) => setForm((prev) => ({ ...prev, startWorkingCapitalPct: value }));

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

  // Right after «Təmizlə» every number is 0 — no red validation lines until the user types again.
  const formEmpty = Object.values(form).every((v) => typeof v !== 'number' || v === 0);
  const branchIsValid = openingBudget > 0 && areaSqm > 0 && seats > 0 && dailyChecks > 0 && branchAverageCheck > 0;

  const statusStyles = {
    safe: { ring: 'ring-emerald-500/20', text: 'text-emerald-700', bg: 'bg-emerald-50', label: t('statusSafe') },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-800', bg: 'bg-amber-50', label: t('statusWarning') },
    danger: { ring: 'ring-red-500/20', text: 'text-red-700', bg: 'bg-red-50', label: t('statusDanger') },
  }[status];

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
    const html = `<!doctype html><html lang="${locale}"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width,initial-scale=1" /><title>${t('branchReportTitle')}</title><style>body{margin:0;background:#fafaf8;color:#172033;font-family:Arial,sans-serif;line-height:1.5}main{max-width:900px;margin:auto;padding:24px}.hero,.card{background:#fff;border:1px solid #e5e7eb;border-radius:20px;padding:22px;margin-bottom:16px}.hero{background:#1a1a2e;color:#fff}.grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.row{display:flex;justify-content:space-between;gap:20px;padding:10px 0;border-bottom:1px solid #edf2f7}.row:last-child{border:0}.pill{display:inline-block;padding:6px 10px;border-radius:999px;font-weight:700;font-size:12px}.muted{color:#64748b;font-size:12px}</style></head><body><main><section class="hero"><div class="muted">DK Agency · ${t(`formats.${branchFormat}`)}</div><h1>${t('branchReportTitle')}</h1><p>${t('branchReportGeneratedAt', { date: new Date().toLocaleDateString(locale) })}</p><span class="pill" style="background:#fff;color:#1a1a2e">${branchResult.paybackMonths === null ? t('notAvailable') : `${fmt1(branchResult.paybackMonths)} ${t('months')}`}</span></section><div class="grid"><section class="card"><h2>${t('capexTitle')}</h2><div class="row"><span>${t('branchStatTotalCapex')}</span><strong>${fmt0(branchResult.totalCapex)} ₼</strong></div><div class="row"><span>${t('branchStatOpeningInvestment')}</span><strong>${fmt0(branchResult.openingInvestment)} ₼</strong></div><div class="row"><span>${t('branchStatWorkingCapital')}</span><strong>${fmt0(branchResult.workingCapital)} ₼</strong></div><div class="row"><span>${t('branchStatRampLoss')}</span><strong>${fmt0(branchResult.rampUpLoss)} ₼</strong></div><div class="row"><span>${t('statFundingGap')}</span><strong>${fmt0(branchResult.fundingGap)} ₼</strong></div></section><section class="card"><h2>${t('benchmarkTitle')}</h2>${branchResult.benchmarkFlags.map((flag) => `<div class="row"><span>${t(`benchmark.${flag.key}`)}: ${t(`benchmarkState.${flag.key}.${flag.band}`)}</span><strong><span class="pill" style="${benchmarkClass(flag.band)}">${fmt1(flag.value)}${flag.key === 'payback' ? ` ${t('months')}` : '%'} </span></strong></div>`).join('')}</section></div><section class="card"><h2>${t('scenarioTitle')}</h2>${branchResult.scenarios.map((scenario) => `<div class="row"><span>${t(`scenario.${scenario.label}`)}</span><strong>${fmt0(scenario.monthlyRevenue)} ₼</strong></div>`).join('')}</section><section class="card muted">${t('branchReportMethodology')}</section></main></body></html>`;
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
      <ToolResetControls
        snapshot={() => form}
        restore={setForm}
        onClear={() => setForm((prev) => emptyState(prev))}
        onLoadExample={() => setForm(EXAMPLE_STATE)}
      />
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('branchTitle')}</h3>
          <p className="mt-1 text-sm text-slate-600">{t('branchSubtitle')}</p>
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

        {!branchIsValid && !formEmpty && (
          <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{t('branchValidationError')}</p>
        )}
      </div>

      <div>
        <h3 className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('planningTitle')}</h3>
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
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('fixedCostsTitle')}</h3>
        <div className="grid grid-cols-2 gap-4">
        {[
          { id: 'financial-rent', label: t('labelRent'), value: rent, set: setRent, step: 100 },
          { id: 'financial-salaries', label: t('labelSalaries'), value: salaries, set: setSalaries, step: 100 },
          { id: 'financial-utilities', label: t('labelUtilities'), value: utilities, set: setUtilities, step: 50 },
          { id: 'financial-other-fixed', label: t('labelOtherFixed'), value: otherFixed, set: setOtherFixed, step: 50 },
        ].map((field) => (
          <div key={field.label}>
            <label htmlFor={field.id} className="mb-1.5 block text-xs font-medium text-slate-700">{field.label}</label>
            <DecimalInput
              id={field.id}
              blankZero
              value={field.value}
              onValueChange={(v) => field.set(Math.max(0, v))}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
            />
          </div>
        ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-4 text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('variableParamsTitle')}</h3>
        <div className="grid gap-4 sm:grid-cols-4">
          {[
            { id: 'financial-variable-pct', label: t('labelVariablePct'), value: variablePct, set: setVariablePct, min: 0, max: 99 },
            { id: 'financial-average-transaction', label: t('labelAvgCheck'), value: avgCheck, set: setAvgCheck, step: 0.5 },
            { id: 'financial-monthly-sales', label: t('labelCurrentSales'), value: currentSales, set: setCurrentSales, step: 500 },
            { id: 'financial-operating-days', label: t('labelOperatingDays'), value: operatingDays, set: setOperatingDays, step: 1 },
          ].map((field) => (
            <div key={field.label}>
              <label htmlFor={field.id} className="mb-1.5 block text-xs font-medium text-slate-700">{field.label}</label>
              <DecimalInput
                id={field.id}
                blankZero
                value={field.value}
                onValueChange={(v) => field.set(Math.min(('max' in field && typeof field.max === 'number') ? field.max : Infinity, Math.max(0, v)))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-slate-100 pt-5">
        <h3 className="mb-1 text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('workingCapitalTitle')}</h3>
        <p className="mb-4 text-xs leading-5 text-slate-600">{t('workingCapitalHelp')}</p>
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

      {!isValid && !formEmpty && (
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
          <div className="flex justify-between"><span>{t('branchStatPrimeCost')}</span><span>{fmt1(branchResult.primeCostPct)}%</span></div>
          <div className="flex justify-between"><span>{t('branchStatEbitda')}</span><span>{fmt0(branchResult.ebitda)} ₼</span></div>
          <div className="flex justify-between"><span>{t('branchStatNetProfit')}</span><span>{fmt0(branchResult.netProfit)} ₼</span></div>
          <div className="flex justify-between"><span>{t('branchStatPayback')}</span><span>{branchResult.paybackMonths === null ? t('notAvailable') : `${fmt1(branchResult.paybackMonths)} ${t('months')}`}</span></div>
          <div className="flex justify-between"><span>{t('branchStatRunway')}</span><span>{fmt1(branchResult.runwayMonths)} {t('months')}</span></div>
          <div className="flex justify-between"><span>{t('branchStatCashRunway')}</span><span>{fmt1(branchResult.cashRunwayMonths)} {t('months')}</span></div>
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
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-600">{t(`benchmark.${flag.key}`)}</div>
              <div className="mt-1 text-sm font-semibold">{t(`benchmarkState.${flag.key}.${flag.band}`)}</div>
              <div className="mt-1 text-lg font-black tabular-nums">{fmt1(flag.value)}{flag.key === 'payback' ? ` ${t('months')}` : '%'}</div>
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
                <span className="font-bold uppercase tracking-wider text-slate-600">{t(`scenario.${scenario.label}`)}</span>
                <span className="font-black tabular-nums text-slate-900">{fmt0(scenario.monthlyRevenue)} ₼</span>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-[11px] text-slate-600 sm:grid-cols-4">
                <span>{t('branchStatPrimeCost')}: {fmt1(scenario.primeCostPct)}%</span>
                <span>{t('branchStatEbitda')}: {fmt0(scenario.ebitda)} ₼</span>
                <span>{t('branchStatPayback')}: {scenario.paybackMonths === null ? t('notAvailable') : `${fmt1(scenario.paybackMonths)} ${t('months')}`}</span>
                <span>{t('branchStatRentShare')}: {fmt1(scenario.rentSharePct)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statBreakEven')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-amber-800">
          {fmt0(calc.breakEvenRevenue)}<span className="ml-1 text-lg">₼</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">{t('statMonthlyMin')}</div>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t('statDailyCustomers')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-slate-900">
          {calc.dailyTransactions}<span className="ml-1 text-lg">{t(`businessUnits.${businessType}`)}</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-600">{t('statAvgCheck')} {avgCheck} ₼</div>
      </div>

      <div className={`${statusStyles.bg} rounded-xl p-4 ring-1 ${statusStyles.ring}`}>
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('statSafetyMargin')}</div>
        <div className={`mt-1 text-3xl font-black tabular-nums ${statusStyles.text}`}>{fmt1(calc.safetyMarginPct)}%</div>
        <div className={`mt-1 flex items-center gap-1 text-xs font-semibold ${statusStyles.text}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {statusStyles.label}
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-600">{t('statFixedCosts')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums text-slate-900">
          {fmt0(calc.totalFixedCosts)}<span className="ml-1 text-lg">₼</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 pt-2">
        <div className="rounded-lg bg-amber-50 p-2.5 text-center ring-1 ring-amber-200/60">
          <div className="text-lg font-black text-amber-800">{fmt0(calc.contributionPct)}%</div>
          <div className="text-[10px] font-medium text-slate-700">{t('contributionLabel')}</div>
        </div>
        <div className="rounded-lg bg-blue-50 p-2.5 text-center ring-1 ring-blue-200/60">
          <div className="text-lg font-black text-blue-700">≥20%</div>
          <div className="text-[10px] font-medium text-slate-700">{t('idealMarginLabel')}</div>
        </div>
        <div className="rounded-lg bg-emerald-50 p-2.5 text-center ring-1 ring-emerald-200/60">
          <div className="text-lg font-black text-emerald-700">{t('calcPeriodValue')}</div>
          <div className="text-[10px] font-medium text-slate-700">{t('calcPeriodLabel')}</div>
        </div>
      </div>

      <div className="rounded-xl bg-slate-950 p-4 text-white">
        <div className="text-[11px] font-bold uppercase tracking-widest text-amber-300">{t('statWorkingCapital')}</div>
        <div className="mt-1 text-3xl font-black tabular-nums">{fmt0(calc.workingCapitalNeed)} ₼</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-slate-300">
          <span>{t('statTotalFunding')}: {fmt0(calc.totalFundingNeed)} ₼</span>
          <span>{t('statFundingGap')}: {fmt0(calc.fundingGap)} ₼</span>
          <span>{t('statRunway')}: {fmt1(calc.runwayMonths)} {t('months')}</span>
          <span>{t('statPayback')}: {calc.paybackMonths === null ? t('notAvailable') : `${fmt1(calc.paybackMonths)} ${t('months')}`}</span>
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
        <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-700">{t('sensitivityTitle')}</div>
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
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">{t('educationSubtitle')}</p>
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
            <p className="mb-4 text-[12px] text-slate-600">{t('fixedVsVariableSubtitle')}</p>
            <div className="mt-auto space-y-2.5">
              <div className="rounded-xl bg-amber-50 p-3.5 ring-1 ring-amber-200/60">
                <p className="text-xs font-bold text-amber-700">{t('fixedCostsLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-amber-800">{t('fixedCostsDesc')}</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 ring-1 ring-blue-200/60">
                <p className="text-xs font-bold text-blue-700">{t('variableCostsLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-blue-800">{t('variableCostsDesc')}</p>
              </div>
              <div className="rounded-xl bg-emerald-50 p-3.5 ring-1 ring-emerald-200/60">
                <p className="text-xs font-bold text-emerald-700">{t('contributionMarginLabel')}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-emerald-800">{t('contributionMarginDesc')}</p>
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
              className="group inline-flex min-h-[24px] items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-black text-orange-700 transition-colors hover:bg-orange-50"
          >
            {t('ocaqCta')} <ArrowRight size={15} />
          </Link>
        </div>
      </div>

      {/* Blog links */}
      <div className="mt-10 rounded-2xl bg-slate-50 p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-2.5">
          <BookOpen size={18} className="text-orange-700" />
          <h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {articles.map((article) => (
            <Link
              key={article.slug}
              href={`/blog/${article.slug}`}
              className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-slate-300/60"
            >
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-700">{article.tag}</span>
              <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-orange-700">
                {article.title}
              </h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-600 transition-all group-hover:gap-2 group-hover:text-orange-700">
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
}: {
  label: string;
  value: number;
  setValue: (value: number) => void;
  /** Kept for call-site compatibility; the decimal text input has no spinner. */
  step?: number;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-slate-700">{label}</label>
      <DecimalInput
        id={id}
        blankZero
        value={value}
        onValueChange={(v) => setValue(Math.max(0, v))}
        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-amber-300 focus:ring-2 focus:ring-amber-500/20"
      />
    </div>
  );
}
