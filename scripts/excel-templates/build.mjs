#!/usr/bin/env node
/**
 * @file build.mjs
 * @purpose TASK-0532 — builds the 5 DK Excel templates for members into content/excel-templates/.
 *          Own design and wording (Over Easy Office was studied for structure only — no text, labels, sample
 *          data or layout copied). Fixes the gaps found there: budget has a variance column, P&L has % of sales
 *          and prime cost over 12 months, labour «guests per labour hour» = total guests ÷ total hours.
 *          Run: node scripts/excel-templates/build.mjs   (re-run after any change; the files are committed)
 * Rule (owner): every number in the files is an example to overwrite — never a market fact.
 * Terms (owner 10.10: «İşəgötürənin sosial ayırmaları yanlış tanım»): legal names — məcburi dövlət sosial sığorta,
 * işsizlikdən sığorta, icbari tibbi sığorta haqları (işəgötürən payı); əmək haqqı; balance lines as in the
 * Ministry of Finance form (qısamüddətli / uzunmüddətli aktivlər, ehtiyatlar, əsas vəsaitlər, kreditor borcları,
 * nizamnamə kapitalı); P&L: satışın maya dəyəri, ümumi mənfəət, vergiyə qədər mənfəət. Rates are NOT written in
 * the files (2026 reform made them tiered and no official text was found) — the owner asks the accountant.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Sheet, buildWorkbook, col } from './xlsx-writer.mjs';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../..');
const OUT = path.join(ROOT, 'content/excel-templates');
const LOGO = new Uint8Array(fs.readFileSync(path.join(ROOT, 'public/images/logo-mobil.png')));
fs.mkdirSync(OUT, { recursive: true });

const WA = '+994 50 256 62 79';
const SITE = 'https://dkagency.com.tr';

/** Ink band with logo (A1:A3) and the title; `last` = last column index of the band. */
function header(sh, last, title, sub) {
  const end = col(last);
  for (let r = 1; r <= 3; r++) sh.fillRange(`A${r}`, `${end}${r}`, 'band');
  sh.height(1, 30).height(2, 18).height(3, 16);
  sh.set('B1', title, 'title').merge(`B1:${end}1`);
  sh.set('B2', sub, 'band').merge(`B2:${end}2`);
  sh.set('B3', `DK Agency · dkagency.com.tr · WhatsApp ${WA}`, 'band').merge(`B3:${end}3`);
}

/** Legend row: what to fill, what is calculated. */
function legend(sh, row) {
  sh.set(`A${row}`, '', 'inText');
  // One line, no wrap (text runs over the empty cells to the right).
  sh.set(`B${row}`, 'Krem xanalara öz rəqəmlərinizi yazın.', 'legend');
  sh.set(`D${row}`, '', 'fMoney');
  sh.set(`E${row}`, 'Boz xanalar özü hesablanır — onlara toxunmayın.', 'legend');
  sh.set(`H${row}`, 'Rəqəmlər nümunədir: silib özünüzünkünü yazın.', 'legendNote');
}

/** Bottom line: DK promotion + links. */
function footer(sh, row, last) {
  const end = col(last);
  sh.fillRange(`A${row}`, `${end}${row}`, 'redBand');
  sh.height(row, 34);
  sh.set(`A${row}`, `Rəqəmlərinizə birlikdə baxaq: pulsuz diaqnostika üçün WhatsApp ${WA} · Pulsuz alətlər: dkagency.com.tr/toolkit`, 'redBand').merge(`A${row}:${end}${row}`);
  sh.set(`A${row + 1}`, { f: `HYPERLINK("${SITE}/toolkit","dkagency.com.tr/toolkit — pulsuz kalkulyatorlar")` }, 'link');
  sh.set(`A${row + 2}`, '© DK Agency. Şablonu öz işinizdə sərbəst istifadə edin; satmaq və ya başqa ad altında yaymaq olmaz.', 'note');
  sh.merge(`A${row + 2}:${end}${row + 2}`);
}

/** «Necə istifadə etməli» sheet — steps + who we are. */
function guide(title, steps) {
  const sh = new Sheet('Necə istifadə etməli', { widths: [10, 92], logo: true, tab: 'FFD63B54' });
  header(sh, 1, title, 'Necə istifadə etməli');
  let r = 5;
  sh.set(`B${r}`, 'Addımlar', 'h2'); r += 1;
  steps.forEach((s, i) => {
    sh.set(`A${r}`, `${i + 1}.`, 'label');
    sh.set(`B${r}`, s, 'text');
    sh.height(r, s.length > 95 ? 34 : 20);
    r += 1;
  });
  r += 1;
  sh.set(`B${r}`, 'DK Agency haqqında', 'h2'); r += 1;
  const about = [
    'DK Agency — Azərbaycanın ilk AI-dəstəkli HoReCa platforması: restoran, kafe və otel sahibləri üçün pulsuz alətlər, B2B elanlar, franchise bələdçisi və xüsusi xidmət.',
    'Qurucu Doğan Tomris HoReCa sahəsində 40 illik təcrübəyə malikdir.',
    'Pulsuz alətlər: food cost, mənfəət-zərər, zərərsiz nöqtə, delivery komissiyası, menyu matrisi, işçi saxlama və başqaları — dkagency.com.tr/toolkit.',
    `Xüsusi xidmət: sistemi sizinlə birlikdə qururuq. İlk addım pulsuz diaqnostikadır — WhatsApp ${WA}.`,
  ];
  for (const a of about) { sh.set(`B${r}`, a, 'text'); sh.height(r, 34); r += 1; }
  r += 1;
  sh.set(`B${r}`, { f: `HYPERLINK("${SITE}","dkagency.com.tr")` }, 'link'); r += 1;
  sh.set(`B${r}`, { f: `HYPERLINK("https://t.me/dkagenc","Telegram: Sektor Nəbzi kanalı")` }, 'link');
  return sh;
}

