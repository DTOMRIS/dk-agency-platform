/**
 * TASK-0541: lead source classification (utm, ad click ids, referring site).
 * Run with: npx tsx e2e/attribution.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { attributionLine, classifyTouch, parseAttribution } from '../lib/analytics/attribution';

let failures = 0;
let checks = 0;
function eq(actual: unknown, expected: unknown, label: string) {
  checks++;
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    failures++;
    console.error(`FAIL: ${label}\n  gözlənilən: ${JSON.stringify(expected)}\n  alınan:     ${JSON.stringify(actual)}`);
  }
}

const HOST = 'dkagency.com.tr';
eq(classifyTouch('?utm_source=Instagram&utm_medium=paid&utm_campaign=Food Cost Okt', '', HOST), { s: 'instagram', m: 'paid', c: 'food cost okt' }, 'utm wins, lower-cased');
eq(classifyTouch('?utm_source=telegram', 'https://www.google.com/', HOST), { s: 'telegram', m: '(none)' }, 'utm without medium');
eq(classifyTouch('?gclid=abc', '', HOST), { s: 'google', m: 'cpc' }, 'Google Ads click id');
eq(classifyTouch('?fbclid=x', '', HOST), { s: 'facebook', m: 'social' }, 'fbclid = facebook social (paid unknown)');
eq(classifyTouch('', 'https://www.google.az/', HOST), { s: 'google', m: 'organic', r: 'google.az' }, 'Google search');
eq(classifyTouch('', 'https://l.instagram.com/?u=x', HOST), { s: 'instagram', m: 'social', r: 'l.instagram.com' }, 'Instagram link shim');
eq(classifyTouch('', 'https://t.me/dkagenc', HOST), { s: 'telegram', m: 'social', r: 't.me' }, 'Telegram channel');
eq(classifyTouch('', 'https://chatgpt.com/', HOST), { s: 'chatgpt', m: 'ai', r: 'chatgpt.com' }, 'ChatGPT');
eq(classifyTouch('', 'https://report.az/xeber', HOST), { s: 'report.az', m: 'referral', r: 'report.az' }, 'other site');
eq(classifyTouch('', 'https://www.dkagency.com.tr/toolkit', HOST), { s: 'direct', m: '(none)' }, 'internal referrer = direct');
eq(classifyTouch('', '', HOST), { s: 'direct', m: '(none)' }, 'nothing = direct');
eq(classifyTouch('?utm_source=<script>', '', HOST).s, 'script', 'utm value sanitised');

const a = parseAttribution(JSON.stringify({ id: 'abc', s: 'instagram', m: 'paid', c: 'okt', l: '/toolkit', t: '2026-10-11T10:00:00Z' }));
eq(attributionLine(a), 'Mənbə: instagram · paid · kampaniya «okt»', 'Telegram line');
eq(attributionLine(parseAttribution(JSON.stringify({ id: 'x', s: 'direct', m: '(none)', l: '/' }))), 'Mənbə: birbaşa (ünvanı yazıb və ya əlfəcin)', 'direct line');
eq(attributionLine(null), 'Mənbə: bilinmir', 'no cookie');
eq(parseAttribution('not json'), null, 'bad cookie ignored');

if (failures > 0) {
  console.error(`\n${failures}/${checks} yoxlama uğursuz`);
  process.exit(1);
}
console.log(`attribution: ${checks}/${checks} OK`);
