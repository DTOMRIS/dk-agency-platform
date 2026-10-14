import Link from 'next/link';
import { notFound } from 'next/navigation';
import NewsEditorForm, { type NewsDraft } from '@/components/dashboard/NewsEditorForm';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAdminNewsArticleById } from '@/lib/repositories/newsRepository';
import { requireAdminPage } from '@/lib/auth/guards';

export const dynamic = 'force-dynamic';

const CATEGORIES: NewsDraft['category'][] = [
  'operations',
  'finance',
  'growth',
  'market',
  'technology',
];

export default async function EditNewsPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdminPage();
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') notFound();

  const { id } = await params;
  const articleId = Number(id);
  if (!Number.isInteger(articleId) || articleId <= 0) notFound();

  const article = await getAdminNewsArticleById(articleId);
  if (!article) notFound();

  const category = CATEGORIES.includes(article.category as NewsDraft['category'])
    ? (article.category as NewsDraft['category'])
    : 'market';
  const publishedAt = article.publishedAt || article.createdAt || new Date();
  const initialDraft: NewsDraft = {
    slug: article.slug || '',
    titleAz: article.titleAz || article.title || '',
    titleRu: article.titleRu || '',
    titleEn: article.titleEn || '',
    titleTr: article.titleTr || '',
    summaryAz: article.summaryAz || article.summary || '',
    summaryRu: article.summaryRu || '',
    summaryEn: article.summaryEn || '',
    summaryTr: article.summaryTr || '',
    contentAz: article.contentAz || '',
    contentRu: article.contentRu || '',
    contentEn: article.contentEn || '',
    contentTr: article.contentTr || '',
    category,
    author: article.author || 'DK Agency',
    publishedAt: publishedAt.toISOString().slice(0, 10),
    status: article.status,
    imageUrl: article.imageUrl || '',
    seoTitle: article.seoTitle || '',
    seoDescription: article.seoDescription || '',
    isEditorPick: article.isEditorPick,
    isManset: article.isManset,
    isTop: article.isTop,
    isGundem: article.isGundem,
    newsType: article.newsType === 'photo' || article.newsType === 'video' ? article.newsType : 'none',
    telegramSend: article.telegramSend,
    logoOverlay: article.logoOverlay,
    externalUrl: article.externalUrl?.startsWith('manual:') ? '' : article.externalUrl || '',
    sourceId: article.sourceId,
  };

  return (
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-[22px] border border-[#E4DCCD] bg-white p-6">
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">Xəbəri düzəlt</h1>
          <Link
            href="/dashboard/xeberler"
            className="inline-flex min-h-11 items-center rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-bold text-[#334155]"
          >
            Xəbərlər siyahısına qayıt
          </Link>
        </div>
        <NewsEditorForm initialDraft={initialDraft} articleId={articleId} />
      </div>
    </div>
  );
}
