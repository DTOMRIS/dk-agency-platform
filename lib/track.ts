import type { UserEventType } from '@/lib/data/userEvents';

/**
 * Fire-and-forget client-side event tracker.
 * Calls POST /api/user/events — never blocks UI, never throws.
 */
export function track(type: UserEventType, payload?: Record<string, unknown>): void {
  try {
    fetch('/api/user/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, payload }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // Silent — telemetry must never affect UX
  }
}
