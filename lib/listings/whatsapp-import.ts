/**
 * @file lib/listings/whatsapp-import.ts
 * @purpose TASK-0497 — turn listings pasted/forwarded from WhatsApp groups into structured
 *          DRAFT listings. Pure parsing: no DB access here (see whatsapp-import-db.ts).
 *
 * Why paste/forward and not a bot in the groups: the official WhatsApp API cannot read
 * third-party groups and unofficial scraping risks bans + personal-data issues. The owner
 * pastes the text (or forwards it to the Telegram bot) and reviews every draft.
 *
 * Flow: raw text → splitWhatsAppMessages() (export lines "[06.10.26, 14:02] Name: …" or plain
 * text) → one DeepSeek call per batch → zod validation against lib/data/listingFieldConfig.ts
 * (the single source of truth for type-specific fields; unknown keys are dropped) →
 * phones/emails stripped from the description, contact kept separately.
 */

import { z } from 'zod';

import { AI_MODELS } from '@/lib/ai-models';
import {
  TYPE_SPECIFIC_FIELDS,
  type EquipmentItem,
  type FieldConfig,
} from '@/lib/data/listingFieldConfig';
import type { ListingCategory } from '@/lib/data/listingCategories';

/** Max listings per confirm request and max candidate messages per preview. */
export const WA_IMPORT_MAX_ITEMS = 30;
/** Max raw text accepted (≈ a long group export excerpt). */
export const WA_IMPORT_MAX_CHARS = 60_000;

export const LISTING_TYPES = Object.keys(TYPE_SPECIFIC_FIELDS) as ListingCategory[];
export const IMPORT_CURRENCIES = ['AZN', 'USD', 'EUR', 'TRY', 'RUB'] as const;
export type ImportCurrency = (typeof IMPORT_CURRENCIES)[number];

export type TypeSpecificValue = string | number | boolean;

export interface WhatsAppMessage {
  index: number;
  sender: string | null;
  sentAt: string | null;
  text: string;
}

export interface ImportedListing {
  key: string;
  sourceIndex: number;
  sourceExcerpt: string;
  type: ListingCategory;
  confidence: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  city: string | null;
  district: string | null;
  price: number | null;
  currency: ImportCurrency;
  typeSpecificData: Record<string, TypeSpecificValue>;
  equipment: EquipmentItem[];
  contactName: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  /** Required config fields the message did not mention (shown as a hint, never invented). */
  missingRequired: string[];
}

export interface SkippedMessage {
  key: string;
  sourceIndex: number;
  sourceExcerpt: string;
  reason: string;
}

export interface WhatsAppParseResult {
  candidates: number;
  truncated: boolean;
  items: ImportedListing[];
  skipped: SkippedMessage[];
  errors: string[];
}

// ── 1. Splitting ─────────────────────────────────────────────────────────────

/**
 * WhatsApp export line, iOS and Android variants:
 *   [06.10.26, 14:02:11] Name: text
 *   06.10.2026, 14:02 - Name: text
 *   6/10/26, 2:02 PM - +994 50 123 45 67: text
 */
const EXPORT_LINE =
  /^‎?\[?(\d{1,2}[./-]\d{1,2}[./-]\d{2,4}),?\s+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp]\.?[Mm]\.?)?)\]?\s*(?:[-–]\s*)?([^:\n]{1,80}?):\s?(.*)$/;
