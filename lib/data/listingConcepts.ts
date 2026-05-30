/**
 * @file listingConcepts.ts
 * @purpose SSOT for HoReCa business concept taxonomy.
 * Sector → Concept mapping. Stored in typeSpecificData jsonb (no migration).
 * Heb's methodology: concept determines critical location requirements.
 */

import type { ListingSector } from './listingSectors';

export const CONCEPT_KEYS = [
  'doner', 'kebab-mangal', 'fast-food-konsept', 'lahmacun-pide',
  'fine-dining', 'restoran-genis-menu', 'pizza', 'asia-sushi',
  'specialty-coffee', 'brunch-breakfast', 'lounge', 'sirniyyat',
  'bar', 'pub', 'kokteyl-bar', 'gece-klubu',
  'butik-otel', 'biznes-otel', 'pansiyon', 'mini-otel', 'xostel',
  'korporativ-catering', 'event-toy', 'gundelik-yemek', 'merkezi-metbex',
  'custom',
] as const;

export type ConceptKey = (typeof CONCEPT_KEYS)[number];

export const SECTOR_CONCEPTS: Record<ListingSector, ConceptKey[]> = {
  restoran: ['doner', 'kebab-mangal', 'fast-food-konsept', 'lahmacun-pide', 'fine-dining', 'restoran-genis-menu', 'pizza', 'asia-sushi'],
  kafe: ['specialty-coffee', 'brunch-breakfast', 'lounge', 'sirniyyat'],
  'bar-pub': ['bar', 'pub', 'kokteyl-bar', 'gece-klubu'],
  'fast-food': ['doner', 'fast-food-konsept', 'lahmacun-pide', 'pizza'],
  'otel-pansiyon': ['butik-otel', 'biznes-otel', 'pansiyon', 'mini-otel', 'xostel'],
  catering: ['korporativ-catering', 'event-toy', 'gundelik-yemek', 'merkezi-metbex'],
  diger: ['custom'],
};

export const CONCEPT_LABELS: Record<ConceptKey, { az: string; en: string; ru: string; tr: string }> = {
  'doner':              { az: 'Dönər',                en: 'Döner Kebab',         ru: 'Дёнер',                tr: 'Döner' },
  'kebab-mangal':       { az: 'Kebab / Manqal',       en: 'Kebab / BBQ',         ru: 'Кебаб / Мангал',       tr: 'Kebap / Mangal' },
  'fast-food-konsept':  { az: 'Fast Food',            en: 'Fast Food',           ru: 'Фастфуд',              tr: 'Fast Food' },
  'lahmacun-pide':      { az: 'Lahmacun / Pidə',      en: 'Lahmacun / Pide',     ru: 'Лахмаджун / Пиде',     tr: 'Lahmacun / Pide' },
  'fine-dining':        { az: 'Fine Dining',          en: 'Fine Dining',         ru: 'Файн дайнинг',         tr: 'Fine Dining' },
  'restoran-genis-menu': { az: 'Geniş menyu restoran', en: 'Full-service restaurant', ru: 'Ресторан с полным меню', tr: 'Geniş menü restoran' },
  'pizza':              { az: 'Pizzeria',             en: 'Pizzeria',            ru: 'Пиццерия',             tr: 'Pizzeria' },
  'asia-sushi':         { az: 'Asiya / Sushi',        en: 'Asian / Sushi',       ru: 'Азия / Суши',          tr: 'Asya / Suşi' },
  'specialty-coffee':   { az: 'Specialty Coffee',     en: 'Specialty Coffee',    ru: 'Спешалти кофе',        tr: 'Specialty Coffee' },
  'brunch-breakfast':   { az: 'Brunch / Səhər yeməyi', en: 'Brunch / Breakfast',  ru: 'Бранч / Завтрак',      tr: 'Brunch / Kahvaltı' },
  'lounge':             { az: 'Lounge',               en: 'Lounge',              ru: 'Лаунж',                tr: 'Lounge' },
  'sirniyyat':          { az: 'Şirniyyat / Pastry',   en: 'Pastry / Bakery',     ru: 'Кондитерская',         tr: 'Pastane' },
  'bar':                { az: 'Bar',                  en: 'Bar',                 ru: 'Бар',                  tr: 'Bar' },
  'pub':                { az: 'Pub',                  en: 'Pub',                 ru: 'Паб',                  tr: 'Pub' },
  'kokteyl-bar':        { az: 'Kokteyl Bar',          en: 'Cocktail Bar',        ru: 'Коктейль-бар',         tr: 'Kokteyl Bar' },
  'gece-klubu':         { az: 'Gecə klubu',           en: 'Night Club',          ru: 'Ночной клуб',          tr: 'Gece kulübü' },
  'butik-otel':         { az: 'Butik otel',           en: 'Boutique Hotel',      ru: 'Бутик-отель',          tr: 'Butik otel' },
  'biznes-otel':        { az: 'Biznes otel',          en: 'Business Hotel',      ru: 'Бизнес-отель',         tr: 'İş oteli' },
  'pansiyon':           { az: 'Pansiyon',             en: 'Guesthouse',          ru: 'Гостевой дом',         tr: 'Pansiyon' },
  'mini-otel':          { az: 'Mini otel',            en: 'Mini Hotel',          ru: 'Мини-отель',           tr: 'Mini otel' },
  'xostel':             { az: 'Xostel',               en: 'Hostel',              ru: 'Хостел',               tr: 'Hostel' },
  'korporativ-catering': { az: 'Korporativ catering', en: 'Corporate Catering',  ru: 'Корп. кейтеринг',     tr: 'Kurumsal catering' },
  'event-toy':          { az: 'Event / Toy',          en: 'Event / Wedding',     ru: 'Мероприятия / Свадьба', tr: 'Etkinlik / Düğün' },
  'gundelik-yemek':     { az: 'Gündəlik yemək',       en: 'Daily Meals',         ru: 'Ежедневное питание',   tr: 'Günlük yemek' },
  'merkezi-metbex':     { az: 'Mərkəzi mətbəx',       en: 'Central Kitchen',     ru: 'Центральная кухня',    tr: 'Merkezi mutfak' },
  'custom':             { az: 'Digər konsept',        en: 'Other concept',       ru: 'Другой концепт',       tr: 'Diğer konsept' },
};

export function getConceptsForSector(sector: string): ConceptKey[] {
  return SECTOR_CONCEPTS[sector as ListingSector] ?? [];
}

export function getConceptLabel(key: string, locale: 'az' | 'en' | 'ru' | 'tr' = 'az'): string {
  return CONCEPT_LABELS[key as ConceptKey]?.[locale] ?? key;
}

export function isValidConcept(key: string): key is ConceptKey {
  return CONCEPT_KEYS.includes(key as ConceptKey);
}
