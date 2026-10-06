/**
 * TASK-0498 — Təchizatçı bazası: məhsul qrupları, statuslar və növlər (client-safe).
 *
 * Məhsul qrupu açarları DB-də `supply_contacts.categories` və
 * `supply_requests.categories` jsonb massivlərində saxlanılır. Etiketlər 4 dildə.
 * Qrupları tanıyan regex-lər `lib/supply/wa-parser.ts`-dədir (rule-based, xarici AI yoxdur).
 */

import type { Locale } from '@/i18n/config';

export const SUPPLY_CATEGORY_KEYS = [
  'et',
  'un',
  'sud',
  'terevez',
  'yag',
  'icki',
  'sirniyyat',
  'yarimfabrikat',
  'qablasdirma',
  'temizlik',
  'geyim',
  'avadanliq',
  'xidmet',
] as const;
export type SupplyCategory = (typeof SUPPLY_CATEGORY_KEYS)[number];

export const SUPPLY_CATEGORY_LABELS: Record<SupplyCategory, Record<Locale, string>> = {
  et: {
    az: 'Ət/toyuq/balıq',
    ru: 'Мясо/птица/рыба',
    en: 'Meat/poultry/fish',
    tr: 'Et/tavuk/balık',
  },
  un: {
    az: 'Un/çörək/xəmir',
    ru: 'Мука/хлеб/тесто',
    en: 'Flour/bread/dough',
    tr: 'Un/ekmek/hamur',
  },
  sud: {
    az: 'Süd/pendir/yumurta',
    ru: 'Молочка/сыр/яйца',
    en: 'Dairy/cheese/eggs',
    tr: 'Süt/peynir/yumurta',
  },
  terevez: { az: 'Tərəvəz/meyvə', ru: 'Овощи/фрукты', en: 'Vegetables/fruit', tr: 'Sebze/meyve' },
  yag: {
    az: 'Yağ/sous/ədviyyat',
    ru: 'Масло/соусы/специи',
    en: 'Oil/sauces/spices',
    tr: 'Yağ/sos/baharat',
  },
  icki: {
    az: 'İçki/qəhvə/çay',
    ru: 'Напитки/кофе/чай',
    en: 'Drinks/coffee/tea',
    tr: 'İçecek/kahve/çay',
  },
  sirniyyat: {
    az: 'Şirniyyat/dondurma',
    ru: 'Сладости/мороженое',
    en: 'Sweets/ice cream',
    tr: 'Tatlı/dondurma',
  },
  yarimfabrikat: {
    az: 'Yarımfabrikat/dondurulmuş',
    ru: 'Полуфабрикаты/заморозка',
    en: 'Semi-finished/frozen',
    tr: 'Yarı mamul/dondurulmuş',
  },
  qablasdirma: {
    az: 'Qablaşdırma/birdəfəlik',
    ru: 'Упаковка/одноразовое',
    en: 'Packaging/disposables',
    tr: 'Ambalaj/tek kullanımlık',
  },
  temizlik: {
    az: 'Təmizlik/kimya',
    ru: 'Уборка/химия',
    en: 'Cleaning/chemicals',
    tr: 'Temizlik/kimya',
  },
  geyim: {
    az: 'Geyim/forma/tekstil',
    ru: 'Униформа/текстиль',
    en: 'Uniforms/textile',
    tr: 'Kıyafet/üniforma/tekstil',
  },
  avadanliq: { az: 'Avadanlıq', ru: 'Оборудование', en: 'Equipment', tr: 'Ekipman' },
  xidmet: { az: 'Xidmət', ru: 'Услуги', en: 'Services', tr: 'Hizmet' },
};

export const SUPPLIER_STATUSES = ['yeni', 'elaqe_saxlanildi', 'razi', 'imtina'] as const;
export type SupplierStatus = (typeof SUPPLIER_STATUSES)[number];

export const REQUEST_STATUSES = ['aciq', 'uygunlasdirildi', 'baglandi'] as const;
export type RequestStatus = (typeof REQUEST_STATUSES)[number];

export const REQUEST_TYPES = ['mehsul', 'ekipman', 'yer', 'xidmet'] as const;
export type RequestType = (typeof REQUEST_TYPES)[number];

export const IMPORT_WINDOWS = [1, 3, 6, 12] as const;
export type ImportWindow = (typeof IMPORT_WINDOWS)[number];

export function isSupplyCategory(value: string): value is SupplyCategory {
  return (SUPPLY_CATEGORY_KEYS as readonly string[]).includes(value);
}

/** «WhatsApp Chat - <qrup>.zip» → «<qrup>»; `_chat.txt` kimi ümumi adlar üçün boş sətir. */
export function groupNameFromFileName(fileName: string | null | undefined): string {
  const base = (fileName ?? '').replace(/\.(zip|txt)$/i, '').trim();
  const name = base.replace(/^WhatsApp Chat\s*-\s*/i, '').trim();
  return name && !/^_?chat$/i.test(name) ? name.slice(0, 120) : '';
}

/** `+994501234567` → `+994 50 123 45 67` (digər formatlar olduğu kimi). */
export function formatPhone(phone: string): string {
  const match = /^\+994(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(phone);
  return match ? `+994 ${match[1]} ${match[2]} ${match[3]} ${match[4]}` : phone;
}
