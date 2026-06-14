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

/* ── News section parsing ── */

interface NewsSection {
  type: 'event' | 'important' | 'lesson' | 'content';
  title?: string;
  body: string;
}

const SECTION_PATTERNS: Array<{ re: RegExp; type: NewsSection['type'] }> = [
  { re: /\*\*(N[əe] ba[şs] verdi)\*\*/i, type: 'event' },
  { re: /\*\*(Niy[əe] [öo]n[əe]mli(?:dir)?)\*\*/i, type: 'important' },
  { re: /\*\*([^*]*?[üu][çc][üu]n\s+(?:d[əe]rs|n[əe]tic[əe]))\*\*/i, type: 'lesson' },
];

function parseNewsContent(content: string): NewsSection[] {
  const markers: Array<{ index: number; end: number; type: NewsSection['type']; title: string }> = [];

  for (const sp of SECTION_PATTERNS) {
    const m = sp.re.exec(content);
    if (m) {
      markers.push({ index: m.index, end: m.index + m[0].length, type: sp.type, title: m[1] });
    }
  }

  if (markers.length === 0) {
    return [{ type: 'content', body: content }];
  }

  markers.sort((a, b) => a.index - b.index);
  const sections: NewsSection[] = [];

  const before = content.slice(0, markers[0].index).trim();
  if (before) sections.push({ type: 'content', body: before });

  for (let i = 0; i < markers.length; i++) {
    const bodyEnd = i < markers.length - 1 ? markers[i + 1].index : content.length;
    sections.push({
      type: markers[i].type,
      title: markers[i].title,
      body: content.slice(markers[i].end, bodyEnd).trim(),
    });
  }

  return sections;
}

const SECTION_STYLES: Record<string, { icon: string; hdr: string; hdrText: string; border: string; body: string }> = {
  event: {
    icon: '📰',
    hdr: 'bg-slate-100',
    hdrText: 'text-slate-700',
    border: 'border-slate-200',
    body: 'bg-slate-50/50',
  },
  important: {
    icon: '💡',
    hdr: 'bg-blue-50',
    hdrText: 'text-blue-800',
    border: 'border-blue-200',
    body: 'bg-blue-50/30',
  },
  lesson: {
    icon: '🎯',
    hdr: 'bg-amber-50',
    hdrText: 'text-amber-900',
    border: 'border-amber-200',
    body: 'bg-amber-50/30',
  },
};

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
            <nav aria-label="Breadcrumb" className="text-sm">
              <ol className="flex flex-wrap items-center gap-1.5 text-slate-500">
                <li>
                  <Link href="/haberler" className="transition hover:text-[#C5A022]">
                    Xəbərlər
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
                <li>
                  <Link
                    href={`/haberler?category=${article.category}`}
                    className="transition hover:text-[#C5A022]"
                  >
                    {getCategoryLabel(article.category)}
                  </Link>
                </li>
                <li className="text-slate-300">/</li>
                <li className="max-w-[300px] truncate text-slate-400">
                  {article.title}
                </li>
              </ol>
            </nav>

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
              <div className="mt-5">
                <ShareButtons title={article.title} url={shareUrl} locale={locale} />
              </div>
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

            <div className="mt-8 max-w-[720px] text-[17px] leading-[1.8] text-slate-700 md:text-[18px]">
              {article.summary ? (
                <p className="mb-6 font-semibold text-slate-800">{stripMarkdown(article.summary)}</p>
              ) : null}
              {article.content
                ? parseNewsContent(article.content).map((section, i) =>
                    section.type === 'content' ? (
                      <MarkdownRenderer
                        key={i}
                        content={section.body}
                        className="text-slate-700 md:text-[18px]"
                      />
                    ) : (
                      <div
                        key={i}
                        className={`my-8 overflow-hidden rounded-2xl border ${SECTION_STYLES[section.type].border}`}
                      >
                        <div
                          className={`flex items-center gap-2.5 px-5 py-3.5 ${SECTION_STYLES[section.type].hdr}`}
                        >
                          <span className="text-lg">{SECTION_STYLES[section.type].icon}</span>
                          <h2
                            className={`text-sm font-bold uppercase tracking-wider ${SECTION_STYLES[section.type].hdrText}`}
                          >
                            {section.title}
                          </h2>
                        </div>
                        <div className={`px-5 py-4 ${SECTION_STYLES[section.type].body}`}>
                          <MarkdownRenderer
                            content={section.body}
                            className="text-slate-700 md:text-[18px]"
                          />
                        </div>
                      </div>
                    ),
                  )
                : null}
            </div>

            <div className="mt-10 max-w-[720px] overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-50 to-[#FFF8E7]">
              <div className="px-6 py-6 sm:px-8">
                <h3 className="font-display text-lg font-bold text-[#1A1A2E]">
                  Həftəlik HoReCa xülasəsi
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Hər həftə sektor xəbərləri, trend analizləri və praktik tövsiyələr.
                </p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="email"
                    placeholder="E-poçt adresiniz"
                    readOnly
                    className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
                  />
                  <Link
                    href="/auth/register?source=newsletter"
                    className="rounded-xl bg-[#1A1A2E] px-6 py-2.5 text-center text-sm font-bold text-white transition hover:bg-[#16213E]"
                  >
                    Abunə ol
                  </Link>
                </div>
              </div>
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
              {/* Share buttons also appear in header above */}
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

            <aside className="rounded-[32px] border border-slate-200 bg-gradient-to-br from-[#1A1A2E] to-[#16213E] p-6 text-white shadow-sm">
              <h3 className="font-display text-lg font-bold">Son İlanlar</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Franchise, devir və B2B imkanlarını kəşf edin.
              </p>
              <Link
                href="/ilanlar"
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#E94560] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#d73753]"
              >
                İlanlara bax →
              </Link>
            </aside>

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
