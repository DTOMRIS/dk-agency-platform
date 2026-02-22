export type HomeEventName = 'home_tab_switch' | 'home_cta_click' | 'kazan_ai_click';

export interface HomeEventPayload {
  event: HomeEventName;
  section?: string;
  ctaLabel?: string;
  tab?: string;
  path?: string;
  timestamp: string;
}

export function trackHomeEvent(payload: Omit<HomeEventPayload, 'timestamp' | 'path'>) {
  if (typeof window === 'undefined') {
    return;
  }

  const event: HomeEventPayload = {
    ...payload,
    path: window.location.pathname,
    timestamp: new Date().toISOString(),
  };

  const w = window as Window & { dataLayer?: Record<string, unknown>[] };
  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push(event as unknown as Record<string, unknown>);
  }

  try {
    const raw = window.localStorage.getItem('dk_home_events');
    const list = raw ? (JSON.parse(raw) as HomeEventPayload[]) : [];
    list.unshift(event);
    window.localStorage.setItem('dk_home_events', JSON.stringify(list.slice(0, 50)));
  } catch {
    // ignore storage errors
  }

  if (navigator.sendBeacon) {
    const body = JSON.stringify(event);
    navigator.sendBeacon('/api/orchestrator', new Blob([body], { type: 'application/json' }));
  }
}
