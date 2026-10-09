/**
 * TASK-0515 — single source of truth for the thresholds the Toolkit tools judge results against.
 *
 * These are widely used industry RULES OF THUMB, not sourced norms for Azerbaijan. Texts must
 * reference them via ICU `{value}` placeholders (never hard-code a second number) and call them
 * a rule of thumb ("geniş yayılmış qayda"). The food cost target is always the user's own input
 * in the Food Cost tool; FOOD_COST_RESTAURANT_BAND is only the default band shown on its bar.
 */

/** Prime cost (food + labour) as % of revenue — at or below is healthy. */
export const PRIME_COST_MAX_PCT = 65;
/** Rent as % of revenue — at or below is healthy. */
export const RENT_MAX_PCT = 10;
/** Food cost as % of revenue used by the P&L tool's KPI (upper end of the restaurant band). */
export const FOOD_COST_MAX_PCT = 32;
/** Labour (staff + management) as % of revenue used by the P&L insight. */
export const LABOR_MAX_PCT = 35;
/** Net margin below this % → "low margin" insight. */
export const NET_MARGIN_LOW_PCT = 5;

/** Food cost sector bands of the Food Cost tool (owner 2026-10-09). */
export const FOOD_COST_SECTOR_BANDS = [
  { key: 'sectorRestaurant', lo: 28, hi: 32 },
  { key: 'sectorFastFood', lo: 22, hi: 28 },
  { key: 'sectorFineDining', lo: 35, hi: 40 },
] as const;

/** Default target food cost % pre-filled in the Food Cost tool (user can change it). */
export const FOOD_COST_DEFAULT_TARGET_PCT = 32;
/** Above target by more than this many percentage points → «danger» instead of «warning» (same 5 pp spread as the old fixed 30/35 bands). */
export const FOOD_COST_DANGER_MARGIN_PP = 5;
