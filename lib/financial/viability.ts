export type BusinessType = 'cafe' | 'restaurant' | 'hotel' | 'retail' | 'service';

export type FinancialVerdict = 'go' | 'conditional' | 'no-go';

export interface FinancialViabilityInput {
  businessType: BusinessType;
  availableBudget: number;
  openingInvestment: number;
  monthlySales: number;
  averageTransaction: number;
  operatingDays: number;
  rent: number;
  salaries: number;
  utilities: number;
  otherFixedCosts: number;
  variableCostPct: number;
  inventoryDays: number;
  receivableDays: number;
  payableDays: number;
  depositsAndPrepaids: number;
  rampUpMonths: number;
  openingSalesPct: number;
  reserveMonths: number;
}

export interface SensitivityResult {
  key: 'rent' | 'ticket' | 'variable-cost';
  changePct: number;
  breakEvenRevenue: number;
  dailyTransactions: number;
  monthlyOperatingProfit: number;
}

export interface FinancialViabilityResult {
  totalFixedCosts: number;
  monthlyVariableCosts: number;
  contributionPct: number;
  breakEvenRevenue: number;
  dailyTransactions: number;
  safetyMarginPct: number;
  monthlyOperatingProfit: number;
  inventoryInvestment: number;
  receivablesFunding: number;
  supplierFinancing: number;
  rampUpLoss: number;
  operatingReserve: number;
  workingCapitalNeed: number;
  totalFundingNeed: number;
  fundingGap: number;
  cashAfterOpening: number;
  runwayMonths: number;
  paybackMonths: number | null;
  verdict: FinancialVerdict;
  conditionKeys: string[];
  sensitivities: SensitivityResult[];
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, finiteNonNegative(value)));
}

function calculateRampUpLoss(
  input: FinancialViabilityInput,
  contributionRate: number,
  totalFixedCosts: number,
): number {
  const months = Math.round(clamp(input.rampUpMonths, 0, 24));
  if (months === 0) return 0;

  const openingRate = clamp(input.openingSalesPct, 0, 100) / 100;
  let accumulatedLoss = 0;

  for (let month = 1; month <= months; month += 1) {
    const progress = months === 1 ? 1 : (month - 1) / (months - 1);
    const salesRate = openingRate + (1 - openingRate) * progress;
    const rampSales = finiteNonNegative(input.monthlySales) * salesRate;
    const operatingCashFlow = rampSales * contributionRate - totalFixedCosts;
    accumulatedLoss += Math.max(0, -operatingCashFlow);
  }

  return accumulatedLoss;
}

function scenario(
  input: FinancialViabilityInput,
  overrides: Partial<FinancialViabilityInput>,
  key: SensitivityResult['key'],
  changePct: number,
): SensitivityResult {
  const next = { ...input, ...overrides };
  const totalFixedCosts =
    finiteNonNegative(next.rent) +
    finiteNonNegative(next.salaries) +
    finiteNonNegative(next.utilities) +
    finiteNonNegative(next.otherFixedCosts);
  const contributionRate = (100 - clamp(next.variableCostPct, 0, 99)) / 100;
  const breakEvenRevenue = contributionRate > 0 ? totalFixedCosts / contributionRate : 0;
  const operatingDays = Math.max(1, Math.round(finiteNonNegative(next.operatingDays)));
  const averageTransaction = finiteNonNegative(next.averageTransaction);
  const dailyTransactions =
    averageTransaction > 0 ? Math.ceil(breakEvenRevenue / operatingDays / averageTransaction) : 0;
  const monthlyOperatingProfit =
    finiteNonNegative(next.monthlySales) * contributionRate - totalFixedCosts;

  return {
    key,
    changePct,
    breakEvenRevenue,
    dailyTransactions,
    monthlyOperatingProfit,
  };
}

