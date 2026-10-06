/**
 * TASK-0498: WhatsApp ixrac parseri + rule-based təsnifat + ZIP oxuyucu + idxal planı.
 * Yalnız SİNTETİK fixture-lar (real qrup ixracından heç bir ad/nömrə/mətn yoxdur).
 * Run with: npx tsx e2e/supply-import.test.ts
 * Exits 0 on success, 1 on failure.
 */

import { deflateRawSync, inflateRawSync } from 'node:zlib';

import { formatPhone, groupNameFromFileName } from '../lib/supply/categories';
import { matchSuppliers, suppliersToCsv, type SupplierRow } from '../lib/supply/repository';
import {
  buildImportPlan,
  classifyMessage,
  extractPhones,
  guessGroupName,
  messageHash,
  normalizeAzPhone,
  parseWhatsAppChat,
  productGroups,
  senderPhone,
  supplierDedupeKey,
  windowStart,
} from '../lib/supply/wa-parser';
import { extractChatText, looksLikeZip, ZipError } from '../lib/supply/zip';

let failures = 0;
let checks = 0;
function eq<T>(actual: T, expected: T, label: string) {
  checks++;
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    failures++;
    console.error(`FAIL: ${label}\n  gözlənilən: ${e}\n  alınan:     ${a}`);
  }
}
function ok(condition: boolean, label: string) {
  eq(condition, true, label);
}

const LRM = '‎';

// ── 1. Parser: başlıq, çoxsətirli mesaj, U+200E, sistem mesajı ─────────
const CHAT = [
  `${LRM}[01.09.26 10:00:00] Test Qrup: ${LRM}Mesajlar və zənglər uçtan uca şifrələnir.`,
  `[02.09.26 09:15:30] Ali Təchizat: Topdan toyuq əti və balıq təklif edirik!`,
  `Çatdırılma pulsuz.`,
  `Əlaqə: 050 123 45 67`,
  `[02.09.26 09:20:00] ~ Rauf Kafe: Salam, kimdə dondurulmuş kartof var? Hardan tapım?`,
  `[03.09.26 11:00:00] Nigar: ${LRM}görüntü dahil edilmedi`,
  `[03.09.26 11:05:00] Nigar: Ok`,
  `${LRM}[03.09.26 12:00:00] Test Qrup: ${LRM}Yeni Üzv gruba katıldı`,
  `[04.09.26 08:00:00] +994 55 111 22 33: Paket, karton qutu və birdəfəlik stəkan istehsal edirik, qiymətlər: 0.05 AZN`,
  `[05.09.26 08:00:00] Ali Təchizat: Topdan toyuq əti və balıq təklif edirik!`,
  `Çatdırılma pulsuz.`,
  `Əlaqə: 050 123 45 67`,
  `[05.09.26 18:00:00] Kamran: Salam, işlənmiş sənaye soyuducusu lazımdır, kimdə var?`,
  `[06.09.26 10:00:00] Leyla: Restoranımıza təcrübəli aşpaz tələb olunur, maaş razılaşma ilə`,
  `[06.09.26 12:00:00] Media Pro: SMM, reklam və menyu dizaynı xidmətlərimiz: əlaqə saxlayın`,
  `[07.09.26 09:00:00] Rauf Kafe: Salam, kimdə dondurulmuş kartof var? Hardan tapım?`,
  `[01.01.26 09:00:00] Köhnə Satıcı: Topdan un və çörək satırıq, çatdırılma var`,
].join('\r\n');

const messages = parseWhatsAppChat(CHAT, 'Test Qrup');
eq(messages.length, 13, 'parser: 13 mesaj (başlıqsız sətirlər davamdır)');
eq(
  messages[1].text,
  'Topdan toyuq əti və balıq təklif edirik!\nÇatdırılma pulsuz.\nƏlaqə: 050 123 45 67',
  'çoxsətirli mesaj'
);
eq(messages[1].date, '2026-09-02', 'tarix dd.mm.yy → YYYY-MM-DD');
eq(messages[1].phones, ['+994501234567'], 'mətndəki telefon normallaşdırılır');
eq(messages[2].sender, 'Rauf Kafe', 'göndərəndəki "~ " silinir');
ok(!messages.some((m) => m.text.includes(LRM)), 'U+200E işarələri silinir');

