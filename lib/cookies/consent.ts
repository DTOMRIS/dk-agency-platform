export type ConsentValue = 'yes' | 'no' | 'custom';

export type ConsentPrefs = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

const CONSENT_COOKIE = 'dk_cookie_consent';
const PREFS_COOKIE = 'dk_cookie_prefs';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function parseCookieString(cookieString: string) {
  return cookieString
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean)
    .reduce<Record<string, string>>((acc, part) => {
      const idx = part.indexOf('=');
      if (idx === -1) return acc;
      const key = part.slice(0, idx);
      const value = part.slice(idx + 1);
      acc[key] = decodeURIComponent(value);
      return acc;
    }, {});
}

function safeParsePrefs(raw?: string): ConsentPrefs | undefined {
  if (!raw) return undefined;
  try {
    const parsed = JSON.parse(raw) as Partial<ConsentPrefs>;
    return {
      essential: true,
      analytics: Boolean(parsed.analytics),
      marketing: Boolean(parsed.marketing),
    };
  } catch {
    return undefined;
  }
}

export function readConsentFromCookies(): { consent?: ConsentValue; prefs?: ConsentPrefs } {
  if (typeof document === 'undefined') {
    return {};
  }

  const cookies = parseCookieString(document.cookie || '');
  const consentRaw = cookies[CONSENT_COOKIE];
  const prefsRaw = cookies[PREFS_COOKIE];

  const consent: ConsentValue | undefined =
    consentRaw === 'yes' || consentRaw === 'no' || consentRaw === 'custom' ? consentRaw : undefined;

  return {
    consent,
    prefs: safeParsePrefs(prefsRaw),
  };
}

export function serializeConsentPrefs(prefs: ConsentPrefs) {
  return JSON.stringify({
    essential: true,
    analytics: Boolean(prefs.analytics),
    marketing: Boolean(prefs.marketing),
  });
}

export function writeConsentToCookies(consent: ConsentValue, prefs: ConsentPrefs) {
  if (typeof document === 'undefined') {
    return;
  }

  const secure =
    typeof window !== 'undefined' &&
    (window.location.protocol === 'https:' || process.env.NODE_ENV === 'production');

  const base = `Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax`;
  const securePart = secure ? '; Secure' : '';

  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(consent)}; ${base}${securePart}`;
  document.cookie = `${PREFS_COOKIE}=${encodeURIComponent(serializeConsentPrefs(prefs))}; ${base}${securePart}`;
}
