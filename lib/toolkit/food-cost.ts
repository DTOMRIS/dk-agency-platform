/**
 * TASK-0515: cost of the USABLE quantity. To get `quantity` after trimming `trim`% you must buy
 * quantity / (1 − trim/100) — e.g. 1 kq at 15% trim and 10 ₼/kq costs 1 / 0.85 × 10 = 11,76 ₼
 * (the old quantity × (1 + trim) gave 11,50). trim ≥ 100 or < 0 is invalid → null.
 */
export function usableLineCost(ing: { quantity: number; trimLoss: number; pricePerUnit: number }): number | null {
  if (!Number.isFinite(ing.trimLoss) || ing.trimLoss < 0 || ing.trimLoss >= 100) return null;
  return (ing.quantity / (1 - ing.trimLoss / 100)) * ing.pricePerUnit;
}