/** Date-stamped system line without an author ("Messages are end-to-end encrypted"). */
const EXPORT_SYSTEM_LINE = /^‎?\[?\d{1,2}[./-]\d{1,2}[./-]\d{2,4},?\s+\d{1,2}:\d{2}/;
const MEDIA_PLACEHOLDER =
  /^‎?(?:<[^>]*(?:omitted|weggelassen|пропущен|dahil edilmedi|daxil edilməyib)[^>]*>|(?:image|video|audio|sticker|GIF|document) omitted|<attached: [^>]+>)$/i;
const PLAIN_SEPARATOR = /\n\s*(?:[-–—_=*~]{3,})\s*\n|\n{3,}/;

function cleanMessageText(text: string): string {
  return text
    .split('\n')
    .filter((line) => !MEDIA_PLACEHOLDER.test(line.trim()))
    .join('\n')
    .replace(/‎|‏/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}

export function splitWhatsAppMessages(rawText: string): WhatsAppMessage[] {
  const text = rawText.replace(/\r\n?/g, '\n').slice(0, WA_IMPORT_MAX_CHARS);
  const lines = text.split('\n');
  // Export = starts with a stamped line, or has ≥2 of them (pasted with a short intro).
  const isExport =
    EXPORT_LINE.test(lines.find((l) => l.trim()) ?? '') ||
    lines.filter((line) => EXPORT_LINE.test(line)).length >= 2;

  const messages: WhatsAppMessage[] = [];
  if (isExport) {
    let current: { sender: string | null; sentAt: string | null; lines: string[] } | null = null;
    const flush = () => {
      if (!current) return;
      const body = cleanMessageText(current.lines.join('\n'));
      if (body)
        messages.push({
          index: messages.length + 1,
          sender: current.sender,
          sentAt: current.sentAt,
          text: body,
        });
      current = null;
    };
    for (const line of lines) {
      const match = line.match(EXPORT_LINE);
      if (match) {
        flush();
        current = { sender: match[3].trim(), sentAt: `${match[1]} ${match[2]}`, lines: [match[4]] };
      } else if (EXPORT_SYSTEM_LINE.test(line)) {
        flush();
      } else if (current) {
        current.lines.push(line);
      }
    }
    flush();
  } else {
    for (const chunk of text.split(PLAIN_SEPARATOR)) {
      const body = cleanMessageText(chunk);
      if (body)
        messages.push({ index: messages.length + 1, sender: null, sentAt: null, text: body });
    }
  }
  return messages;
}

// ── 2. Contact helpers ───────────────────────────────────────────────────────

/** Azerbaijani mobile/landline prefixes after the leading 0 (050, 012, …). */
const AZ_PREFIXES = new Set([
  '10',
  '12',
  '18',
  '20',
  '21',
  '22',
  '23',
  '24',
  '25',
  '26',
  '36',
  '40',
  '50',
  '51',
  '55',
  '60',
  '70',
  '77',
  '99',
]);

/** Normalise to +994XXXXXXXXX when the number is obviously Azerbaijani; other countries keep +digits. */
export function normalizePhone(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 7) return null;
  if (digits.startsWith('994') && digits.length === 12) return `+${digits}`;
  if (digits.startsWith('00994') && digits.length === 14) return `+${digits.slice(2)}`;
  if (digits.length === 10 && digits.startsWith('0') && AZ_PREFIXES.has(digits.slice(1, 3)))
    return `+994${digits.slice(1)}`;
  if (digits.length === 9 && AZ_PREFIXES.has(digits.slice(0, 2))) return `+994${digits}`;
  if (trimmed.startsWith('+') || trimmed.startsWith('00')) return `+${digits.replace(/^00/, '')}`;
  return digits;
}

const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
const PHONE_CANDIDATE_RE = /\+?\(?\d[\d\s().\-‒–]{6,}\d/g;
const URL_RE = /\b(?:https?:\/\/|wa\.me\/|t\.me\/)\S+/gi;

/** Removes phone numbers (9–15 digits), e-mails and wa.me/t.me links. Prices (≤8 digits) survive. */
export function stripContacts(text: string): string {
  return text
    .replace(URL_RE, '')
    .replace(EMAIL_RE, '')
    .replace(PHONE_CANDIDATE_RE, (match) => {
      const digits = match.replace(/\D/g, '').length;
      return digits >= 9 && digits <= 15 ? '' : match;
    })
    .replace(
      /(?:tel|telefon|əlaqə|elaqe|контакт|телефон|тел|iletişim|whatsapp|wp)\s*[:.]?\s*(?=\n|$)/gim,
      ''
    )
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function hasContactLeak(text: string): boolean {
  EMAIL_RE.lastIndex = 0;
  if (EMAIL_RE.test(text)) return true;
  return (text.match(PHONE_CANDIDATE_RE) ?? []).some((m) => {
    const digits = m.replace(/\D/g, '').length;
    return digits >= 9 && digits <= 15;
  });
}

// ── 3. Value coercion against the field config ───────────────────────────────

const MULTIPLIERS: Array<[RegExp, number]> = [
  [/^(?:k|к|min|bin|тыс\.?|тысяч)$/i, 1_000],
  [/^(?:m|mln|milyon|million|млн\.?|миллион(?:а|ов)?)$/i, 1_000_000],
];

/** "45 000" → 45000, "45k" → 45000, "1,2 mln" → 1200000. Anything else → null. */
export function toNumber(value: unknown): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value !== 'string') return null;
  const compact = value
    .replace(/[\s  ]/g, '')
    .replace(/(?:azn|manat|₼|\$|usd|eur|€|tl|try|₺|руб|rub|m²|m2|кв\.?м)$/i, '');
  const match = compact.match(/^(\d+(?:[.,]\d+)?)([a-zа-яəğıöşüç.]*)$/i);
  if (!match) return null;
  let base: number;
  // "45.000" / "45,000" are thousands separators; "1,2" / "1.5" decimals.
  if (/^\d{1,3}(?:[.,]\d{3})+$/.test(match[1])) base = Number(match[1].replace(/[.,]/g, ''));
  else base = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(base)) return null;
  if (!match[2]) return base;
  const multiplier = MULTIPLIERS.find(([re]) => re.test(match[2]));
  return multiplier ? base * multiplier[1] : null;
}

function toBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const v = value.trim().toLowerCase();
    if (['true', 'bəli', 'beli', 'yes', 'да', 'evet', 'var'].includes(v)) return true;
    if (['false', 'xeyr', 'no', 'нет', 'hayır', 'hayir', 'yoxdur', 'yox'].includes(v)) return false;
  }
  return null;
}

function cleanString(value: unknown, max: number): string | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const s = String(value).trim();
  if (!s || /^(null|undefined|n\/a|-|—|yoxdur|bilinmir|unknown)$/i.test(s)) return null;
  return s.slice(0, max);
}

const equipmentSchema = z.object({
  name: z.string().trim().min(1).max(120),
  condition: z.enum(['new', 'used']).catch('used'),
  count: z.coerce.number().int().positive().max(10_000).optional().catch(undefined),
});

function sanitizeEquipment(value: unknown): EquipmentItem[] {
  if (!Array.isArray(value)) return [];
  const out: EquipmentItem[] = [];
  for (const raw of value.slice(0, 100)) {
    const parsed = equipmentSchema.safeParse(typeof raw === 'string' ? { name: raw } : raw);
    if (parsed.success)
      out.push(
        parsed.data.count
          ? parsed.data
          : { name: parsed.data.name, condition: parsed.data.condition }
      );
  }
  return out;
}

/**
 * Keeps only keys that exist in TYPE_SPECIFIC_FIELDS[type], coerced to the configured kind.
 * `equipment-list` fields are returned separately (they live in the `equipment` column).
 */
export function sanitizeTypeSpecific(
  type: ListingCategory,
  fields: Record<string, unknown> | null | undefined
): {
  data: Record<string, TypeSpecificValue>;
  equipment: EquipmentItem[];
  missingRequired: string[];
} {
  const config: FieldConfig[] = TYPE_SPECIFIC_FIELDS[type] ?? [];
  const data: Record<string, TypeSpecificValue> = {};
  let equipment: EquipmentItem[] = [];
  const source = fields ?? {};
  for (const field of config) {
    const raw = source[field.key];
    if (raw === undefined || raw === null) continue;
    switch (field.type) {
      case 'number': {
        const n = toNumber(raw);
        if (n !== null && n >= 0) data[field.key] = n;
        break;
      }
      case 'boolean': {
        const b = toBoolean(raw);
        if (b !== null) data[field.key] = b;
        break;
      }
      case 'select': {
        const s = cleanString(raw, 120);
        const option = s
          ? field.options?.find((o) => o.toLowerCase() === s.toLowerCase())
          : undefined;
        if (option) data[field.key] = option;
        break;
      }
      case 'equipment-list':
        equipment = sanitizeEquipment(raw);
        break;
      default: {
        const s = cleanString(raw, field.type === 'textarea' ? 1000 : 160);
        if (s) data[field.key] = stripContacts(s);
      }
    }
  }
  const missingRequired = config
    .filter((f) => f.required && f.type !== 'equipment-list' && data[f.key] === undefined)
    .map((f) => f.key);
  return { data, equipment, missingRequired };
}

