import { NextRequest, NextResponse } from 'next/server';
import { getApprovedNewsArticles } from '@/lib/repositories/newsRepository';

// public-ok: the 3 newest approved stories (public data). TASK-0530: before, a «stub» that returned
// invented stories with made-up view counts from lib/data/newsroomFeed.
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const localeParam = request.nextUrl.searchParams.get('locale');
  const locale = localeParam === 'en' || localeParam === 'ru' || localeParam === 'tr' ? localeParam : 'az';
  const { items } = await getApprovedNewsArticles({ limit: 3 }, locale);

  return NextResponse.json({
    ok: true,
    generatedAt: new Date().toISOString(),
    items: items.map((item) => ({ id: item.id, title: item.title, summary: item.summary, slug: item.slug })),
  });
}
