/**
 * @file lokasyon-analiz.ts
 * @purpose Franchise-style location analysis KB, scoring, and breakeven engine.
 * @task TASK-0151
 * @lastModified 2026-05-18
 */

export type LocationMode = 'new' | 'existing';
export type LocationType = 'street' | 'mall' | 'plaza';
export type AnswerValue = 0 | 1 | 2;

export type LocationCriterionId =
  | 'corner_visibility'
  | 'pedestrian_traffic'
  | 'car_traffic'
  | 'parking_access'
  | 'income_density'
  | 'education_nearby'
  | 'office_residential_mix'
  | 'ready_parking'
  | 'day_evening_energy'
  | 'wide_entry'
  | 'busy_sidewalk_side'
  | 'low_sun_side'
  | 'outdoor_seating'
  | 'mall_escalator_position'
  | 'mall_dedicated_seating';

export type RiskFlagId =
  | 'oversized_area'
  | 'above_market_rent'
  | 'shared_usage'
  | 'seasonal_dependency'
  | 'limited_hours';

export type BreakevenInput = {
  rent: number;
  labor: number;
  gas: number;
  electricity: number;
  water: number;
  telecom: number;
  insurance: number;
  maintenance: number;
  other: number;
  foodCostPercent: number;
  royaltyPercent: number;
  marketingPercent: number;
};

export type LocationProfile = {
  mode: LocationMode;
  locationType: LocationType;
  answers: Record<LocationCriterionId, AnswerValue>;
  riskFlags: RiskFlagId[];
  breakeven: BreakevenInput;
};

export type LocationCriterion = {
  id: LocationCriterionId;
  weight: number;
  appliesTo: LocationType[];
  fallback: string;
};

export type BreakevenResult = {
  fixedCosts: number;
  grossMarginPercent: number;
  monthlyBreakevenSales: number | null;
  sustainable: boolean;
};

export type LocationAnalysis = {
  mode: LocationMode;
  locationType: LocationType;
  score: number;
  level: 'strong' | 'conditional' | 'risky';
  scoredCriteria: Array<{ criterionId: LocationCriterionId; value: AnswerValue; weightedScore: number; maxScore: number }>;
  strengths: LocationCriterionId[];
  weaknesses: LocationCriterionId[];
  applicableRiskFlags: RiskFlagId[];
  breakeven: BreakevenResult;
  fallbackRecommendations: string[];
};

export const LOCATION_TYPES: LocationType[] = ['street', 'mall', 'plaza'];
export const LOCATION_MODES: LocationMode[] = ['new', 'existing'];

