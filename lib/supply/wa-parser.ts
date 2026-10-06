/**
 * TASK-0498 — WhatsApp (iOS) qrup ixracı: parser + rule-based təsnifat + aqreqasiya.
 *
 * Mənbə: sahibin Python prototipi (parse.py / classify2.py / report.py) — məntiq
 * dəyişmədən TypeScript-ə köçürülüb. Mesaj mətni HEÇ BİR xarici AI API-yə
 * göndərilmir (şəxsi məlumat) — təsnifat yalnız regex qaydaları ilədir.
 *
 * Python ilə fərq yaradan yeganə texniki məqam: JS-də `\b` yalnız ASCII söz
 * sərhədidir, Python-da isə Unicode. `\bət\b` kimi qaydalar JS-də heç vaxt
 * tutmazdı, ona görə hər `\b` Unicode lookaround-a çevrilir (`ub()`).
 *
 * Server-only (node:crypto). Client yalnız `categories.ts`-i import edir.
 */

import { createHash } from 'node:crypto';

import { groupNameFromFileName, type RequestType, type SupplyCategory } from './categories';

// ── Regex köməkçiləri ────────────────────────────────────────────────

const WORD = '[\\p{L}\\p{N}_]';
/** Python-un Unicode `\b`-si: söz simvolu ilə qeyri-söz simvolu arasındakı sərhəd. */
const UNICODE_BOUNDARY = `(?:(?<=${WORD})(?!${WORD})|(?<!${WORD})(?=${WORD}))`;

function ub(source: string): string {
  return source.replace(/\\b/g, UNICODE_BOUNDARY);
}

/**
 * Python `re.I` i/ı/I/İ hərflərini bir-birinə bərabər sayır (sre `_equivalences`:
 * `i`↔`ı`, `İ`→`i`). JS `iu` bunu etmir — «lazimdi» `lazım` qaydasına düşmürdü.
 * Ona görə hər belə hərf `[iıIİ]` sinfinə çevrilir. Qaydaların öz `[...]`
 * siniflərində bu hərflər yoxdur, ona görə sadə əvəzləmə təhlükəsizdir.
 */
function foldTurkicI(source: string): string {
  return source.replace(/[iıIİ]/g, '[iıIİ]');
}

/** Python `re.compile('|'.join(ws), re.I)` ekvivalenti. */
function rx(...parts: string[]): RegExp {
  return new RegExp(ub(foldTurkicI(parts.join('|'))), 'iu');
}

// ── Parser ───────────────────────────────────────────────────────────

const HEADER = /^\u200e?\[(\d\d)\.(\d\d)\.(\d\d) (\d\d:\d\d:\d\d)\] ([^:]+?): (.*)$/u;
const PHONE = new RegExp(
  ub(
    '(?:\\+?994|\\b0)[\\s\\-()]*(?:10|12|50|51|55|60|70|77|99)[\\s\\-()]*\\d{3}[\\s\\-]*\\d{2}[\\s\\-]*\\d{2}\\b'
  ),
  'gu'
);

export interface ChatMessage {
  group: string;
  /** YYYY-MM-DD (ixracdakı yerli tarix) */
  date: string;
  /** HH:MM:SS */
  time: string;
  sender: string;
  text: string;
  /** +994XXXXXXXXX formatında, unikal, sıralı */
  phones: string[];
}

/** AZ nömrəsi: son 9 rəqəm → `+994XXXXXXXXX`. */
export function normalizeAzPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '');
  if (digits.length < 9) return null;
  return `+994${digits.slice(-9)}`;
}

export function extractPhones(text: string): string[] {
  const found = new Set<string>();
  for (const match of text.matchAll(PHONE)) {
    const phone = normalizeAzPhone(match[0]);
    if (phone) found.add(phone);
  }
  return [...found].sort();
}

