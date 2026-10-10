/**
 * KST (Keyfiyyət · Servis · Təmizlik) self-check score — TASK-0523.
 * Before, the LLM was asked to add up 30 answers and pick the weakest ones; numbers are now code.
 * Each answer is 1–5; a group score = Σ / (n × 5) × 100; overall = mean of the three groups.
 */

export type KstCategory = 'quality' | 'service' | 'cleanliness';

export const KST_CATEGORIES: readonly KstCategory[] = ['quality', 'service', 'cleanliness'];
export const KST_PREFIX: Record<KstCategory, string> = { quality: 'K', service: 'S', cleanliness: 'T' };

/** Our suggested target for every group — not a sector statistic (there is no Baku source for one). */
export const KST_TARGET_PCT = 80;

export type KstAnswers = Record<KstCategory, Record<string, number>>;

export type KstWeakItem = { category: KstCategory; questionId: string; score: number };

export type KstScoreResult = {
  scores: Record<KstCategory | 'overall', number>;
  /** Lowest answers first (score asc, then K → S → T, then question number). */
  weakest: KstWeakItem[];
};

function groupPct(answers: Record<string, number>): number {
  const values = Object.values(answers).filter((v) => Number.isFinite(v));
  if (!values.length) return 0;
  const sum = values.reduce((acc, v) => acc + v, 0);
  return Math.round((sum / (values.length * 5)) * 100);
}

export function computeKstScores(answers: KstAnswers, weakestCount = 3): KstScoreResult {
  const quality = groupPct(answers.quality);
  const service = groupPct(answers.service);
  const cleanliness = groupPct(answers.cleanliness);
  const overall = Math.round((quality + service + cleanliness) / 3);

  const all: KstWeakItem[] = KST_CATEGORIES.flatMap((category) =>
    Object.entries(answers[category]).map(([questionId, score]) => ({ category, questionId, score })),
  );
  const order = (item: KstWeakItem) => KST_CATEGORIES.indexOf(item.category) * 100 + Number(item.questionId.slice(1));
  // Only answers below «yaxşı» (≤3) count as weak; a 4/5 is not a problem to fix this month.
  const weakest = all
    .filter((item) => item.score <= 3)
    .sort((a, b) => a.score - b.score || order(a) - order(b))
    .slice(0, weakestCount);

  return { scores: { quality, service, cleanliness, overall }, weakest };
}
