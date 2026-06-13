import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';

import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import AdSlot from '@/components/ads/AdSlot';
import RelatedToolkitsBox from '@/components/news/RelatedToolkitsBox';
import { ShareButtons } from '@/components/news/ShareButtons';
import { MarkdownRenderer } from '@/components/blog';
import { formatDateAz } from '@/lib/formatDate';
import {
  getNewsArticleBySlug,
  getRelatedApprovedNewsArticles,
} from '@/lib/repositories/newsRepository';

function estimateReadTime(text: string): number {
  const words = text.split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Strip markdown syntax from summary for plain-text display */
function stripMarkdown(text: string): string {
  return text
    .replace(/^#{1,6}\s+/gm, '')       // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1')  // bold
    .replace(/\*([^*]+)\*/g, '$1')      // italic
    .replace(/`([^`]+)`/g, '$1')        // inline code
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .trim();
}

function getCategoryLabel(category: string) {
  switch (category) {
    case 'finance':
      return 'Maliyyə';
    case 'operations':
      return 'Əməliyyat';
    case 'growth':
      return 'Böyümə';
    case 'market':
      return 'Bazar';
    case 'technology':
      return 'Texnologiya';
    default:
      return category;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const article = await getNewsArticleBySlug(slug, locale);

  if (!article) {
    return { title: 'Xəbər tapılmadı | DK Agency' };
  }

  const localePrefix = locale === 'az' ? '' : `/${locale}`;

  return {
    metadataBase: new URL('https://dkagency.com.tr'),
    title: `${article.title} | DK Agency`,
    description: article.summary,
    alternates: {
      canonical: `${localePrefix}/haberler/${article.slug}`,
      languages: {
        az: `/haberler/${article.slug}`,
        ru: `/ru/haberler/${article.slug}`,
        en: `/en/haberler/${article.slug}`,
        tr: `/tr/haberler/${article.slug}`,
      },
    },
    openGraph: {
      type: 'article',
      locale:
        locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `https://dkagency.com.tr${localePrefix}/haberler/${article.slug}`,
      title: `${article.title} | DK Agency`,
      description: article.summary,
      images: article.imageUrl
        ? [
            {
              url: article.imageUrl,
              alt: article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${article.title} | DK Agency`,
      description: article.summary,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
  };
}

export default async function HaberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const isPreview = sp.preview === 'true';
  const locale = await getLocale();
  const article = await getNewsArticleBySlug(slug, locale, isPreview);

  if (!article) {
    notFound();
  }

  const related = await getRelatedApprovedNewsArticles(article.id, article.category, locale);
  const shareUrl = `https://dkagency.com.tr/haberler/${article.slug}`;
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DK Agency',
      url: 'https://dkagency.com.tr',
    },
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: shareUrl,
    inLanguage: locale || 'az',
  };

  return (
    <BlogContentWrapper articleTitle={article.title} isPremium>
      <main className="min-h-screen bg-[#FAFAF8] px-4 py-10 text-[#1A1A2E]">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
          <article className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 text-[#1A1A2E] shadow-sm md:px-10 md:py-10">
            <Link
              href="/haberler"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#C5A022]"
            >
              ← Bütün xəbərlər
            </Link>

            <header className="mt-6 border-b border-slate-200 pb-8">
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="inline-flex rounded-full bg-[#FFF8E7] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#C5A022]">
                  {getCategoryLabel(article.category)}
                </span>
                <span>
                  {(article.sourceName || 'Mənbə yoxdur') +
                    ' · ' +
                    formatDateAz(article.publishedAt)}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
                  ⏱ {estimateReadTime(article.content || article.summary || '')} dəq oxu
                </span>
              </div>
              <h1 className="mt-5 max-w-[720px] font-display text-[30px] font-bold leading-tight text-[#1A1A2E] sm:text-[36px] md:text-[42px]">
                {article.title}
              </h1>
            </header>

            {article.imageUrl ? (
              <div className="mt-8 overflow-hidden rounded-[28px] border border-slate-200 bg-slate-100">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="h-full w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : null}

            <div className="mt-8 max-w-[720px] space-y-4 text-[17px] leading-[1.8] text-slate-700 md:text-[18px]">
              {article.summary ? (
                <p className="font-semibold text-slate-800">{stripMarkdown(article.summary)}</p>
              ) : null}
              {article.content ? (
                <MarkdownRenderer
                  content={article.content}
                  className="text-slate-700 md:text-[18px]"
                />
              ) : null}
            </div>

            <footer className="mt-10 flex max-w-[720px] flex-col gap-5 border-t border-slate-200 pt-8">
              {!article.isManual && article.externalUrl
                ? (() => {
                    let hostname = '';
                    try {
                      hostname = new URL(article.externalUrl).hostname.replace('www.', '');
                    } catch {
                      hostname = '';
                    }
                    return article.content && hostname ? (
                      <p className="text-xs text-slate-400">
                        Mənbə:{' '}
                        <a
                          href={article.externalUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline hover:text-slate-600"
                        >
                          {hostname}
                        </a>
                      </p>
                    ) : !article.content && hostname ? (
                      <a
                        href={article.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-fit items-center rounded-full bg-[#E94560] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d73753]"
                      >
                        Mənbədə tam xəbəri oxu →
                      </a>
                    ) : null;
                  })()
                : null}
              <div className="max-w-[280px]">
                <ShareButtons title={article.title} url={shareUrl} locale={locale} />
              </div>
            </footer>

            {(article as { relatedToolkits?: string[] }).relatedToolkits?.length ? (
              <div className="mt-10">
                <RelatedToolkitsBox
                  toolkitSlugs={(article as { relatedToolkits?: string[] }).relatedToolkits || []}
                  blogSlug={(article as { relatedBlogSlug?: string }).relatedBlogSlug || null}
                  locale={locale}
                />
              </div>
            ) : null}
          </article>

          <div className="space-y-6">
            <AdSlot placement="news-sidebar" />

            {related.length > 0 ? (
              <aside className="rounded-[32px] border border-slate-200 bg-white p-6 text-[#1A1A2E] shadow-sm">
                <h3 className="font-display text-xl font-bold text-[#1A1A2E]">Əlaqəli xəbərlər</h3>
                <div className="mt-4 space-y-3">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/haberler/${item.slug}`}
                      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-slate-50 transition hover:border-[#C5A022] hover:bg-white hover:shadow-sm"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="aspect-[16/9] w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : null}
                      <div className="p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#C5A022]">
                          {getCategoryLabel(item.category)}
                        </div>
                        <div className="mt-1 text-sm font-bold leading-5 text-[#1A1A2E] group-hover:text-[#E94560]">
                          {item.title}
                        </div>
                        <div className="mt-1.5 text-[11px] text-slate-500">
                          {formatDateAz(item.publishedAt)}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </aside>
            ) : null}
          </div>
        </div>
      </main>
    </BlogContentWrapper>
  );
}
