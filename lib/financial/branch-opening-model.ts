import { AZERBAIJAN_TAX_CONFIG, TAX_BENCHMARK_BANDS, type BranchFormat } from '@/lib/financial/azerbaijan-tax-config';
import { BRANCH_OPENING_PRESETS } from '@/lib/financial/branch-opening-presets';

export interface BranchOpeningInput {
  format: BranchFormat;
  areaSqm: number;
  seats: number;
  monthlyRent: number;
  dailyChecks: number;
  averageCheck: number;
  openingBudget: number;
  fitoutCostPerSqm: number;
  ventilationCostPerSqm: number;
  kitchenEquipmentCost: number;
  barEquipmentCost: number;
  furnitureCostPerSeat: number;
  inventoryDays: number;
  staffCosts: number;
  utilities: number;
  otherFixedCosts: number;
  variableCostPct: number;
  rentTaxType: 'individual' | 'legalEntity';
  rampUpMonths: number;
  openingSalesPct: number;
  reserveMonths: number;
  operatingDays: number;
  openingMarketingPct: number;
  documentsCost: number;
  unexpectedPct: number;
  startWorkingCapitalPct: number;
}

export interface BranchScenarioResult {
  label: 'base' | 'conservative' | 'optimistic';
  monthlyRevenue: number;
  grossProfit: number;
  primeCostPct: number;
  ebitda: number;
  netProfit: number;
  paybackMonths: number | null;
  breakEvenSales: number;
  rentSharePct: number;
  runwayMonths: number;
  scenarioChecks: number;
}

export interface BranchBenchmarkFlag {
  key: 'primeCost' | 'rentShare' | 'ebitda' | 'payback';
  value: number;
  band: 'green' | 'amber' | 'red';
}

export interface BranchOpeningResult {
  preset: ReturnType<typeof getPreset>;
  taxConfig: typeof AZERBAIJAN_TAX_CONFIG;
  totalCapex: number;
  openingInvestment: number;
  workingCapital: number;
  totalFundingNeed: number;
  fundingGap: number;
  monthlyRevenue: number;
  monthlyVariableCosts: number;
  monthlyFixedCosts: number;
  primeCostPct: number;
  grossProfit: number;
  ebitda: number;
  netProfit: number;
  paybackMonths: number | null;
  breakEvenSales: number;
  rentSharePct: number;
  rampUpLoss: number;
  runwayMonths: number;
  cashRunwayMonths: number;
  scenarios: BranchScenarioResult[];
  benchmarkFlags: BranchBenchmarkFlag[];
  taxBurden: number;
  leaseTax: number;
  socialContribution: number;
}

function finite(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finite(value)));
}

function getPreset(format: BranchFormat) {
  return BRANCH_OPENING_PRESETS[format];
}

function buildRampSeries(months: number, openingPct: number): number[] {
  const safeMonths = Math.max(0, Math.round(months));
  if (safeMonths === 0) return [];
  const openingRate = clamp(openingPct, 0, 100) / 100;
  return Array.from({ length: safeMonths }, (_, index) => {
    const progress = safeMonths === 1 ? 1 : index / (safeMonths - 1);
    return openingRate + (1 - openingRate) * progress;
  });
}

function calcBand(value: number, bands: typeof TAX_BENCHMARK_BANDS.primeCost): 'green' | 'amber' | 'red' {
  for (const band of bands) {
    if (value >= band.min && value < band.max) return band.labelKey;
  }
  return 'red';
}

function pickScenarioRevenue(baseRevenue: number, multiplier: number, rampBoost: number): number {
  return finite(baseRevenue * multiplier * rampBoost);
}