// ── 2. Təsnifat ───────────────────────────────────────────────────────
eq(classifyMessage(messages[1].text), 'techizatci-teklif', 'təchizatçı təklifi');
eq(classifyMessage(messages[2].text), 'sorgu:mehsul', 'alıcı sorğusu (məhsul)');
eq(classifyMessage(messages[3].text), 'sistem/media', 'media/sistem mesajı');
eq(classifyMessage(messages[4].text), 'qisa/sohbet', 'qısa söhbət');
eq(classifyMessage(messages[5].text), 'qrup-admin', 'qrupa qoşulma = admin mesajı');
eq(classifyMessage(messages[8].text), 'sorgu:ekipman', 'avadanlıq sorğusu');
eq(classifyMessage(messages[9].text), 'vakansiya', 'vakansiya');
eq(classifyMessage(messages[10].text), 'xidmet-teklif', 'xidmət təklifi');
// Python re.I: i ↔ ı bərabərdir — «lazimdi» `lazım(dır|di)` qaydasına düşməlidir.
eq(
  classifyMessage('salam toyuq petenesi lazimdi kimde varsa yazsin'),
  'sorgu:mehsul',
  'i/ı qatlanması (Python re.I)'
);
// Python len() kod nöqtəsi sayır: 22 hərf + boşluq + emoji = 24 < 25.
eq(classifyMessage('Turbo sef salmisiz bel 🤣'), 'qisa/sohbet', 'emoji uzunluğu kod nöqtəsi ilə');
// Unicode söz sərhədi: `\bət\b` JS-də ASCII \b ilə heç vaxt tutmazdı.
eq(productGroups('Təzə ət və toyuq'), ['et'], 'Unicode \\b — «ət» tanınır');
ok(!productGroups('Bu gün hamı rahatdır').includes('et'), '«rahatdır» içində «ət» yoxdur');
eq(
  productGroups('Salam, işlənmiş soyuducu lazımdır', 'sorgu:ekipman'),
  ['avadanliq'],
  'ekipman → avadanlıq'
);
ok(productGroups('SMM xidmətlərimiz', 'xidmet-teklif').includes('xidmet'), 'xidmət → xidmet qrupu');

// ── 3. Telefonlar ─────────────────────────────────────────────────────
eq(
  extractPhones('Zəng: +994 (55) 123-45-67, 0701234567 və 994 99 123 45 67'),
  ['+994551234567', '+994701234567', '+994991234567'],
  'AZ telefon formatları'
);
eq(extractPhones('Qiymət 1234567 AZN, kod 12345'), [], 'telefon olmayan rəqəmlər tutulmur');
eq(normalizeAzPhone('050-123-45-67'), '+994501234567', 'normalizeAzPhone');
eq(senderPhone('+994 55 111 22 33'), '+994551112233', 'nömrə göndərən → telefon');
eq(senderPhone('Ali Təchizat'), null, 'ad göndərən → telefon yoxdur');
eq(supplierDedupeKey('+994 55 111 22 33'), 'p:551112233', 'dedupe açarı: nömrə');
eq(supplierDedupeKey('  Ali   Təchizat '), 'n:ali təchizat', 'dedupe açarı: ad');
eq(formatPhone('+994501234567'), '+994 50 123 45 67', 'formatPhone');