export function calculateFinancialViability(
  input: FinancialViabilityInput,
): FinancialViabilityResult {
  const monthlySales = finiteNonNegative(input.monthlySales);
  const availableBudget = finiteNonNegative(input.availableBudget);
  const openingInvestment = finiteNonNegative(input.openingInvestment);
  const totalFixedCosts =
    finiteNonNegative(input.rent) +
    finiteNonNegative(input.salaries) +
    finiteNonNegative(input.utilities) +
    finiteNonNegative(input.otherFixedCosts);
  const variableCostPct = clamp(input.variableCostPct, 0, 99);
  const contributionPct = 100 - variableCostPct;
  const contributionRate = contributionPct / 100;
  const monthlyVariableCosts = monthlySales * (variableCostPct / 100);
  const breakEvenRevenue = contributionRate > 0 ? totalFixedCosts / contributionRate : 0;
  const operatingDays = Math.max(1, Math.round(finiteNonNegative(input.operatingDays)));
  const averageTransaction = finiteNonNegative(input.averageTransaction);
  const dailyTransactions =
    averageTransaction > 0 ? Math.ceil(breakEvenRevenue / operatingDays / averageTransaction) : 0;
  const safetyMarginPct =
    monthlySales > 0 ? ((monthlySales - breakEvenRevenue) / monthlySales) * 100 : -100;
  const monthlyOperatingProfit = monthlySales * contributionRate - totalFixedCosts;

  const inventoryInvestment =
    (monthlyVariableCosts / 30) * clamp(input.inventoryDays, 0, 180);
  const receivablesFunding = (monthlySales / 30) * clamp(input.receivableDays, 0, 180);
  const supplierFinancing =
    (monthlyVariableCosts / 30) * clamp(input.payableDays, 0, 180);
  const rampUpLoss = calculateRampUpLoss(input, contributionRate, totalFixedCosts);
  const operatingReserve = totalFixedCosts * clamp(input.reserveMonths, 0, 12);
  const workingCapitalNeed = Math.max(
    0,
    inventoryInvestment +
      receivablesFunding +
      finiteNonNegative(input.depositsAndPrepaids) +
      rampUpLoss +
      operatingReserve -
      supplierFinancing,
  );
  const totalFundingNeed = openingInvestment + workingCapitalNeed;
  const fundingGap = Math.max(0, totalFundingNeed - availableBudget);
  const cashAfterOpening = Math.max(0, availableBudget - openingInvestment);
  const runwayMonths = totalFixedCosts > 0 ? cashAfterOpening / totalFixedCosts : 0;
  const paybackMonths = monthlyOperatingProfit > 0 ? totalFundingNeed / monthlyOperatingProfit : null;

  const conditionKeys: string[] = [];
  if (fundingGap > 0) conditionKeys.push('closeFundingGap');
  if (safetyMarginPct < 20) conditionKeys.push('raiseSafetyMargin');
  if (input.reserveMonths < 2) conditionKeys.push('buildReserve');
  if (monthlyOperatingProfit <= 0) conditionKeys.push('fixUnitEconomics');
  if (input.receivableDays > input.payableDays) conditionKeys.push('shortenCashCycle');

  let verdict: FinancialVerdict = 'go';
  if (
    contributionPct <= 0 ||
    monthlyOperatingProfit <= 0 ||
    fundingGap > totalFundingNeed * 0.2
  ) {
    verdict = 'no-go';
  } else if (conditionKeys.length > 0) {
    verdict = 'conditional';
  }

  const sensitivities: SensitivityResult[] = [
    scenario(input, { rent: finiteNonNegative(input.rent) * 0.9 }, 'rent', -10),
    scenario(
      input,
      {
        averageTransaction: finiteNonNegative(input.averageTransaction) * 1.1,
        monthlySales: finiteNonNegative(input.monthlySales) * 1.1,
      },
      'ticket',
      10,
    ),
    scenario(
      input,
      { variableCostPct: Math.max(0, variableCostPct - 3) },
      'variable-cost',
      -3,
    ),
  ];

  return {
    totalFixedCosts,
    monthlyVariableCosts,
    contributionPct,
    breakEvenRevenue,
    dailyTransactions,
    safetyMarginPct,
    monthlyOperatingProfit,
    inventoryInvestment,
    receivablesFunding,
    supplierFinancing,
    rampUpLoss,
    operatingReserve,
    workingCapitalNeed,
    totalFundingNeed,
    fundingGap,
    cashAfterOpening,
    runwayMonths,
    paybackMonths,
    verdict,
    conditionKeys,
    sensitivities,
  };
}