function toCurrency(value: unknown): ImportCurrency {
  const s = typeof value === 'string' ? value.trim().toUpperCase() : '';
  if (/^(USD|\$|DOLLAR|DOLLAR|ДОЛЛАР)/.test(s)) return 'USD';
  if (/^(EUR|€|AVRO|EURO|ЕВРО)/.test(s)) return 'EUR';
  if (/^(TRY|TL|₺|LIRA)/.test(s)) return 'TRY';
  if (/^(RUB|РУБ|₽)/.test(s)) return 'RUB';
  return 'AZN';
}

// ── 4. DeepSeek ──────────────────────────────────────────────────────────────

const TYPE_GUIDE: Record<ListingCategory, string> = {
  devir:
    'an OPERATING restaurant/cafe/bar/bakery/hotel business transferred or sold as a going concern (AZ "devir", "hazır biznes satılır", RU "продаётся готовый бизнес", "передача", TR "devren satılık/kiralık"). price = transfer/sale price (NOT the rent).',
  'franchise-vermek':
    'a brand OFFERING its franchise. price = franchise fee (fields.franchiseFee too).',
  'franchise-almaq': 'someone who WANTS TO BUY/OPEN a franchise. price = their budget.',
  'ortak-tapmaq':
    'looking for a business PARTNER (ortaq/ortak/партнёр) for an existing or planned HoReCa business. price = investment needed.',
  'yeni-investisiya':
    'a NEW HoReCa project/concept seeking investment. price = amount sought (or total budget).',
  'obyekt-icaresi':
    'EMPTY premises/space for rent or sale suitable for HoReCa, no operating business transferred (obyekt kirayə, помещение в аренду, kiralık dükkan). price = monthly rent (or sale price if sold).',
  'horeca-ekipman':
    'kitchen/bar/restaurant EQUIPMENT or furniture for sale (soyuducu, peç, kofe maşını, оборудование, ekipman). price = sale price (total if a lot).',
};

function fieldGuide(): string {
  return LISTING_TYPES.map((type) => {
    const fields = TYPE_SPECIFIC_FIELDS[type]
      .map((f) => {
        if (f.type === 'equipment-list') return `${f.key}: use top-level "equipment" array instead`;
        const kind =
          f.type === 'select'
            ? `one of ${JSON.stringify(f.options)}`
            : f.type === 'textarea'
              ? 'string'
              : f.type;
        return `${f.key} (${f.label}${f.suffix ? `, ${f.suffix}` : ''}): ${kind}`;
      })
      .join('; ');
    return `- ${type}: ${TYPE_GUIDE[type]}\n  fields: ${fields}`;
  }).join('\n');
}

