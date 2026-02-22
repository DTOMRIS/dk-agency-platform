import { getTopRead, type NewsLocale } from '@/lib/data/newsroomFeed';

export interface NewsletterDigestItem {
  id: string;
  title: string;
  summary: string;
  views: number;
  slug: string;
}

export function getNewsletterDigestStub(locale: NewsLocale = 'az'): NewsletterDigestItem[] {
  return getTopRead(locale, 3).map((item) => ({
    id: item.id,
    title: item.localizedTitle,
    summary: item.localizedSummary,
    views: item.views,
    slug: item.slug,
  }));
}