// The .xlsx files are binary; the repo's pre-commit encoding check reads committed files as text and flags
// zip bytes as «mojibake». So the committed form is base64 in lib/excel-templates/files.generated.ts
// (served by /api/member/excel-templates/[slug]); content/excel-templates/*.xlsx is a local preview copy only.
const GENERATED = {};
function save(file, sheets, title, subject) {
  const bytes = buildWorkbook({ sheets, title, subject, logoPng: LOGO });
  fs.writeFileSync(path.join(OUT, file), bytes);
  GENERATED[file] = Buffer.from(bytes).toString('base64');
  console.log(`${file}  ${(bytes.length / 1024).toFixed(1)} KB`);
}
process.on('beforeExit', () => {
  if (!Object.keys(GENERATED).length) return;
  const body = Object.entries(GENERATED)
    .map(([file, b64]) => `  '${file}':\n    '${b64}',`)
    .join('\n');
  const out = `// GENERATED by scripts/excel-templates/build.mjs — do not edit. Base64 of the DK Excel templates (TASK-0532).\nexport const EXCEL_TEMPLATE_FILES: Record<string, string> = {\n${body}\n};\n`;
  fs.writeFileSync(path.join(ROOT, 'lib/excel-templates/files.generated.ts'), out);
  console.log('lib/excel-templates/files.generated.ts written');
  Object.keys(GENERATED).forEach((k) => delete GENERATED[k]);
});

// ═══ 1. Anbar və maya dəyəri ═══════════════════════════════════════════════
{
  const sh = new Sheet('Anbar', { widths: [16, 26, 11, 13, 14, 13, 14, 12, 15, 12, 14, 4, 34, 16], logo: true, freeze: 'A8', tab: 'FF0F172A' });
  header(sh, 13, 'Anbar və maya dəyəri', 'Ayın əvvəlindəki qalıq + alış − ayın sonundakı sayım = istifadə olunan ərzaq. Ay: __________   Məkan: __________');
  legend(sh, 5);
  const heads = ['Kateqoriya', 'Məhsul', 'Ölçü vahidi', 'Vahid qiyməti (₼)', 'Ayın əvvəlində qalıq', 'Ay ərzində alış', 'Ayın sonunda sayım (inventarizasiya)', 'İstifadə', 'Qalığın dəyəri (₼)', 'Sifariş həddi', 'Vəziyyət'];
  heads.forEach((h, i) => sh.set(`${col(i)}7`, h, 'head'));
  sh.height(7, 48);
  const ex = [
    ['Ət və toyuq', 'Mal əti', 'kq', 18, 20, 40, 15, 10],
    ['Ət və toyuq', 'Toyuq filesi', 'kq', 9.5, 15, 60, 8, 10],
    ['Tərəvəz', 'Pomidor', 'kq', 2.2, 10, 80, 12, 15],
    ['Tərəvəz', 'Soğan', 'kq', 0.9, 25, 50, 30, 20],
    ['Quru məhsul', 'Düyü', 'kq', 3, 30, 50, 22, 25],
    ['Quru məhsul', 'Un', 'kq', 1.1, 40, 50, 35, 30],
    ['Süd məhsulları', 'Pendir', 'kq', 12, 6, 15, 4, 5],
    ['İçkilər', 'Mineral su 0,5 l', 'ədəd', 0.6, 120, 240, 150, 100],
  ];
  const first = 8, last = 47;
  for (let r = first; r <= last; r++) {
    const e = ex[r - first];
    sh.set(`A${r}`, e ? e[0] : '', 'inText');
    sh.set(`B${r}`, e ? e[1] : '', 'inText');
    sh.set(`C${r}`, e ? e[2] : '', 'inText');
    sh.set(`D${r}`, e ? e[3] : '', 'inMoney');
    sh.set(`E${r}`, e ? e[4] : '', 'inMoney');
    sh.set(`F${r}`, e ? e[5] : '', 'inMoney');
    sh.set(`G${r}`, e ? e[6] : '', 'inMoney');
    sh.set(`H${r}`, { f: `IF(B${r}="","",E${r}+F${r}-G${r})` }, 'fMoney');
    sh.set(`I${r}`, { f: `IF(B${r}="","",G${r}*D${r})` }, 'fMoney');
    sh.set(`J${r}`, e ? e[7] : '', 'inMoney');
    sh.set(`K${r}`, { f: `IF(OR(B${r}="",J${r}=""),"",IF(G${r}<=J${r},"Sifariş et","Normal"))` }, 'fText');
  }
  sh.over(`K${first}:K${last}`, `K${first}="Sifariş et"`, 0);
  sh.over(`H${first}:H${last}`, `AND(ISNUMBER(H${first}),H${first}<0)`, 0);
  const R = `${first}:`;
  void R;
  // Summary block (M:N)
  sh.set('M7', 'Ayın yekunu', 'head').set('N7', '₼', 'head');
  const sum = [
    ['Ayın əvvəlində anbarın dəyəri', `SUMPRODUCT(D${first}:D${last},E${first}:E${last})`, 'fMoney'],
    ['Ay ərzində alışların dəyəri', `SUMPRODUCT(D${first}:D${last},F${first}:F${last})`, 'fMoney'],
    ['Ayın sonunda anbarın dəyəri', `SUM(I${first}:I${last})`, 'fMoney'],
    ['İstifadə olunan ərzağın maya dəyəri', 'N8+N9-N10', 'totMoney'],
  ];
  sum.forEach(([l, f, s], i) => { sh.set(`M${8 + i}`, l, i === 3 ? 'totLabel' : 'labelCell'); sh.set(`N${8 + i}`, { f }, s); });
  sh.set('M13', 'Ayın ərzaq və içki satışı (₼)', 'labelCell').set('N13', 9500, 'inMoney');
  sh.set('M14', 'Ərzaq maya dəyəri faizi (food cost)', 'totLabel').set('N14', { f: 'IF(N13>0,N11/N13,"")' }, 'totPct');
  sh.set('M16', 'İstifadə mənfidirsə, sayımda və ya alış qeydində səhv var. «Sifariş et» = qalıq sifariş həddinə çatıb.', 'note').merge('M16:N19');
  footer(sh, 50, 13);
  save('dk-anbar-ve-maya-deyeri.xlsx', [sh, guide('Anbar və maya dəyəri', [
    'Ayın 1-i: hər məhsulun qalığını sayın və «Ayın əvvəlində qalıq» sütununa yazın (keçən ayın «Ayın sonunda sayım» rəqəmi).',
    'Ay ərzində gələn hər alışı (qaimələrə görə) «Ay ərzində alış» sütununa əlavə edin.',
    'Ayın son günü yenidən sayın və «Ayın sonunda sayım» sütununa yazın — «İstifadə» və «Qalığın dəyəri» özü hesablanır.',
    'Sağdakı blokda ayın ərzaq və içki satışını yazın: istifadə olunan ərzağın maya dəyəri və food cost faizi görünəcək.',
    '«Sifariş həddi» yazsanız, qalıq o həddə çatanda «Vəziyyət» sütununda «Sifariş et» görünür.',
    'Food cost faizini aydan-aya müqayisə edin. Yemək-yemək hesablamaq üçün: dkagency.com.tr/toolkit/food-cost.',
  ])], 'Anbar və maya dəyəri — DK Agency şablonu', 'Aylıq anbar sayımı, istifadə və food cost');
}

