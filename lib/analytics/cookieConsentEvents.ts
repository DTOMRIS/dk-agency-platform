export type ConsentValue = 'yes' | 'no' | 'custom';

interface ConsentEvent {
  event: 'cookie_consent_set';
  value: ConsentValue;
  timestamp: string;
}

export function trackCookieConsent(value: ConsentValue, analyticsAllowed: boolean) {
  if (typeof window === 'undefined') {
    return;
  }

  const payload: ConsentEvent = {
    event: 'cookie_consent_set',
    value,
    timestamp: new Date().toISOString(),
  };

  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  if (analyticsAllowed && Array.isArray(w.dataLayer)) {
    w.dataLayer.push(payload as unknown as Record<string, unknown>);
  }

  try {
    const raw = window.localStorage.getItem('dk_analytics_events');
    const list = raw ? (JSON.parse(raw) as ConsentEvent[]) : [];
    list.unshift(payload);
    window.localStorage.setItem('dk_analytics_events', JSON.stringify(list.slice(0, 100)));
  } catch {
    // ignore storage errors
  }
}
