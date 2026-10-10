export type RestaurantSeasonType =
  | 'city'
  | 'coast'
  | 'mountain'
  | 'cafe'
  | 'banquet';

export type MonthKey =
  | 'jan'
  | 'feb'
  | 'mar'
  | 'apr'
  | 'may'
  | 'jun'
  | 'jul'
  | 'aug'
  | 'sep'
  | 'oct'
  | 'nov'
  | 'dec';

export type SeasonInput = {
  monthlyRevenue: number;
  restaurantType: RestaurantSeasonType;
  laborPercent: number;
  foodCostPercent: number;
  /** Year whose Ramadan months are marked; defaults to the current year. */
  year?: number;
};

export type MonthProjection = {
  month: MonthKey;
  coefficient: number;
  projectedRevenue: number;
  laborBudget: number;
  inventoryBudget: number;
  isRamadanWindow: boolean;
  isDeadMonth: boolean;
};

export type SeasonAnalysis = {
  months: MonthProjection[];
  weakestMonths: MonthProjection[];
  strongestMonths: MonthProjection[];
  annualRevenue: number;
  annualLaborBudget: number;
  annualInventoryBudget: number;
  averageCoefficient: number;
};

export const MONTH_KEYS: MonthKey[] = [
  'jan',
  'feb',
  'mar',
  'apr',
  'may',
  'jun',
  'jul',
  'aug',
  'sep',
  'oct',
  'nov',
  'dec',
];

export const RESTAURANT_SEASON_TYPES: RestaurantSeasonType[] = [
  'city',
  'coast',
  'mountain',
  'cafe',
  'banquet',
];

export const SEASON_COEFFICIENTS: Record<RestaurantSeasonType, Record<MonthKey, number>> = {
  city: {
    jan: 0.75,
    feb: 0.78,
    mar: 1.2,
    apr: 1,
    may: 1.05,
    jun: 1.1,
    jul: 1.22,
    aug: 1.16,
    sep: 1.05,
    oct: 1.05,
    nov: 0.95,
    dec: 1.1,
  },
  coast: {
    jan: 0.6,
    feb: 0.55,
    mar: 0.7,
    apr: 0.85,
    may: 1.05,
    jun: 1.3,
    jul: 1.45,
    aug: 1.4,
    sep: 1.1,
    oct: 0.8,
    nov: 0.65,
    dec: 0.6,
  },
  mountain: {
    jan: 1.35,
    feb: 1.3,
    mar: 1.25,
    apr: 0.95,
    may: 0.85,
    jun: 0.8,
    jul: 0.75,
    aug: 0.75,
    sep: 0.9,
    oct: 1,
    nov: 1.15,
    dec: 1.4,
  },
  cafe: {
    jan: 0.9,
    feb: 0.92,
    mar: 1.08,
    apr: 1,
    may: 1.05,
    jun: 1.08,
    jul: 1.1,
    aug: 1.08,
    sep: 1.15,
    oct: 1.12,
    nov: 1,
    dec: 1.05,
  },
  banquet: {
    jan: 0.7,
    feb: 0.85,
    mar: 1.05,
    apr: 1,
    may: 1.32,
    jun: 1.35,
    jul: 1.1,
    aug: 1,
    sep: 1.35,
    oct: 1.38,
    nov: 1.3,
    dec: 1.1,
  },
};

// TASK-0523: Ramadan moves ~11 days earlier every year; it was hard-coded to 2026 (Feb–Mar).
// Approximate start/end (the exact day depends on the moon sighting) — only the months are used.
const RAMADAN_WINDOWS: Record<number, [string, string]> = {
  2025: ['2025-03-01', '2025-03-30'],
  2026: ['2026-02-18', '2026-03-19'],
  2027: ['2027-02-08', '2027-03-09'],
  2028: ['2028-01-28', '2028-02-26'],
  2029: ['2029-01-16', '2029-02-14'],
  2030: ['2030-01-05', '2030-02-04'],
};

export function ramadanMonths(year: number): Set<MonthKey> {
  const window = RAMADAN_WINDOWS[year];
  if (!window) return new Set();
  const startMonth = Number(window[0].slice(5, 7)) - 1;
  const endMonth = Number(window[1].slice(5, 7)) - 1;
  const months = new Set<MonthKey>();
  for (let m = startMonth; m <= endMonth; m++) months.add(MONTH_KEYS[m]);
  return months;
}

/**
 * TASK-0523: the tables above are a seasonal SHAPE; their mean was 0.92–1.13, so «average month ×
 * coefficient» summed to 11–13.5 months a year. Scaling to mean = 1 keeps the shape and makes the
 * year equal 12 × the average month the owner typed.
 */
export function normalizedCoefficients(type: RestaurantSeasonType): Record<MonthKey, number> {
  const raw = SEASON_COEFFICIENTS[type];
  const mean = MONTH_KEYS.reduce((sum, month) => sum + raw[month], 0) / MONTH_KEYS.length;
  return Object.fromEntries(MONTH_KEYS.map((month) => [month, Math.round((raw[month] / mean) * 1000) / 1000])) as Record<MonthKey, number>;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function topMonths(
  months: MonthProjection[],
  direction: 'weak' | 'strong',
): MonthProjection[] {
  return [...months]
    .sort((a, b) => direction === 'weak'
      ? a.coefficient - b.coefficient
      : b.coefficient - a.coefficient)
    .slice(0, 3);
}

export function calculateSeasonAnalysis(input: SeasonInput): SeasonAnalysis {
  const coefficients = normalizedCoefficients(input.restaurantType);
  const ramadan = ramadanMonths(input.year ?? new Date().getFullYear());
  const months = MONTH_KEYS.map((month) => {
    const coefficient = coefficients[month];
    const projectedRevenue = input.monthlyRevenue * coefficient;

    return {
      month,
      coefficient,
      projectedRevenue: roundMoney(projectedRevenue),
      laborBudget: roundMoney(projectedRevenue * (input.laborPercent / 100)),
      inventoryBudget: roundMoney(projectedRevenue * (input.foodCostPercent / 100)),
      isRamadanWindow: ramadan.has(month),
      isDeadMonth: coefficient < 0.8,
    };
  });

  const annualRevenue = months.reduce((sum, month) => sum + month.projectedRevenue, 0);
  const annualLaborBudget = months.reduce((sum, month) => sum + month.laborBudget, 0);
  const annualInventoryBudget = months.reduce((sum, month) => sum + month.inventoryBudget, 0);

  return {
    months,
    weakestMonths: topMonths(months, 'weak'),
    strongestMonths: topMonths(months, 'strong'),
    annualRevenue: roundMoney(annualRevenue),
    annualLaborBudget: roundMoney(annualLaborBudget),
    annualInventoryBudget: roundMoney(annualInventoryBudget),
    averageCoefficient: Math.round((months.reduce((sum, month) => sum + month.coefficient, 0) / months.length) * 100) / 100,
  };
}