// ── 4. İdxal planı: pəncərə, aqreqasiya, dedupe ─────────────────────
const plan = buildImportPlan(messages, '2026-08-01');
eq(plan.messagesInWindow, 12, 'pəncərədən köhnə mesaj çıxır');
const ali = plan.suppliers.find((s) => s.displayName === 'Ali Təchizat');
ok(Boolean(ali), 'təchizatçı yaranır');
eq(ali?.messageHashes.length, 2, 'eyni təklif 2 dəfə (fərqli vaxt) = 2 paylaşım');
eq(ali?.sampleOffers.length, 1, 'nümunə təkliflər mətnə görə unikal');
eq(ali?.categories.sort(), ['et'], 'təchizatçı kateqoriyası');
eq(ali?.firstSeen, '2026-09-02T05:15:30.000Z', 'firstSeen Bakı vaxtı (+04:00)');
const numberSender = plan.suppliers.find((s) => s.dedupeKey === 'p:551112233');
eq(numberSender?.phones, ['+994551112233'], 'nömrə göndərənin telefonu təchizatçıya düşür');
ok(numberSender?.categories.includes('qablasdirma') ?? false, 'qablaşdırma kateqoriyası');
ok(
  plan.suppliers.some((s) => s.displayName === 'Media Pro'),
  'xidmət təchizatçısı bazaya düşür'
);
ok(!plan.suppliers.some((s) => s.displayName === 'Leyla'), 'vakansiya təchizatçı deyil');
eq(plan.requests.length, 2, 'eyni sorğu iki dəfə → 1 tələb + avadanlıq tələbi');
eq(plan.requests.map((r) => r.requestType).sort(), ['ekipman', 'mehsul'], 'tələb növləri');
eq(
  plan.requests.find((r) => r.requestType === 'mehsul')?.postedAt,
  '2026-09-07T05:00:00.000Z',
  'dublikat tələbdən ən yenisi qalır'
);
eq(plan.reference.offerSenders, 3, 'referans: təklif göndərənlər (ekipman xaric)');
eq(plan.reference.requestUnique, 2, 'referans: unikal tələblər');
eq(messageHash(messages[1]), messageHash({ ...messages[1] }), 'mesaj hash-i deterministikdir');
eq(windowStart(6, new Date('2026-10-06T08:00:00Z')), '2026-04-06', 'windowStart 6 ay');
eq(guessGroupName('WhatsApp Chat - HoReCa Test.zip', []), 'HoReCa Test', 'qrup adı fayl adından');
eq(guessGroupName('_chat.txt', messages), 'Test Qrup', 'qrup adı ilk sistem mesajından');
eq(groupNameFromFileName('_chat.txt'), '', 'ümumi fayl adı → boş');

// ── 5. Uyğunlaşdırma və CSV ──────────────────────────────────────────
const base = { company: null, phones: [], status: 'yeni' };
const matches = matchSuppliers(
  ['et', 'yag'],
  [
    { ...base, id: 1, displayName: 'A', categories: ['et'], lastSeen: new Date('2026-09-01') },
    {
      ...base,
      id: 2,
      displayName: 'B',
      categories: ['et', 'yag'],
      lastSeen: new Date('2026-08-01'),
    },
    { ...base, id: 3, displayName: 'C', categories: ['un'], lastSeen: new Date('2026-09-05') },
    {
      ...base,
      id: 4,
      displayName: 'D',
      categories: ['et'],
      lastSeen: new Date('2026-09-03'),
      status: 'imtina',
    },
    { ...base, id: 5, displayName: 'E', categories: ['yag'], lastSeen: new Date('2026-09-04') },
  ]
);
eq(
  matches.map((m) => m.id),
  [2, 5, 1],
  'uyğunlar: kəsişmə ↓, son aktivlik ↓, imtina xaric'
);
eq(
  matchSuppliers(
    [],
    [{ ...base, id: 1, displayName: 'A', categories: ['et'], lastSeen: new Date() }]
  ),
  [],
  'kateqoriyasız tələb → 0'
);

