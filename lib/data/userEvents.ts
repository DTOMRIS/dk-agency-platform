/**
 * Single source of truth for user event types (adoption loop telemetry).
 * Shared between client track() helper and server logEvent().
 */

export const EVENT_TYPES = [
  'modal_opened',
  'priorities_set',
  'priorities_skipped',
  'tool_recommended_clicked',
  'nudge_shown',
  'nudge_clicked',
  'nudge_dismissed',
  'onboarding_completed',
  'gap_interest',
  // TASK-0505: üzv «Yaxında» alət üçün «Xəbər ver» basdı — payload { toolSlug }
  'tool_notify_request',
  // TASK-0532: üzv Excel şablonunu yüklədi — payload { slug }
  'template_download',
] as const;

export type UserEventType = (typeof EVENT_TYPES)[number];

export function isValidEventType(value: unknown): value is UserEventType {
  return typeof value === 'string' && (EVENT_TYPES as readonly string[]).includes(value);
}
