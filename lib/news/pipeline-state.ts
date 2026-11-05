import { and, eq, gte, ne } from 'drizzle-orm';
import { sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { bakuDay, conflictingSignals, relatedSignals, type Signal } from './story-policy';
import { deliverNewsForApproval } from '@/lib/telegram/news-approval';
import { claimDeliveryQuery, queueApprovalQuery, reserveQuery, RUN_SYNTHESIS_CAP } from './pipeline-sql';

function database() {
  if (!db) throw new Error('Database not available');
  return db;
}

export async function recentSignals(): Promise<Signal[]> {
  return database().select({
    id: newsArticles.id, title: newsArticles.title, summary: newsArticles.summary,
    externalUrl: newsArticles.externalUrl, publishedAt: newsArticles.publishedAt,
    status: newsArticles.status, origin: newsArticles.origin,
    contentAz: newsArticles.contentAz, relevanceScore: newsArticles.relevanceScore,
    author: newsArticles.author,
  }).from(newsArticles).where(and(
    gte(newsArticles.createdAt, new Date(Date.now() - 14 * 86400_000)),
    ne(newsArticles.status, 'rejected'),
  ));
}

/** Re-evaluate on approval too: a contrary source may have arrived after drafting. */
export async function publicationIssue(articleId: number): Promise<string | null> {
  const signals = await recentSignals();
  let article = signals.find((a) => a.id === articleId);
  if (!article) {
    const rows = await database().select().from(newsArticles).where(eq(newsArticles.id, articleId));
    article = rows[0];
  }
  if (!article || article.origin === 'manual') return null;
  const peers = signals.filter((a) => a.id !== articleId && relatedSignals(article, a));
  if (peers.some((a) => conflictingSignals(article, a))) {
    return 'Mənbələr arasında ziddiyyət var. Paneldə mənbələri yoxlayın və yanlış siqnalı rədd edin.';
  }
  if (peers.some((a) => a.status === 'approved')) {
    return 'Bu hadisə artıq başqa mənbədən dərc olunub.';
  }
  return null;
}

/** TASK-0557: synthesis slots already used today, per source name. */
export async function todaySourceCounts(): Promise<Map<string, number>> {
  const result = await database().execute(sql`SELECT a.author, count(*)::int AS n FROM news_pipeline_budget b
    JOIN news_articles a ON a.id=b.article_id WHERE b.day=${bakuDay()}::date GROUP BY a.author`);
  return new Map(result.rows.map((r) => [String(r.author ?? ''), Number(r.n)]));
}

/** Atomic bounded reservation: manual runs share the same Baku-day allowance. */
export async function reserveSynthesis(articleId: number, runKey: string): Promise<boolean> {
  try {
    const result = await database().execute(reserveQuery(bakuDay(), articleId, runKey));
    return result.rows.length > 0;
  } catch (err) {
    // TASK-0557: before migration 0023 the slot check still stops at 12 — treat as "day is full".
    const cause = (err as { cause?: Error })?.cause;
    if (/news_pipeline_budget_slot_check|23514/.test(`${cause?.message ?? ''} ${err instanceof Error ? err.message : ''}`)) {
      return false;
    }
    throw err;
  }
}

export async function queueApproval(articleId: number, note: string, sourceUrls: string[], held = false): Promise<boolean> {
  const result = await database().execute(queueApprovalQuery(articleId, note, [...new Set(sourceUrls)].sort(), held));
  return result.rows.length > 0;
}

export async function deliverPendingApprovals(limit = RUN_SYNTHESIS_CAP): Promise<{ sent: number; attempted: number; errors: string[] }> {
  const store = database();
  const result = { sent: 0, attempted: 0, errors: [] as string[] };
  // A killed worker may have sent the message. Never blindly resend it.
  await store.execute(sql`UPDATE news_approval_delivery SET state='uncertain', updated_at=now()
    WHERE state='sending' AND updated_at < now() - interval '10 minutes'`);
  const unresolved = await store.execute(sql`SELECT article_id, state FROM news_approval_delivery
    WHERE state='uncertain' OR (state='failed' AND attempts >= 3) ORDER BY article_id LIMIT 20`);
  for (const row of unresolved.rows) result.errors.push(`Telegram #${row.article_id}: ${row.state}; manual review required`);
  const pending = await store.execute(sql`
    SELECT d.article_id, d.editor_note, d.source_urls, d.attempts, d.review_only, a.title, a.title_az, a.summary_az, a.content_az, a.external_url
    FROM news_approval_delivery d JOIN news_articles a ON a.id=d.article_id
    WHERE d.state IN ('pending','failed') AND d.attempts < 3 AND d.next_attempt_at <= now()
      AND (a.status='translated' OR (d.review_only AND a.status IN ('fetched','approved')))
    ORDER BY d.updated_at LIMIT ${Math.min(RUN_SYNTHESIS_CAP, Math.max(0, limit))}`);
  for (const row of pending.rows) {
    const id = Number(row.article_id);
    const issue = await publicationIssue(id);
    let reviewOnly = Boolean(row.review_only);
    if (issue) {
      await store.execute(sql`UPDATE news_approval_delivery SET review_only=true, editor_note=${issue}, updated_at=now() WHERE article_id=${id}`);
      reviewOnly = true;
    }
    const claimed = await store.execute(claimDeliveryQuery(id));
    if (!claimed.rows.length) continue;
    result.attempted++;
    const delivery = await deliverNewsForApproval({
      id, titleAz: String(row.title_az ?? row.title ?? ''), summaryAz: String(row.summary_az ?? ''),
      contentAz: String(row.content_az ?? ''), externalUrl: String(row.external_url ?? ''),
      editorNote: issue ?? String(row.editor_note ?? ''), reviewOnly,
      sourceUrls: Array.isArray(row.source_urls) ? row.source_urls.filter((x): x is string => typeof x === 'string') : [],
    });
    await store.execute(sql`UPDATE news_approval_delivery SET state=${delivery.state}, message_id=${delivery.messageId ?? null},
      next_attempt_at=now() + interval '1 hour', updated_at=now() WHERE article_id=${id}`);
    if (delivery.state === 'sent') result.sent++;
    else result.errors.push(`Telegram #${id}: ${delivery.state}`);
  }
  return result;
}