// ═══ 2. İşçi xərci ═════════════════════════════════════════════════════════
{
  const sh = new Sheet('Əmək haqqı xərcləri', { widths: [12, 22, 9, 14, 14, 13, 13, 13, 15, 12, 4, 38, 16], logo: true, freeze: 'A8', tab: 'FF0F172A' });
  header(sh, 12, 'Əmək haqqı xərcləri', 'Aylıq əmək haqqı, iş vaxtından artıq işləmə və əmək haqqı xərclərinin satışa nisbəti. Ay: __________   Məkan: __________');
  legend(sh, 5);
  const heads = ['Bölmə', 'Vəzifə', 'Nəfər', 'Aylıq əmək haqqı (bir nəfər, ₼)', 'Sığorta haqları, işəgötürən payı (%)', 'Aylıq iş saatı (bir nəfər)', 'İş vaxtından artıq saat (ayda, cəmi)', 'Artıq saatın haqqı (₼)', 'Cəmi xərc (₼)', 'Cəmi saat'];
  heads.forEach((h, i) => sh.set(`${col(i)}7`, h, 'head'));
  sh.height(7, 46);
  const ex = [
    ['Zal', 'Ofisiant', 4, 600, 208, 20, 4],
    ['Zal', 'Kassir', 1, 650, 208, 0, 4],
    ['Zal', 'Administrator', 1, 900, 208, 10, 6],
    ['Mətbəx', 'Aşpaz', 2, 1100, 208, 16, 7],
    ['Mətbəx', 'Köməkçi aşpaz', 2, 700, 208, 12, 4.5],
    ['Mətbəx', 'Qabyuyan', 1, 500, 208, 0, 3],
  ];
  const first = 8, last = 27;
  for (let r = first; r <= last; r++) {
    const e = ex[r - first];
    sh.set(`A${r}`, e ? e[0] : '', 'inText');
    sh.set(`B${r}`, e ? e[1] : '', 'inText');
    sh.set(`C${r}`, e ? e[2] : '', 'inInt');
    sh.set(`D${r}`, e ? e[3] : '', 'inMoney');
    sh.set(`E${r}`, '', 'inPct');
    sh.set(`F${r}`, e ? e[4] : '', 'inInt');
    sh.set(`G${r}`, e ? e[5] : '', 'inInt');
    sh.set(`H${r}`, e ? e[6] : '', 'inMoney');
    sh.set(`I${r}`, { f: `IF(B${r}="","",N(C${r})*N(D${r})*(1+N(E${r}))+N(G${r})*N(H${r}))` }, 'fMoney');
    sh.set(`J${r}`, { f: `IF(B${r}="","",N(C${r})*N(F${r})+N(G${r}))` }, 'fInt');
  }
  sh.list(`A${first}:A${last}`, ['Zal', 'Mətbəx', 'Digər']);
  sh.set(`H${last + 1}`, 'Cəmi', 'totLabel').set(`I${last + 1}`, { f: `SUM(I${first}:I${last})` }, 'totMoney').set(`J${last + 1}`, { f: `SUM(J${first}:J${last})` }, 'totMoney');
  const T = `I${last + 1}`, H = `J${last + 1}`;
  sh.set('L7', 'Ayın göstəriciləri', 'head').set('M7', '', 'head');
  const rows = [
    ['Ayın satışı (proqnoz və ya faktiki, ₼)', 32000, 'inMoney', 'labelCell'],
    ['Ayda müştəri sayı', 2600, 'inInt', 'labelCell'],
    ['Zalın əmək haqqı xərci (₼)', { f: `SUMIF(A${first}:A${last},"Zal",I${first}:I${last})` }, 'fMoney', 'labelCell'],
    ['Mətbəxin əmək haqqı xərci (₼)', { f: `SUMIF(A${first}:A${last},"Mətbəx",I${first}:I${last})` }, 'fMoney', 'labelCell'],
    ['Cəmi əmək haqqı xərci (₼)', { f: T }, 'totMoney', 'totLabel'],
    ['Əmək haqqı xərcinin satışa nisbəti', { f: `IF(M8>0,${T}/M8,"")` }, 'totPct', 'totLabel'],
    ['Bir müştəriyə düşən əmək haqqı xərci (₼)', { f: `IF(M9>0,${T}/M9,"")` }, 'fMoney', 'labelCell'],
    ['Bir iş saatına düşən müştəri', { f: `IF(N(${H})>0,M9/${H},"")` }, 'fMoney', 'labelCell'],
    ['Ərzaq maya dəyəri faizi (anbar faylından)', 0.3, 'inPct', 'labelCell'],
    ['Əsas xərc faizi (ərzaq + əmək haqqı)', { f: 'IF(ISNUMBER(M13),M16+M13,"")' }, 'totPct', 'totLabel'],
  ];
  rows.forEach(([l, v, s, ls], i) => { sh.set(`L${8 + i}`, l, ls); sh.set(`M${8 + i}`, v, s); });
  sh.set('L19', '«Sığorta haqları» = işəgötürənin ödədiyi məcburi dövlət sosial sığorta, işsizlikdən sığorta və icbari tibbi sığorta haqları. Dərəcələr əmək haqqının məbləğinə görə pillələrlə dəyişir — faizi mühasibinizdən dəqiqləşdirin; boş qalsa, 0 sayılır. «Əsas xərc» (prime cost) restoranda ən böyük iki xərcin cəmidir: ərzaq və əmək haqqı.', 'note').merge('L19:M23');
  footer(sh, last + 4, 12);
  save('dk-isci-xerci.xlsx', [sh, guide('Əmək haqqı xərcləri', [
    'Hər vəzifəni bir sətirdə yazın: bölmə (Zal, Mətbəx və ya Digər), vəzifə, neçə nəfər və bir nəfərin aylıq əmək haqqı.',
    'İşəgötürənin ödədiyi sığorta haqlarının (məcburi dövlət sosial sığorta, işsizlikdən sığorta, icbari tibbi sığorta) cəmi faizini mühasibinizdən soruşub yazın; boş qalsa, hesaba qatılmır.',
    'Ay ərzində iş vaxtından artıq işlənən cəmi saatı və bir saatın haqqını yazın.',
    'Sağdakı blokda ayın satışını və müştəri sayını yazın: əmək haqqı xərcinin satışa nisbəti, bir müştəriyə düşən xərc və bir iş saatına düşən müştəri hesablanır.',
    'Anbar faylındakı food cost faizini yazsanız, «əsas xərc» (ərzaq + əmək haqqı) faizi görünür.',
    'Növbə planı üçün: dkagency.com.tr/toolkit/personel-planlayici. İşçi dəyişməsinin xərci üçün: dkagency.com.tr/toolkit/staff-retention.',
  ])], 'Əmək haqqı xərcləri — DK Agency şablonu', 'Aylıq əmək haqqı xərcləri, onların satışa nisbəti və əsas xərc');
}

