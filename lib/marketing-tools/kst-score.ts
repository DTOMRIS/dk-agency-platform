/**
 * KST (Keyfiyyət · Servis · Təmizlik · İnsan) self-check score — TASK-0523.
 * The 4th group «İnsan» (team) follows OCAQ's K·X·T·İ logic; its 5 questions are our own wording.
 * Before, the LLM was asked to add up 30 answers and pick the weakest ones; numbers are now code.
 * Each answer is 1–5; a group score = Σ / (n × 5) × 100; overall = mean of the answered groups.
 */

export type KstCategory = 'quality' | 'service' | 'cleanliness' | 'people';

export const KST_CATEGORIES: readonly KstCategory[] = ['quality', 'service', 'cleanliness', 'people'];
export const KST_PREFIX: Record<KstCategory, string> = { quality: 'K', service: 'S', cleanliness: 'T', people: 'I' };
export const KST_QUESTION_COUNT: Record<KstCategory, number> = { quality: 10, service: 10, cleanliness: 10, people: 5 };

/** Our suggested target for every group — not a sector statistic (there is no Baku source for one). */
export const KST_TARGET_PCT = 80;

/** `people` is optional: runs saved before TASK-0523 have only K · S · T. */
export type KstAnswers = Record<Exclude<KstCategory, 'people'>, Record<string, number>> & { people?: Record<string, number> };

export type KstWeakItem = { category: KstCategory; questionId: string; score: number };

export type KstScoreResult = {
  /** `people` is null when that group was not answered. */
  scores: Record<Exclude<KstCategory, 'people'> | 'overall', number> & { people: number | null };
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
  const hasPeople = !!answers.people && Object.keys(answers.people).length > 0;
  const people = hasPeople ? groupPct(answers.people ?? {}) : null;
  const groups = [quality, service, cleanliness, ...(people === null ? [] : [people])];
  const overall = Math.round(groups.reduce((sum, v) => sum + v, 0) / groups.length);

  const all: KstWeakItem[] = KST_CATEGORIES.flatMap((category) =>
    Object.entries(answers[category] ?? {}).map(([questionId, score]) => ({ category, questionId, score })),
  );
  const order = (item: KstWeakItem) => KST_CATEGORIES.indexOf(item.category) * 100 + Number(item.questionId.slice(1));
  // Only answers below «yaxşı» (≤3) count as weak; a 4/5 is not a problem to fix this month.
  const weakest = all
    .filter((item) => item.score <= 3)
    .sort((a, b) => a.score - b.score || order(a) - order(b))
    .slice(0, weakestCount);

  return { scores: { quality, service, cleanliness, people, overall }, weakest };
}