export const CRITERIA: LocationCriterion[] = [
  { id: 'corner_visibility', weight: 10, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Improve sign visibility from the main walking direction before investing in ads.' },
  { id: 'pedestrian_traffic', weight: 11, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Count passing pedestrians for three dayparts before signing a lease.' },
  { id: 'car_traffic', weight: 6, appliesTo: ['street', 'plaza'], fallback: 'Use facade messaging readable from a slow car lane, not only from the door.' },
  { id: 'parking_access', weight: 8, appliesTo: ['street', 'plaza'], fallback: 'Negotiate nearby short-stop parking or clearly mark the closest parking route.' },
  { id: 'income_density', weight: 9, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Match entry price and portion value to the real purchasing power around the site.' },
  { id: 'education_nearby', weight: 5, appliesTo: ['street', 'plaza'], fallback: 'If students are nearby, test a fast lunch or snack set with clear price.' },
  { id: 'office_residential_mix', weight: 9, appliesTo: ['street', 'plaza'], fallback: 'Build separate lunch and evening offers so the location works beyond one daypart.' },
  { id: 'ready_parking', weight: 7, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Make parking or arrival instructions visible in Google Business and Instagram highlights.' },
  { id: 'day_evening_energy', weight: 10, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Observe the point at lunch, evening, and weekend before judging its real demand.' },
  { id: 'wide_entry', weight: 6, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Keep the entrance open, readable, and low-friction; do not hide the first decision point.' },
  { id: 'busy_sidewalk_side', weight: 7, appliesTo: ['street', 'plaza'], fallback: 'If you are on the weaker sidewalk side, compensate with directional signs and delivery focus.' },
  { id: 'low_sun_side', weight: 4, appliesTo: ['street', 'plaza'], fallback: 'Add shade, cooling, or evening positioning if sun exposure weakens walk-in comfort.' },
  { id: 'outdoor_seating', weight: 6, appliesTo: ['street', 'mall', 'plaza'], fallback: 'Test even a small outdoor or visible waiting area if rules and space allow.' },
  { id: 'mall_escalator_position', weight: 10, appliesTo: ['mall'], fallback: 'Prefer the densest escalator corridor; weak mall corners need much stronger rent logic.' },
  { id: 'mall_dedicated_seating', weight: 8, appliesTo: ['mall'], fallback: 'If seating is shared, strengthen takeaway packaging and speed before expanding menu.' },
];

export const RISK_FLAGS: RiskFlagId[] = [
  'oversized_area',
  'above_market_rent',
  'shared_usage',
  'seasonal_dependency',
  'limited_hours',
];

export const DEFAULT_ANSWERS: Record<LocationCriterionId, AnswerValue> = Object.fromEntries(
  CRITERIA.map((criterion) => [criterion.id, 1]),
) as Record<LocationCriterionId, AnswerValue>;

export const DEFAULT_BREAKEVEN: BreakevenInput = {
  rent: 3500,
  labor: 6500,
  gas: 500,
  electricity: 900,
  water: 250,
  telecom: 120,
  insurance: 180,
  maintenance: 350,
  other: 700,
  foodCostPercent: 32,
  royaltyPercent: 0,
  marketingPercent: 3,
};

function toNumber(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function clampPercent(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function applicableCriteria(locationType: LocationType): LocationCriterion[] {
  return CRITERIA.filter((criterion) => criterion.appliesTo.includes(locationType));
}

function calculateBreakeven(input: BreakevenInput): BreakevenResult {
  const fixedCosts = [
    input.rent,
    input.labor,
    input.gas,
    input.electricity,
    input.water,
    input.telecom,
    input.insurance,
    input.maintenance,
    input.other,
  ].reduce((sum, item) => sum + toNumber(item), 0);
  const grossMarginPercent = 100 - (
    clampPercent(input.foodCostPercent) +
    clampPercent(input.royaltyPercent) +
    clampPercent(input.marketingPercent)
  );
  const sustainable = grossMarginPercent > 10;
  return {
    fixedCosts,
    grossMarginPercent,
    monthlyBreakevenSales: sustainable ? Math.round(fixedCosts / (grossMarginPercent / 100)) : null,
    sustainable,
  };
}

function levelForScore(score: number): LocationAnalysis['level'] {
  if (score >= 75) return 'strong';
  if (score >= 50) return 'conditional';
  return 'risky';
}

function buildFallbackRecommendations(
  weaknesses: LocationCriterionId[],
  riskFlags: RiskFlagId[],
  breakeven: BreakevenResult,
): string[] {
  const items = weaknesses
    .slice(0, 3)
    .map((criterionId) => CRITERIA.find((criterion) => criterion.id === criterionId)?.fallback)
    .filter((item): item is string => Boolean(item));

  if (!breakeven.sustainable) {
    items.unshift('Rework rent, food cost, royalty, and marketing assumptions before committing to this point.');
  }
  if (riskFlags.includes('above_market_rent')) {
    items.push('Treat rent as a go/no-go gate: the point must pass breakeven before design spending.');
  }
  if (riskFlags.includes('seasonal_dependency')) {
    items.push('Model low-season sales separately; a seasonal peak cannot justify a full-year fixed cost alone.');
  }

  return Array.from(new Set(items)).slice(0, 3);
}

export function calculateLocationAnalysis(profile: LocationProfile): LocationAnalysis {
  const criteria = applicableCriteria(profile.locationType);
  const scoredCriteria = criteria.map((criterion) => {
    const value = profile.answers[criterion.id] ?? 0;
    return {
      criterionId: criterion.id,
      value,
      weightedScore: value * criterion.weight,
      maxScore: 2 * criterion.weight,
    };
  });
  const total = scoredCriteria.reduce((sum, item) => sum + item.weightedScore, 0);
  const max = scoredCriteria.reduce((sum, item) => sum + item.maxScore, 0);
  const score = max > 0 ? Math.round((total / max) * 100) : 0;
  const strengths = scoredCriteria
    .filter((item) => item.value === 2)
    .map((item) => item.criterionId)
    .slice(0, 5);
  const weaknesses = scoredCriteria
    .filter((item) => item.value === 0)
    .sort((a, b) => b.maxScore - a.maxScore)
    .map((item) => item.criterionId);
  const breakeven = calculateBreakeven(profile.breakeven);

  return {
    mode: profile.mode,
    locationType: profile.locationType,
    score,
    level: levelForScore(score),
    scoredCriteria,
    strengths,
    weaknesses,
    applicableRiskFlags: profile.mode === 'existing' ? profile.riskFlags : [],
    breakeven,
    fallbackRecommendations: buildFallbackRecommendations(weaknesses, profile.riskFlags, breakeven),
  };
}

export function isLocationMode(value: string): value is LocationMode {
  return LOCATION_MODES.includes(value as LocationMode);
}

export function isLocationType(value: string): value is LocationType {
  return LOCATION_TYPES.includes(value as LocationType);
}

export function isRiskFlag(value: string): value is RiskFlagId {
  return RISK_FLAGS.includes(value as RiskFlagId);
}
