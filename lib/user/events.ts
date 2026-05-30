import { db } from '@/lib/db';
import { userEvents } from '@/lib/db/schema';
import { type UserEventType, isValidEventType } from '@/lib/data/userEvents';

/**
 * Fire-and-forget event logger. Never throws — safe to call in any context.
 * Silently drops if DB is unavailable or type is invalid.
 */
export async function logEvent(
  userId: number,
  type: UserEventType,
  payload?: Record<string, unknown>,
): Promise<void> {
  if (!db || !isValidEventType(type)) return;
  try {
    await db.insert(userEvents).values({
      userId,
      eventType: type,
      payload: payload ?? null,
    });
  } catch {
    // Silent — telemetry must never block UX
  }
}
