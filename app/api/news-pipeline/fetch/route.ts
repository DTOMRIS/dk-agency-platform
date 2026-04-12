import { NextRequest, NextResponse } from 'next/server';
import { getServerMemberSession } from '@/lib/members/server-session';
import { fetchNewsFromRss } from '@/lib/news/rss-pipeline';

const FETCH_COOLDOWN_MS = 60_000; // 60 saniyə
let lastFetchTime = 0;

function isAuthorized(
  request: NextRequest,
  session: Awaited<ReturnType<typeof getServerMemberSession>>,
) {
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

  const now = Date.now();
  const elapsed = now - lastFetchTime;
  if (elapsed < FETCH_COOLDOWN_MS) {
    const retryAfter = Math.ceil((FETCH_COOLDOWN_MS - elapsed) / 1000);
    return NextResponse.json(
      {
        error: 'Too many requests. Son çağırışdan 60 saniyə keçməyib.',
        retryAfterSeconds: retryAfter,
      },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }

  lastFetchTime = now;

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