export function calculateBranchOpeningModel(input: BranchOpeningInput): BranchOpeningResult {
  const preset = getPreset(input.format);
  const areaSqm = Math.max(0, Math.round(finite(input.areaSqm)));
  const seats = Math.max(0, Math.round(finite(input.seats)));
  const monthlyRent = finite(input.monthlyRent);
  const dailyChecks = finite(input.dailyChecks);
  const averageCheck = finite(input.averageCheck) || preset.avgCheck;
  const operatingDays = Math.max(1, Math.round(finite(input.operatingDays) || preset.operatingDays));
  const variableCostPct = clamp(input.variableCostPct || preset.variableCostPct, 0, 99);
  const rentTaxType = input.rentTaxType === 'legalEntity' ? 'legalEntity' : 'individual';

  const fitoutCostPerSqm = finite(input.fitoutCostPerSqm) || preset.fitoutPerSqm;
  const ventilationCostPerSqm = finite(input.ventilationCostPerSqm) || preset.ventilationPerSqm;
  const furnitureCostPerSeat = finite(input.furnitureCostPerSeat) || preset.furniturePerSeat;
  const kitchenEquipmentCost = finite(input.kitchenEquipmentCost);
  const barEquipmentCost = finite(input.barEquipmentCost);
  const openingMarketingPct = clamp(input.openingMarketingPct, 0, 40);
  const documentsCost = finite(input.documentsCost);
  const unexpectedPct = clamp(input.unexpectedPct, 0, 30);
  const startWorkingCapitalPct = clamp(input.startWorkingCapitalPct, 0, 50);
  const rampUpMonths = Math.max(0, Math.round(finite(input.rampUpMonths) || preset.rampUpMonths));
  const openingSalesPct = clamp(input.openingSalesPct || preset.openingSalesPct, 0, 100);
  const reserveMonths = Math.max(0, Math.round(finite(input.reserveMonths) || preset.reserveMonths));

  const fitoutCost = areaSqm * fitoutCostPerSqm;
  const ventilationCost = areaSqm * ventilationCostPerSqm;
  const furnitureCost = seats * furnitureCostPerSeat;
  const kitchenCost = kitchenEquipmentCost || fitoutCost * preset.kitchenPercentOfCapex;
  const barCost = barEquipmentCost || fitoutCost * preset.barPercentOfCapex;
  const baseCapex = fitoutCost + ventilationCost + furnitureCost + kitchenCost + barCost + documentsCost;
  const marketingCost = baseCapex * (openingMarketingPct / 100);
  const unexpectedCost = baseCapex * (unexpectedPct / 100);
  const totalCapex = round(baseCapex + marketingCost + unexpectedCost);
  const openingInvestment = round(totalCapex * preset.capexMultiplier);

  const monthlyRevenue = round(dailyChecks * averageCheck * operatingDays);
  const monthlyVariableCosts = round(monthlyRevenue * (variableCostPct / 100));
  const socialContribution = round(finite(input.staffCosts) * (AZERBAIJAN_TAX_CONFIG.socialContributionRate / 100));
  const leaseTax = round(monthlyRent * (rentTaxType === 'legalEntity' ? AZERBAIJAN_TAX_CONFIG.leaseTaxRates.legalEntity : AZERBAIJAN_TAX_CONFIG.leaseTaxRates.individual) / 100);
  const monthlyFixedCosts = round(monthlyRent + leaseTax + finite(input.staffCosts) + socialContribution + finite(input.utilities) + finite(input.otherFixedCosts));
  const grossProfit = round(monthlyRevenue - monthlyVariableCosts);
  const primeCostPct = monthlyRevenue > 0 ? round(((monthlyVariableCosts + finite(input.staffCosts)) / monthlyRevenue) * 100) : 0;
  const ebitda = round(monthlyRevenue - monthlyVariableCosts - monthlyFixedCosts);
  const profitTax = round(Math.max(0, ebitda) * (AZERBAIJAN_TAX_CONFIG.generalTaxRates.profit / 100));
  const netProfit = round(ebitda - profitTax);
  const ebitdaMarginPct = monthlyRevenue > 0 ? round((ebitda / monthlyRevenue) * 100) : 0;
  const breakEvenSales = round(monthlyFixedCosts / Math.max(0.01, 1 - (variableCostPct / 100)));
  const breakEvenRevenue = breakEvenSales;
  const rentSharePct = monthlyRevenue > 0 ? round((monthlyRent / monthlyRevenue) * 100) : 0;

  const rampSeries = buildRampSeries(rampUpMonths, openingSalesPct);
  const rampUpLoss = round(rampSeries.reduce((sum, rate) => {
    const rampRevenue = monthlyRevenue * rate;
    const rampEbitda = rampRevenue - (rampRevenue * (variableCostPct / 100)) - monthlyFixedCosts;
    return sum + Math.max(0, -rampEbitda);
  }, 0));

  const workingCapital = round(
    (monthlyVariableCosts / 30) * clamp(input.inventoryDays || preset.inventoryDays, 0, 180)
    + monthlyFixedCosts * reserveMonths
    + rampUpLoss
    + totalCapex * (startWorkingCapitalPct / 100),
  );
  const totalFundingNeed = round(openingInvestment + workingCapital);
  const fundingGap = round(Math.max(0, totalFundingNeed - finite(input.openingBudget)));
  const cashRunwayMonths = monthlyFixedCosts > 0 ? round(Math.max(0, finite(input.openingBudget) - openingInvestment) / monthlyFixedCosts) : 0;
  const runwayMonths = monthlyFixedCosts > 0 ? round(Math.max(0, finite(input.openingBudget) - openingInvestment + workingCapital) / monthlyFixedCosts) : 0;
  const paybackMonths = netProfit > 0 ? round(totalFundingNeed / netProfit) : null;

  const scenarios: BranchScenarioResult[] = [
    { label: 'base', monthlyRevenue, grossProfit, primeCostPct, ebitda, netProfit, paybackMonths, breakEvenSales, rentSharePct, runwayMonths, scenarioChecks: 1 },
    (() => {
      const revenue = pickScenarioRevenue(monthlyRevenue, 0.85, 0.9);
      const variable = revenue * (variableCostPct / 100);
      const gross = revenue - variable;
      const ebitdaValue = gross - monthlyFixedCosts;
      return {
        label: 'conservative',
        monthlyRevenue: round(revenue),
        grossProfit: round(gross),
        primeCostPct: revenue > 0 ? round(((variable + finite(input.staffCosts)) / revenue) * 100) : 0,
        ebitda: round(ebitdaValue),
        netProfit: round(ebitdaValue - round(Math.max(0, ebitdaValue) * (AZERBAIJAN_TAX_CONFIG.generalTaxRates.profit / 100))),
        paybackMonths: ebitdaValue > 0 ? round(totalFundingNeed / round(ebitdaValue - round(Math.max(0, ebitdaValue) * (AZERBAIJAN_TAX_CONFIG.generalTaxRates.profit / 100)))) : null,
        breakEvenSales: breakEvenRevenue,
        rentSharePct: revenue > 0 ? round((monthlyRent / revenue) * 100) : 0,
        runwayMonths,
        scenarioChecks: 2,
      };
    })(),
    (() => {
      const revenue = pickScenarioRevenue(monthlyRevenue, 1.15, 1.05);
      const variable = revenue * (variableCostPct / 100);
      const gross = revenue - variable;
      const ebitdaValue = gross - monthlyFixedCosts;
      return {
        label: 'optimistic',
        monthlyRevenue: round(revenue),
        grossProfit: round(gross),
        primeCostPct: revenue > 0 ? round(((variable + finite(input.staffCosts)) / revenue) * 100) : 0,
        ebitda: round(ebitdaValue),
        netProfit: round(ebitdaValue - round(Math.max(0, ebitdaValue) * (AZERBAIJAN_TAX_CONFIG.generalTaxRates.profit / 100))),
        paybackMonths: ebitdaValue > 0 ? round(totalFundingNeed / round(ebitdaValue - round(Math.max(0, ebitdaValue) * (AZERBAIJAN_TAX_CONFIG.generalTaxRates.profit / 100)))) : null,
        breakEvenSales: breakEvenRevenue,
        rentSharePct: revenue > 0 ? round((monthlyRent / revenue) * 100) : 0,
        runwayMonths,
        scenarioChecks: 3,
      };
    })(),
  ];

  const benchmarkFlags: BranchBenchmarkFlag[] = [
    {
      key: 'primeCost',
      value: primeCostPct,
      band: calcBand(primeCostPct, TAX_BENCHMARK_BANDS.primeCost),
    },
    {
      key: 'rentShare',
      value: rentSharePct,
      band: calcBand(rentSharePct, TAX_BENCHMARK_BANDS.rentShare),
    },
    {
      key: 'ebitda',
      value: ebitdaMarginPct,
      band: calcBand(ebitdaMarginPct, TAX_BENCHMARK_BANDS.ebitda),
    },
    {
      key: 'payback',
      value: paybackMonths ?? 9999,
      band: calcBand(paybackMonths ?? 9999, TAX_BENCHMARK_BANDS.paybackMonths),
    },
  ];

  const taxBurden = round(profitTax + leaseTax + socialContribution);

  return {
    preset,
    taxConfig: AZERBAIJAN_TAX_CONFIG,
    totalCapex,
    openingInvestment,
    workingCapital,
    totalFundingNeed,
    fundingGap,
    monthlyRevenue,
    monthlyVariableCosts,
    monthlyFixedCosts,
    primeCostPct,
    grossProfit,
    ebitda,
    netProfit,
    paybackMonths,
    breakEvenSales,
    rentSharePct,
    rampUpLoss,
    runwayMonths,
    cashRunwayMonths,
    scenarios,
    benchmarkFlags,
    taxBurden,
    leaseTax,
    socialContribution,
  };
}
