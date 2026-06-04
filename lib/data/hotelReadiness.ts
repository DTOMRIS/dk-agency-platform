/**
 * Hotel Readiness Quiz — Single Source of Truth
 *
 * AHA (Azerbaijan Hotel Association) Milli Ulduz Tesnifati 248 meyarini
 * 12 esas kateqoriyada xulase edir. Her kateqoriya 4 sirali cavab (25/50/75/100).
 *
 * Standart bazasi: Hotelstars Union (Avropa Mehmanxanalar Assosiasiyasi).
 * Verdict mapping: umumi skor -> ulduz hedef tier.
 * i18n keys: hotelReadiness.questions.{index}.{q,cat,options.{index}}
 *
 * Reuse: FranchiseQuiz parametrik component bunu config kimi qebul edir.
 */

export const HOTEL_QUESTION_COUNT = 12;
export const HOTEL_QUESTION_SCORES = [25, 50, 75, 100] as const;

export type HotelVerdict = 'pansion' | 'tier12' | 'tier3' | 'tier4' | 'tier5';

export function getHotelVerdict(avgScore: number): HotelVerdict {
  if (avgScore < 50) return 'pansion';
  if (avgScore < 65) return 'tier12';
  if (avgScore < 75) return 'tier3';
  if (avgScore < 85) return 'tier4';
  return 'tier5';
}

export function getHotelWeakestIndex(scores: number[]): number {
  let minVal = 101;
  let minIdx = 0;
  scores.forEach((v, i) => { if (v < minVal) { minVal = v; minIdx = i; } });
  return minIdx;
}

export const HOTEL_READINESS_TASK_TYPE = 'HotelReadinessReport' as const;