// ═══ 3. Büdcə və faktiki ═══════════════════════════════════════════════════
{
  const sh = new Sheet('Büdcə', { widths: [34, 15, 15, 15, 12, 34], logo: true, freeze: 'A8', tab: 'FF0F172A' });
  header(sh, 5, 'Büdcə və faktiki xərclər', 'Ayın planı ilə faktiki xərci yan-yana: fərq ₼ və % ilə. Ay: __________   Məkan: __________');
  legend(sh, 5);
  ['Xərc maddəsi', 'Büdcə (₼)', 'Faktiki (₼)', 'Fərq (₼)', 'Fərq (%)', 'Qeyd'].forEach((h, i) => sh.set(`${col(i)}7`, h, 'head'));
  sh.height(7, 30);
  const groups = [
    ['Məkan', [['İcarə', 3500, 3500], ['Kommunal (işıq, qaz, su)', 900, 1040], ['İnternet və telefon', 80, 80]]],
    ['İşçilər', [['Əmək haqqı', 9500, 9800], ['Sığorta haqları (işəgötürən payı)', '', ''], ['İşçi yeməyi', 600, 650], ['Təlim', 200, 0]]],
    ['Ərzaq və qablaşdırma', [['Ərzaq alışı', 9000, 9600], ['İçkilər', 1200, 1150], ['Qablaşdırma (paket, qab)', 500, 620]]],
    ['Satış kanalları', [['Delivery komissiyası (Wolt, Bolt Food, Yango)', 1400, 1580], ['Bank kartı ilə ödəniş komissiyası', 300, 310]]],
    ['Marketinq', [['Reklam', 500, 450], ['Sosial media və foto', 300, 300]]],
    ['Texnologiya', [['Kassa (POS) və proqram təminatı', 150, 150], ['Digər proqramlar', 50, 50]]],
    ['Əməliyyat', [['Təmizlik vasitələri', 250, 280], ['Təmir və servis', 300, 520], ['Lisenziya və icazələr', 100, 100], ['Mühasibat xidməti', 300, 300]]],
    ['Digər', [['Digər xərclər', 200, 260]]],
  ];
  let r = 8;
  const subtotals = [];
  for (const [g, items] of groups) {
    sh.set(`A${r}`, g, 'section'); r += 1;
    const a = r;
    for (const [name, b, f] of items) {
      sh.set(`A${r}`, name, 'labelCell');
      sh.set(`B${r}`, b, 'inMoney');
      sh.set(`C${r}`, f, 'inMoney');
      sh.set(`D${r}`, { f: `IF(AND(B${r}="",C${r}=""),"",N(C${r})-N(B${r}))` }, 'fMoney');
      sh.set(`E${r}`, { f: `IF(N(B${r})=0,"",(N(C${r})-N(B${r}))/B${r})` }, 'fPct');
      sh.set(`F${r}`, '', 'inText');
      r += 1;
    }
    sh.set(`A${r}`, `${g} — cəmi`, 'totLabel');
    sh.set(`B${r}`, { f: `SUM(B${a}:B${r - 1})` }, 'totMoney');
    sh.set(`C${r}`, { f: `SUM(C${a}:C${r - 1})` }, 'totMoney');
    sh.set(`D${r}`, { f: `C${r}-B${r}` }, 'totMoney');
    sh.set(`E${r}`, { f: `IF(B${r}=0,"",(C${r}-B${r})/B${r})` }, 'totPct');
    subtotals.push(r);
    r += 2;
  }
  sh.set(`A${r}`, 'BÜTÜN XƏRCLƏR', 'totLabel');
  sh.set(`B${r}`, { f: subtotals.map((x) => `B${x}`).join('+') }, 'totMoney');
  sh.set(`C${r}`, { f: subtotals.map((x) => `C${x}`).join('+') }, 'totMoney');
  sh.set(`D${r}`, { f: `C${r}-B${r}` }, 'totMoney');
  sh.set(`E${r}`, { f: `IF(B${r}=0,"",(C${r}-B${r})/B${r})` }, 'totPct');
  sh.over(`D8:E${r}`, 'AND(ISNUMBER(D8),D8>0)', 0);
  sh.over(`D8:E${r}`, 'AND(ISNUMBER(D8),D8<0)', 1);
  sh.set(`A${r + 2}`, 'Qırmızı = büdcədən çox xərclənib, yaşıl = büdcədən az. Fərq 10%-dən böyükdürsə, «Qeyd» sütununda səbəbini yazın — gələn ayın büdcəsi daha dəqiq olar.', 'note').merge(`A${r + 2}:F${r + 3}`);
  footer(sh, r + 5, 5);
  save('dk-budce-ve-faktiki.xlsx', [sh, guide('Büdcə və faktiki xərclər', [
    'Ayın əvvəlində hər xərc maddəsi üçün planladığınız məbləği «Büdcə» sütununa yazın.',
    'Ayın sonunda bank çıxarışı və qaimələrə görə faktiki məbləği «Faktiki» sütununa yazın.',
    '«Fərq» özü hesablanır: qırmızı rəqəm büdcədən çox xərcləndiyini, yaşıl rəqəm az xərcləndiyini göstərir.',
    'Lazım olmayan sətri boş saxlayın; yeni maddə lazımdırsa, «Digər xərclər» sətrindən istifadə edin və «Qeyd» sütununda adını yazın.',
    'Böyük fərqlərin səbəbini «Qeyd» sütununda yazın və gələn ayın büdcəsini buna görə düzəldin.',
    'Mənfəət-zərəri görmək üçün «12 aylıq mənfəət-zərər» şablonundan və ya dkagency.com.tr/toolkit/pnl alətindən istifadə edin.',
  ])], 'Büdcə və faktiki xərclər — DK Agency şablonu', 'Aylıq büdcə, faktiki xərc və fərq');
}

