import {
  EMPLOYER_CONTRIB_PCT_DEFAULT,
  PAYBACK_GOOD_MONTHS,
  PAYBACK_WATCH_MONTHS,
  PRIME_COST_MAX_PCT,
  PRIME_COST_WATCH_PCT,
  RENT_MAX_PCT,
  RENT_WATCH_PCT,
} from '@/lib/toolkit/benchmarks';

export type BranchFormat = 'fastFood' | 'coffee' | 'bar' | 'cafe' | 'lounge' | 'fineDining';

export interface TaxBenchmarkBand {
  min: number;
  max: number;
  labelKey: 'green' | 'amber' | 'red';
}

export const AZERBAIJAN_TAX_CONFIG = {
  simplifiedTaxRates: {
    baku: 8,
    region: 4,
  },
  generalTaxRates: {
    vat: 18,
    profit: 20,
  },
  leaseTaxRates: {
    individual: 14,
    legalEntity: 0,
  },
  // TASK-0537: same default as the staff tools (lib/toolkit/benchmarks.ts).
  socialContributionRate: EMPLOYER_CONTRIB_PCT_DEFAULT,
} as const;

export const TAX_BENCHMARK_BANDS = {
  // TASK-0537: thresholds from lib/toolkit/benchmarks.ts (P&L uses the same numbers); upper bound inclusive.
  primeCost: [
    { min: 0, max: PRIME_COST_WATCH_PCT, labelKey: 'green' },
    { min: PRIME_COST_WATCH_PCT, max: PRIME_COST_MAX_PCT, labelKey: 'amber' },
    { min: PRIME_COST_MAX_PCT, max: 100, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  rentShare: [
    { min: 0, max: RENT_WATCH_PCT, labelKey: 'green' },
    { min: RENT_WATCH_PCT, max: RENT_MAX_PCT, labelKey: 'amber' },
    { min: RENT_MAX_PCT, max: 100, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  ebitda: [
    { min: 12, max: 1000, labelKey: 'green' },
    { min: 8, max: 12, labelKey: 'amber' },
    { min: -100, max: 8, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  paybackMonths: [
    { min: 0, max: PAYBACK_GOOD_MONTHS, labelKey: 'green' },
    { min: PAYBACK_GOOD_MONTHS, max: PAYBACK_WATCH_MONTHS, labelKey: 'amber' },
    { min: PAYBACK_WATCH_MONTHS, max: 9999, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
} as const;
