/** Franchise Buyer Checklist - 9 section SSOT (scores are data - L-013) */

export const BUYER_QUESTION_COUNT = 9;
export const BUYER_SCORE_OPTIONS = [0, 50, 100] as const; // no / partial / yes

export type BuyerVerdict = 'risky' | 'cautious' | 'promising' | 'strong';

export function getBuyerVerdict(avgScore: number): BuyerVerdict {
  if (avgScore < 40) return 'risky';
  if (avgScore < 60) return 'cautious';
  if (avgScore < 80) return 'promising';
  return 'strong';
}

export function getBuyerWeakestIndex(scores: number[]): number {
  let minVal = 101;
  let minIdx = 0;
  scores.forEach((value, index) => {
    if (value < minVal) {
      minVal = value;
      minIdx = index;
    }
  });
  return minIdx;
}
