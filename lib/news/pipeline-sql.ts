/** Shared SQL for the production store and isolated PostgreSQL integration tests. */
import { sql } from 'drizzle-orm';

/**
 * TASK-0557 (owner 2026-11-05): 12/day (TASK-0553) cut published news from ~12–15 to ~8 a day, because
 * about half of the drafts are rejected in Telegram. Back to 30 writes a day, 15 per scheduled run.
 */
export const DAILY_SYNTHESIS_CAP = 30;
export const RUN_SYNTHESIS_CAP = 15;

export function reserveQuery(day: string, articleId: number, runKey: string) {
  return sql`INSERT INTO news_pipeline_budget(day, slot, article_id, run_key)
    SELECT ${day}::date, s, ${articleId}, ${runKey}
    FROM generate_series(1,${sql.raw(String(DAILY_SYNTHESIS_CAP))}) s
    WHERE NOT EXISTS (SELECT 1 FROM news_pipeline_budget b WHERE b.day=${day}::date AND b.slot=s)
      AND (SELECT count(*) FROM news_pipeline_budget WHERE run_key=${runKey}) < ${sql.raw(String(RUN_SYNTHESIS_CAP))}
      AND NOT EXISTS (SELECT 1 FROM news_pipeline_budget WHERE day=${day}::date AND article_id=${articleId})
    ORDER BY s LIMIT 1 ON CONFLICT DO NOTHING RETURNING slot`;
}

export function claimDeliveryQuery(articleId: number) {
  return sql`UPDATE news_approval_delivery SET state='sending', attempts=attempts+1, updated_at=now()
    WHERE article_id=${articleId} AND state IN ('pending','failed') AND attempts < 3
      AND next_attempt_at <= now() RETURNING article_id`;
}

export function queueApprovalQuery(articleId: number, note: string, sourceUrls: string[], held: boolean) {
  return sql`INSERT INTO news_approval_delivery(article_id, editor_note, source_urls, review_only)
    VALUES (${articleId}, ${note}, ${JSON.stringify(sourceUrls)}::jsonb, ${held})
    ON CONFLICT (article_id) DO UPDATE SET editor_note=excluded.editor_note, source_urls=excluded.source_urls,
      state=CASE WHEN news_approval_delivery.review_only <> excluded.review_only AND news_approval_delivery.state='sent' THEN 'pending'
        WHEN news_approval_delivery.state IN ('sent','sending','uncertain') THEN news_approval_delivery.state ELSE 'pending' END,
      attempts=CASE WHEN news_approval_delivery.review_only <> excluded.review_only AND news_approval_delivery.state='sent' THEN 0 ELSE news_approval_delivery.attempts END,
      review_only=excluded.review_only, updated_at=now()
    WHERE news_approval_delivery.review_only <> excluded.review_only
      OR news_approval_delivery.source_urls <> excluded.source_urls
      OR (NOT excluded.review_only AND news_approval_delivery.editor_note <> excluded.editor_note)
    RETURNING article_id`;
}