/** Göndərən adı nömrədirsə (kontaktda saxlanmayıb) — onu normallaşdırılmış telefon kimi qaytar. */
export function senderPhone(sender: string): string | null {
  const cleaned = sender.replace(/[\u200e\u202a\u202c\u00a0\u202f~]/g, '').trim();
  if (!/^\+?[\d\s\-()]+$/.test(cleaned)) return null;
  const digits = cleaned.replace(/\D/g, '');
  if (digits.length < 9 || digits.length > 15) return null;
  if (digits.startsWith('994') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('0') && digits.length === 10) return `+994${digits.slice(1)}`;
  if (digits.length === 9) return `+994${digits}`;
  return `+${digits}`;
}

function cleanSender(sender: string): string {
  return sender
    .replace(/[\u200e\u202a\u202c]/g, '')
    .replace(/^[\s~\u00a0\u202f]+/, '')
    .trim();
}

/**
 * `[dd.mm.yy hh:mm:ss] Göndərən: mətn` sətirləri; başlıqsız sətirlər əvvəlki
 * mesajın davamıdır (çoxsətirli mesaj). U+200E işarələri silinir.
 */
export function parseWhatsAppChat(raw: string, group: string): ChatMessage[] {
  const messages: ChatMessage[] = [];
  let current: ChatMessage | null = null;
  const text = raw.replace(/^\ufeff/, '');

  for (const line of text.split(/\r\n|\r|\n/)) {
    const match = HEADER.exec(line);
    if (match) {
      const [, d, mo, y, time, sender, body] = match;
      current = {
        group,
        date: `20${y}-${mo}-${d}`,
        time,
        sender: cleanSender(sender.replace(/^[\u200e ]+|[\u200e ]+$/g, '')),
        text: body,
        phones: [],
      };
      messages.push(current);
    } else if (current) {
      current.text += `\n${line}`;
    }
  }

  for (const message of messages) {
    message.text = message.text.replace(/\u200e/g, '').trim();
    message.phones = extractPhones(message.text);
  }
  return messages;
}

/**
 * Qrup adını təxmin edir: «WhatsApp Chat - <ad>.zip» fayl adından, yoxsa
 * ilk sistem mesajının göndərəni (qrup adı) — yoxsa boş.
 */
export function guessGroupName(
  fileName: string | null | undefined,
  messages: ChatMessage[]
): string {
  const fromFile = groupNameFromFileName(fileName);
  if (fromFile) return fromFile;
  const first = messages[0];
  if (first && /(uçtan uca|end-to-end|сквозн|şifrel)/i.test(first.text))
    return first.sender.slice(0, 120);
  return '';
}

// ── Təsnifat (classify2.py) ──────────────────────────────────────────

