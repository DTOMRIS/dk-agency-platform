/**
 * TASK-0517: Menyu Analitiyi — manat food cost → API costPercent (0–100).
 * Run with: npx tsx e2e/menu-cost-percent.test.ts
 */
import { toCostPercent } from '../lib/marketing/cost-percent';

let failures = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  if (!Object.is(actual, expected)) {
    failures++;
    console.error(`FAIL: ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}
eq(toCostPercent(2.5, 8), 31.3, '2,50 ₼ of 8 ₼ = 31,3%');
eq(toCostPercent(3, 10), 30, '3 of 10 = 30%');
eq(toCostPercent(12, 10), 100, 'cost above price is capped at 100');
eq(toCostPercent(undefined, 10), undefined, 'no cost');
eq(toCostPercent(2, 0), undefined, 'no price');
eq(toCostPercent(-1, 10), undefined, 'negative cost');
if (failures) {
  console.error(`${failures} failure(s)`);
  process.exit(1);
}
console.error('menu-cost-percent: all checks passed');
