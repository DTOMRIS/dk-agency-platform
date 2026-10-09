/**
 * @file cost-percent.ts
 * @purpose Menyu Analitiyi form: the owner types the food cost of one portion in manat, but
 *          POST /api/marketing-tools/menyu-analitigi validates `costPercent` as 0–100 (%).
 *          Before TASK-0517 the manat number was sent as if it were a percent.
 * @task TASK-0517
 */

/** Food cost % = cost ÷ price × 100, one decimal, capped at 100. undefined when not computable. */
export function toCostPercent(costAmount: number | undefined, price: number): number | undefined {
  if (costAmount === undefined || !Number.isFinite(costAmount) || costAmount < 0) return undefined;
  if (!Number.isFinite(price) || price <= 0) return undefined;
  return Math.min(100, Math.round((costAmount / price) * 1000) / 10);
}
