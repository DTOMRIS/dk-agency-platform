import { db } from '@/lib/db';
import { users, userEvents } from '@/lib/db/schema';
import { sql, gte, and, eq, count, countDistinct } from 'drizzle-orm';

export interface FunnelData {
  registered: number;
  prioritiesSet: number;
  prioritiesSkipped: number;
  toolClicked24h: number;
  d7Returned: number;
  prioritiesSetRate: number;
  activationRate: number;
  d7RetentionRate: number;
}

export async function getActivationFunnel(days: number = 30): Promise<FunnelData> {
  const empty: FunnelData = {
    registered: 0,
    prioritiesSet: 0,
    prioritiesSkipped: 0,
    toolClicked24h: 0,
    d7Returned: 0,
    prioritiesSetRate: 0,
    activationRate: 0,
    d7RetentionRate: 0,
  };

  if (!db) return empty;

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  try {
    // Stage 1: registered users in date range
    const [regRow] = await db
      .select({ cnt: count() })
      .from(users)
      .where(gte(users.createdAt, cutoff));
    const registered = regRow?.cnt ?? 0;

    if (registered === 0) return empty;

    // Stage 2: users who set priorities
    const [prioRow] = await db
      .select({ cnt: countDistinct(userEvents.userId) })
      .from(userEvents)
      .innerJoin(users, eq(userEvents.userId, users.id))
      .where(
        and(
          eq(userEvents.eventType, 'priorities_set'),
          gte(users.createdAt, cutoff),
        ),
      );
    const prioritiesSet = prioRow?.cnt ?? 0;

    // Stage 2b: users who skipped
    const [skipRow] = await db
      .select({ cnt: countDistinct(userEvents.userId) })
      .from(userEvents)
      .innerJoin(users, eq(userEvents.userId, users.id))
      .where(
        and(
          eq(userEvents.eventType, 'priorities_skipped'),
          gte(users.createdAt, cutoff),
        ),
      );
    const prioritiesSkipped = skipRow?.cnt ?? 0;

    // Stage 3: users who set priorities AND clicked a tool within 24h
    const [toolRow] = await db
      .select({ cnt: sql<number>`count(distinct tc.user_id)::int` })
      .from(
        sql`(
          SELECT ue1.user_id, ue1.created_at as prio_at
          FROM user_events ue1
          INNER JOIN users u ON u.id = ue1.user_id
          WHERE ue1.event_type = 'priorities_set'
            AND u.created_at >= ${cutoff}
        ) ps
        INNER JOIN user_events tc ON tc.user_id = ps.user_id
          AND tc.event_type = 'tool_recommended_clicked'
          AND tc.created_at <= ps.prio_at + interval '24 hours'`,
      );
    const toolClicked24h = toolRow?.cnt ?? 0;

    // Stage 4: users with any event >= 7 days after registration
    const [d7Row] = await db
      .select({ cnt: sql<number>`count(distinct ue.user_id)::int` })
      .from(
        sql`user_events ue
        INNER JOIN users u ON u.id = ue.user_id
        WHERE u.created_at >= ${cutoff}
          AND ue.created_at >= u.created_at + interval '7 days'`,
      );
    const d7Returned = d7Row?.cnt ?? 0;

    const pct = (n: number, d: number) => (d > 0 ? Math.round((n / d) * 100) : 0);

    return {
      registered,
      prioritiesSet,
      prioritiesSkipped,
      toolClicked24h,
      d7Returned,
      prioritiesSetRate: pct(prioritiesSet, registered),
      activationRate: pct(toolClicked24h, registered),
      d7RetentionRate: pct(d7Returned, toolClicked24h || registered),
    };
  } catch {
    return empty;
  }
}
