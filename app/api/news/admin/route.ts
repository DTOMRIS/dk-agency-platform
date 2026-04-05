import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAdminNewsArticles, getNewsSourcesAdmin } from '@/lib/repositories/newsRepository';

export async function GET(request: NextRequest) {
  const session = await getServerMemberSession();
  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');
  const status = searchParams.get('status');

  console.log('[api/news/admin] request', {
    resource: resource ?? 'articles',
    status: status ?? 'all',
    loggedIn: session.loggedIn,
    plan: session.plan,
  });

  if (!session.loggedIn || session.plan !== 'admin') {
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
