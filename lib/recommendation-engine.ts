export type MetricKey = 'food_cost' | 'labor_cost' | 'net_profit' | 'rent_ratio';
export type Severity = 'OK' | 'WARNING' | 'CRITICAL';

interface ThresholdRange {
  min: number;
  max: number;
  severity: Severity;
  benchmarkKey: string;
}

const metricThresholds: Record<MetricKey, ThresholdRange[]> = {
  food_cost: [
    { min: 0, max: 32, severity: 'OK', benchmarkKey: 'weekly_actions.benchmark.food_cost_ok' },
    { min: 33, max: 38, severity: 'WARNING', benchmarkKey: 'weekly_actions.benchmark.food_cost_warning' },
    { min: 39, max: Infinity, severity: 'CRITICAL', benchmarkKey: 'weekly_actions.benchmark.food_cost_critical' },
  ],
  labor_cost: [
    { min: 0, max: 25, severity: 'OK', benchmarkKey: 'weekly_actions.benchmark.labor_cost_ok' },
    { min: 26, max: 30, severity: 'WARNING', benchmarkKey: 'weekly_actions.benchmark.labor_cost_warning' },
    { min: 31, max: Infinity, severity: 'CRITICAL', benchmarkKey: 'weekly_actions.benchmark.labor_cost_critical' },
  ],
  net_profit: [
    { min: 12, max: Infinity, severity: 'OK', benchmarkKey: 'weekly_actions.benchmark.net_profit_ok' },
    { min: 8, max: 11, severity: 'WARNING', benchmarkKey: 'weekly_actions.benchmark.net_profit_warning' },
    { min: -Infinity, max: 7, severity: 'CRITICAL', benchmarkKey: 'weekly_actions.benchmark.net_profit_critical' },
  ],
  rent_ratio: [
    { min: 0, max: 8, severity: 'OK', benchmarkKey: 'weekly_actions.benchmark.rent_ok' },
    { min: 9, max: 12, severity: 'WARNING', benchmarkKey: 'weekly_actions.benchmark.rent_warning' },
    { min: 13, max: Infinity, severity: 'CRITICAL', benchmarkKey: 'weekly_actions.benchmark.rent_critical' },
  ],
};

export function getSeverity(metric: MetricKey, value: number): Severity {
  const ranges = metricThresholds[metric];
  for (const r of ranges) {
    if (value >= r.min && value <= r.max) return r.severity;
  }
  return 'CRITICAL';
}

export function getBenchmarkKey(metric: MetricKey, value: number): string {
  const ranges = metricThresholds[metric];
  for (const r of ranges) {
    if (value >= r.min && value <= r.max) return r.benchmarkKey;
  }
  return ranges[ranges.length - 1].benchmarkKey;
}

export interface Action {
  id: string;
  translationKey: string;
  durationMinutes: number;
  toolSlug: string;
  comingSoon: boolean;
  priority: number;
  triggerMetric: MetricKey;
  triggerSeverity: Severity[];
}

const actionCatalog: Action[] = [
  {
    id: 'recipe_audit',
    translationKey: 'weekly_actions.actions.recipe_audit',
    durationMinutes: 5,
    toolSlug: 'food-cost',
    comingSoon: false,
    priority: 1,
    triggerMetric: 'food_cost',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
  {
    id: 'portion_check',
    translationKey: 'weekly_actions.actions.portion_check',
    durationMinutes: 15,
    toolSlug: 'food-cost',
    comingSoon: false,
    priority: 2,
    triggerMetric: 'food_cost',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
  {
    id: 'supplier_compare',
    translationKey: 'weekly_actions.actions.supplier_compare',
    durationMinutes: 15,
    toolSlug: 'basabas',
    comingSoon: false,
    priority: 3,
    triggerMetric: 'food_cost',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
  {
    id: 'waste_log',
    translationKey: 'weekly_actions.actions.waste_log',
    durationMinutes: 10,
    toolSlug: 'food-cost',
    comingSoon: false,
    priority: 2,
    triggerMetric: 'food_cost',
    triggerSeverity: ['CRITICAL'],
  },
  {
    id: 'menu_engineering',
    translationKey: 'weekly_actions.actions.menu_engineering',
    durationMinutes: 30,
    toolSlug: 'menu-matrix',
    comingSoon: false,
    priority: 1,
    triggerMetric: 'net_profit',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
  {
    id: 'price_review',
    translationKey: 'weekly_actions.actions.price_review',
    durationMinutes: 20,
    toolSlug: 'basabas',
    comingSoon: false,
    priority: 2,
    triggerMetric: 'net_profit',
    triggerSeverity: ['CRITICAL'],
  },
  {
    id: 'shift_optimization',
    translationKey: 'weekly_actions.actions.shift_optimization',
    durationMinutes: 20,
    toolSlug: 'staff-retention',
    comingSoon: false,
    priority: 1,
    triggerMetric: 'labor_cost',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
  {
    id: 'revenue_mix',
    translationKey: 'weekly_actions.actions.revenue_mix',
    durationMinutes: 25,
    toolSlug: 'menu-matrix',
    comingSoon: false,
    priority: 3,
    triggerMetric: 'net_profit',
    triggerSeverity: ['WARNING', 'CRITICAL'],
  },
];

export function getRecommendedActions(
  metrics: Record<MetricKey, number>,
): Action[] {
  const triggered: Action[] = [];

  for (const action of actionCatalog) {
    const metricValue = metrics[action.triggerMetric];
    const severity = getSeverity(action.triggerMetric, metricValue);
    if (action.triggerSeverity.includes(severity)) {
      triggered.push(action);
    }
  }

  // Sort: CRITICAL triggers first, then by priority
  triggered.sort((a, b) => {
    const sevA = getSeverity(a.triggerMetric, metrics[a.triggerMetric]);
    const sevB = getSeverity(b.triggerMetric, metrics[b.triggerMetric]);
    const sevOrder = { CRITICAL: 0, WARNING: 1, OK: 2 };
    const sevDiff = sevOrder[sevA] - sevOrder[sevB];
    if (sevDiff !== 0) return sevDiff;
    return a.priority - b.priority;
  });

  return triggered.slice(0, 3);
}
