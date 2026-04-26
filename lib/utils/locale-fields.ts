/**
 * @file locale-fields.ts
 * @purpose Locale-aware field accessor for inline _az/_ru/_en/_tr columns
 */

export type ContentLocale = 'az' | 'ru' | 'en' | 'tr';

const VALID_LOCALES = new Set<string>(['az', 'ru', 'en', 'tr']);

export function sanitizeLocale(locale: string | undefined | null): ContentLocale {
  if (locale && VALID_LOCALES.has(locale)) return locale as ContentLocale;
  return 'az';
}

/**
 * Pick a locale-specific field from a row with _az fallback.
 * Example: localizedField(row, 'title', 'ru') → row.title_ru || row.title_az
 */
export function localizedField(
  row: Record<string, unknown>,
  field: string,
  locale: ContentLocale,
): string {
  const localeValue = row[`${field}_${locale}`];
  if (typeof localeValue === 'string' && localeValue.trim()) return localeValue;

  const azValue = row[`${field}_az`];
  if (typeof azValue === 'string' && azValue.trim()) return azValue;

  return '';
}
