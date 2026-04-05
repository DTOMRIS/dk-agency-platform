import { NextRequest, NextResponse } from 'next/server';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import { updateNewsArticleReviewState } from '@/lib/repositories/newsRepository';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await canAccessNewsAdmin(request);
  console.log('[api/news/admin/:id] patch', {
    id: (await params).id,
    loggedIn: auth.session.loggedIn,
    plan: auth.session.plan,
    viaSameOrigin: auth.viaSameOrigin,
    viaDashboardReferer: auth.viaDashboardReferer,
  });
  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  const result = await updateNewsArticleReviewState(Number(id), {
    status: body.status,
    isEditorPick: body.isEditorPick,
  });

  return NextResponse.json({ success: true, source: result.source });
}
