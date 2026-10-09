/**
 * TASK-0515 — one decimal parser for every Toolkit input.
 *
 * Accepts both "12,5" and "12.5" as twelve and a half. Spaces (incl. NBSP / narrow NBSP used as
 * thousands separators by Intl) are stripped. A dot is read as a thousands separator ONLY when the
 * whole value matches /^\d{1,3}(\.\d{3})+$/ ("1.500" → 1500, "12.500.000" → 12500000); a single
 * comma is always the decimal mark. Returns `null` for empty or unreadable input so callers can
 * show a validation message instead of silently turning it into 0.
 */

const THOUSANDS_DOT = /^\d{1,3}(\.\d{3})+$/;
const PLAIN_DECIMAL = /^\d+([.,]\d*)?$|^[.,]\d+$/;

export function parseDecimal(raw: string | null | undefined): number | null {
  if (raw == null) return null;
  let value = String(raw).replace(/[\s  ]/g, '');
  if (value === '') return null;

  let sign = 1;
  if (value.startsWith('-') || value.startsWith('−')) {
    sign = -1;
    value = value.slice(1);
  } else if (value.startsWith('+')) {
    value = value.slice(1);
  }
  if (value === '') return null;

  if (THOUSANDS_DOT.test(value)) {
    return sign * Number(value.replace(/\./g, ''));
  }
  // "1.500,75" — dot thousands + comma decimal
  const mixed = /^(\d{1,3}(?:\.\d{3})+),(\d*)$/.exec(value);
  if (mixed) {
    return sign * Number(`${mixed[1].replace(/\./g, '')}.${mixed[2] || '0'}`);
  }
  if (!PLAIN_DECIMAL.test(value)) return null;

  const n = Number(value.replace(',', '.'));
  return Number.isFinite(n) ? sign * n : null;
}

/** Display a number for an editable input: no grouping, locale decimal mark (comma for az/ru/tr). */
export function formatDecimalInput(value: number, locale: string = 'az'): string {
  if (!Number.isFinite(value)) return '';
  const rounded = Math.round(value * 1e6) / 1e6;
  const text = String(rounded);
  return locale === 'en' ? text : text.replace('.', ',');
}
