/**
 * TASK-0561: owner-feedback dedupe + reject-reason callbacks. Run: npx tsx e2e/news-owner-feedback.test.ts
 * Cases are real titles from the owner's Telegram (rejected as repeats, 16–25.11.2026).
 */
import { ownerTasteBlock, parseReasonCallback, rejectReasonButtons, repeatsRecentTitle } from '../lib/news/owner-feedback';

let fail = 0;
const check = (ok: boolean, label: string) => { if (!ok) { fail++; console.error('FAIL', label); } };

const repeats: Array<[string, string]> = [
  ['47 şadlıq sarayından 41-də nöqsanlar aşkarlandı', 'Bakıdakı 47 şadlıq sarayından 41-də qida təhlükəsizliyi pozuntusu aşkarlanıb'],
  ['Hanoy kollecində Bakı guşəsi və Azərbaycan mətbəxi zonası açılıb', 'Hanoyda Bakı guşəsi və Azərbaycan kulinariya zonası açılıb'],
];
// Re-worded repeats with ≤ 2 distinctive stems (By Fateh «dayandırıb/məhdudlaşdırılıb», ATB «dörd/4») are left to
// the editor pass, which sees this week's titles — the backstop stays conservative so new events are never hidden.
const distinct: Array<[string, string]> = [
  ['Dubai otellərində doluluq 58,6%-ə düşüb', 'Azərbaycanda ictimai iaşə dövriyyəsi 10 ayda 2,6 milyard manata çatıb'],
  ['Hilton 2027-ci ildə açacağı otellərin siyahısını paylaşdı', 'Yum China 20 min restorana çatdı, 2030 üçün 30 min hədəf qoydu'],
  // Replay false positives found while tuning (TASK-0561): different events, shared inspection/seminar wording.
  ['Bakı restoranında vaxtı keçmiş məhsul və sənədsiz ət aşkarlandı', 'Hövsanda "Malakanka" MMC-də vaxtı keçmiş məhsullar və sənədsiz xammal aşkarlanıb'],
  ['ATB Pekindəki nümayəndəliyi vasitəsilə Çinin dörd şəhərində turizm seminarları keçirib', 'ATB Belarusun üç şəhərində turizm seminarları keçirib'],
  ['Bilasuvarda 6-cı «Hind – Mətbəx Festivalı» keçirildi', 'Hanoyda beynəlxalq kulinariya festivalında Azərbaycan yeməkləri maraq doğurub'],
];
for (const [a, b] of repeats) check(repeatsRecentTitle(a, [b]) === b, `repeat: ${a}`);
for (const [a, b] of distinct) check(repeatsRecentTitle(a, [b]) === null, `distinct: ${a}`);
check(repeatsRecentTitle('Nəsə', []) === null, 'empty list');

check(JSON.stringify(parseReasonCallback('news:why:pr:4822', 'news:why:')) === JSON.stringify({ reason: 'pr', articleId: 4822 }), 'parse ok');
for (const bad of ['news:why:xx:1', 'news:why:pr:0', 'news:why:pr:abc', 'news:reject:4822', 'news:why:pr']) {
  check(parseReasonCallback(bad, 'news:why:') === null, `parse bad ${bad}`);
}
const rows = rejectReasonButtons(4822, 'news:why:');
check(rows.flat().length === 4 && rows.flat().every((b) => Buffer.byteLength(b.callback_data) <= 64), 'buttons ≤ 64 bytes');

check(ownerTasteBlock({ recentTitles: [], approved: [], rejected: [] }) === '', 'empty block');
const block = ownerTasteBlock({ recentTitles: ['A'], approved: ['B'], rejected: [{ title: 'C', reason: 'pr' }] });
check(block.includes('- A') && block.includes('+ B') && block.includes('C (şirkət reklamı'), 'block content');

if (fail) { console.error(`${fail} uğursuz`); process.exit(1); }
console.log('news-owner-feedback: OK');
