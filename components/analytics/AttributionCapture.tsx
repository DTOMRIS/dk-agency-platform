'use client';

/**
 * @file AttributionCapture.tsx
 * @purpose TASK-0541: on every full page load, keep the visitor's last non-direct touch (utm, ad click id,
 *          referring site) in the first-party `dk_attr` cookie. A plain internal visit never overwrites an
 *          earlier ad/social touch. Session cookie without analytics consent, 30 days with it.
 */

import { useEffect } from 'react';
import {
  ATTR_COOKIE,
  ATTR_MAX_AGE_SECONDS,
  classifyTouch,
  parseAttribution,
  type Attribution,
} from '@/lib/analytics/attribution';

function readCookie(name: string): string | null {
  const hit = document.cookie.split(';').map((c) => c.trim()).find((c) => c.startsWith(`${name}=`));
  if (!hit) return null;
  try {
    return decodeURIComponent(hit.slice(name.length + 1));
  } catch {
    return null;
  }
}

/** Analytics consent from the cookie bar (localStorage `dk-cookie-consent`). */
function hasAnalyticsConsent(): boolean {
  try {
    const raw = window.localStorage.getItem('dk-cookie-consent');
    if (!raw) return false;
    const c = JSON.parse(raw) as { accepted?: boolean; settings?: Record<string, boolean> };
    return Boolean(c.accepted && c.settings && (c.settings.google || c.settings.yandex_metrica));
  } catch {
    return false;
  }
}

function newId(): string {
  const bytes = new Uint8Array(9);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(36).padStart(2, '0')).join('').slice(0, 14);
}

export default function AttributionCapture() {
  useEffect(() => {
    try {
      const existing = parseAttribution(readCookie(ATTR_COOKIE));
      const touch = classifyTouch(window.location.search, document.referrer, window.location.host);
      const next: Attribution =
        touch.s === 'direct' && existing
          ? existing
          : { id: existing?.id ?? newId(), ...touch, l: window.location.pathname.slice(0, 300), t: new Date().toISOString() };
      const age = hasAnalyticsConsent() ? `; Max-Age=${ATTR_MAX_AGE_SECONDS}` : '';
      const secure = window.location.protocol === 'https:' ? '; Secure' : '';
      document.cookie = `${ATTR_COOKIE}=${encodeURIComponent(JSON.stringify(next))}; Path=/; SameSite=Lax${age}${secure}`;
    } catch {
      /* cookies blocked — the lead is still saved, only without a source */
    }
  }, []);
  return null;
}
