/**
 * Launch campaign for the OCR Invoice (Fatura) module.
 * Free for ALL members until LAUNCH_FREE_UNTIL. After that, a grace policy
 * applies (see docs): existing invoices stay readable + exportable forever;
 * only NEW upload + OCR + AI analysis become premium (Kalfa+). No data hostage.
 */

export const LAUNCH_FREE_UNTIL = new Date('2026-09-01T00:00:00+04:00');

const DAY_MS = 24 * 60 * 60 * 1000;

/** True while the invoice module is free for everyone. */
export function isLaunchActive(now: Date = new Date()): boolean {
  return now.getTime() < LAUNCH_FREE_UNTIL.getTime();
}

/** Whole days left until the free period ends (0 once ended). */
export function daysUntilLaunchEnd(now: Date = new Date()): number {
  const diff = LAUNCH_FREE_UNTIL.getTime() - now.getTime();
  return diff <= 0 ? 0 : Math.ceil(diff / DAY_MS);
}

/** Show a countdown warning when ≤ 30 days remain (30/14/7/1 thresholds matter). */
export function shouldWarnLaunchEnding(now: Date = new Date()): boolean {
  const d = daysUntilLaunchEnd(now);
  return d > 0 && d <= 30;
}

/** Formatted free-until date for banners (az). */
export function launchEndLabel(): string {
  return LAUNCH_FREE_UNTIL.toLocaleDateString('az-AZ', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}
