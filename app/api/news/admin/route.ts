import { NextRequest, NextResponse } from 'next/server';
import { canAccessNewsAdmin } from '@/lib/news/admin-access';
import { getAdminNewsArticles, getNewsSourcesAdmin } from '@/lib/repositories/newsRepository';

export async function GET(request: NextRequest) {
  const auth = await canAccessNewsAdmin(request);
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const status = searchParams.get('status');

  console.log('[api/news/admin] request', {
    resource: resource ?? 'articles',
    status: status ?? 'all',
    loggedIn: auth.session.loggedIn,
    plan: auth.session.plan,
    viaSameOrigin: auth.viaSameOrigin,
    viaDashboardReferer: auth.viaDashboardReferer,
  });

  if (!auth.allowed) {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  if (resource === 'sources') {
    const sources = await getNewsSourcesAdmin();
    console.log('[api/news/admin] sources', { total: sources.length });
    return NextResponse.json({ success: true, data: sources });
  }

  const result = await getAdminNewsArticles({ status });
  console.log('[api/news/admin] articles', {
    status: status ?? 'all',
    total: result.total,
    source: result.source,
  });
  return NextResponse.json({ success: true, data: result.items, total: result.total, source: result.source });
}
