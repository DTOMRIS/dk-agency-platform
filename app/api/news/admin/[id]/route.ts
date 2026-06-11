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

  const nextTitleAz = typeof body.titleAz === 'string' ? body.titleAz : article.titleAz;
  const nextSummaryAz = typeof body.summaryAz === 'string' ? body.summaryAz : article.summaryAz;

  if (body.status === 'approved' && (!nextTitleAz || !nextTitleAz.trim() || !nextSummaryAz || !nextSummaryAz.trim())) {
    return NextResponse.json(
      { success: false, error: 'Tərcümə olunmamış xəbər approve edilə bilməz.' },
      { status: 400 },
    );
  }

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
  });

  // Auto-translate on approve (fire-and-forget — don't block response)
  if (body.status === 'approved' && article.slug) {
    translateNewsArticleBySlug(article.slug).catch(() => {});
  }

  return NextResponse.json({ success: true, source: result.source });
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
