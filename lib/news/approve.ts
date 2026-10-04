/**
 * @file lib/news/approve.ts
 * @purpose Single approve/reject path for news — used by the admin API and the Telegram buttons (TASK-0477).
 */

import {
  getAdminNewsArticleById,
  translateNewsArticleBySlug,
  updateNewsArticleAdmin,
} from '@/lib/repositories/newsRepository';

/**
 * After an article is approved: auto-translate (RU/EN/TR) and match related toolkits.
 * Fire-and-forget — failures must not block the approval itself.
 */
export function runApproveSideEffects(
  articleId: number,
  slug: string | null | undefined,
  text: { titleAz?: string | null; summaryAz?: string | null; contentAz?: string | null }
): void {
  if (!slug) return;
  translateNewsArticleBySlug(slug).catch(() => {});

  import('@/lib/news/match-toolkits')
    .then(({ matchToolkitsForArticle }) =>
      matchToolkitsForArticle(text.titleAz || '', text.summaryAz || '', text.contentAz || '')
    )
    .then((match) => {
      if (match.toolkits.length > 0 || match.blogSlug) {
        return updateNewsArticleAdmin(articleId, {
          relatedToolkits: match.toolkits,
          relatedBlogSlug: match.blogSlug,
        } as Record<string, unknown>);
      }
      return undefined;
    })
    .catch(() => {});
}

export type ApprovalOutcome =
  | { ok: true; slug: string | null; title: string }
  | { ok: false; reason: 'not_found' | 'no_az_content' | 'already_decided'; status?: string };

/**
 * Approve a synthesized article. Unlike the admin form, this refuses articles that have no
 * Azerbaijani title/content (it never publishes the English source as if it were AZ).
 */
export async function approveNewsArticle(articleId: number): Promise<ApprovalOutcome> {
  const article = await getAdminNewsArticleById(articleId);
  if (!article) return { ok: false, reason: 'not_found' };
  if (article.status === 'approved' || article.status === 'rejected') {
    return { ok: false, reason: 'already_decided', status: article.status };
  }
  if (!article.titleAz || !article.contentAz) return { ok: false, reason: 'no_az_content' };

  await updateNewsArticleAdmin(articleId, { status: 'approved' });
  runApproveSideEffects(articleId, article.slug, article);
  return { ok: true, slug: article.slug, title: article.titleAz };
}

export async function rejectNewsArticle(articleId: number): Promise<ApprovalOutcome> {
  const article = await getAdminNewsArticleById(articleId);
  if (!article) return { ok: false, reason: 'not_found' };
  if (article.status === 'approved' || article.status === 'rejected') {
    return { ok: false, reason: 'already_decided', status: article.status };
  }
  await updateNewsArticleAdmin(articleId, { status: 'rejected' });
  return { ok: true, slug: article.slug, title: article.titleAz || article.title };
}
