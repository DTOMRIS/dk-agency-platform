'use client';
import { useSyncExternalStore } from 'react';
import { holidayPhase, seasonalLogo } from '@/lib/brand/seasonal';
function subscribe(onChange: () => void) {
  const timer = window.setInterval(onChange, 30_000);
  document.addEventListener('visibilitychange', onChange);
  return () => { window.clearInterval(timer); document.removeEventListener('visibilitychange', onChange); };
}
// Stable SSR snapshots avoid cached pages causing hydration mismatches across midnight.
export function useSeasonalLogo() {
  return useSyncExternalStore(subscribe, () => seasonalLogo(Date.now()), () => false);
}
export function useHolidayPhase() {
  return useSyncExternalStore(subscribe, () => holidayPhase(Date.now()), () => null);
}