const SYSTEM_PROMPT = `You extract HoReCa business listings (Azerbaijan / Turkey / CIS market) from WhatsApp group messages for DK Agency. A human editor reviews every draft, so precision beats recall and you must NEVER invent facts.

Input: JSON array of messages {"i": number, "sender": string|null, "text": string}. Languages: Azerbaijani, Russian, Turkish, English (often mixed, informal, with emoji).

Listing types:
${fieldGuide()}

Return ONLY a JSON object: {"results": [ ... ]} with AT LEAST one entry per input message "i":
- Not a listing (greeting, question, chatter, "kim bilir?", thanks, job vacancy, unrelated product, sticker): {"i": n, "type": "skip", "reason": "<short Azerbaijani reason>"}.
- A listing: {"i": n, "type": "<one of the 7 types>", "confidence": "high"|"medium"|"low", "title": string, "description": string, "city": string|null, "district": string|null, "price": number|null, "currency": "AZN"|"USD"|"EUR"|"TRY"|"RUB"|null, "fields": {…}, "equipment": [{"name": string, "condition": "new"|"used", "count": number|null}], "contactName": string|null, "contactPhone": string|null, "contactEmail": string|null}.
- One message may contain several separate listings → several entries with the same "i".

Rules:
1. Never invent. Unknown → null / omit the field key. Do not guess a city, price, area or seat count that is not written.
2. Numbers as plain JSON numbers: "45 min" / "45k" / "45.000" → 45000; "1,2 mln" → 1200000; "120 kv.m" → 120. A range ("38-42 min", "150-200 kv.m") is NOT a number: omit that field and keep the range in the description. Booleans as true/false only when stated. devir propertyType = "İcarə (kirayə)" only when a monthly rent for the premises is stated, "Mülkiyyət (satış)" only when the property itself is sold.
3. "fields" may only contain the field keys listed for the chosen type. Select fields must use one of the given options exactly, otherwise omit.
4. title: Azerbaijani, factual, ≤ 90 characters, no emoji, no phone, no exclamation marks. Example: "Nərimanovda 80 yerlik işlək restoran devir olunur".
5. description: Azerbaijani (translate from RU/TR/EN), clean sentences or short lines, keep every business fact (area, seats, rent, revenue, equipment, reason, terms). REMOVE phone numbers, e-mails, links, contact person names and "zəng edin/yazın" calls-to-action.
6. city: Azerbaijani spelling (Bakı, Sumqayıt, Gəncə, Xırdalan, Mingəçevir, Şəki, Lənkəran, Qəbələ; Turkish cities like İstanbul, Ankara). District/metro (Nərimanov, Yasamal, 28 May, Gənclik…) → "district". City of a Baku district is Bakı.
7. currency: manat/AZN/₼ → AZN, $/dollar → USD, €/avro → EUR, TL/₺ → TRY, руб → RUB; null if no price.
8. Contacts: contactPhone exactly as written in the text (any format); contactName only when a contact person is named in the text (otherwise null — do not use the sender); contactEmail if present.
9. Demand-side requests for premises or equipment ("yer axtarıram", "ищу помещение", "soyuducu lazımdır") are NOT listings → skip with reason "Axtarış/tələb mesajı, təklif deyil". Only franchise-almaq and ortak-tapmaq are listings that express a need.
10. confidence "low" when the type is ambiguous or the message is too vague.`;

const aiEntrySchema = z.object({
  i: z.coerce.number().int().positive(),
  type: z.string().trim(),
  reason: z.string().nullish(),
  confidence: z.enum(['high', 'medium', 'low']).nullish().catch(null),
  title: z.string().nullish(),
  description: z.string().nullish(),
  city: z.string().nullish(),
  district: z.string().nullish(),
  price: z.union([z.number(), z.string()]).nullish(),
  currency: z.string().nullish(),
  fields: z.record(z.string(), z.unknown()).nullish().catch(null),
  equipment: z.array(z.unknown()).nullish().catch(null),
  contactName: z.string().nullish(),
  contactPhone: z.union([z.string(), z.number()]).nullish(),
  contactEmail: z.string().nullish(),
});

const aiResponseSchema = z.object({ results: z.array(z.unknown()) });

export type DeepSeekCaller = (
  system: string,
  user: string
) => Promise<{ ok: true; json: unknown } | { ok: false; error: string }>;

