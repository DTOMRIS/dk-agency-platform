import type { BranchFormat } from '@/lib/financial/azerbaijan-tax-config';

export interface BranchOpeningPreset {
  format: BranchFormat;
  label: string;
  capexMultiplier: number;
  furniturePerSeat: number;
  fitoutPerSqm: number;
  ventilationPerSqm: number;
  kitchenPercentOfCapex: number;
  barPercentOfCapex: number;
  inventoryDays: number;
  variableCostPct: number;
  avgCheck: number;
  occupancyRate: number;
  openingSalesPct: number;
  rampUpMonths: number;
  operatingDays: number;
  reserveMonths: number;
}

export const BRANCH_OPENING_PRESETS: Record<BranchFormat, BranchOpeningPreset> = {
  fastFood: {
    format: 'fastFood',
    label: 'Fast Food / QSR',
    capexMultiplier: 1.05,
    furniturePerSeat: 420,
    fitoutPerSqm: 900,
    ventilationPerSqm: 280,
    kitchenPercentOfCapex: 0.34,
    barPercentOfCapex: 0.02,
    inventoryDays: 9,
    variableCostPct: 38,
    avgCheck: 18,
    occupancyRate: 1.8,
    openingSalesPct: 45,
    rampUpMonths: 4,
    operatingDays: 30,
    reserveMonths: 3,
  },
  coffee: {
    format: 'coffee',
    label: 'Coffee Shop',
    capexMultiplier: 0.9,
    furniturePerSeat: 520,
    fitoutPerSqm: 850,
    ventilationPerSqm: 210,
    kitchenPercentOfCapex: 0.22,
    barPercentOfCapex: 0.18,
    inventoryDays: 12,
    variableCostPct: 34,
    avgCheck: 16,
    occupancyRate: 1.5,
    openingSalesPct: 40,
    rampUpMonths: 4,
    operatingDays: 30,
    reserveMonths: 3,
  },
  bar: {
    format: 'bar',
    label: 'Bar',
    capexMultiplier: 1.15,
    furniturePerSeat: 650,
    fitoutPerSqm: 980,
    ventilationPerSqm: 260,
    kitchenPercentOfCapex: 0.18,
    barPercentOfCapex: 0.28,
    inventoryDays: 14,
    variableCostPct: 31,
    avgCheck: 28,
    occupancyRate: 1.7,
    openingSalesPct: 35,
    rampUpMonths: 5,
    operatingDays: 30,
    reserveMonths: 4,
  },
  cafe: {
    format: 'cafe',
    label: 'Cafe',
    capexMultiplier: 1,
    furniturePerSeat: 480,
    fitoutPerSqm: 820,
    ventilationPerSqm: 230,
    kitchenPercentOfCapex: 0.25,
    barPercentOfCapex: 0.12,
    inventoryDays: 11,
    variableCostPct: 36,
    avgCheck: 22,
    occupancyRate: 1.6,
    openingSalesPct: 40,
    rampUpMonths: 4,
    operatingDays: 30,
    reserveMonths: 3,
  },
  lounge: {
    format: 'lounge',
    label: 'Lounge',
    capexMultiplier: 1.2,
    furniturePerSeat: 720,
    fitoutPerSqm: 1100,
    ventilationPerSqm: 300,
    kitchenPercentOfCapex: 0.16,
    barPercentOfCapex: 0.34,
    inventoryDays: 15,
    variableCostPct: 30,
    avgCheck: 34,
    occupancyRate: 1.4,
    openingSalesPct: 35,
    rampUpMonths: 5,
    operatingDays: 30,
    reserveMonths: 4,
  },
  fineDining: {
    format: 'fineDining',
    label: 'Fine Dining',
    capexMultiplier: 1.35,
    furniturePerSeat: 950,
    fitoutPerSqm: 1350,
    ventilationPerSqm: 340,
    kitchenPercentOfCapex: 0.32,
    barPercentOfCapex: 0.16,
    inventoryDays: 16,
    variableCostPct: 29,
    avgCheck: 52,
    occupancyRate: 1.3,
    openingSalesPct: 30,
    rampUpMonths: 6,
    operatingDays: 30,
    reserveMonths: 4,
  },
};