const csvRow: SupplierRow = {
  id: 1,
  displayName: '=HYPERLINK("x")',
  company: 'Şirkət, MMC',
  phones: ['+994501234567'],
  categories: ['et'],
  sourceGroups: ['Qrup'],
  firstSeen: new Date('2026-09-01T00:00:00Z'),
  lastSeen: new Date('2026-09-02T00:00:00Z'),
  postCount: 2,
  sampleOffers: [],
  status: 'yeni',
  publicConsent: false,
  notes: null,
};
const csv = suppliersToCsv([csvRow], ['name', 'company']);
ok(csv.startsWith('﻿'), 'CSV Excel üçün BOM ilə başlayır');
ok(csv.includes(`"'=HYPERLINK(""x"")"`), 'CSV formula injection qorunur');
ok(csv.includes('"Şirkət, MMC"'), 'CSV vergüllü xana dırnaqlanır');

// ── 6. ZIP oxuyucu (öz ZIP-imizi yığırıq) ───────────────────────────
function buildZip(files: Array<{ name: string; data: Buffer; deflate: boolean }>): Buffer {
  const locals: Buffer[] = [];
  const centrals: Buffer[] = [];
  let offset = 0;
  for (const file of files) {
    const name = Buffer.from(file.name, 'utf8');
    const body = file.deflate ? deflateRawSync(file.data) : file.data;
    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6);
    local.writeUInt16LE(file.deflate ? 8 : 0, 8);
    local.writeUInt32LE(body.length, 18);
    local.writeUInt32LE(file.data.length, 22);
    local.writeUInt16LE(name.length, 26);
    locals.push(local, name, body);
    const central = Buffer.alloc(46);
    central.writeUInt32LE(0x02014b50, 0);
    central.writeUInt16LE(0x0800, 8);
    central.writeUInt16LE(file.deflate ? 8 : 0, 10);
    central.writeUInt32LE(body.length, 20);
    central.writeUInt32LE(file.data.length, 24);
    central.writeUInt16LE(name.length, 28);
    central.writeUInt32LE(offset, 42);
    centrals.push(central, name);
    offset += 30 + name.length + body.length;
  }
  const cd = Buffer.concat(centrals);
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(files.length, 8);
  eocd.writeUInt16LE(files.length, 10);
  eocd.writeUInt32LE(cd.length, 12);
  eocd.writeUInt32LE(offset, 16);
  return Buffer.concat([...locals, cd, eocd]);
}
function source(buffer: Buffer) {
  return {
    size: buffer.length,
    read: async (o: number, l: number) => buffer.subarray(o, o + l),
    inflateRaw: async (d: Uint8Array) => inflateRawSync(d),
  };
}

async function zipChecks() {
  const zip = buildZip([
    { name: '00001-PHOTO.jpg', data: Buffer.alloc(2048, 7), deflate: false },
    { name: '_chat.txt', data: Buffer.from(CHAT, 'utf8'), deflate: true },
  ]);
  ok(looksLikeZip(zip.subarray(0, 4)), 'ZIP imzası tanınır');
  eq(await extractChatText(source(zip)), CHAT, 'ZIP-dən _chat.txt (deflate) çıxarılır');
  const noChat = buildZip([{ name: 'a.jpg', data: Buffer.alloc(10), deflate: false }]);
  let code = '';
  try {
    await extractChatText(source(noChat));
  } catch (error) {
    code = error instanceof ZipError ? error.code : 'other';
  }
  eq(code, 'no_chat', '_chat.txt olmayan ZIP → no_chat');
  let notZip = '';
  try {
    await extractChatText(source(Buffer.from('salam dünya, bu zip deyil')));
  } catch (error) {
    notZip = error instanceof ZipError ? error.code : 'other';
  }
  eq(notZip, 'not_zip', 'ZIP olmayan fayl → not_zip');
}

zipChecks()
  .then(() => {
    if (failures > 0) {
      console.error(`\n${failures}/${checks} yoxlama FAIL`);
      process.exit(1);
    }
    console.log(`supply-import: ${checks}/${checks} PASS`);
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
