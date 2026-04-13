import { NextRequest, NextResponse } from 'next/server';
import { translateFetchedNews } from '@/lib/news/rss-pipeline';

const RATE_LIMIT_MS = 60_000;
const lastTranslateByIp = new Map<string, number>();

function getApiSecret(request: NextRequest) {
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.toLowerCase().startsWith('bearer ')) {
    return authHeader.slice(7).trim();
  }
  return request.headers.get('x-api-secret') || '';
}

function getClientIp(request: NextRequest) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function rateLimit(request: NextRequest) {
  const ip = getClientIp(request);
  const now = Date.now();
  const last = lastTranslateByIp.get(ip) || 0;
  if (now - last < RATE_LIMIT_MS) {
    const retryAfter = Math.ceil((RATE_LIMIT_MS - (now - last)) / 1000);
    return NextResponse.json(
      { error: 'Too many requests. 60 saniyə gözləyin.', retryAfterSeconds: retryAfter },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } },
    );
  }
  lastTranslateByIp.set(ip, now);
  return null;
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.NEWS_API_SECRET;
  const token = getApiSecret(request);
  return Boolean(secret && token && secret === token);
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const rateResponse = rateLimit(request);
  if (rateResponse) {
    return rateResponse;
  }

  try {
    const result = await translateFetchedNews(10);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { error: 'Tərcümə prosesi alınmadı.', details: String(error) },
      { status: 500 },
    );
  }
}
