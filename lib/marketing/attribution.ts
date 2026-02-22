import { readConsentFromCookies } from '@/lib/cookies/consent';

export type AttributionPayload = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  gclid?: string;
  captured_at: string;
  landing_path: string;
};

const SESSION_KEY = 'dk_attribution_session';
const COOKIE_KEY = 'dk_utm';
const UTM_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function parseCookieString(cookieString: string) {
  return cookieString
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return acc;
      acc[part.slice(0, idx)] = decodeURIComponent(part.slice(idx + 1));
      return acc;
    }, {});
}

function readFromSession(): AttributionPayload | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AttributionPayload;
  } catch {
    return null;
  }
}

function readFromCookie(): AttributionPayload | null {
  if (typeof document === 'undefined') return null;

  try {
    const cookies = parseCookieString(document.cookie || '');
    const raw = cookies[COOKIE_KEY];
    if (!raw) return null;
    return JSON.parse(raw) as AttributionPayload;
  } catch {
    return null;
  }
}

function writeCookie(data: AttributionPayload) {
  if (typeof document === 'undefined') return;

  const secure =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' || process.env.NODE_ENV === 'production');
  const base = `Path=/; Max-Age=${UTM_MAX_AGE_SECONDS}; SameSite=Lax`;
  const securePart = secure ? '; Secure' : '';
  document.cookie = `${COOKIE_KEY}=${encodeURIComponent(JSON.stringify(data))}; ${base}${securePart}`;
}

export function getAttribution() {
  return readFromSession() ?? readFromCookie();
}

export function persistAttributionIfAllowed(payload: AttributionPayload) {
  if (typeof window === 'undefined') return;

  const existing = readFromSession() ?? {};
  const merged = { ...existing, ...payload } as AttributionPayload;

  window.sessionStorage.setItem(SESSION_KEY, JSON.stringify(merged));

  const consent = readConsentFromCookies();
  if (consent.prefs?.marketing === true) {
    writeCookie(merged);
  }
}
