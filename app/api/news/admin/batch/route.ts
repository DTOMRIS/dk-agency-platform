/**
 * @file app/api/news/admin/batch/route.ts
 * @purpose Bulk delete / approve / reject for the admin news list (TASK-0490).
 *
 * - Same guard as /api/news/admin/[id] (canAccessNewsAdmin → admin session only).
 * - approve reuses lib/news/approve.ts approveNewsArticle per id (same rules as the
 *   Telegram button: AZ title+content required, already decided rows are skipped).
 *   Translation / toolkit side effects run in a small background queue so a
 *   200-row approve does not start 200 translation jobs at once.
 * - reject → status 'rejected' (+ editor pick cleared, like the row button).
 * - delete → same as DELETE /api/news/admin/[id]; approved rows are skipped unless includeApproved.
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import { approveNewsArticle, performApproveSideEffects } from '@/lib/news/approve';
import { deleteNewsArticles, setNewsArticlesStatus } from '@/lib/repositories/newsRepository';

export const maxDuration = 120;

const BatchSchema = z.object({
  ids: z.array(z.number().int().positive()).max(200),
  action: z.enum(['delete', 'approve', 'reject']),
  /** TASK-0493: deleting published articles needs an explicit second confirmation. */
  includeApproved: z.boolean().optional(),
});

const SIDE_EFFECT_CONCURRENCY = 2;

type SideEffectJob = {
  id: number;
  slug: string | null;
  text: { titleAz?: string | null; summaryAz?: string | null; contentAz?: string | null };
};

/** Background queue: at most SIDE_EFFECT_CONCURRENCY jobs in flight. Never throws. */
function queueSideEffects(jobs: SideEffectJob[]): void {
  if (jobs.length === 0) return;
  let next = 0;
  const worker = async () => {
    while (next < jobs.length) {
      const job = jobs[next++];
      await performApproveSideEffects(job.id, job.slug, job.text).catch(() => undefined);
    }
  };
  void Promise.all(Array.from({ length: Math.min(SIDE_EFFECT_CONCURRENCY, jobs.length) }, worker));
}

export async function POST(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    const status = auth.session.loggedIn ? 403 : 401;
    return NextResponse.json({ success: false, error: 'Admin girişi tələb olunur.' }, { status });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ success: false, error: 'JSON formatı yanlış.' }, { status: 400 });
  }

  const parsed = BatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: parsed.error.issues[0]?.message || 'Yanlış məlumat.',
        details: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const ids = Array.from(new Set(parsed.data.ids));
  const { action } = parsed.data;

  if (ids.length === 0) {
    return NextResponse.json({ success: true, action, processed: [], skipped: [] });
  }

  try {
    if (action === 'delete') {
      const { deleted: processed, protectedIds } = await deleteNewsArticles(ids, {
        includeApproved: parsed.data.includeApproved === true,
      });
      const skipped = ids
        .filter((id) => !processed.includes(id))
        .map((id) => ({ id, reason: protectedIds.includes(id) ? 'approved_protected' : 'not_found' }));
      return NextResponse.json({ success: true, action, processed, skipped });
    }

    if (action === 'reject') {
      const processed = await setNewsArticlesStatus(ids, 'rejected');
      const skipped = ids
        .filter((id) => !processed.includes(id))
        .map((id) => ({ id, reason: 'not_found' }));
      return NextResponse.json({ success: true, action, processed, skipped });
    }

    // approve — sequential DB writes (cheap); side effects queued in background.
    const processed: number[] = [];
    const skipped: Array<{ id: number; reason: string }> = [];
    const jobs: SideEffectJob[] = [];
    for (const id of ids) {
      const outcome = await approveNewsArticle(id, { sideEffects: false });
      if (outcome.ok) {
        processed.push(id);
        jobs.push({ id, slug: outcome.slug, text: outcome.text ?? {} });
      } else {
        skipped.push({ id, reason: outcome.reason });
      }
    }
    queueSideEffects(jobs);

    return NextResponse.json({ success: true, action, processed, skipped });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Toplu əməliyyat alınmadı.';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