export function deepSeekCaller(apiKey: string): DeepSeekCaller {
  return async (system, user) => {
    let res: Response;
    try {
      res = await fetch('https://api.deepseek.com/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: AI_MODELS.deepseek.chat,
          temperature: 0.1,
          max_tokens: 6000,
          // TASK-0488: v4-flash reasoning otherwise eats the budget and truncates the JSON.
          thinking: { type: 'disabled' },
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: system },
            { role: 'user', content: user },
          ],
        }),
        signal: AbortSignal.timeout(45_000),
      });
    } catch (err) {
      return { ok: false, error: `[deepseek] ${err instanceof Error ? err.message : 'network'}` };
    }
    if (!res.ok) return { ok: false, error: `[deepseek] ${res.status}` };
    const data = (await res.json().catch(() => null)) as {
      choices?: Array<{ message?: { content?: string } }>;
    } | null;
    const raw = data?.choices?.[0]?.message?.content || '';
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start < 0 || end <= start) return { ok: false, error: '[parse] no JSON object' };
    try {
      return { ok: true, json: JSON.parse(raw.slice(start, end + 1)) as unknown };
    } catch {
      return { ok: false, error: '[parse] invalid JSON' };
    }
  };
}

const BATCH_MAX_MESSAGES = 6;
const BATCH_MAX_CHARS = 9_000;
const MESSAGE_MAX_CHARS = 3_500;

function batchMessages(messages: WhatsAppMessage[]): WhatsAppMessage[][] {
  const batches: WhatsAppMessage[][] = [];
  let current: WhatsAppMessage[] = [];
  let size = 0;
  for (const message of messages) {
    const length = Math.min(message.text.length, MESSAGE_MAX_CHARS);
    if (
      current.length &&
      (current.length >= BATCH_MAX_MESSAGES || size + length > BATCH_MAX_CHARS)
    ) {
      batches.push(current);
      current = [];
      size = 0;
    }
    current.push(message);
    size += length;
  }
  if (current.length) batches.push(current);
  return batches;
}

function excerpt(text: string): string {
  return text.length > 280 ? `${text.slice(0, 280).trimEnd()}…` : text;
}

function looksLikePhone(value: string | null): boolean {
  return Boolean(value && /^[+\d\s()-]{9,}$/.test(value) && value.replace(/\D/g, '').length >= 9);
}

/** Turns one validated AI entry into an ImportedListing (or a skip). Exported for tests. */
export function buildListing(
  entry: z.infer<typeof aiEntrySchema>,
  message: WhatsAppMessage,
  ordinal: number
): ImportedListing | SkippedMessage {
  const key = `m${message.index}-${ordinal}`;
  const sourceExcerpt = excerpt(message.text);
  const type = LISTING_TYPES.find((t) => t === entry.type);
  if (!type) {
    return {
      key,
      sourceIndex: message.index,
      sourceExcerpt,
      reason: cleanString(entry.reason, 200) ?? 'Elan deyil',
    };
  }

  const { data, equipment, missingRequired } = sanitizeTypeSpecific(type, entry.fields);
  const extraEquipment = sanitizeEquipment(entry.equipment);
  const rawTitle = cleanString(entry.title, 200) ?? message.text.split('\n')[0];
  const title =
    stripContacts(rawTitle).replace(/\s+/g, ' ').slice(0, 90).trim() || 'WhatsApp elanı';
  const description = stripContacts(cleanString(entry.description, 5000) ?? message.text) || title;
  const price = toNumber(entry.price ?? null);

  // The sender of an export line is often shown as a phone number (not in the phone book).
  const textPhone = normalizePhone(entry.contactPhone == null ? null : String(entry.contactPhone));
  const senderPhone = looksLikePhone(message.sender) ? normalizePhone(message.sender) : null;
  const email = cleanString(entry.contactEmail, 255);

  return {
    key,
    sourceIndex: message.index,
    sourceExcerpt,
    type,
    confidence: entry.confidence ?? 'medium',
    title,
    description,
    city: cleanString(entry.city, 120),
    district: cleanString(entry.district, 120),
    price: price !== null && price > 0 ? Math.round(price) : null,
    currency: price !== null && price > 0 ? toCurrency(entry.currency) : 'AZN',
    typeSpecificData: data,
    equipment: equipment.length ? equipment : extraEquipment,
    contactName: cleanString(entry.contactName, 150),
    contactPhone: textPhone ?? senderPhone,
    contactEmail: email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? email.toLowerCase() : null,
    missingRequired,
  };
}

function isSkip(value: ImportedListing | SkippedMessage): value is SkippedMessage {
  return 'reason' in value;
}

