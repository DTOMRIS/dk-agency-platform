import { NextResponse } from 'next/server';
import { getAllBlogArticles } from '@/lib/data/blogArticles';

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET() {
  const articles = getAllBlogArticles();
  const baseUrl = 'https://dkagency.az';

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>DK Agency Xəbərlər</title>
<link>${baseUrl}/haberler</link>
<description>HoReCa sektoru üzrə DK Agency ekspert yazıları, analizlər və praktik məqalələr.</description>
<atom:link href="${baseUrl}/api/rss/haberler" rel="self" type="application/rss+xml"/>
<language>az</language>
${articles
  .map(
    (a) =>
      `<item>
<title>${xmlEscape(a.title)}</title>
<link>${baseUrl}/haberler/${a.slug}</link>
<guid isPermaLink="true">${baseUrl}/haberler/${a.slug}</guid>
<pubDate>${new Date(a.publishDate).toUTCString()}</pubDate>
<description>${xmlEscape(a.summary)}</description>
</item>`,
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
