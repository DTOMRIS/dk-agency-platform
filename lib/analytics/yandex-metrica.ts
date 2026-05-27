'use client';

declare global {
  interface Window {
    ym?: (counterId: number, action: string, ...args: unknown[]) => void;
  }
}

const COUNTER_ID = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID
  ? parseInt(process.env.NEXT_PUBLIC_YANDEX_METRICA_ID, 10)
  : null;

let initialized = false;

export function isYandexEnabled(): boolean {
  return COUNTER_ID !== null && !isNaN(COUNTER_ID);
}

export function initYandexMetrica(): void {
  if (typeof window === 'undefined') return;
  if (initialized) return;
  if (!isYandexEnabled() || !COUNTER_ID) return;

  /* eslint-disable */
  (function (m: any, e: any, t: any, r: any, i: any) {
    m[i] =
      m[i] ||
      function () {
        (m[i].a = m[i].a || []).push(arguments);
      };
    m[i].l = 1 * (new Date() as any);
    const k = e.createElement(t);
    const a = e.getElementsByTagName(t)[0];
    k.async = 1;
    k.src = r;
    a.parentNode.insertBefore(k, a);
  })(window, document, 'script', 'https://mc.yandex.ru/metrika/tag.js', 'ym');
  /* eslint-enable */

  window.ym?.(COUNTER_ID, 'init', {
    clickmap: true,
    trackLinks: true,
    accurateTrackBounce: true,
    webvisor: true,
    defer: true,
  });

  initialized = true;
}

export function trackEvent(eventName: string, params?: Record<string, unknown>): void {
  if (typeof window === 'undefined') return;
  if (!initialized || !COUNTER_ID) return;
  window.ym?.(COUNTER_ID, 'reachGoal', eventName, params);
}

export function trackPageView(url: string): void {
  if (typeof window === 'undefined') return;
  if (!initialized || !COUNTER_ID) return;
  window.ym?.(COUNTER_ID, 'hit', url);
}
