/**
 * @file listingSectors.ts
 * @purpose SSOT for business sector taxonomy (orthogonal to listing type/operation).
 * Type = what you do (devir, franchise, etc.)
 * Sector = what business it is (restoran, otel, catering, etc.)
 *
 * varchar + config pattern — NO pgEnum. Adding a new sector = config change only,
 * no migration needed.
 */

export const SECTOR_KEYS = [
  'restoran',
  'kafe',
  'bar-pub',
  'fast-food',
  'otel-pansiyon',
  'catering',
  'diger',
] as const;

export type ListingSector = (typeof SECTOR_KEYS)[number];

export const SECTOR_LABELS: Record<ListingSector, { az: string; en: string; ru: string; tr: string }> = {
  restoran:        { az: 'Restoran',         en: 'Restaurant',          ru: 'Ресторан',              tr: 'Restoran' },
  kafe:            { az: 'Kafe',             en: 'Café',                ru: 'Кафе',                  tr: 'Kafe' },
  'bar-pub':       { az: 'Bar / Pub',        en: 'Bar / Pub',           ru: 'Бар / Паб',             tr: 'Bar / Pub' },
  'fast-food':     { az: 'Fast Food',        en: 'Fast Food',           ru: 'Фастфуд',               tr: 'Fast Food' },
  'otel-pansiyon': { az: 'Otel / Pansiyon',  en: 'Hotel / Guesthouse',  ru: 'Отель / Гостевой дом',  tr: 'Otel / Pansiyon' },
  catering:        { az: 'Catering',         en: 'Catering',            ru: 'Кейтеринг',             tr: 'Catering' },
  diger:           { az: 'Digər',            en: 'Other',               ru: 'Другое',                tr: 'Diğer' },
};

export function getSectorLabel(key: string, locale: 'az' | 'en' | 'ru' | 'tr' = 'az'): string {
  const entry = SECTOR_LABELS[key as ListingSector];
  return entry?.[locale] ?? key;
}

export function isValidSector(key: string): key is ListingSector {
  return SECTOR_KEYS.includes(key as ListingSector);
}

export function getAllSectors(locale: 'az' | 'en' | 'ru' | 'tr' = 'az') {
  return SECTOR_KEYS.map((key) => ({
    value: key,
    label: SECTOR_LABELS[key][locale],
  }));
}
