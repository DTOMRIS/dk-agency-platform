import { calculateFinancialViability, type BusinessType } from '../lib/financial/viability';
import { buildFinancialReportHtml } from '../lib/financial/report-html';

const baseInput = {
  availableBudget: 120_000,
  openingInvestment: 70_000,
  monthlySales: 45_000,
  averageTransaction: 150,
  operatingDays: 30,
  rent: 8_000,
  salaries: 12_000,
  utilities: 2_500,
  otherFixedCosts: 2_500,
  variableCostPct: 28,
  inventoryDays: 7,
  receivableDays: 10,
  payableDays: 20,
  depositsAndPrepaids: 12_000,
  rampUpMonths: 4,
  openingSalesPct: 35,
  reserveMonths: 3,
};

for (const businessType of ['cafe', 'hotel', 'service'] satisfies BusinessType[]) {
  const input = { ...baseInput, businessType };
  const result = calculateFinancialViability(input);

  if (result.workingCapitalNeed <= 0) throw new Error(`${businessType}: missing working capital`);
  if (result.totalFundingNeed !== input.openingInvestment + result.workingCapitalNeed) {
    throw new Error(`${businessType}: total funding mismatch`);
  }
  if (result.sensitivities.length !== 3) throw new Error(`${businessType}: sensitivities missing`);
  if (result.sensitivities[1].monthlyOperatingProfit <= result.monthlyOperatingProfit) {
    throw new Error(`${businessType}: ticket sensitivity did not improve profit`);
  }

  const labels = new Proxy<Record<string, string>>({}, {
    get: (_target, property) => String(property),
  });
  const html = buildFinancialReportHtml(input, result, {
    locale: 'en',
    title: 'Test report',
    generatedAt: '2026-06-13',
    businessType,
    verdict: result.verdict,
    summary: 'Summary',
    fundingTitle: 'Funding',
    operatingTitle: 'Operations',
    sensitivityTitle: 'Sensitivity',
    conditionsTitle: 'Conditions',
    methodology: 'Methodology',
    labels,
    conditions: ['Condition'],
    sensitivities: ['Scenario'],
  });

  if (!html.includes('name="viewport"') || !html.includes('inventory')) {
    throw new Error(`${businessType}: mobile HTML report incomplete`);
  }

  console.info('[financial-viability]', {
    businessType,
    workingCapital: Math.round(result.workingCapitalNeed),
    fundingGap: Math.round(result.fundingGap),
    breakEven: Math.round(result.breakEvenRevenue),
    dailyTransactions: result.dailyTransactions,
    verdict: result.verdict,
    htmlBytes: html.length,
  });
}