const ADMIN = rx(
  'qaydalar',
  'qurupun',
  'qrupun',
  'paylaşım (qadağan|etməməy)',
  'paylaşım yapmak',
  'grubu oluşturdu',
  'sizi ekledi',
  'ekledi$',
  'ayrıldı$',
  'katıldı',
  'çıkardı',
  'bağlantısıyla'
);
const MEDIA = rx(
  'dahil edilmedi',
  'omitted',
  '^<[^>]+eklendi>$',
  'bu mesaj silindi',
  'mesaj silindi'
);
const ROLE = rx(
  'a[şs]paz',
  'a[şs]baz',
  'ofi?siant',
  'barmen',
  'barista',
  'kassir',
  'qab ?yuyan',
  'menecer',
  'administrator',
  'kuryer',
  'xadim',
  'pizza(çı| ustas)',
  'şaurmaçı',
  'köm[əe]kçi',
  'q[əe]nnadı',
  '\\bşef\\b',
  'tandirçi',
  'kababçı',
  'usta ',
  'satıcı',
  'müəllim',
  'повар',
  'официант',
  'бармен',
  'кассир',
  'посудомой',
  'курьер',
  'aşçı',
  'garson',
  'kasiyer',
  'hostes',
  'müdür',
  'direktor'
);
const HIRE = rx(
  'tələb olunur',
  'teleb olunur',
  'lazımdır',
  'lazimdir',
  'lazımdı',
  'axtarırıq',
  'axtarilir',
  'axtarılır',
  'vakansiya',
  'işə (qəbul|qebul)',
  'требует',
  'вакансия',
  'ищем',
  'aranıyor',
  'alınacak',
  'iş (təklif|teklif)'
);
const SEEK = rx(
  'iş axtarıram',
  'is axtariram',
  'işə düzəlm',
  'axtardığım vəzifə',
  'ищу работу',
  'iş arıyorum',
  'işsizəm',
  'təcrübəli .{0,20}(am|əm)\\b',
  'özüm .{0,30}(aşpaz|ofisiant)'
);
const VENUE = rx(
  'restoran',
  'kafe',
  'cafe',
  'obyekt',
  'şadlıq',
  'fast ?food',
  'kofe ?(şop|shop)',
  'coffee',
  'pizza',
  'şaurma',
  'çayxana',
  'mehmanxana',
  'otel',
  'hotel',
  'bar\\b',
  'lounge',
  'keyterinq',
  'mağaza',
  'kafe-bar',
  'кафе',
  'ресторан',
  'biznes',
  'бизнес'
);
const SELL = rx(
  'satılır',
  'satilir',
  'satıram',
  'satiram',
  'продается',
  'продаю',
  'продам',
  'satışa çıxar',
  'satışdadır',
  'satılık'
);
const DEVIR = rx(
  '\\bdevir',
  'dəvir',
  '\\bdevr',
  'təhvil',
  'tehvil',
  'hazır biznes',
  'hazir biznes',
  'devren'
);
const RENT = rx(
  'icarəyə',
  'icareye',
  'icarə',
  'kirayə',
  'kiraye',
  'аренд',
  'сда[её]тся',
  'kiralık'
);
const EQUIP = rx(
  'avadanl',
  'soyuducu',
  '\\bpeç',
  'pech',
  'soba',
  '(kofe|qəhvə) (aparat|maşın)',
  'qabyuyan aparat',
  'friteuz',
  'fritöz',
  'konveksiyon',
  'dönər aparat',
  'ət maşın',
  'mikser',
  'dəzgah',
  'vitrin',
  'manqal',
  'kassa aparat',
  'оборудован',
  'холодил',
  'печь',
  'ekipman',
  'inox',
  'paslanmaz'
);
const OFFER = rx(
  'təklif edirik',
  'teklif edirik',
  'sifariş(lər)? qəbul',
  'sifarisler qebul',
  'istehsal(ı|çı|çısı|çıyıq|ını) ',
  'istehsal edirik',
  'topdan',
  'optom',
  'оптом',
  'qiymət(lər)?(imiz)?\\s*[:\\-]',
  'məhsullarımız',
  'mehsullarimiz',
  'xidmətlərimiz',
  'çatdırılma (var|mövcud|pulsuz)',
  'catdirilma',
  'əlaqə(\\s|:)',
  'предлагаем',
  'доставк',
  'endirim',
  'kampaniya',
  'aksiya',
  '\\d+\\s*(azn|manat|m\\b|₼)'
);
const SUPPLY = rx(
  'çörək',
  'un\\b',
  'yağ',
  'ət\\b',
  'ət məhsul',
  'toyuq',
  'süd',
  'pendir',
  'kartof',
  'tərəvəz',
  'meyvə',
  'düyü',
  'içki',
  'su\\b',
  'kofe',
  'qəhvə',
  'çay',
  'şirniyyat',
  'dondurma',
  'qablaşdırma',
  'qutu',
  'paket',
  'karton',
  'birdəfəlik',
  'salfet',
  'ədviyyat',
  'sous',
  'dəniz məhsul',
  'balıq',
  'yumurta',
  'şəkər',
  'qənnadı məhsul',
  'xəmir',
  'dondurulmuş',
  'yarımfabrikat',
  'kabab',
  'pelmeni',
  'xəngəl',
  'dolma',
  'kimyəvi',
  'təmizlik',
  'yuyucu',
  'forma',
  'geyim',
  'qab-qacaq',
  'boşqab'
);
const SERVICE = rx(
  '\\bpos\\b',
  'proqram',
  'kassa',
  'dizayn',
  'smm',
  'reklam',
  'konsalt',
  'audit',
  'dezinfeks',
  'dezinseks',
  'ventil',
  'təmir',
  'kondisioner',
  'mühasib',
  'uçot',
  'aqta',
  'qeydiyyat',
  'sertifikat',
  'təlim',
  'treninq',
  'seminar',
  'foto',
  'menyu',
  'услуг',
  'франч',
  'logistik',
  'daşıma',
  'hüquq',
  'vəkil'
);
const FRAN = rx(
  'fran[cç]ay',
  'frençayz',
  'franchise',
  'franşiz',
  'ortaq (axtar|lazım|olmaq)',
  'investor',
  'партн[её]р',
  'инвест'
);
const ASK = rx(
  '\\?',
  'kim(də)? (var|satır|satir|tanıyır|bilir)',
  'varmı',
  'varmi',
  'hardan (tap|al)',
  'tövsiyə',
  'tovsiye',
  'məsləhət',
  'kimdə',
  'bilən var',
  'нужен',
  'нужна',
  'кто знает',
  'где купить',
  'lazım(dır|di)\\b'
);
const PRODUCER = rx('topdan|optom|оптом|istehsal');

