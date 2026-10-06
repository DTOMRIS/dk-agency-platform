/**
 * TASK-0497: WhatsApp listing import — parser helpers, config validation and the Telegram routing.
 * Offline (DeepSeek, DB and Telegram are stubbed). Run with: npx tsx e2e/whatsapp-import.test.ts
 * Exits 0 on success, 1 on failure.
 */

import {
  normalizePhone,
  parseWhatsAppListings,
  sanitizeTypeSpecific,
  splitWhatsAppMessages,
  stripContacts,
  toNumber,
  type DeepSeekCaller,
} from '../lib/listings/whatsapp-import';
import {
  buildForwardReply,
  classifyTelegramUpdate,
  handleListingForward,
} from '../lib/telegram/listing-import';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';

import { WHATSAPP_NUMBER } from '../lib/contact-channels';
import { listings } from '../lib/db/schema';
import {
  UNKNOWN_CITY,
  buildDraftValues,
  importOriginNote,
} from '../lib/listings/whatsapp-import-db';

let failures = 0;
let total = 0;
function check(name: string, ok: boolean, detail = '') {
  total++;
  if (!ok) failures++;
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${!ok && detail ? ` — ${detail}` : ''}`);
}

async function main() {
  // ── splitting ──
  const exportText = [
    '[06.10.26, 14:00:01] Qrup: Messages and calls are end-to-end encrypted.',
    '[06.10.26, 14:02:11] Kamran: Salam, kim bilir?',
    '[06.10.26, 14:05:40] +994 51 444 55 66: Xırdalanda kafe devir olunur',
    'ikinci sətir: kirayə 1200',
    '[06.10.26, 14:06:00] Leyla: <Media omitted>',
    '06.10.2026, 14:07 - Leyla: Kofe maşını satılır',
  ].join('\n');
  const split = splitWhatsAppMessages(exportText);
  check(
    'export: 4 stamped messages, media-only dropped',
    split.length === 4, // group-name line (AI skips it), Kamran, devir, Leyla android; media-only dropped
    JSON.stringify(split)
  );
  const devir = split.find((m) => m.text.startsWith('Xırdalanda'));
  check('export: continuation line kept', Boolean(devir?.text.includes('kirayə 1200')));
  check('export: sender kept', devir?.sender === '+994 51 444 55 66', String(devir?.sender));
  check(
    'export: android line parsed',
    split.some((m) => m.text === 'Kofe maşını satılır' && m.sender === 'Leyla')
  );
  check('export: media placeholder removed', !split.some((m) => /omitted/i.test(m.text)));

  const plain = splitWhatsAppMessages('Birinci elan mətni burada\n---\nİkinci elan mətni burada');
  check('plain: separator splits', plain.length === 2, JSON.stringify(plain));
  check(
    'plain: single block stays one',
    splitWhatsAppMessages('Sətir 1\nSətir 2\n\nSətir 3').length === 1
  );

  // ── phones / contacts ──
  check('phone 050 312 45 67', normalizePhone('050 312 45 67') === '+994503124567');
  check('phone +994 55 777 12 34', normalizePhone('+994 55 777 12 34') === '+994557771234');
  check('phone 552223344', normalizePhone('552223344') === '+994552223344');
  check('phone (012) 404 00 00', normalizePhone('(012) 404 00 00') === '+994124040000');
  check('phone TR +90 532', normalizePhone('+90 532 111 22 33') === '+905321112233');
  check('phone too short → null', normalizePhone('12 34') === null);

  const stripped = stripContacts(
    'Qiymət: 95 000 AZN, kirayə 1200.\nƏlaqə: 050 312 45 67\nmail: a.b@x.az wa.me/994501112233'
  );
  check('strip: phone removed', !/312 45 67/.test(stripped), stripped);
  check('strip: email removed', !/a\.b@x\.az/.test(stripped), stripped);
  check('strip: link removed', !/wa\.me/.test(stripped), stripped);
  check(
    'strip: prices kept',
    stripped.includes('95 000 AZN') && stripped.includes('1200'),
    stripped
  );

  // ── numbers ──
  check('num "45 000"', toNumber('45 000') === 45000);
  check('num "45k"', toNumber('45k') === 45000);
  check('num "1,2 mln"', toNumber('1,2 mln') === 1200000);
  check('num "45.000"', toNumber('45.000') === 45000);
  check('num "38-42 min" → null', toNumber('38-42 min') === null);
  check('num "abc" → null', toNumber('abc') === null);

  // ── config validation (lib/data/listingFieldConfig.ts) ──
  const s1 = sanitizeTypeSpecific('devir', {
    area: '220',
    seatCount: 85,
    hasLicense: 'bəli',
    propertyType: 'Kirayə',
    unknownKey: 'x',
    brand: 'Rational',
    equipment: [{ name: 'Peç', condition: 'used', count: 2 }, 'Soyuducu'],
  });
  check(
    'config: unknown keys dropped',
    !('unknownKey' in s1.data) && !('brand' in s1.data),
    JSON.stringify(s1.data)
  );
  check('config: numeric string coerced', s1.data.area === 220);
  check('config: boolean coerced', s1.data.hasLicense === true);
  check('config: invalid select option dropped', !('propertyType' in s1.data));
  check(
    'config: equipment-list → equipment column',
    s1.equipment.length === 2 && !('equipment' in s1.data)
  );
  check('config: missing required reported', s1.missingRequired.includes('propertyType'));

  // ── full pipeline with a stubbed DeepSeek ──
  const stub: DeepSeekCaller = async (_system, user) => {
    const messages = JSON.parse(user) as Array<{ i: number; text: string }>;
    return {
      ok: true,
      json: {
        results: messages.map((m) =>
          m.text.includes('kim bilir')
            ? { i: m.i, type: 'skip', reason: 'Sualdır' }
            : {
                i: m.i,
                type: 'devir',
                confidence: 'high',
                title: 'Xırdalanda kafe devir olunur 050 999 88 77',
                description: 'Kafe devir olunur. Zəng: 050 999 88 77',
                city: 'Xırdalan',
                price: '35 min',
                currency: 'manat',
                fields: { seatCount: 60, madeUp: 1 },
                contactPhone: null,
              }
        ),
      },
    };
  };
  const parsed = await parseWhatsAppListings(exportText, stub);
  const item = parsed.items.find((i) => i.sourceExcerpt.startsWith('Xırdalanda'));
  check(
    'pipeline: chatter skipped',
    parsed.skipped.some((s) => s.reason === 'Sualdır')
  );
  check(
    'pipeline: price parsed',
    item?.price === 35000 && item.currency === 'AZN',
    JSON.stringify(item)
  );
  check(
    'pipeline: phone stripped from title + description',
    Boolean(item && !/999 88 77/.test(item.title + item.description))
  );
  check(
    'pipeline: sender phone used as contact',
    item?.contactPhone === '+994514445566',
    String(item?.contactPhone)
  );
  check(
    'pipeline: unknown AI field dropped',
    Boolean(item && !('madeUp' in item.typeSpecificData))
  );

  const failing: DeepSeekCaller = async () => ({ ok: false, error: '[deepseek] 500' });
  const failed = await parseWhatsAppListings('Bakıda kafe devir olunur, 50 yer', failing);
  check(
    'pipeline: AI error reported, nothing invented',
    failed.items.length === 0 && failed.errors.length === 1
  );

  // ── Draft row (what confirm / Telegram insert) — built and compiled to SQL, never executed ──
  const draft = buildDraftValues(
    {
      type: 'obyekt-icaresi',
      title: 'Obyekt kirayə verilir 070 555 66 77',
      description: 'Obyekt 180 m². Zəng: 070 555 66 77',
      city: '',
      district: null,
      price: 3500,
      currency: 'AZN',
      // seatCount belongs to devir — must be dropped after the owner changed the type.
      typeSpecificData: { area: 180, seatCount: 40 },
      equipment: [],
      contactName: 'Rəşad',
      contactPhone: '070 555 66 77',
      contactEmail: null,
    },
    importOriginNote('admin', new Date('2026-10-06T10:00:00Z'))
  );
  check(
    'draft: status submitted, not showcased, no slug',
    draft.status === 'submitted' && draft.isShowcase === false && draft.slug === null
  );
  check(
    'draft: public phone/email = DK Agency',
    draft.phone === WHATSAPP_NUMBER &&
      draft.email === 'info@dkagency.com.tr' &&
      draft.ownerName === 'DK Agency'
  );
  check(
    'draft: poster phone only in contact_phone (normalised)',
    draft.contactPhone === '+994705556677'
  );
  check(
    'draft: phone stripped from title/description',
    !/555 66 77/.test(`${draft.title} ${draft.description}`)
  );
  check(
    'draft: type change re-validated against config',
    JSON.stringify(draft.typeSpecificData) === '{"area":180}',
    JSON.stringify(draft.typeSpecificData)
  );
  check('draft: missing city → placeholder', draft.city === UNKNOWN_CITY);
  check('draft: origin note', draft.committeeNotes === 'Mənbə: WhatsApp import, 2026-10-06');
  const offlineDb = drizzle(neon('postgresql://user:pass@localhost.invalid/db'));
  const sql = offlineDb.insert(listings).values(draft).returning({ id: listings.id }).toSQL();
  check(
    'draft: compiles to INSERT with contact + note columns',
    /insert into "listings"/.test(sql.sql) &&
      sql.sql.includes('"contact_phone"') &&
      sql.sql.includes('"committee_notes"'),
    sql.sql.slice(0, 120)
  );

  // ── Telegram routing: the news callback flow must stay first ──
  const owner = '12345';
  const callback = {
    callback_query: {
      id: 'q',
      data: 'news:approve:7',
      message: { message_id: 1, chat: { id: 12345 } },
    },
  };
  check('tg: callback → news handler', classifyTelegramUpdate(callback, owner) === 'callback');
  check(
    'tg: callback + message → still callback',
    classifyTelegramUpdate(
      {
        ...callback,
        message: { message_id: 2, chat: { id: 12345 }, text: 'Bakıda kafe devir olunur 50 yer' },
      },
      owner
    ) === 'callback'
  );
  check(
    'tg: owner text → listing',
    classifyTelegramUpdate(
      { message: { message_id: 3, chat: { id: 12345 }, text: 'Bakıda kafe devir olunur, 50 yer' } },
      owner
    ) === 'listing'
  );
  check(
    'tg: forwarded caption → listing',
    classifyTelegramUpdate(
      { message: { message_id: 3, chat: { id: 12345 }, caption: 'Obyekt kirayə verilir 180 m²' } },
      owner
    ) === 'listing'
  );
  check(
    'tg: other chat ignored',
    classifyTelegramUpdate(
      { message: { message_id: 4, chat: { id: 999 }, text: 'Bakıda kafe devir olunur, 50 yer' } },
      owner
    ) === 'ignore'
  );
  check(
    'tg: command ignored',
    classifyTelegramUpdate(
      { message: { message_id: 5, chat: { id: 12345 }, text: '/start please do something' } },
      owner
    ) === 'ignore'
  );
  check(
    'tg: bot message ignored',
    classifyTelegramUpdate(
      {
        message: {
          message_id: 6,
          chat: { id: 12345 },
          from: { is_bot: true },
          text: 'Bakıda kafe devir olunur, 50 yer',
        },
      },
      owner
    ) === 'ignore'
  );
  check('tg: empty update ignored', classifyTelegramUpdate(null, owner) === 'ignore');

  const replies: string[] = [];
  let createCalls = 0;
  const result = await handleListingForward(exportText, {
    parse: (text) => parseWhatsAppListings(text, stub),
    create: async (items) => {
      createCalls++;
      return {
        created: items.map((it, idx) => ({
          id: 100 + idx,
          trackingCode: `DK-2026-${1000 + idx}`,
          title: it.title,
          adminUrl: `https://dkagency.com.tr/dashboard/ilanlar/${100 + idx}`,
        })),
        failed: [],
      };
    },
    reply: async (text) => {
      replies.push(text);
    },
  });
  check(
    'tg forward: drafts created via create()',
    createCalls === 1 && result.created >= 1,
    JSON.stringify(result)
  );
  check(
    'tg forward: reply "📥 N qaralama yaradıldı" + admin link',
    /📥 \d+ qaralama yaradıldı/.test(replies[0] ?? '') &&
      (replies[0] ?? '').includes('/dashboard/ilanlar/100'),
    replies[0]
  );

  replies.length = 0;
  createCalls = 0;
  await handleListingForward('Salam, kim bilir?', {
    parse: (text) => parseWhatsAppListings(text, stub),
    create: async () => {
      createCalls++;
      return { created: [], failed: [] };
    },
    reply: async (text) => {
      replies.push(text);
    },
  });
  check(
    'tg forward: no listing → no create, short reply',
    createCalls === 0 && /tanınmadı/.test(replies[0] ?? ''),
    replies[0]
  );
  check(
    'tg reply: AI error message',
    /AI təhlili alınmadı/.test(buildForwardReply([], 0, [], ['[deepseek] 500']))
  );

  console.log(`\n${total - failures}/${total} checks OK`);
  process.exit(failures === 0 ? 0 : 1);
}

main();
