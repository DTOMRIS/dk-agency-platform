export type HomeEventName = 'home_tab_switch' | 'home_cta_click' | 'kazan_ai_click';

export interface HomeEventPayload {
  event: HomeEventName;
  section?: string;
  ctaLabel?: string;
  tab?: string;
  path?: string;
  timestamp: string;
}

/**
 * TASK-0439: beacon `/api/orchestrator`-a gedirdi — yəni AI endpoint-inə.
 * O route `taskType` + `userPrompt` tələb edir, analitika hadisəsində isə
 * bunlar yoxdur, ona görə hər beacon 400 alırdı: ana səhifə hadisələri
 * **heç vaxt qeydə düşməyib**, üstəlik hər ziyarətçi AI endpoint-inə dəyirdi.
 * Doğru ünvan `/api/analytics/track`-dir — o, sendBeacon üçün qurulub
 * (text/plain + Blob qəbul edir) və `webConversionEvents`-ə yazır.
 *
 * Sessiya id-si `PortalEngagementTracker` ilə eyni nümunədədir, amma ayrı
 * açarda saxlanır ki, açıq sayt və portal ölçmələri qarışmasın.
 */
const SESSION_KEY = 'dk_home_analytics_session_id';

function getAnalyticsSessionId(): string {
  try {
    const existing = window.sessionStorage.getItem(SESSION_KEY);
    if (existing) return existing;
    const created = `sess_${Math.random().toString(36).slice(2, 15)}_${Date.now()}`;
    window.sessionStorage.setItem(SESSION_KEY, created);
    return created;
  } catch {
    // Private mode / bloklanmış storage — ölçmə UX-i sındırmamalıdır.
    return 'sess_ephemeral';
  }
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
    const body = JSON.stringify({
      sessionId: getAnalyticsSessionId(),
      pagePath: event.path,
      eventName: event.event,
      metadata: { section: event.section, ctaLabel: event.ctaLabel, tab: event.tab },
    });
    navigator.sendBeacon('/api/analytics/track', new Blob([body], { type: 'application/json' }));
  }
}
