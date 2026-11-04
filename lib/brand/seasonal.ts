/** TASK-0555: one fixed campaign, boundaries explicitly in Baku (UTC+4). */
export const LOGO_START = Date.parse('2026-11-04T00:00:00+04:00');
export const BANNER_START = Date.parse('2026-11-05T00:00:00+04:00');
export const FLAG_START = Date.parse('2026-11-09T00:00:00+04:00');
export const CAMPAIGN_END = Date.parse('2026-11-10T00:00:00+04:00');
export function holidayPhase(now: number) {
  return now < BANNER_START || now >= CAMPAIGN_END ? null : now >= FLAG_START ? 'flag' : 'victory';
}
export function seasonalLogo(now: number) { return now >= LOGO_START && now < CAMPAIGN_END; }
export function brandLogoPath(now = Date.now()) {
  return seasonalLogo(now) ? '/images/dk-victory-2026.png' : '/images/logo-mobil.png';
}