async function parseBatch(
  batch: WhatsAppMessage[],
  call: DeepSeekCaller
): Promise<{ items: ImportedListing[]; skipped: SkippedMessage[]; error?: string }> {
  const payload = batch.map((m) => ({
    i: m.index,
    sender: m.sender,
    text: m.text.slice(0, MESSAGE_MAX_CHARS),
  }));
  const result = await call(SYSTEM_PROMPT, JSON.stringify(payload));
  if (!result.ok) {
    return {
      items: [],
      skipped: batch.map((m) => ({
        key: `m${m.index}-err`,
        sourceIndex: m.index,
        sourceExcerpt: excerpt(m.text),
        reason: 'AI təhlili alınmadı',
      })),
      error: result.error,
    };
  }
  const parsed = aiResponseSchema.safeParse(result.json);
  const entries = parsed.success ? parsed.data.results : [];
  const items: ImportedListing[] = [];
  const skipped: SkippedMessage[] = [];
  const counter = new Map<number, number>();
  for (const raw of entries) {
    const entry = aiEntrySchema.safeParse(raw);
    if (!entry.success) continue;
    const message = batch.find((m) => m.index === entry.data.i);
    if (!message) continue;
    const ordinal = (counter.get(message.index) ?? 0) + 1;
    counter.set(message.index, ordinal);
    const built = buildListing(entry.data, message, ordinal);
    if (isSkip(built)) skipped.push(built);
    else items.push(built);
  }
  // A message the model silently dropped is reported, not lost.
  for (const message of batch) {
    if (!counter.has(message.index)) {
      skipped.push({
        key: `m${message.index}-none`,
        sourceIndex: message.index,
        sourceExcerpt: excerpt(message.text),
        reason: 'AI cavabında yoxdur',
      });
    }
  }
  return { items, skipped, error: parsed.success ? undefined : '[parse] results missing' };
}

/** Full pipeline. `call` is injectable so tests and scripts can stub or reuse a caller. */
export async function parseWhatsAppListings(
  rawText: string,
  call: DeepSeekCaller
): Promise<WhatsAppParseResult> {
  const all = splitWhatsAppMessages(rawText);
  const messages = all.slice(0, WA_IMPORT_MAX_ITEMS);
  const batches = batchMessages(messages);

  // At most 3 batches in flight: 30 messages = 5 batches ≈ 2 rounds, well inside maxDuration 120.
  const results: Awaited<ReturnType<typeof parseBatch>>[] = [];
  for (let i = 0; i < batches.length; i += 3) {
    results.push(
      ...(await Promise.all(batches.slice(i, i + 3).map((batch) => parseBatch(batch, call))))
    );
  }

  const items = results.flatMap((r) => r.items).slice(0, WA_IMPORT_MAX_ITEMS);
  const skipped = results.flatMap((r) => r.skipped).sort((a, b) => a.sourceIndex - b.sourceIndex);
  const errors = results.map((r) => r.error).filter((e): e is string => Boolean(e));
  return {
    candidates: messages.length,
    truncated: all.length > messages.length,
    items,
    skipped,
    errors,
  };
}

// ── 5. Confirm payload (owner-edited preview items) ──────────────────────────

export const confirmItemSchema = z.object({
  type: z.enum(LISTING_TYPES as [ListingCategory, ...ListingCategory[]]),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(8000).default(''),
  city: z.string().trim().max(120).nullish(),
  district: z.string().trim().max(120).nullish(),
  price: z.number().nonnegative().max(2_000_000_000).nullish(),
  currency: z.enum(IMPORT_CURRENCIES).default('AZN'),
  typeSpecificData: z
    .record(z.string(), z.union([z.string(), z.number(), z.boolean()]))
    .default({}),
  equipment: z.array(equipmentSchema).max(100).default([]),
  contactName: z.string().trim().max(150).nullish(),
  contactPhone: z.string().trim().max(30).nullish(),
  contactEmail: z.string().trim().max(255).nullish(),
});

export type ConfirmItem = z.infer<typeof confirmItemSchema>;
