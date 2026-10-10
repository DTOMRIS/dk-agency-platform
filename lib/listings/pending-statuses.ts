import { sql, type SQL } from 'drizzle-orm';
import { listings } from '@/lib/db/schema';

/**
 * TASK-0526: ONE definition of «gözləyən elan» (listing waiting for a decision). Before there were three:
 * the dashboard home counted 5 statuses, the listings page / repository 3, the sidebar badge only
 * `submitted` — so the same panel showed three different «pending» numbers.
 * = every status of the review pipeline before a final decision (showcase_ready / rejected / archived).
 */
export const PENDING_LISTING_STATUSES = [
  'submitted',
  'ai_checked',
  'committee_review',
  'shortlisted',
  'docs_requested',
] as const;

/** `count(*) filter (where status in (…pending…))::int` for drizzle selects. */
export function pendingCountSql(): SQL<number> {
  return sql<number>`count(*) filter (where ${listings.status} in (${sql.join(
    PENDING_LISTING_STATUSES.map((status) => sql`${status}`),
    sql`, `,
  )}))::int`;
}
