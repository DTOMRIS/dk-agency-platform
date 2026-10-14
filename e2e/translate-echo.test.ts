/**
 * TASK-0547: the translation echo guard must reject an untranslated (Azerbaijani) answer but accept a real
 * translation that keeps AZ proper names («Mülki Məcəllə», «Qida Təhlükəsizliyi Agentliyi»).
 * Run with: npx tsx e2e/translate-echo.test.ts — exits 0 on success, 1 on failure.
 */

import { looksUntranslated } from '../lib/ai/translate';

const cases: Array<[string, string, boolean, string]> = [
  ['Under Article 726 of the Civil Code (Mülki Məcəllə), the franchisee must check the contract carefully before signing. This applies to every transfer of an operating restaurant in Azerbaijan.', 'en', false, 'en with a law name'],
  ['The Food Safety Agency (AQTA, Qida Təhlükəsizliyi Agentliyi) inspects kitchens; prepare the temperature log, staff health records and supplier invoices before the visit.', 'en', false, 'en with an agency name'],
  ['Restoran açarkən ən böyük səhv konsepti müəyyən etməmək və maya dəyərini bilməməkdir. Sahibkarlar çox vaxt bunu sonradan başa düşür.', 'en', true, 'AZ echoed as en'],
  ['Restoran açarkən ən böyük səhv konsepti müəyyən etməmək və maya dəyərini bilməməkdir.', 'tr', true, 'AZ echoed as tr'],
  ['Mülki Məcəllə', 'en', false, 'short name only'],
  ['Ресторан должен знать себестоимость каждой порции (Mülki Məcəllə).', 'ru', false, 'ru with a law name'],
  ['Restaurant must know the cost.', 'ru', true, 'ru without Cyrillic'],
  ['Bir restoran sahibi gəldi, dedi ki menyu çox genişdir və mətbəx yetişmir.', 'en', true, 'AZ sentence'],
];

let failures = 0;
for (const [text, lang, expected, label] of cases) {
  const got = looksUntranslated(text, lang);
  if (got !== expected) {
    failures++;
    console.error(`FAIL: ${label}\n  gözlənilən: ${expected}\n  alınan:     ${got}`);
  }
}
if (failures > 0) {
  console.error(`\n${failures}/${cases.length} yoxlama uğursuz`);
  process.exit(1);
}
console.log(`translate-echo: ${cases.length}/${cases.length} OK`);
