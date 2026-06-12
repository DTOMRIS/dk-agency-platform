import { NextRequest, NextResponse } from 'next/server';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import { getAdminNewsArticleById, updateNewsArticleAdmin, deleteNewsArticle, translateNewsArticleBySlug } from '@/lib/repositories/newsRepository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();
  const articleId = Number(id);
  const article = await getAdminNewsArticleById(articleId);

  if (!article) {
    return NextResponse.json({ success: false, error: 'Xeber tapilmadi.' }, { status: 404 });
  }

  // If titleAz/summaryAz missing, fall back to original English — don't block approve
  const nextTitleAz = typeof body.titleAz === 'string' ? body.titleAz : (article.titleAz || article.title);
  const nextSummaryAz = typeof body.summaryAz === 'string' ? body.summaryAz : (article.summaryAz || article.summary || '');

  // Auto-fill titleAz/summaryAz from original if empty (so approve always works)
  if (body.status === 'approved' && (!article.titleAz || !article.summaryAz)) {
    body.titleAz = body.titleAz || nextTitleAz;
    body.summaryAz = body.summaryAz || nextSummaryAz;
  }

  const publishedAt =
    typeof body.publishedAt === 'string' && !Number.isNaN(Date.parse(body.publishedAt))
      ? new Date(body.publishedAt)
      : undefined;
  const externalUrl =
    typeof body.externalUrl === 'string' &&
    body.externalUrl.trim() === '' &&
    article.externalUrl?.startsWith('manual:')
      ? article.externalUrl
      : body.externalUrl;

  const result = await updateNewsArticleAdmin(articleId, {
    status: body.status,
    isEditorPick: body.isEditorPick,
    isManset: body.isManset,
    isTop: body.isTop,
    isGundem: body.isGundem,
    titleAz: body.titleAz,
    titleRu: body.titleRu,
    titleEn: body.titleEn,
    titleTr: body.titleTr,
    summaryAz: body.summaryAz,
    summaryRu: body.summaryRu,
    summaryEn: body.summaryEn,
    summaryTr: body.summaryTr,
    contentAz: body.contentAz,
    contentRu: body.contentRu,
    contentEn: body.contentEn,
    contentTr: body.contentTr,
    category: body.category,
    author: body.author,
    imageUrl: body.imageUrl,
    seoTitle: body.seoTitle,
    seoDescription: body.seoDescription,
    slug: body.slug,
    publishedAt,
    externalUrl,
    sourceId: body.sourceId,
    newsType: body.newsType,
    telegramSend: body.telegramSend,
    logoOverlay: body.logoOverlay,
  });

  // Auto-translate + auto-match toolkits on approve (fire-and-forget)
  const savedSlug = typeof body.slug === 'string' && body.slug.trim() ? body.slug.trim() : article.slug;
  if (body.status === 'approved' && savedSlug) {
    translateNewsArticleBySlug(savedSlug).catch(() => {});

    // Match related toolkits via DeepSeek
    import('@/lib/news/match-toolkits').then(({ matchToolkitsForArticle }) => {
      const tAz = body.titleAz || article.titleAz || '';
      const sAz = body.summaryAz || article.summaryAz || '';
      const cAz = body.contentAz || (article as Record<string, unknown>).contentAz as string || '';
      matchToolkitsForArticle(tAz, sAz, cAz).then((match) => {
        if (match.toolkits.length > 0 || match.blogSlug) {
          import('@/lib/repositories/newsRepository').then(({ updateNewsArticleAdmin }) => {
            updateNewsArticleAdmin(articleId, {
              relatedToolkits: match.toolkits,
              relatedBlogSlug: match.blogSlug,
            } as Record<string, unknown>).catch(() => {});
          }).catch(() => {});
        }
      }).catch(() => {});
    }).catch(() => {});
  }

  return NextResponse.json({
    success: true,
    source: result.source,
    data: { id: articleId, slug: savedSlug },
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = Number(id);
  const article = await getAdminNewsArticleById(articleId);

  if (!article) {
    return NextResponse.json({ success: false, error: 'Xeber tapilmadi.' }, { status: 404 });
  }

  const result = await deleteNewsArticle(articleId);
  return NextResponse.json({ success: true, source: result.source });
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canAccessNewsAdmin(request);
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const articleId = Number(id);
  const article = await getAdminNewsArticleById(articleId);

  if (!article) {
    return NextResponse.json({ success: false, error: 'Xeber tapilmadi.' }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: article });
}
