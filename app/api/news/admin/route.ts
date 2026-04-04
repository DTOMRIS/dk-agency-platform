import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAdminNewsArticles, getNewsSourcesAdmin } from '@/lib/repositories/newsRepository';

export async function GET(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!session.loggedIn || session.plan !== 'admin') {
    return NextResponse.json({ success: false, error: 'Admin girisi teleb olunur.' }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const resource = searchParams.get('resource');

  if (resource === 'sources') {
    const sources = await getNewsSourcesAdmin();
    return NextResponse.json({ success: true, data: sources });
  }

  const status = searchParams.get('status');
  const result = await getAdminNewsArticles({ status });
  return NextResponse.json({ success: true, data: result.items, total: result.total, source: result.source });
}
