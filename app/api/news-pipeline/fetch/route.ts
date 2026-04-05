import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { fetchNewsFromRss } from '@/lib/news/rss-pipeline';

function isAuthorized(request: NextRequest, session: Awaited<ReturnType<typeof getServerMemberSession>>) {
  const apiSecret = process.env.NEWS_API_SECRET;
  const headerSecret = request.headers.get('x-api-secret');
  const isAdminSession = session.loggedIn && session.plan === 'admin';
  return isAdminSession || (apiSecret && headerSecret === apiSecret);
}

export async function POST(request: NextRequest) {
  const session = await getServerMemberSession();
  if (!isAuthorized(request, session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const result = await fetchNewsFromRss();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: 'RSS fetch prosesi ugursuz oldu.',
        details: String(error),
      },
      { status: 500 },
    );
  }
}
