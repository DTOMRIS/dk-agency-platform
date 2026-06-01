import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, Bookmark, Calendar, ChevronLeft, Clock, Share2, Tag, User } from 'lucide-react';

import { MarkdownRenderer } from '@/components/blog';
import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import { CATEGORY_CONFIG, getRelatedArticles } from '@/lib/data/blogArticles';
import { getBlogPostDetail } from '@/lib/db/blog-repository';
import { getProtectedArticleContent } from '@/lib/members/article-access';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAlternates } from '@/lib/seo/alternates';

// BLOG_OVERRIDES removed — all content served from DB (L-037)

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const article = await getBlogPostDetail(slug, locale);

  if (!article) {
    return {
      title: 'Blog yazısı tapılmadı',
      description: 'Axtardığınız yazı tapılmadı.',
    };
  }

  const localePrefix = locale === 'az' ? '' : `/${locale}`;

  return {
    metadataBase: new URL('https://dkagency.com.tr'),
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternates: getAlternates(locale, `/blog/${article.slug}`),
    openGraph: {
      type: 'article',
      locale: locale === 'az' ? 'az_AZ' : locale === 'ru' ? 'ru_RU' : locale === 'tr' ? 'tr_TR' : 'en_US',
      url: `https://dkagency.com.tr${localePrefix}/blog/${article.slug}`,
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      images: article.coverImage
        ? [
            {
              url: article.coverImage,
              alt: article.coverImageAlt || article.title,
            },
          ]
        : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;
  const article = await getBlogPostDetail(slug, locale);
  const session = await getServerMemberSession();

  if (!article) {
    notFound();
  }

  const cat = CATEGORY_CONFIG[article.category];
  const related = getRelatedArticles(slug);
  const renderedContent = getProtectedArticleContent(
    article.content || '',
    session,
    article.isPremium
  );
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    image: article.coverImage ? [article.coverImage] : undefined,
    author: {
      '@type': 'Person',
      name: article.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'DK Agency',
      url: 'https://dkagency.com.tr',
    },
    datePublished: article.publishDate,
    dateModified: article.updatedAt || article.publishDate,
    mainEntityOfPage: `https://dkagency.com.tr/blog/${article.slug}`,
    keywords: article.tags?.join(', ') || undefined,
    inLanguage: locale || 'az',
    isAccessibleForFree: !article.isPremium,
  };

  return (
    <BlogContentWrapper articleTitle={article.title} isPremium={article.isPremium}>
      <div className="min-h-screen bg-[var(--dk-paper)] pb-20 text-slate-900">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        <div className="relative h-[240px] w-full overflow-hidden sm:h-[320px] lg:h-[420px]">
          <img
            src={article.coverImage}
            alt={article.coverImageAlt || article.title}
            className="h-full w-full max-w-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          <Link
            href="/blog"
            className="absolute left-6 top-6 z-10 flex items-center gap-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            <ChevronLeft size={18} /> Bloga qayıt
          </Link>

          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-8 lg:p-16">
            <div className="mx-auto max-w-4xl">
              <div className="space-y-3 sm:space-y-4">
                <span className="rounded-full bg-brand-red px-3 py-1 sm:px-4 sm:py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-red/20">
                  {cat?.emoji} {cat?.label}
                </span>
                <h1 className="text-xl font-display font-black leading-tight tracking-tighter text-white sm:text-3xl lg:text-5xl">
                  {article.title}
                </h1>
                {article.subtitle && (
                  <p className="max-w-2xl text-sm text-white/70 sm:text-base sm:text-lg">{article.subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 sm:mt-12 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
            <article className="text-slate-900 lg:col-span-8">
              <div className="mb-6 sm:mb-10 flex flex-wrap items-center gap-3 sm:gap-6 border-b border-slate-200 pb-6 sm:pb-8 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-brand-red" />
                  {article.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {new Date(article.publishDate).toLocaleDateString('az-AZ', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-red" />
                  {article.readingTime} dəq oxu
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-brand-red" />
                  {cat?.label}
                </div>
                <div className="ml-auto flex items-center gap-4">
                  <button className="transition-colors hover:text-brand-red">
                    <Share2 size={18} />
                  </button>
                  <button className="transition-colors hover:text-brand-red">
                    <Bookmark size={18} />
                  </button>
                </div>
              </div>

              {article.tags && article.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <MarkdownRenderer content={renderedContent} />
            </article>

            <aside className="space-y-8 lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">Xülasə</h3>
                  <p className="text-sm leading-relaxed text-slate-700">{article.summary}</p>
                </div>

                {related.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">Əlaqəli yazılar</h3>
                    <div className="space-y-4">
                      {related.map((rel) => (
                        <Link key={rel.slug} href={`/blog/${rel.slug}`} className="group block">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-lg">{CATEGORY_CONFIG[rel.category]?.emoji}</div>
                            <div>
                              <h4 className="text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand-red">
                                {rel.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">{rel.readingTime} dəq oxu</p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-brand-red p-8 text-white shadow-2xl shadow-brand-red/20">
                  <h3 className="mb-3 text-xl font-display font-black leading-tight">Pulsuz Toolkit</h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/80">
                    Food cost, P&amp;L, menyu matrisi və digər alətlərlə restoranını optimallaşdır.
                  </p>
                  <Link
                    href="/toolkit"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black uppercase tracking-widest text-brand-red transition-all hover:bg-slate-50"
                  >
                    Alətlərə bax <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </BlogContentWrapper>
  );
}
