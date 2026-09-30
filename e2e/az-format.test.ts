/**
 * TASK-0462: lib/i18n/format.ts — Node-un tam ICU `az-AZ` çıxışı ilə eyni olmalıdır.
 * Run with: npx tsx e2e/az-format.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { formatAzDate, formatAzDateTime, formatNumber } from '../lib/i18n/format';

let failures = 0;
let checks = 0;
function eq(actual: string, expected: string, label: string) {
  checks++;
  if (actual !== expected) {
    failures++;
    console.error(
      `FAIL: ${label}\n  gözlənilən: ${JSON.stringify(expected)}\n  alınan:     ${JSON.stringify(actual)}`
    );
  }
}

const TZ = { timeZone: 'Asia/Baku' } as const;
const OPTION_SETS: Intl.DateTimeFormatOptions[] = [
  {},
  { day: 'numeric', month: 'long' },
  { day: 'numeric', month: 'long', year: 'numeric' },
  { month: 'long', day: 'numeric', year: 'numeric' },
  { day: '2-digit', month: 'short', year: 'numeric' },
  { day: '2-digit', month: 'long', year: 'numeric' },
  { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  { weekday: 'long', day: 'numeric', month: 'long' },
  { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' },
  { day: '2-digit', month: '2-digit', year: 'numeric' },
];

// Bütün aylar, həftənin bütün günləri, gecə yarısı ətrafı (UTC ≠ Bakı günü) və tək rəqəmli günlər
const dates: Date[] = [];
for (let m = 0; m < 12; m++) dates.push(new Date(Date.UTC(2026, m, 5, 8, 5, 7)));
for (let d = 0; d < 7; d++) dates.push(new Date(Date.UTC(2026, 8, 27 + d, 12)));
dates.push(new Date(Date.UTC(2026, 11, 31, 21, 30))); // Bakıda artıq 1 yanvar 2027
dates.push(new Date(Date.UTC(2026, 0, 1, 0, 0)));

for (const date of dates) {
  for (const opts of OPTION_SETS) {
    eq(
      formatAzDate(date, opts),
      date.toLocaleDateString('az-AZ', { ...TZ, ...opts }),
      `${date.toISOString()} ${JSON.stringify(opts)}`
    );
  }
  eq(formatAzDateTime(date), date.toLocaleString('az-AZ', TZ), `${date.toISOString()} datetime`);
}

// String/number girişi və səhv tarix
eq(formatAzDate('2026-09-29T08:05:07Z'), '29.09.2026', 'ISO string');
eq(formatAzDate(Date.UTC(2026, 8, 29)), '29.09.2026', 'timestamp');
eq(formatAzDate('not-a-date'), '', 'səhv tarix → boş');

// Rəqəmlər
for (const n of [0, 7, 1234, 3744.5, 1234567.891, -98765.4]) {
  eq(formatNumber(n), n.toLocaleString('az-AZ'), `rəqəm ${n}`);
  eq(
    formatNumber(n, 'az', { maximumFractionDigits: 0 }),
    n.toLocaleString('az-AZ', { maximumFractionDigits: 0 }),
    `rəqəm ${n} (0 onluq)`
  );
}
eq(formatNumber(1234.5, 'ru'), (1234.5).toLocaleString('ru'), 'ru olduğu kimi');

if (failures > 0) {
  console.error(`\n${failures}/${checks} FAIL`);
  process.exit(1);
}
console.log(`ALL PASS (${checks} yoxlama)`);
process.exit(0);
