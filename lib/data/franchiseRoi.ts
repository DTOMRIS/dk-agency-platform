/** Franchise ROI Calculator — data SSOT */

export const ROI_DEFAULTS = {
  revenue: 240_000,
  marginPercent: 60,
  opex: 96_000,
  royaltyPercent: 5,
  adFundPercent: 2,
  investment: 180_000,
} as const;

export type RoiVerdict = 'good' | 'mid' | 'bad' | 'negative';

export function calcRoi(input: {
  revenue: number;
  marginPercent: number;
  opex: number;
  royaltyPercent: number;
  adFundPercent: number;
  investment: number;
}) {
  const grossProfit = input.revenue * input.marginPercent / 100;
  const royaltyAdFund = input.revenue * (input.royaltyPercent + input.adFundPercent) / 100;
  const netProfit = grossProfit - royaltyAdFund - input.opex;
  const roi = input.investment > 0 ? (netProfit / input.investment) * 100 : 0;
  const paybackMonths = netProfit > 0 ? input.investment / (netProfit / 12) : Infinity;

  let verdict: RoiVerdict;
  if (netProfit <= 0) verdict = 'negative';
  else if (roi >= 20 && paybackMonths <= 36) verdict = 'good';
  else if (roi >= 15) verdict = 'mid';
  else verdict = 'bad';

  return { grossProfit, royaltyAdFund, netProfit, roi, paybackMonths, verdict };
}
