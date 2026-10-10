/**
 * Complaint batch statistics — TASK-0523.
 * The AI only labels each complaint (category + severity); counts, shares, the top category,
 * urgency and the lightness score are computed here. Before, the LLM counted and rounded on its own.
 */

export const COMPLAINT_CATEGORIES = [
  'food_quality',
  'wait_speed',
  'service_staff',
  'cleanliness',
  'price_bill',
  'delivery',
  'atmosphere',
  'other',
] as const;
export type ComplaintCategoryKey = (typeof COMPLAINT_CATEGORIES)[number];

export const COMPLAINT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;
export type ComplaintSeverityKey = (typeof COMPLAINT_SEVERITIES)[number];

const SEVERITY_WEIGHT: Record<ComplaintSeverityKey, number> = { low: 25, medium: 50, high: 75, critical: 100 };

export type ComplaintLabel = { index: number; category: ComplaintCategoryKey; severity: ComplaintSeverityKey };

export type ComplaintCategoryStat = {
  key: ComplaintCategoryKey;
  count: number;
  percentage: number;
  /** complaint indexes (1-based) in this category, in input order */
  indexes: number[];
};

export type ComplaintStats = {
  total: number;
  categories: ComplaintCategoryStat[];
  topCategory: ComplaintCategoryKey | null;
  urgencyLevel: ComplaintSeverityKey;
  /** 100 = every complaint is minor, 0 = every complaint is critical */
  lightnessScore: number;
};

/**
 * @param total number of complaints sent (labels for missing indexes count as 'other' / 'medium')
 */
export function computeComplaintStats(total: number, labels: ComplaintLabel[]): ComplaintStats {
  const byIndex = new Map<number, ComplaintLabel>();
  for (const label of labels) {
    if (Number.isInteger(label.index) && label.index >= 1 && label.index <= total && !byIndex.has(label.index)) {
      byIndex.set(label.index, label);
    }
  }

  const buckets = new Map<ComplaintCategoryKey, number[]>();
  let weightSum = 0;
  let worst = 0;
  for (let i = 1; i <= total; i++) {
    const label = byIndex.get(i) ?? { index: i, category: 'other' as const, severity: 'medium' as const };
    const list = buckets.get(label.category) ?? [];
    list.push(i);
    buckets.set(label.category, list);
    weightSum += SEVERITY_WEIGHT[label.severity];
    worst = Math.max(worst, COMPLAINT_SEVERITIES.indexOf(label.severity));
  }

  const categories = [...buckets.entries()]
    .map(([key, indexes]) => ({
      key,
      count: indexes.length,
      percentage: total > 0 ? Math.round((indexes.length / total) * 100) : 0,
      indexes,
    }))
    .sort((a, b) => b.count - a.count || COMPLAINT_CATEGORIES.indexOf(a.key) - COMPLAINT_CATEGORIES.indexOf(b.key));

  return {
    total,
    categories,
    topCategory: categories[0]?.key ?? null,
    urgencyLevel: COMPLAINT_SEVERITIES[worst],
    // mean weight 25 (all minor) → 100, mean weight 100 (all critical) → 0
    lightnessScore: total > 0 ? Math.round(((100 - weightSum / total) / 75) * 100) : 100,
  };
}