// ═══ 4. 12 aylıq mənfəət-zərər ═════════════════════════════════════════════
{
  const MONTHS = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
  const sh = new Sheet('Mənfəət-zərər', { widths: [32, ...MONTHS.map(() => 11.5), 13, 11], logo: true, freeze: 'B8', tab: 'FF0F172A' });
  const TOT = 13, PCT = 14; // column indexes: N = Cəmi, O = satışın %-i
  header(sh, PCT, '12 aylıq mənfəət-zərər hesabatı', 'Hər ayın satışı, xərcləri və mənfəəti; sağda ilin cəmi və satışın faizi. İl: ______   Məkan: __________');
  legend(sh, 5);
  sh.set('A7', 'Maddə', 'head');
  MONTHS.forEach((m, i) => sh.set(`${col(i + 1)}7`, m, 'head'));
  sh.set(`${col(TOT)}7`, 'İlin cəmi', 'head').set(`${col(PCT)}7`, 'Satışın %-i', 'head');
  sh.height(7, 28);
  let r = 8;
  const rowsAt = {};
  const seasonal = [0.85, 0.85, 0.95, 1, 1.05, 1.1, 1.15, 1.15, 1.05, 1, 0.95, 1.1];
  // `fixed` = the same every month (rent, salaries, software); the rest follows a sample season curve.
  const input = (key, label, base, fixed = false) => {
    sh.set(`A${r}`, label, 'labelCell');
    for (let m = 0; m < 12; m++) sh.set(`${col(m + 1)}${r}`, base ? Math.round(base * (fixed ? 1 : seasonal[m])) : '', 'inMoney');
    sh.set(`${col(TOT)}${r}`, { f: `SUM(B${r}:M${r})` }, 'fMoney');
    rowsAt[key] = r; r += 1;
  };
  const total = (key, label, expr, style = 'totMoney') => {
    sh.set(`A${r}`, label, 'totLabel');
    for (let m = 0; m < 12; m++) {
      const c = col(m + 1);
      sh.set(`${c}${r}`, { f: expr(c) }, style);
    }
    sh.set(`${col(TOT)}${r}`, { f: style === 'totPct' ? expr(col(TOT)) : `SUM(B${r}:M${r})` }, style);
    rowsAt[key] = r; r += 1;
  };
  const section = (label) => { sh.set(`A${r}`, label, 'section'); r += 1; };
  section('GƏLİRLƏR');
  input('s1', 'Zal satışı', 26000);
  input('s2', 'Paket və delivery satışı', 7000);
  input('s3', 'Digər gəlir (tədbir, ketrinq)', 1000);
  total('sales', 'Cəmi gəlir (satış)', (c) => `SUM(${c}${rowsAt.s1}:${c}${rowsAt.s3})`);
  r += 1; section('SATIŞIN MAYA DƏYƏRİ');
  input('c1', 'Ərzaq', 9600);
  input('c2', 'İçkilər', 1300);
  input('c3', 'Qablaşdırma', 650);
  total('cogs', 'Cəmi satışın maya dəyəri', (c) => `SUM(${c}${rowsAt.c1}:${c}${rowsAt.c3})`);
  total('gp', 'Ümumi (brüt) mənfəət', (c) => `${c}${rowsAt.sales}-${c}${rowsAt.cogs}`);
  r += 1; section('ƏMƏK HAQQI XƏRCLƏRİ');
  input('l1', 'Əmək haqqı', 9800, true);
  input('l2', 'Sığorta haqları (işəgötürən payı)', 0);
  input('l3', 'İşçi yeməyi, təlim və digər', 700);
  total('labor', 'Cəmi əmək haqqı xərcləri', (c) => `SUM(${c}${rowsAt.l1}:${c}${rowsAt.l3})`);
  total('prime', 'Əsas xərc (maya dəyəri + əmək haqqı)', (c) => `${c}${rowsAt.cogs}+${c}${rowsAt.labor}`);
  r += 1; section('ƏMƏLİYYAT XƏRCLƏRİ');
  input('o1', 'İcarə', 3500, true);
  input('o2', 'Kommunal (işıq, qaz, su)', 1000);
  input('o3', 'Delivery komissiyası', 1550);
  input('o4', 'Marketinq', 750, true);
  input('o5', 'Texnologiya (kassa, proqram)', 200, true);
  input('o6', 'Təmir və təmizlik', 700);
  input('o7', 'Digər xərclər', 600);
  total('opex', 'Cəmi əməliyyat xərcləri', (c) => `SUM(${c}${rowsAt.o1}:${c}${rowsAt.o7})`);
  r += 1;
  total('op', 'Əməliyyat mənfəəti', (c) => `${c}${rowsAt.gp}-${c}${rowsAt.labor}-${c}${rowsAt.opex}`);
  input('int', 'Kredit faizləri', 0);
  total('pbt', 'Vergiyə qədər mənfəət', (c) => `${c}${rowsAt.op}-${c}${rowsAt.int}`);
  input('tax', 'Vergi (mənfəət vergisi və ya sadələşdirilmiş vergi)', 0);
  total('net', 'XALİS MƏNFƏƏT', (c) => `${c}${rowsAt.pbt}-${c}${rowsAt.tax}`);
  r += 1; section('NİSBƏTLƏR (satışın faizi)');
  total('pc', 'Maya dəyəri faizi', (c) => `IF(N(${c}${rowsAt.sales})=0,"",${c}${rowsAt.cogs}/${c}${rowsAt.sales})`, 'totPct');
  total('pl', 'Əmək haqqı xərcləri faizi', (c) => `IF(N(${c}${rowsAt.sales})=0,"",${c}${rowsAt.labor}/${c}${rowsAt.sales})`, 'totPct');
  total('pp', 'Əsas xərc faizi', (c) => `IF(N(${c}${rowsAt.sales})=0,"",${c}${rowsAt.prime}/${c}${rowsAt.sales})`, 'totPct');
  total('pn', 'Xalis mənfəət faizi', (c) => `IF(N(${c}${rowsAt.sales})=0,"",${c}${rowsAt.net}/${c}${rowsAt.sales})`, 'totPct');
  const lastRow = r - 1;
  // «Satışın %-i» column for every money row
  const S_ = `${col(TOT)}${rowsAt.sales}`;
  for (let rr = 8; rr < rowsAt.pc; rr++) {
    const nameCell = sh.cells.get(`A${rr}`);
    if (!nameCell || nameCell.v === undefined || ['GƏLİRLƏR', 'SATIŞIN MAYA DƏYƏRİ', 'ƏMƏK HAQQI XƏRCLƏRİ', 'ƏMƏLİYYAT XƏRCLƏRİ'].includes(nameCell.v)) continue;
    sh.set(`${col(PCT)}${rr}`, { f: `IF(N(${S_})=0,"",${col(TOT)}${rr}/${S_})` }, 'fPct');
  }
  sh.over(`B${rowsAt.op}:N${rowsAt.net}`, `AND(ISNUMBER(B${rowsAt.op}),B${rowsAt.op}<0)`, 0);
  sh.set(`A${lastRow + 2}`, '«Əsas xərc» (prime cost) restoranın ən böyük iki xərcidir: satışın maya dəyəri və əmək haqqı. Hər ay faizini izləyin — artırsa, səbəbi menyu qiymətində, porsiyada, itkidə və ya növbə planındadır. Mənfi mənfəət qırmızı görünür.', 'note').merge(`A${lastRow + 2}:O${lastRow + 3}`);
  footer(sh, lastRow + 5, PCT);
  save('dk-menfeet-zerer-12-ay.xlsx', [sh, guide('12 aylıq mənfəət-zərər hesabatı', [
    'Hər ayın sütununa həmin ayın satışını üç sətirdə yazın: zal, paket/delivery və digər gəlir.',
    '«Satışın maya dəyəri» sətirlərinə ərzaq, içki və qablaşdırma xərcini yazın (anbar şablonundakı «istifadə olunan ərzağın maya dəyəri» buraya gəlir).',
    'Əmək haqqı xərclərini və əməliyyat xərclərini (icarə, kommunal, delivery komissiyası və s.) yazın; kredit faizi və vergini ayrıca sətirlərdə.',
    'Cəmlər, ümumi mənfəət, əsas xərc, əməliyyat mənfəəti, vergiyə qədər və xalis mənfəət özü hesablanır; sağda ilin cəmi və satışın faizi görünür.',
    'Aşağıdakı «Nisbətlər» blokunda maya dəyəri, əmək haqqı, əsas xərc və xalis mənfəət faizlərini aydan-aya müqayisə edin.',
    'Bir ayın mənfəət-zərərini sürətli hesablamaq üçün: dkagency.com.tr/toolkit/pnl.',
  ])], '12 aylıq mənfəət və zərər hesabatı — DK Agency şablonu', 'Aylıq gəlir, xərclər, əsas xərc və mənfəət');
}

