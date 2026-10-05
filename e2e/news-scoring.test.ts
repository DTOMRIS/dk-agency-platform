/**
 * TASK-0491: lib/news/scoring-config.ts — Azerbaijani-aware relevance scoring.
 * Run with: npx tsx e2e/news-scoring.test.ts
 * Exits 0 on success, 1 on failure. Real headlines (AZ/TR/RU/EN) seen in the feeds, 2026-10.
 */

import { SCORE_THRESHOLD, scoreNewsItem } from '../lib/news/scoring-config';

type Fixture = { title: string; summary?: string; url?: string; pass: boolean };

const NEUTRAL = 'https://example.org/news/1';

const FIXTURES: Fixture[] = [
  // --- Azerbaijani: should pass ---
  { title: 'Bakı restoranlarında qiymətlər artıb', pass: true },
  { title: 'İCTİMAİ İAŞƏ müəssisələri yoxlanılır', pass: true },
  {
    title: 'AİİQA-nın İdarə Heyəti formalaşdırıldı: Sektor bir araya gəldi',
    summary:
      'Azərbaycanın ictimai iaşə və qastronomiya sektorunun aparıcı nümayəndələri assosiasiyanın idarə heyətinə seçildi.',
    pass: true,
  },
  { title: 'Turizm sektorunda yeni qaydalar', pass: true },
  {
    title: 'Restoranlarımızda xidmət keyfiyyəti necə yüksəldilə bilər?',
    url: 'https://modern.az/x',
    pass: true,
  },
  { title: 'Şadlıq sarayları üçün yeni sanitar tələblər', url: 'https://apa.az/x', pass: true },
  { title: 'Yeməkxanalarda gigiyena yoxlaması aparılıb', url: 'https://musavat.com/x', pass: true },
  {
    title: 'Neftçilər prospektində yeni restoran şəbəkəsi açılır',
    url: 'https://report.az/x',
    pass: true,
  },
  { title: 'Bakıdakı kafelərində menyu qiymətləri dəyişdi', pass: true },
  { title: 'Azərbaycana gələn turistlərin sayı 20% artıb', url: 'https://apa.az/x', pass: true },
  // --- Turkish: should pass ---
  {
    title: 'İstanbul restoranlardaki fiyat artışı sürüyor',
    url: 'https://www.turizmgazetesi.com/x',
    pass: true,
  },
  { title: 'OTELCİLİK sektöründe yapay zeka dönemi', pass: true },
  {
    title: 'Lokanta sahipleri yeni vergi düzenlemesine tepkili',
    url: 'https://www.turizmgazetesi.com/x',
    pass: true,
  },
  // --- Russian: should pass ---
  { title: 'В Баку открылись три новых ресторана', pass: true },
  { title: 'Туризм в Азербайджане: число гостиниц выросло', pass: true },
  // --- English: should pass ---
  { title: 'Restaurant chains bet on AI voice ordering', pass: true },
  { title: 'Azerbaijan tourism revenue hits record', url: 'https://en.trend.az/x', pass: true },

  // A single sector word from an unknown source stays below the threshold.
  { title: 'Lokanta sahipleri yeni vergi düzenlemesine tepkili', pass: false },
  // --- should fail ---
  { title: 'Azerbaijan Basketball Federation unveils plans', pass: false },
  { title: 'ADEX 2026-nın rəsmi açılış mərasimi', pass: false },
  {
    title: 'Deputy Defense Minister visits ADEX exhibition in Baku',
    summary: 'The minister toured the hotel-hosted defence expo.',
    pass: false,
  },
  { title: 'Premyer Liqa: Neftçi Qarabağla heç-heçə edib', pass: false },
  { title: 'Neft qiyməti yenidən düşüb', pass: false },
  { title: 'Universitetin kafedrası yeni proqram təqdim etdi', pass: false },
  { title: 'Prezident xarici işlər nazirini qəbul edib', pass: false },
  { title: 'Bitcoin price surges as hotel chain accepts crypto', pass: false },
  { title: 'Мэр посетил футбольный матч', pass: false },
  { title: 'Saudi Arabia completes first tokenised real estate deal', pass: false },
  {
    title: 'Hotel group announces quarterly results',
    url: 'https://www.menafn.com/x',
    pass: false,
  },
];

let failures = 0;
for (const f of FIXTURES) {
  const score = scoreNewsItem(f.title, f.summary ?? '', f.url ?? NEUTRAL);
  const passed = score >= SCORE_THRESHOLD;
  const ok = passed === f.pass;
  if (!ok) failures++;
  console.log(
    `${ok ? 'OK  ' : 'FAIL'} [${String(score).padStart(2)}] expect ${f.pass ? 'pass' : 'fail'} — ${f.title}`
  );
}

console.log(`\n${FIXTURES.length - failures}/${FIXTURES.length} fixtures OK`);
process.exit(failures === 0 ? 0 : 1);
