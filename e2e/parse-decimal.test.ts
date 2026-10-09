/**
 * TASK-0515: lib/toolkit/parse-decimal.ts — "12,5" and "12.5" are the same number in every tool.
 * Run with: npx tsx e2e/parse-decimal.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { formatDecimalInput, parseDecimal } from '../lib/toolkit/parse-decimal';

let failures = 0;
let checks = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  checks++;
  if (!Object.is(actual, expected)) {
    failures++;
    console.error(`FAIL: ${label}\n  expected: ${JSON.stringify(expected)}\n  got:      ${JSON.stringify(actual)}`);
  }
}

const cases: Array<[string | null | undefined, number | null]> = [
  // decimal comma and decimal dot are equal
  ['12,5', 12.5],
  ['12.5', 12.5],
  ['0,25', 0.25],
  ['0.25', 0.25],
  [',5', 0.5],
  ['.5', 0.5],
  ['12,', 12],
  ['12.', 12],
  ['12', 12],
  ['0', 0],
  // spaces / NBSP thousands separators are stripped
  ['50 000', 50000],
  ['50 000', 50000],
  ['1 234,5', 1234.5],
  [' 7 ', 7],
  // dot = thousands ONLY for the full ^\d{1,3}(\.\d{3})+$ shape
  ['1.500', 1500],
  ['12.500.000', 12500000],
  ['999.999', 999999],
  ['1.5', 1.5],
  ['1.50', 1.5],
  ['1234.567', 1234.567],
  ['1.5000', 1.5],
  // mixed: dot thousands + comma decimal
  ['1.500,75', 1500.75],
  // sign
  ['-5', -5],
  ['-12,5', -12.5],
  ['+3', 3],
  // invalid / empty → null (caller shows a message, never 12540)
  ['', null],
  ['   ', null],
  [null, null],
  [undefined, null],
  ['-', null],
  ['abc', null],
  ['12,5,3', null],
  ['12.5.3', null],
  ['1,500.75', null],
  ['12a', null],
  ['Infinity', null],
];

for (const [input, expected] of cases) {
  eq(parseDecimal(input), expected, `parseDecimal(${JSON.stringify(input)})`);
}

// The regression this helper exists for: typing "12,5" must never become 12540 or 125.
eq(parseDecimal('12,5') === 12540, false, '"12,5" is not 12540');
eq(parseDecimal('12.5') === 125, false, '"12.5" is not 125 (old P&L parseNumber)');

// Display for inputs
eq(formatDecimalInput(12.5, 'az'), '12,5', 'formatDecimalInput az');
eq(formatDecimalInput(12.5, 'en'), '12.5', 'formatDecimalInput en');
eq(formatDecimalInput(50000, 'az'), '50000', 'formatDecimalInput no grouping');
eq(formatDecimalInput(0.1 + 0.2, 'az'), '0,3', 'formatDecimalInput float noise');
eq(formatDecimalInput(Number.NaN, 'az'), '', 'formatDecimalInput NaN');
// round-trip
for (const n of [0, 0.25, 1.5, 12.5, 99.99, 1250, 50000]) {
  for (const loc of ['az', 'ru', 'en', 'tr']) {
    eq(parseDecimal(formatDecimalInput(n, loc)), n, `round-trip ${n} ${loc}`);
  }
}

if (failures > 0) {
  console.error(`\n${failures}/${checks} checks failed`);
  process.exit(1);
}
console.log(`parse-decimal: ${checks}/${checks} checks passed`);