export const MESSAGE_CLASSES = [
  'techizatci-teklif',
  'xidmet-teklif',
  'sorgu:mehsul',
  'sorgu:ekipman',
  'sorgu:devir/yer',
  'sorgu:xidmet',
  'ekipman',
  'icare',
  'devir/biznes-satis',
  'vakansiya',
  'is_axtaran(CV)',
  'franchise/ortaq',
  'qrup-admin',
  'sistem/media',
  'qisa/sohbet',
  'sual/muzakire',
  'diger',
] as const;
export type MessageClass = (typeof MESSAGE_CLASSES)[number];

/** Təchizatçı bazasına düşən təkliflər. */
export const OFFER_CLASSES: readonly MessageClass[] = [
  'techizatci-teklif',
  'xidmet-teklif',
  'ekipman',
];
/** Python hesabatındakı «təklif» sayı (müqayisə üçün; `ekipman` daxil deyil). */
export const REFERENCE_OFFER_CLASSES: readonly MessageClass[] = [
  'techizatci-teklif',
  'xidmet-teklif',
];

export const REQUEST_CLASS_TYPE: Partial<Record<MessageClass, RequestType>> = {
  'sorgu:mehsul': 'mehsul',
  'sorgu:ekipman': 'ekipman',
  'sorgu:devir/yer': 'yer',
  'sorgu:xidmet': 'xidmet',
};

export function classifyMessage(t: string): MessageClass {
  // Python len() kod nöqtəsi sayır (emoji = 1), JS .length UTF-16 (emoji = 2).
  const length = Array.from(t).length;
  if (MEDIA.test(t) && length < 120) return 'sistem/media';
  if (ADMIN.test(t)) return 'qrup-admin';
  if (length < 25) return 'qisa/sohbet';
  const ask = ASK.test(t) && !OFFER.test(t);
  if (SEEK.test(t)) return 'is_axtaran(CV)';
  if (ROLE.test(t) && HIRE.test(t) && !EQUIP.test(t)) return 'vakansiya';
  if (DEVIR.test(t) || (SELL.test(t) && VENUE.test(t) && !EQUIP.test(t) && !SUPPLY.test(t))) {
    return ask ? 'sorgu:devir/yer' : 'devir/biznes-satis';
  }
  if (RENT.test(t)) return ask ? 'sorgu:devir/yer' : 'icare';
  if (EQUIP.test(t)) return ask ? 'sorgu:ekipman' : 'ekipman';
  if (FRAN.test(t)) return 'franchise/ortaq';
  if (SUPPLY.test(t) || PRODUCER.test(t)) return ask ? 'sorgu:mehsul' : 'techizatci-teklif';
  if (SERVICE.test(t)) return ask ? 'sorgu:xidmet' : 'xidmet-teklif';
  if (ask) return 'sual/muzakire';
  return 'diger';
}

