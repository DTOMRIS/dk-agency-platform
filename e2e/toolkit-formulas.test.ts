/**
 * TASK-0515: Toolkit formulas — trim (usable quantity) and Kasavana & Smith menu classification.
 * Run with: npx tsx e2e/toolkit-formulas.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { usableLineCost } from '../lib/toolkit/food-cost';
import { classifyMenu, menuThresholds } from '../lib/toolkit/menu-matrix';

let failures = 0;
let checks = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  checks++;
  if (!Object.is(actual, expected)) {
    failures++;
    console.error(`FAIL: ${label}\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(actual)}`);
  }
}
const r2 = (n: number | null) => (n === null ? null : Math.round(n * 100) / 100);

// Trim: 1 kq, 15%, 10 ₼ → 1 / 0.85 × 10 = 11.76 (old formula gave 11.50)
eq(r2(usableLineCost({ quantity: 1, trimLoss: 15, pricePerUnit: 10 })), 11.76, 'trim 15%');
eq(r2(usableLineCost({ quantity: 0.25, trimLoss: 0, pricePerUnit: 9.5 })), 2.38, 'trim 0%');
eq(usableLineCost({ quantity: 1, trimLoss: 100, pricePerUnit: 10 }), null, 'trim 100% invalid');
eq(usableLineCost({ quantity: 1, trimLoss: 150, pricePerUnit: 10 }), null, 'trim >100% invalid');
eq(usableLineCost({ quantity: 1, trimLoss: -5, pricePerUnit: 10 }), null, 'trim negative invalid');

// Menu matrix: sales 100/40/30/30 → popularity threshold 0.7 × 50 = 35 → the 40-item is popular
const items = [
  { id: 'a', name: 'A', salesCount: 100, contributionMargin: 8 },
  { id: 'b', name: 'B', salesCount: 40, contributionMargin: 6 },
  { id: 'c', name: 'C', salesCount: 30, contributionMargin: 9 },
  { id: 'd', name: 'D', salesCount: 30, contributionMargin: 5 },
];
const th = menuThresholds(items);
eq(th.popularity, 35, 'popularity threshold');
eq(r2(th.margin), 7.3, 'sales-weighted CM (800+240+270+150)/200');
eq(classifyMenu(items).map((x) => x.category).join(','), 'star,plowHorse,puzzle,dog', 'categories');
eq(menuThresholds([]).popularity, 0, 'empty list');
// No sales at all → simple average CM
eq(menuThresholds([{ id: 'x', name: 'x', salesCount: 0, contributionMargin: 4 }, { id: 'y', name: 'y', salesCount: 0, contributionMargin: 6 }]).margin, 5, 'no-sales fallback');

if (failures > 0) {
  console.error(`\n${failures}/${checks} checks failed`);
  process.exit(1);
}
console.log(`toolkit-formulas: ${checks}/${checks} checks passed`);