// ═══ 5. Balans ═════════════════════════════════════════════════════════════
{
  const sh = new Sheet('Balans', { widths: [40, 17, 17, 4, 40, 14], logo: true, freeze: 'A8', tab: 'FF0F172A' });
  header(sh, 5, 'Balans hesabatı', 'Biznesin nəyi var (aktivlər), nə borcludur (öhdəliklər) və sahibin payı (kapital). Tarix: __________');
  legend(sh, 5);
  ['Maddə', 'Əvvəlki il (₼)', 'Bu il (₼)'].forEach((h, i) => sh.set(`${col(i)}7`, h, 'head'));
  sh.height(7, 28);
  let r = 8;
  const at = {};
  const block = (key, title, items) => {
    sh.set(`A${r}`, title, 'section'); r += 1;
    const a = r;
    for (const [name, p, c] of items) {
      sh.set(`A${r}`, name, 'labelCell'); sh.set(`B${r}`, p, 'inMoney'); sh.set(`C${r}`, c, 'inMoney'); r += 1;
    }
    sh.set(`A${r}`, `${title} — cəmi`, 'totLabel');
    sh.set(`B${r}`, { f: `SUM(B${a}:B${r - 1})` }, 'totMoney');
    sh.set(`C${r}`, { f: `SUM(C${a}:C${r - 1})` }, 'totMoney');
    at[key] = r; r += 2;
  };
  block('ca', 'Qısamüddətli aktivlər', [['Kassadakı nağd pul vəsaitləri', 1200, 1800], ['Bank hesablarındakı pul vəsaitləri', 6500, 9200], ['Ehtiyatlar (ərzaq və materiallar)', 3800, 4100], ['Gələcək dövrlərin xərcləri (qabaqcadan ödənilmiş icarə və s.)', 3500, 3500], ['Debitor borcları (sizə borclu olanlar)', 600, 900]]);
  block('fa', 'Uzunmüddətli aktivlər', [['Əsas vəsaitlər: mətbəx avadanlığı', 38000, 34000], ['Əsas vəsaitlər: mebel və inventar', 15000, 13500], ['İcarəyə götürülmüş binada təmir və quraşdırma', 22000, 19000], ['Nəqliyyat vasitələri', 0, 0], ['Qeyri-maddi aktivlər (proqram, franchise haqqı)', 5000, 4500]]);
  sh.set(`A${r}`, 'CƏMİ AKTİVLƏR', 'totLabel');
  sh.set(`B${r}`, { f: `B${at.ca}+B${at.fa}` }, 'totMoney').set(`C${r}`, { f: `C${at.ca}+C${at.fa}` }, 'totMoney');
  at.assets = r; r += 2;
  block('cl', 'Qısamüddətli öhdəliklər', [['Təchizatçılara kreditor borcları', 4200, 3600], ['İcarə üzrə borc', 0, 0], ['Kommunal xidmətlər üzrə borc', 600, 400], ['Vergi və digər məcburi ödənişlər üzrə öhdəliklər', 900, 1100], ['Əmək haqqı üzrə borc', 2500, 2600], ['Qısamüddətli kreditlər', 3000, 1500]]);
  block('ll', 'Uzunmüddətli öhdəliklər', [['Uzunmüddətli bank kreditləri', 20000, 15000], ['Lizinq öhdəlikləri', 0, 0], ['Digər uzunmüddətli öhdəliklər', 0, 0]]);
  block('eq', 'Kapital', [['Nizamnamə kapitalı (təsisçinin qoyuluşu)', 50000, 50000], ['Bölüşdürülməmiş mənfəət (ödənilməmiş zərər)', 14400, 16300], ['Digər kapital', 0, 0]]);
  sh.set(`A${r}`, 'CƏMİ ÖHDƏLİKLƏR VƏ KAPİTAL', 'totLabel');
  sh.set(`B${r}`, { f: `B${at.cl}+B${at.ll}+B${at.eq}` }, 'totMoney').set(`C${r}`, { f: `C${at.cl}+C${at.ll}+C${at.eq}` }, 'totMoney');
  at.le = r; r += 1;
  sh.set(`A${r}`, 'Yoxlama: aktivlər − (öhdəliklər + kapital)', 'labelCell');
  sh.set(`B${r}`, { f: `B${at.assets}-B${at.le}` }, 'fMoney').set(`C${r}`, { f: `C${at.assets}-C${at.le}` }, 'fMoney');
  sh.over(`B${r}:C${r}`, `ROUND(B${r},2)<>0`, 0);
  const check = r; r += 1;
  sh.set(`A${r}`, 'Yoxlama 0 olmalıdır. 0 deyilsə, hansısa maddə yazılmayıb və ya iki dəfə yazılıb.', 'note').merge(`A${r}:C${r}`);
  void check;
  // Ratios (E:F)
  sh.set('E7', 'Əmsallar (bu il)', 'head').set('F7', '', 'head');
  const ratios = [
    ['Cari likvidlik əmsalı (qısamüddətli aktivlər ÷ qısamüddətli öhdəliklər)', `IF(C${at.cl}=0,"",C${at.ca}/C${at.cl})`, 'totMoney'],
    ['Dövriyyə kapitalı, ₼ (qısamüddətli aktivlər − qısamüddətli öhdəliklər)', `C${at.ca}-C${at.cl}`, 'fMoney'],
    ['Borc əmsalı (cəmi öhdəliklər ÷ cəmi aktivlər)', `IF(C${at.assets}=0,"",(C${at.cl}+C${at.ll})/C${at.assets})`, 'fPct'],
    ['Öhdəliklərin kapitala nisbəti (cəmi öhdəliklər ÷ kapital)', `IF(C${at.eq}=0,"",(C${at.cl}+C${at.ll})/C${at.eq})`, 'fMoney'],
  ];
  ratios.forEach(([l, f, s], i) => { sh.set(`E${8 + i}`, l, 'labelCell'); sh.set(`F${8 + i}`, { f }, s); sh.height(8 + i, 30); });
  sh.set('E13', 'Cari likvidlik əmsalı 1-dən aşağıdırsa, yaxın aylarda ödəniləcək borclar əldəki puldan və anbardan çoxdur. Borc əmsalı yüksəldikcə biznes krediterlərdən daha çox asılıdır. Rəqəmləri mühasibinizlə birlikdə yoxlayın.', 'note').merge('E13:F18');
  footer(sh, r + 2, 5);
  save('dk-balans.xlsx', [sh, guide('Balans hesabatı', [
    'İlin sonundakı (və ya istədiyiniz tarixdəki) vəziyyəti yazın; «Əvvəlki il» sütunu müqayisə üçündür.',
    'Aktivlər: kassa və bankdakı pul, ehtiyatlar, əsas vəsaitlər (avadanlıq, mebel), təmir — biznesin nəyi var.',
    'Öhdəliklər: təchizatçıya, vergi və məcburi ödənişlərə, əmək haqqına və banka borclar. Kapital: nizamnamə kapitalı (sahibin qoyduğu pul) və bölüşdürülməmiş mənfəət.',
    '«Yoxlama» sətri 0 olmalıdır — aktivlər həmişə öhdəliklər və kapitalın cəminə bərabərdir.',
    'Sağdakı əmsallar biznesin borcunu ödəmə qabiliyyətini göstərir; mənasını qeyddə oxuyun.',
    'Balansı ildə ən azı bir dəfə mühasibinizlə birlikdə doldurun. Aylıq nəticə üçün: «12 aylıq mənfəət-zərər» şablonu.',
  ])], 'Balans hesabatı — DK Agency şablonu', 'Aktivlər, öhdəliklər, kapital və əsas göstəricilər');
}
