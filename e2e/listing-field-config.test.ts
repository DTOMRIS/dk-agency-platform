/**
 * TASK-0005: Unit test for listingFieldConfig integrity.
 * Run with: npx tsx e2e/listing-field-config.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { TYPE_SPECIFIC_FIELDS, getFieldsForType } from '../lib/data/listingFieldConfig';

let failures = 0;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FAIL: ${message}`);
    failures++;
  } else {
    console.log(`PASS: ${message}`);
  }
}

// --- devir: 13 fields (10 original + 3 new) ---
const devir = getFieldsForType('devir');
assert(devir.length === 13, `devir field count = ${devir.length}, expected 13`);

const leaseDevir = devir.find(f => f.key === 'leaseTermMonths');
assert(!!leaseDevir, 'devir has leaseTermMonths');
assert(leaseDevir?.type === 'number', 'leaseTermMonths is number');
assert(leaseDevir?.suffix === 'ay', 'leaseTermMonths suffix is ay');

const netProfit = devir.find(f => f.key === 'monthlyNetProfit');
assert(!!netProfit, 'devir has monthlyNetProfit');
assert(netProfit?.type === 'number', 'monthlyNetProfit is number');
assert(netProfit?.suffix === 'AZN', 'monthlyNetProfit suffix is AZN');

const propType = devir.find(f => f.key === 'propertyType');
assert(!!propType, 'devir has propertyType');
assert(propType?.type === 'select', 'propertyType is select');
assert(propType?.required === true, 'propertyType is required');
assert(propType?.options?.length === 3, `propertyType has ${propType?.options?.length} options, expected 3`);
assert(propType?.options?.[0] === 'İcarə (kirayə)', `option 0 = ${propType?.options?.[0]}`);
assert(propType?.options?.[1] === 'Mülkiyyət (satış)', `option 1 = ${propType?.options?.[1]}`);
assert(propType?.options?.[2] === 'İcarə + satınalma opsiyonu', `option 2 = ${propType?.options?.[2]}`);

// --- franchise-vermek: 10 fields (9 original + 1 new) ---
const franchise = getFieldsForType('franchise-vermek');
assert(franchise.length === 10, `franchise-vermek field count = ${franchise.length}, expected 10`);

const minArea = franchise.find(f => f.key === 'minArea');
assert(!!minArea, 'franchise-vermek has minArea');
assert(minArea?.type === 'number', 'minArea is number');
assert(minArea?.suffix === 'm²', 'minArea suffix is m²');

// --- obyekt-icaresi: 9 fields (8 original + 1 new) ---
const obyekt = getFieldsForType('obyekt-icaresi');
assert(obyekt.length === 9, `obyekt-icaresi field count = ${obyekt.length}, expected 9`);

const leaseObyekt = obyekt.find(f => f.key === 'leaseTermMonths');
assert(!!leaseObyekt, 'obyekt-icaresi has leaseTermMonths');
assert(leaseObyekt?.placeholder === 'məs: 60', `obyekt leaseTermMonths placeholder = ${leaseObyekt?.placeholder}`);

// --- unchanged categories should not be affected ---
assert(getFieldsForType('franchise-almaq').length === 5, 'franchise-almaq unchanged (5)');
assert(getFieldsForType('ortak-tapmaq').length === 5, 'ortak-tapmaq unchanged (5)');
assert(getFieldsForType('yeni-investisiya').length === 6, 'yeni-investisiya unchanged (6)');
assert(getFieldsForType('horeca-ekipman').length === 7, 'horeca-ekipman unchanged (7)');

// --- all categories must be present ---
const expectedCategories = ['devir', 'franchise-vermek', 'franchise-almaq', 'ortak-tapmaq', 'yeni-investisiya', 'obyekt-icaresi', 'horeca-ekipman'];
for (const cat of expectedCategories) {
  assert(cat in TYPE_SPECIFIC_FIELDS, `category "${cat}" exists in TYPE_SPECIFIC_FIELDS`);
}

console.log(`\n${failures === 0 ? '✅ ALL PASSED' : `❌ ${failures} FAILURES`}`);
process.exit(failures > 0 ? 1 : 0);
