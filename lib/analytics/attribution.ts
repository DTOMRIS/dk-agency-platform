/**
 * @file lib/analytics/attribution.ts
 * @purpose TASK-0541 (owner 2026-10-11): «where did this lead come from?» — reklam/UTM mənbəyi heç yerdə
 *          saxlanmırdı. The visitor's last non-direct touch (utm_*, ad click ids, or the referring site) is
 *          kept in a first-party cookie `dk_attr`; lead endpoints read it and record a `lead` row in
 *          `web_conversion_events` (source / campaign / metadata — no schema change) and add a «Mənbə» line
 *          to the owner's Telegram message. Pure functions: shared by the browser capture and the server.
 *
 * Consent: without analytics consent the cookie is a session cookie (gone when the browser closes);
 * with consent it lives 30 days.
 */

export const ATTR_COOKIE = 'dk_attr';
export const ATTR_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type Attribution = {
  /** random visitor id — groups lead rows of one visitor */
  id: string;
  /** source: utm_source, «google», «instagram», «direct» … */
  s: string;
  /** medium: utm_medium, «cpc», «organic», «social», «referral», «(none)» */
  m: string;
  /** campaign (utm_campaign), optional */
  c?: string;
  /** referring host, optional */
  r?: string;
  /** landing path of this touch */
  l: string;
  /** ISO time of this touch */
  t: string;
};

export type Touch = Omit<Attribution, 'id' | 'l' | 't'>;

const clean = (v: string | null | undefined, n = 80) =>
  (v ?? '').trim().toLowerCase().replace(/[^\p{L}\p{N}._\-+ /]/gu, '').slice(0, n);

const REFERRERS: Array<[RegExp, string, string]> = [
  [/(^|\.)google\./, 'google', 'organic'],
  [/(^|\.)yandex\./, 'yandex', 'organic'],
  [/(^|\.)bing\.com$/, 'bing', 'organic'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo', 'organic'],
  [/(^|\.)instagram\.com$/, 'instagram', 'social'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me)$/, 'facebook', 'social'],
  [/(^|\.)(t\.me|telegram\.org|telegram\.me)$/, 'telegram', 'social'],
  [/(^|\.)(whatsapp\.com|wa\.me)$/, 'whatsapp', 'social'],
  [/(^|\.)tiktok\.com$/, 'tiktok', 'social'],
  [/(^|\.)(linkedin\.com|lnkd\.in)$/, 'linkedin', 'social'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube', 'social'],
  [/(^|\.)(x\.com|twitter\.com|t\.co)$/, 'x', 'social'],
  [/(^|\.)(chatgpt\.com|openai\.com)$/, 'chatgpt', 'ai'],
  [/(^|\.)perplexity\.ai$/, 'perplexity', 'ai'],
  [/(^|\.)(claude\.ai|gemini\.google\.com|copilot\.microsoft\.com)$/, 'ai-assistant', 'ai'],
];

/** Classify one landing: UTM first, then ad click ids, then the referring site; nothing → direct. */
export function classifyTouch(search: string, referrer: string, ownHost: string): Touch {
  const p = new URLSearchParams(search);
  const utmSource = clean(p.get('utm_source'));
  if (utmSource) {
    const c = clean(p.get('utm_campaign'), 100);
    return { s: utmSource, m: clean(p.get('utm_medium')) || '(none)', ...(c ? { c } : {}) };
  }
  if (p.get('gclid') || p.get('gbraid') || p.get('wbraid')) return { s: 'google', m: 'cpc' };
  if (p.get('yclid')) return { s: 'yandex', m: 'cpc' };
  if (p.get('ttclid')) return { s: 'tiktok', m: 'cpc' };
  // fbclid is added to every outbound Facebook/Instagram link, paid or not.
  if (p.get('fbclid')) return { s: 'facebook', m: 'social' };

  let host = '';
  try {
    host = referrer ? new URL(referrer).hostname.replace(/^www\./, '').toLowerCase() : '';
  } catch {
    host = '';
  }
  const own = ownHost.replace(/^www\./, '').toLowerCase();
  if (!host || host === own) return { s: 'direct', m: '(none)' };
  for (const [re, s, m] of REFERRERS) {
    if (re.test(host) || (s === 'instagram' && host.startsWith('l.instagram'))) return { s, m, r: host };
  }
  return { s: host.slice(0, 80), m: 'referral', r: host.slice(0, 80) };
}

export function parseAttribution(raw: string | undefined | null): Attribution | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw) as Partial<Attribution>;
    if (!v || typeof v.s !== 'string' || typeof v.id !== 'string') return null;
    return {
      id: v.id.slice(0, 40),
      s: clean(v.s) || 'direct',
      m: clean(v.m) || '(none)',
      ...(v.c ? { c: clean(v.c, 100) } : {}),
      ...(v.r ? { r: clean(v.r) } : {}),
      l: typeof v.l === 'string' ? v.l.slice(0, 300) : '/',
      t: typeof v.t === 'string' ? v.t.slice(0, 40) : '',
    };
  } catch {
    return null;
  }
}

/** One line for the owner's Telegram message. */
export function attributionLine(a: Attribution | null): string {
  if (!a) return 'Mənbə: bilinmir';
  if (a.s === 'direct') return 'Mənbə: birbaşa (ünvanı yazıb və ya əlfəcin)';
  const parts = [`Mənbə: ${a.s}`, a.m && a.m !== '(none)' ? a.m : null, a.c ? `kampaniya «${a.c}»` : null];
  return parts.filter(Boolean).join(' · ');
}
