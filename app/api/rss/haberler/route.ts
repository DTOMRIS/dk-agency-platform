import { NextResponse, type NextRequest } from 'next/server';
import { getApprovedNewsArticles } from '@/lib/repositories/newsRepository';

export const dynamic = 'force-dynamic';

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

// public-ok: RSS of approved news (same as the public /haberler page). TASK-0530: ?locale= picks the
// language (also used by /api/rss/xeberler, which used to serve static sample stories).
export async function GET(request?: NextRequest) {
  const baseUrl = 'https://dkagency.com.tr';
  const raw = request?.nextUrl.searchParams.get('locale') ?? 'az';
  const locale = ['az', 'en', 'ru', 'tr'].includes(raw) ? raw : 'az';
  const prefix = locale === 'az' ? '' : `/${locale}`;

  // Real approved news from the DB — this feed previously served blog mock data
  // (getAllBlogArticles), producing /haberler/<blog-slug> links that 404.
  const { items } = await getApprovedNewsArticles({ limit: 50 }, locale);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>DK Agency Xəbərlər</title>
<link>${baseUrl}${prefix}/haberler</link>
<description>HoReCa sektoru üzrə DK Agency xəbərləri, analizlər və sektor nəbzi.</description>
<atom:link href="${baseUrl}/api/rss/haberler" rel="self" type="application/rss+xml"/>
<language>${locale}</language>
${items
  .map(
    (a) =>
      `<item>
<title>${xmlEscape(a.title)}</title>
<link>${baseUrl}${prefix}/haberler/${a.slug}</link>
<guid isPermaLink="true">${baseUrl}${prefix}/haberler/${a.slug}</guid>
<pubDate>${new Date(a.publishedAt).toUTCString()}</pubDate>
<description>${xmlEscape(a.summary || '')}</description>
</item>`
  )
  .join('\n')}
</channel>
</rss>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
