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

/*
 * TASK-0518 — EXAMPLE assumptions of the staff and kitchen tools (owner 2026-10-09).
 * They are starting defaults of editable inputs, not facts: every page shows
 * «nümunədir; arta və ya azala bilər» next to them and the user can overwrite each value.
 */

/** Staff planner (İşçi planlayıcısı): example monthly salary per role, ₼. */
export const STAFF_PLANNER_SALARY_DEFAULTS = {
  garson: 450,
  barista: 500,
  asci: 600,
  host: 400,
  kasa: 420,
  sommelier: 600,
} as const;
/** Staff planner: employer extras on top of salary (taxes, contributions), % — was the 1.22 multiplier. */
export const STAFF_PLANNER_EXTRA_PCT_DEFAULT = 22;
/** Staff planner: example average check per venue type, ₼. */
export const STAFF_PLANNER_AVG_CHECK_DEFAULTS = {
  restoran_casual: 15,
  restoran_fine: 30,
  kafe: 6,
  bar: 12,
} as const;
/** Staff planner: staff cost target as % of sales per venue type (rule of thumb). */
export const STAFF_PLANNER_LABOR_TARGET_DEFAULTS = {
  restoran_casual: 35,
  restoran_fine: 35,
  kafe: 32,
  bar: 32,
} as const;
/** Staff planner: working days per month used for monthly sales. */
export const STAFF_PLANNER_WORK_DAYS = 30;

/** Kitchen stations (Mətbəx stansiyaları): example average monthly salary of a kitchen worker, ₼. */
export const KITCHEN_SALARY_DEFAULT = 380;
/** Kitchen stations: employer extras on top of salary, % — was the 1.15 multiplier. */
export const KITCHEN_EXTRA_PCT_DEFAULT = 15;
/** Kitchen stations: staff cost target as % of sales (fast food rule of thumb). */
export const KITCHEN_LABOR_TARGET_DEFAULT = 32;
/** Kitchen stations: example average check per concept, ₼. */
export const KITCHEN_AVG_CHECK_DEFAULTS = {
  fast_food: 10,
  qsr_burger: 12,
  qsr_pizza: 18,
  dark_kitchen: 14,
  catering: 25,
} as const;
/** Kitchen stations: working days per month used for monthly sales. */
export const KITCHEN_WORK_DAYS = 26;

/**
 * «İnşaatdan açılışa» example budget split for a 50–80 m², 30–40 seat restaurant, ₼ (min–max per row).
 * Starting values of editable inputs only (owner 2026-10-09: «nümunədir, arta və ya azala bilər»).
 */
export const CONSTRUCTION_BUDGET_DEFAULTS = [
  { key: 'prep', min: 2000, max: 5000 },
  { key: 'rough', min: 20000, max: 40000 },
  { key: 'finish', min: 15000, max: 30000 },
  { key: 'equipment', min: 25000, max: 50000 },
  { key: 'opening', min: 3000, max: 5000 },
  { key: 'reserve', min: 10000, max: 20000 },
] as const;
