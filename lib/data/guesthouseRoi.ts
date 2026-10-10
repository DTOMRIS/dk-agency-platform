/** Guesthouse ROI Calculator — SSOT */

export const GUESTHOUSE_ROI_DEFAULTS = {
  nightlyPrice: 100,
  roomCount: 4,
  occupancyPercent: 40,
  avgCommissionPercent: 15,
  otaSharePercent: 70,
  monthlyFixedCost: 1500,
  initialInvestment: 20000,
} as const;

export type GuesthouseRoiVerdict = 'healthy' | 'borderline' | 'risky' | 'unprofitable';

export interface GuesthouseRoiInput {
  nightlyPrice: number;
  roomCount: number;
  occupancyPercent: number;
  avgCommissionPercent: number;
  otaSharePercent: number;
  monthlyFixedCost: number;
  initialInvestment: number;
}

export function calcGuesthouseRoi(input: GuesthouseRoiInput) {
  const monthlyGross = input.nightlyPrice * input.roomCount * (input.occupancyPercent / 100) * 30;
  const otaRevenue = monthlyGross * (input.otaSharePercent / 100);
  const directRevenue = monthlyGross * ((100 - input.otaSharePercent) / 100);
  const otaCommission = otaRevenue * (input.avgCommissionPercent / 100);
  const monthlyNet = monthlyGross - otaCommission - input.monthlyFixedCost;
  const annualNet = monthlyNet * 12;
  const paybackMonths = monthlyNet > 0 ? input.initialInvestment / monthlyNet : Infinity;

  let verdict: GuesthouseRoiVerdict;
  if (monthlyNet <= 0) verdict = 'unprofitable';
  // TASK-0534 (calc audit): payback only — the extra «≥ 1 000 ₼ / ≥ 500 ₼ a month» condition made a small place that
  // pays back in 20 months «risky», with a text saying the money comes back too late.
  else if (paybackMonths <= 24) verdict = 'healthy';
  else if (paybackMonths <= 48) verdict = 'borderline';
  else verdict = 'risky';

  return {
    monthlyGross: Math.round(monthlyGross),
    otaRevenue: Math.round(otaRevenue),
    directRevenue: Math.round(directRevenue),
    otaCommission: Math.round(otaCommission),
    monthlyNet: Math.round(monthlyNet),
    annualNet: Math.round(annualNet),
    paybackMonths: paybackMonths === Infinity ? Infinity : Math.round(paybackMonths * 10) / 10,
    verdict,
  };
}
