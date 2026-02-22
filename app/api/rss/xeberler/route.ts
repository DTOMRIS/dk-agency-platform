import { NextRequest, NextResponse } from 'next/server';
import { getLocalizedNews, type NewsLocale } from '@/lib/data/newsroomFeed';

function resolveLocale(input: string | null): NewsLocale {
  if (input === 'az' || input === 'en' || input === 'ru' || input === 'tr') {
    return input;
  }
  return 'az';
}

function xmlEscape(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

export function GET(request: NextRequest) {
  const locale = resolveLocale(request.nextUrl.searchParams.get('locale'));
  const items = getLocalizedNews(locale);

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>DK Agency Xeberler (${locale.toUpperCase()})</title>\n<link>https://dkagency.az/xeberler?locale=${locale}</link>\n<description>Multilingual DK Agency newsroom feed</description>\n${items
    .map(
      (item) =>
        `<item><title>${xmlEscape(item.localizedTitle)}</title><link>https://dkagency.az/xeberler#${item.slug}</link><guid>${item.id}</guid><pubDate>${new Date(item.publishedAt).toUTCString()}</pubDate><description>${xmlEscape(
          item.localizedSummary,
        )}</description></item>`,
    )
    .join('')}\n</channel>\n</rss>`;

  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
    },
  });
}
