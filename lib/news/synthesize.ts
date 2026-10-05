/**
 * @file synthesize.ts
 * @purpose DeepSeek Model-B — fetched signal → original DK HoReCa analysis (AZ).
 * TASK-0402: Called by `npm run news:synthesize` (manual) and later by cron (TASK-0403).
 *
 * NOT a copy/paraphrase. Creates original DK analysis from facts only.
 * TASK-0492: writing + editorial review live in ./editorial.ts (writer → editor, no fixed template).
 * Toolkit matching + translation happen at approve time (existing flow, NOT rebuilt here).
 */

import { and, desc, eq, gte, inArray, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { sendNewsForApproval } from '@/lib/telegram/news-approval';
import { slugifyAz } from '@/lib/utils/slugify-az';
import { draftNewsArticle } from './editorial';

/** TASK-0492: only fresh signals are worth writing; older backlog is left for manual triage. */
const FRESH_DAYS = 14;

export interface SynthesizeResult {
  synthesized: number;
  skipped: number;
  unpublishable: number;
  errors: string[];
}

/**
 * Process fetched signals: send to DeepSeek for original DK analysis.
 * Only processes articles with origin='newsdata' or 'rss', status='fetched', no contentAz.
 */
export async function synthesizeFetchedNews(limit = 15): Promise<SynthesizeResult> {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) {
    return { synthesized: 0, skipped: 0, unpublishable: 0, errors: ['DEEPSEEK_API_KEY not set'] };
  }
  if (!db) {
    return { synthesized: 0, skipped: 0, unpublishable: 0, errors: ['Database not available'] };
  }

  const result: SynthesizeResult = { synthesized: 0, skipped: 0, unpublishable: 0, errors: [] };

  // Get fetched signals without content
  const pending = await db
    .select({
      id: newsArticles.id,
      title: newsArticles.title,
      summary: newsArticles.summary,
      externalUrl: newsArticles.externalUrl,
      publishedAt: newsArticles.publishedAt,
    })
    .from(newsArticles)
    .where(
      and(
        // TASK-0480: trade-press RSS drafts go through the same synthesis
        inArray(newsArticles.origin, ['newsdata', 'rss']),
        eq(newsArticles.status, 'fetched'),
        isNull(newsArticles.contentAz),
        gte(newsArticles.createdAt, new Date(Date.now() - FRESH_DAYS * 24 * 60 * 60 * 1000)),
      ),
    )
    // TASK-0492: most relevant first (was newest id first — RSS rows filled every batch and the
    // Azerbaijani NewsData rows never got a turn), then newest.
    .orderBy(sql`${newsArticles.relevanceScore} desc nulls last`, desc(newsArticles.id))
    .limit(limit);

  if (!pending.length) {
    result.skipped = 0;
    return result;
  }

  for (const article of pending) {
    try {
      const outcome = await draftNewsArticle(
        {
          title: article.title,
          summary: article.summary,
          externalUrl: article.externalUrl,
          publishedAt: article.publishedAt,
        },
        apiKey,
      );

      if (outcome.kind === 'error') {
        result.errors.push(`${outcome.error} for article #${article.id}`);
        continue;
      }

      // TASK-0476: mark weak/off-topic/stale signals processed so they are not retried forever.
      if (outcome.kind === 'unpublishable') {
        await db
          .update(newsArticles)
          .set({
            origin: 'synthesized',
            // seo_description is varchar(160)
            seoDescription: `[unpublishable] ${outcome.reason}`.slice(0, 160),
          })
          .where(eq(newsArticles.id, article.id));
        result.unpublishable++;
        continue;
      }

      await db
        .update(newsArticles)
        .set({
          titleAz: outcome.titleAz,
          // TASK-0478: public URL from the AZ headline (not the foreign source title) + id = unique.
          slug: `${slugifyAz(outcome.titleAz).slice(0, 80) || 'xeber'}-${article.id}`,
          contentAz: outcome.bodyAz,
          summaryAz: outcome.summaryAz,
          origin: 'synthesized',
          status: 'translated',
        })
        .where(eq(newsArticles.id, article.id));

      result.synthesized++;

      // TASK-0477: ask the owner on Telegram (✅ Yayınla / ❌ Rədd et). No-op without TELEGRAM_* env.
      await sendNewsForApproval({
        id: article.id,
        titleAz: outcome.titleAz,
        summaryAz: outcome.summaryAz,
        contentAz: outcome.bodyAz,
        externalUrl: article.externalUrl,
        editorNote: outcome.editorNote,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      result.errors.push(`[synthesis] ${msg.slice(0, 200)} for article #${article.id}`);
    }
  }

  return result;
}