// ── Məhsul qrupları (report.py GROUPS) ───────────────────────────────

const GROUP_PATTERNS: Array<[SupplyCategory, RegExp]> = [
  ['et', rx('\\bət\\b|ət məhsul|toyuq|balıq|dəniz məhsul|kolbasa|sosis|kabab|qiymə|мяс|кур')],
  ['un', rx('\\bun\\b|çörək|xəmir|lavaş|təndir|bulka|kruassan|мук|хлеб')],
  ['sud', rx('süd|pendir|qaymaq|kərə|yumurta|yoğurt|сыр|молоч')],
  ['terevez', rx('tərəvəz|meyvə|kartof|soğan|pomidor|göyərti|овощ|фрукт')],
  ['yag', rx('yağ|sous|ketçup|mayonez|ədviyyat|duz|şəkər|соус|масл')],
  ['icki', rx('içki|qəhvə|kofe|coffee|çay\\b|şirə|su\\b|limonad|enerji|пиво|кофе|чай')],
  ['sirniyyat', rx('şirniyyat|tort|dondurma|şokolad|krem|qənnadı|desert|десерт')],
  [
    'yarimfabrikat',
    rx('yarımfabrikat|dondurulmuş|pelmeni|xəngəl|dolma|kotlet|katlet|duşpərə|полуфабрикат|заморож'),
  ],
  ['qablasdirma', rx('qablaşdırma|qutu|paket|karton|birdəfəlik|salfet|stəkan|folqa|упаков|коробк')],
  ['temizlik', rx('təmizlik|yuyucu|kimyəvi|dezinfek|məişət kimya|моющ')],
  ['geyim', rx('forma|geyim|önlük|tekstil|parça|униформ')],
  [
    'avadanliq',
    rx('avadanl|soyuducu|peç|soba|aparat|mikser|dəzgah|vitrin|inox|paslanmaz|оборудован'),
  ],
];

/**
 * Mətnin məhsul qrupları. Xidmət/ekipman sinfi mətnində qrup sözü olmasa belə
 * `xidmet`/`avadanliq` əlavə olunur — tələb ↔ təchizatçı uyğunlaşdırması üçün.
 */
export function productGroups(text: string, cls?: MessageClass): SupplyCategory[] {
  const result = new Set<SupplyCategory>();
  for (const [key, pattern] of GROUP_PATTERNS) if (pattern.test(text)) result.add(key);
  if (cls === 'xidmet-teklif' || cls === 'sorgu:xidmet') result.add('xidmet');
  if (cls === 'ekipman' || cls === 'sorgu:ekipman') result.add('avadanliq');
  return [...result];
}

// ── Dedupe açarları ──────────────────────────────────────────────────

/** Python `re.sub(r'\W+',' ',t.lower())[:300]`. */
export function normalizeKey(text: string): string {
  const lowered = text.toLowerCase().replace(/[^\p{L}\p{N}_]+/gu, ' ');
  return Array.from(lowered).slice(0, 300).join('');
}

export function textHash(text: string): string {
  return createHash('sha256').update(normalizeKey(text)).digest('hex');
}

export function messageHash(
  message: Pick<ChatMessage, 'group' | 'date' | 'time' | 'sender' | 'text'>
): string {
  return createHash('sha1')
    .update(`${message.group}|${message.date}|${message.time}|${message.sender}|${message.text}`)
    .digest('hex')
    .slice(0, 16);
}

