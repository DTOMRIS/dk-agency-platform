/** Franchise Readiness Test — 12 question SSOT (scores are data, not UI labels — L-013) */

export type ReadinessOption = { score: 25 | 50 | 75 | 100 };
export type ReadinessQuestion = { cat: string; options: ReadinessOption[] };

// i18n keys: franchiseReadiness.questions.{index}.{q,cat,options.{index}}
export const QUESTION_COUNT = 12;

export const QUESTION_SCORES = [25, 50, 75, 100] as const;

export type ReadinessVerdict = 'not_ready' | 'developing' | 'almost' | 'ready';

export function getVerdict(avgScore: number): ReadinessVerdict {
  if (avgScore < 50) return 'not_ready';
  if (avgScore < 70) return 'developing';
  if (avgScore < 85) return 'almost';
  return 'ready';
}

export function getWeakestIndex(scores: number[]): number {
  let minVal = 101;
  let minIdx = 0;
  scores.forEach((v, i) => { if (v < minVal) { minVal = v; minIdx = i; } });
  return minIdx;
}
