/** TASK-0553: select events before AI; bounded synthesis and durable owner delivery. */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { slugifyAz } from '@/lib/utils/slugify-az';
import { draftNewsArticle } from './editorial';
import { conflictingSignals, groupSignals, preferredSignal } from './story-policy';
import { deliverPendingApprovals, queueApproval, recentSignals, reserveSynthesis } from './pipeline-state';

export interface SynthesizeResult {
  synthesized: number; skipped: number; unpublishable: number; errors: string[];
}

export async function synthesizeFetchedNews(limit = 6, runKey: string = randomUUID()): Promise<SynthesizeResult> {
  const result: SynthesizeResult = { synthesized: 0, skipped: 0, unpublishable: 0, errors: [] };
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!db || !apiKey) {
    result.errors.push(!db ? 'Database not available' : 'DEEPSEEK_API_KEY not set');
    return result;
  }
  // Missing migration must fail before an AI request. Historical queue is never backfilled.
  const delivery = await deliverPendingApprovals();
  result.errors.push(...delivery.errors);
  const signals = await recentSignals();
  const groups = groupSignals(signals).sort((a, b) =>
    Math.max(...b.map((x) => x.relevanceScore ?? 0)) - Math.max(...a.map((x) => x.relevanceScore ?? 0)));
  let attempts = 0;
  let reviews = 0;
  for (const group of groups) {
    if (attempts >= Math.min(6, Math.max(0, limit))) break;
    const eligible = group.filter((x) => ['rss', 'newsdata'].includes(x.origin)
      && x.status === 'fetched' && !x.contentAz && x.publishedAt
      && +x.publishedAt >= Date.now() - 14 * 86400_000 && +x.publishedAt <= Date.now() + 3600_000);
    if (group.some((x) => group.some((y) => conflictingSignals(x, y)))) {
      if (reviews < 2) {
        const drafted = group.filter((x) => x.origin === 'synthesized');
        const review = preferredSignal(drafted.length ? drafted : group);
        const queued = await queueApproval(review.id, '⚠️ Mənbələr fərqli rəqəm və ya istiqamət bildirir. Paneldə yoxlayın.',
          group.filter((x) => x.id !== review.id).map((x) => x.externalUrl), true);
        if (queued) reviews++;
      }
      result.skipped++;
      continue;
    }
    if (!eligible.length || group.some((x) => x.status === 'approved' || x.origin === 'synthesized')) {
      result.skipped++;
      continue;
    }
    const article = preferredSignal(eligible);
    const sourceUrls = group.filter((x) => x.id !== article.id).map((x) => x.externalUrl);
    if (!await reserveSynthesis(article.id, runKey)) { result.skipped++; continue; }
    attempts++;
    try {
      const outcome = await draftNewsArticle(article, apiKey);
      if (outcome.kind === 'error') { result.errors.push(`${outcome.error} for article #${article.id}`); continue; }
      if (outcome.kind === 'unpublishable') {
        await db.update(newsArticles).set({ origin: 'synthesized', seoDescription: `[unpublishable] ${outcome.reason}`.slice(0, 160) })
          .where(eq(newsArticles.id, article.id));
        result.unpublishable++;
        continue;
      }
      // Queue before saving content; a crash cannot leave a completed draft without delivery state.
      await queueApproval(article.id, outcome.editorNote, sourceUrls);
      await db.update(newsArticles).set({ titleAz: outcome.titleAz,
        slug: `${slugifyAz(outcome.titleAz).slice(0, 80) || 'xeber'}-${article.id}`,
        contentAz: outcome.bodyAz, summaryAz: outcome.summaryAz, origin: 'synthesized', status: 'translated',
      }).where(eq(newsArticles.id, article.id));
      result.synthesized++;
    } catch (err) {
      result.errors.push(`[synthesis] ${err instanceof Error ? err.message : 'Unknown error'} for article #${article.id}`);
    }
  }
  const after = await deliverPendingApprovals(6 - delivery.attempted);
  result.errors.push(...after.errors);
  return result;
}
