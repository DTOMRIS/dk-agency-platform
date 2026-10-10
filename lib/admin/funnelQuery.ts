import { db } from '@/lib/db';
import { sql } from 'drizzle-orm';

/**
 * Activation funnel — TASK-0526 rewrite (Haiku audit 10.10, verified in code).
 * Before: step 3 counted tool clicks made BEFORE priorities were set (no lower bound), step 4 counted
 * any event ≥ 7 days after sign-up with no upper bound and no link to step 3 (so it could exceed step 3),
 * users younger than 7 days sat in the D7 denominator, admins were counted, and a DB error looked like
 * «not enough data». Now every step is nested in the previous one:
 *   1 registered       — users created in the window, role ≠ admin
 *   2 prioritiesSet    — of 1, has a `priorities_set` event
 *   3 toolClicked24h   — of 2, a `tool_recommended_clicked` within [first priorities_set, +24 h]
 *   4 d7Returned       — of 3 and old enough (signed up ≥ 7 days ago), any event in [sign-up +7 d, +14 d)
 */
export interface FunnelData {
  registered: number;
  prioritiesSet: number;
  prioritiesSkipped: number;
  toolClicked24h: number;
  /** step-3 users who signed up at least 7 days ago (D7 denominator) */
  d7Eligible: number;
  d7Returned: number;
  prioritiesSetRate: number;
  activationRate: number;
  d7RetentionRate: number;
  /** true when the query failed — shown as an error, not as «no data» */
  error: boolean;
}

const EMPTY: FunnelData = {
  registered: 0,
  prioritiesSet: 0,
  prioritiesSkipped: 0,
  toolClicked24h: 0,
  d7Eligible: 0,
  d7Returned: 0,
  prioritiesSetRate: 0,
  activationRate: 0,
  d7RetentionRate: 0,
  error: false,
};

const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

export async function getActivationFunnel(days: number = 30): Promise<FunnelData> {
  if (!db) return { ...EMPTY, error: true };

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  try {
    const result = await db.execute(sql`
      WITH cohort AS (
        SELECT id, created_at FROM users
        WHERE created_at >= ${cutoff} AND coalesce(role, 'member') <> 'admin'
      ),
      prio AS (
        SELECT ue.user_id, min(ue.created_at) AS prio_at
        FROM user_events ue JOIN cohort c ON c.id = ue.user_id
        WHERE ue.event_type = 'priorities_set'
        GROUP BY ue.user_id
      ),
      skipped AS (
        SELECT DISTINCT ue.user_id
        FROM user_events ue JOIN cohort c ON c.id = ue.user_id
        WHERE ue.event_type = 'priorities_skipped'
      ),
      clicked AS (
        SELECT DISTINCT p.user_id
        FROM prio p JOIN user_events ue ON ue.user_id = p.user_id
        WHERE ue.event_type = 'tool_recommended_clicked'
          AND ue.created_at >= p.prio_at
          AND ue.created_at <= p.prio_at + interval '24 hours'
      ),
      eligible AS (
        SELECT k.user_id, c.created_at
        FROM clicked k JOIN cohort c ON c.id = k.user_id
        WHERE c.created_at <= now() - interval '7 days'
      ),
      returned AS (
        SELECT DISTINCT e.user_id
        FROM eligible e JOIN user_events ue ON ue.user_id = e.user_id
        WHERE ue.created_at >= e.created_at + interval '7 days'
          AND ue.created_at < e.created_at + interval '14 days'
      )
      SELECT
        (SELECT count(*) FROM cohort)::int   AS registered,
        (SELECT count(*) FROM prio)::int     AS priorities_set,
        (SELECT count(*) FROM skipped)::int  AS priorities_skipped,
        (SELECT count(*) FROM clicked)::int  AS tool_clicked,
        (SELECT count(*) FROM eligible)::int AS d7_eligible,
        (SELECT count(*) FROM returned)::int AS d7_returned
    `);

    const rows = (Array.isArray(result) ? result : (result as { rows?: unknown[] }).rows) ?? [];
    const row = rows[0] as Record<string, number | string> | undefined;
    if (!row) return { ...EMPTY, error: true };

    const n = (k: string) => Number(row[k]) || 0;
    const registered = n('registered');
    const prioritiesSet = n('priorities_set');
    const toolClicked24h = n('tool_clicked');
    const d7Eligible = n('d7_eligible');
    const d7Returned = n('d7_returned');

    return {
      registered,
      prioritiesSet,
      prioritiesSkipped: n('priorities_skipped'),
      toolClicked24h,
      d7Eligible,
      d7Returned,
      prioritiesSetRate: pct(prioritiesSet, registered),
      activationRate: pct(toolClicked24h, registered),
      d7RetentionRate: pct(d7Returned, d7Eligible),
      error: false,
    };
  } catch (err) {
    console.error('[funnel] query failed', err);
    return { ...EMPTY, error: true };
  }
}
