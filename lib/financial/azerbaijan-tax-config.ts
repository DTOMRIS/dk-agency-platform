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
  socialContributionRate: 24.5,
} as const;

export const TAX_BENCHMARK_BANDS = {
  primeCost: [
    { min: 0, max: 60, labelKey: 'green' },
    { min: 60, max: 65, labelKey: 'amber' },
    { min: 65, max: 100, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  rentShare: [
    { min: 0, max: 8, labelKey: 'green' },
    { min: 8, max: 10, labelKey: 'amber' },
    { min: 10, max: 100, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  ebitda: [
    { min: 12, max: 30, labelKey: 'green' },
    { min: 8, max: 12, labelKey: 'amber' },
    { min: -100, max: 8, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
  paybackMonths: [
    { min: 0, max: 36, labelKey: 'green' },
    { min: 36, max: 60, labelKey: 'amber' },
    { min: 60, max: 9999, labelKey: 'red' },
  ] satisfies TaxBenchmarkBand[],
} as const;