/** Eyni şəxs hər iki qrupda: nömrədirsə `p:<son 9>`, yoxsa normallaşdırılmış ad. */
export function supplierDedupeKey(sender: string): string {
  const phone = senderPhone(sender);
  if (phone) return `p:${phone.replace(/\D/g, '').slice(-9)}`;
  const name = sender
    .toLowerCase()
    .replace(/[~\u200e\u202a\u202c]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return `n:${name}`.slice(0, 190);
}

// ── Pəncərə ──────────────────────────────────────────────────────────

/** `months` ay əvvəlki tarix (YYYY-MM-DD, Bakı vaxtı). Python-da `date >= since` müqayisəsi. */
export function windowStart(months: number, now: Date = new Date()): string {
  const baku = new Date(now.getTime() + 4 * 60 * 60 * 1000);
  const start = new Date(
    Date.UTC(baku.getUTCFullYear(), baku.getUTCMonth() - months, baku.getUTCDate())
  );
  return start.toISOString().slice(0, 10);
}

function toIso(date: string, time: string): string {
  return new Date(`${date}T${time}+04:00`).toISOString();
}

// ── Aqreqasiya ───────────────────────────────────────────────────────

export const SAMPLE_OFFER_LIMIT = 5;
export const SAMPLE_OFFER_CHARS = 1000;
export const REQUEST_TEXT_CHARS = 2000;

export interface SampleOffer {
  text: string;
  date: string;
  group: string;
  /** normallaşdırılmış mətnin qısa hash-i — DB-də birləşdirmədə dublikat açarı */
  k: string;
}

export interface SupplierDraft {
  dedupeKey: string;
  displayName: string;
  phones: string[];
  categories: SupplyCategory[];
  sourceGroups: string[];
  firstSeen: string;
  lastSeen: string;
  messageHashes: string[];
  sampleOffers: SampleOffer[];
}

export interface RequestDraft {
  textHash: string;
  requesterName: string;
  phones: string[];
  text: string;
  categories: SupplyCategory[];
  requestType: RequestType;
  sourceGroup: string;
  postedAt: string;
}

export interface ImportPlan {
  since: string;
  messagesTotal: number;
  messagesInWindow: number;
  firstDate: string | null;
  lastDate: string | null;
  classCounts: Array<{ cls: MessageClass; messages: number; unique: number }>;
  suppliers: SupplierDraft[];
  requests: RequestDraft[];
  /** Python hesabatı ilə müqayisə üçün (təchizatçı + xidmət, ekipman xaric). */
  reference: {
    offerSenders: number;
    offerUnique: number;
    requestSenders: number;
    requestUnique: number;
  };
}

function mergeSamples(samples: SampleOffer[]): SampleOffer[] {
  const seen = new Set<string>();
  const out: SampleOffer[] = [];
  for (const sample of [...samples].sort((a, b) => b.date.localeCompare(a.date))) {
    if (seen.has(sample.k)) continue;
    seen.add(sample.k);
    out.push(sample);
    if (out.length >= SAMPLE_OFFER_LIMIT) break;
  }
  return out;
}

/**
 * Pəncərədəki mesajlardan təchizatçı və tələb qaralamaları qurur.
 * Heç nə yazmır — DB əməliyyatı `lib/supply/repository.ts`-dədir.
 */
export function buildImportPlan(messages: ChatMessage[], since: string): ImportPlan {
  const inWindow = messages.filter((m) => m.date >= since);
  const classCount = new Map<MessageClass, { messages: number; keys: Set<string> }>();
  const suppliers = new Map<string, SupplierDraft & { hashSet: Set<string> }>();
  const requests = new Map<string, RequestDraft>();
  const refOfferSenders = new Set<string>();
  const refOfferKeys = new Set<string>();
  const refReqSenders = new Set<string>();
  const refReqKeys = new Set<string>();

  for (const message of inWindow) {
    const cls = classifyMessage(message.text);
    const key = normalizeKey(message.text);
    const entry = classCount.get(cls) ?? { messages: 0, keys: new Set<string>() };
    entry.messages += 1;
    entry.keys.add(key);
    classCount.set(cls, entry);

    const stamp = toIso(message.date, message.time);
    const ownPhone = senderPhone(message.sender);
    const phones = [...new Set([...message.phones, ...(ownPhone ? [ownPhone] : [])])].sort();

    if (REFERENCE_OFFER_CLASSES.includes(cls)) {
      refOfferSenders.add(message.sender);
      refOfferKeys.add(key);
    }

    if (OFFER_CLASSES.includes(cls)) {
      const dedupeKey = supplierDedupeKey(message.sender);
      const groups = productGroups(message.text, cls);
      const sample: SampleOffer = {
        text: message.text.slice(0, SAMPLE_OFFER_CHARS),
        date: stamp,
        group: message.group,
        k: textHash(message.text).slice(0, 16),
      };
      const existing = suppliers.get(dedupeKey);
      if (!existing) {
        suppliers.set(dedupeKey, {
          dedupeKey,
          displayName: message.sender.slice(0, 200),
          phones,
          categories: groups,
          sourceGroups: [message.group],
          firstSeen: stamp,
          lastSeen: stamp,
          messageHashes: [],
          hashSet: new Set([messageHash(message)]),
          sampleOffers: [sample],
        });
      } else {
        existing.phones = [...new Set([...existing.phones, ...phones])].sort();
        existing.categories = [...new Set([...existing.categories, ...groups])];
        if (!existing.sourceGroups.includes(message.group))
          existing.sourceGroups.push(message.group);
        if (stamp < existing.firstSeen) existing.firstSeen = stamp;
        if (stamp > existing.lastSeen) {
          existing.lastSeen = stamp;
          existing.displayName = message.sender.slice(0, 200);
        }
        existing.hashSet.add(messageHash(message));
        existing.sampleOffers = mergeSamples([...existing.sampleOffers, sample]);
      }
    }

    const requestType = REQUEST_CLASS_TYPE[cls];
    if (requestType) {
      refReqSenders.add(message.sender);
      refReqKeys.add(key);
      const hash = textHash(message.text);
      const prior = requests.get(hash);
      // Python `uniq()`: eyni mətndən ən yenisi saxlanılır.
      if (!prior || stamp > prior.postedAt) {
        requests.set(hash, {
          textHash: hash,
          requesterName: message.sender.slice(0, 200),
          phones,
          text: message.text.slice(0, REQUEST_TEXT_CHARS),
          categories: productGroups(message.text, cls),
          requestType,
          sourceGroup: message.group,
          postedAt: stamp,
        });
      }
    }
  }

  const supplierList: SupplierDraft[] = [...suppliers.values()]
    .map(({ hashSet, ...rest }) => ({
      ...rest,
      messageHashes: [...hashSet].sort(),
    }))
    .sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));

  const dates = messages.map((m) => m.date).sort();

  return {
    since,
    messagesTotal: messages.length,
    messagesInWindow: inWindow.length,
    firstDate: dates[0] ?? null,
    lastDate: dates[dates.length - 1] ?? null,
    classCounts: [...classCount.entries()]
      .map(([cls, value]) => ({ cls, messages: value.messages, unique: value.keys.size }))
      .sort((a, b) => b.messages - a.messages),
    suppliers: supplierList,
    requests: [...requests.values()].sort((a, b) => b.postedAt.localeCompare(a.postedAt)),
    reference: {
      offerSenders: refOfferSenders.size,
      offerUnique: refOfferKeys.size,
      requestSenders: refReqSenders.size,
      requestUnique: refReqKeys.size,
    },
  };
}

/** Bir neçə ixracın (qrupun) planlarını birləşdirmək üçün: mesajları birləşdirib plan qur. */
export function buildPlanFromChats(
  chats: Array<{ text: string; group: string }>,
  since: string
): ImportPlan {
  const all = chats.flatMap((chat) => parseWhatsAppChat(chat.text, chat.group));
  return buildImportPlan(all, since);
}
