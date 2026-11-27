/** TASK-0553: select events before AI; bounded synthesis and durable owner delivery. */
import { randomUUID } from 'node:crypto';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { newsArticles } from '@/lib/db/schema';
import { slugifyAz } from '@/lib/utils/slugify-az';
import { draftNewsArticle } from './editorial';
import { conflictingSignals, groupSignals, orderForSynthesis, preferredSignal, SOURCE_DAILY_CAP } from './story-policy';
import { deliverPendingApprovals, queueApproval, recentSignals, reserveSynthesis, todaySourceCounts } from './pipeline-state';
import { MAX_AI_ATTEMPTS_PER_RUN, RUN_SYNTHESIS_CAP } from './pipeline-sql';
import { isRegulationTopic } from './scoring-config';
import { loadDecisionContext } from './owner-feedback';

export interface SynthesizeResult {
  synthesized: number; skipped: number; unpublishable: number;
  /** System failures (DB, API key, Telegram delivery): the run must go red. */
  errors: string[];
  /** TASK-0563: one article the AI could not draft (forbidden word, bad JSON). The rest still ship. */
  warnings: string[];
}

export async function synthesizeFetchedNews(limit = RUN_SYNTHESIS_CAP, runKey: string = randomUUID()): Promise<SynthesizeResult> {
  const result: SynthesizeResult = { synthesized: 0, skipped: 0, unpublishable: 0, errors: [], warnings: [] };
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!db || !apiKey) {
    result.errors.push(!db ? 'Database not available' : 'DEEPSEEK_API_KEY not set');
    return result;
  }
  // Missing migration must fail before an AI request. Historical queue is never backfilled.
  const delivery = await deliverPendingApprovals();
  result.errors.push(...delivery.errors);
  const signals = await recentSignals();
  const groups = orderForSynthesis(groupSignals(signals), isRegulationTopic);
  const perSource = await todaySourceCounts();
  // TASK-0561: the owner's last decisions + titles he already saw this week steer the editor pass.
  const decisions = await loadDecisionContext();
  // TASK-0566: the run cap counts drafts that reach the owner, not AI attempts. Since TASK-0561 the
  // editor pass rejects ~2/3 of title-only signals as unpublishable; when those spent the 15 slots, a
  // run delivered only 3–4 drafts (26–27.11). Budget slots are now reserved only for publishable drafts;
  // AI calls per run are bounded separately by MAX_AI_ATTEMPTS_PER_RUN.
  const cap = Math.min(RUN_SYNTHESIS_CAP, Math.max(0, limit));
  let attempts = 0;
  let drafted = 0;
  let reviews = 0;
  for (const group of groups) {
    if (drafted >= cap || attempts >= MAX_AI_ATTEMPTS_PER_RUN) break;
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
    const source = article.author ?? '';
    if ((perSource.get(source) ?? 0) >= SOURCE_DAILY_CAP) { result.skipped++; continue; }
    const sourceUrls = group.filter((x) => x.id !== article.id).map((x) => x.externalUrl);
    attempts++;
    try {
      const outcome = await draftNewsArticle(article, apiKey, decisions);
      if (outcome.kind === 'error') { result.warnings.push(`${outcome.error} for article #${article.id}`); continue; }
      if (outcome.kind === 'unpublishable') {
        await db.update(newsArticles).set({ origin: 'synthesized', seoDescription: `[unpublishable] ${outcome.reason}`.slice(0, 160) })
          .where(eq(newsArticles.id, article.id));
        result.unpublishable++;
        continue;
      }
      // TASK-0566: reserve the day/run slot only now. A full day or run ends the loop; the draft is dropped
      // and the signal stays `fetched` for the next run.
      if (!await reserveSynthesis(article.id, runKey)) { result.skipped++; break; }
      drafted++;
      perSource.set(source, (perSource.get(source) ?? 0) + 1);
      // Queue before saving content; a crash cannot leave a completed draft without delivery state.
      await queueApproval(article.id, outcome.editorNote, sourceUrls);
      decisions.recentTitles.push(outcome.titleAz); // same-run repeats are caught too
      await db.update(newsArticles).set({ titleAz: outcome.titleAz,
        slug: `${slugifyAz(outcome.titleAz).slice(0, 80) || 'xeber'}-${article.id}`,
        contentAz: outcome.bodyAz, summaryAz: outcome.summaryAz, origin: 'synthesized', status: 'translated',
      }).where(eq(newsArticles.id, article.id));
      result.synthesized++;
    } catch (err) {
      result.warnings.push(`[synthesis] ${err instanceof Error ? err.message : 'Unknown error'} for article #${article.id}`);
    }
  }
  const after = await deliverPendingApprovals(RUN_SYNTHESIS_CAP - delivery.attempted);
  result.errors.push(...after.errors);
  return result;
}
