/** Franchise ROI Calculator — data SSOT */

export const ROI_DEFAULTS = {
  revenue: 240_000,
  marginPercent: 60,
  opex: 96_000,
  royaltyPercent: 5,
  adFundPercent: 2,
  entryFee: 30_000,
  setupCost: 100_000,
  workingCapital: 50_000,
} as const;

export type RoiVerdict = 'good' | 'mid' | 'bad' | 'negative';

export interface RoiInput {
  revenue: number;
  marginPercent: number;
  opex: number;
  royaltyPercent: number;
  adFundPercent: number;
  entryFee: number;
  setupCost: number;
  workingCapital: number;
}

export function calcRoi(input: RoiInput) {
  const investment = input.entryFee + input.setupCost + input.workingCapital;
  const grossProfit = input.revenue * input.marginPercent / 100;
  const royaltyAdFund = input.revenue * (input.royaltyPercent + input.adFundPercent) / 100;
  const netProfit = grossProfit - royaltyAdFund - input.opex;
  const roi = investment > 0 ? (netProfit / investment) * 100 : 0;
  const paybackMonths = netProfit > 0 ? investment / (netProfit / 12) : Infinity;

  let verdict: RoiVerdict;
  if (netProfit <= 0) verdict = 'negative';
  else if (roi >= 20 && paybackMonths <= 36) verdict = 'good';
  else if (roi >= 15 && paybackMonths <= 48) verdict = 'mid';
  else verdict = 'bad';

  return { investment, grossProfit, royaltyAdFund, netProfit, roi, paybackMonths, verdict };
}
