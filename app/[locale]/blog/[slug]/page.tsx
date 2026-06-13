import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowRight, Calendar, ChevronLeft, Clock, User } from 'lucide-react';
import { getTranslations } from 'next-intl/server';

import {
  MarkdownRenderer,
  LegalDisclaimer,
  BlogActionBar,
  GuruQuoteBox,
  DoganNote,
} from '@/components/blog';
import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import { CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import { getBlogPostDetail, getRelatedBlogPosts, getSlugRedirect } from '@/lib/db/blog-repository';
import { getProtectedArticleContent } from '@/lib/members/article-access';
import { getServerMemberSession } from '@/lib/members/server-session';
import { getAlternates } from '@/lib/seo/alternates';
import {
  localeUrl,
  articleNode,
  breadcrumbNode,
  organizationNode,
  faqNode,
  extractFaqFromMarkdown,
  jsonLdGraph,
} from '@/lib/seo/structured-data';
import { normalizeLocale, withLocale } from '@/i18n/config';

// BLOG_OVERRIDES removed — all content served from DB (L-037)

const DATE_LOCALE_MAP: Record<string, string> = {
  az: 'az-AZ',
  ru: 'ru-RU',
  en: 'en-US',
  tr: 'tr-TR',
};

const CATEGORY_I18N_MAP: Record<string, string> = {
  maliyye: 'catMaliyye',
  kadr: 'catKadr',
  emeliyyat: 'catEmeliyyat',
  konsept: 'catKonsept',
  acilis: 'catAcilis',
  satis: 'catSatis',
  huquqi: 'catHuquqi',
  marketinq: 'catMarketinq',
};

const STAGE_I18N_MAP: Record<string, string> = {
  Başla: 'stageBasla',
  Böyüt: 'stageBoyut',
  Devir: 'stageDevir',
};

const LEGACY_BLOG_SLUGS: Record<string, string> = {
  'sertifikatli-komanda-cth-online-tehsil': 'sertifikatli-komanda-cth-portal-karyera',
  'azerbaycan-qastronomiya-2030-dovlet-plani': 'azerbaycan-qastronomiya-2030-strateji-yol-xeritesi',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const t = await getTranslations({ locale: normalizedLocale, namespace: 'blogDetail' });
  const article = await getBlogPostDetail(LEGACY_BLOG_SLUGS[slug] || slug, normalizedLocale);

  if (!article) {
    return {
      title: t('notFoundTitle'),
      description: t('notFoundDesc'),
    };
  }

  const localePrefix = normalizedLocale === 'az' ? '' : `/${normalizedLocale}`;

  return {
    metadataBase: new URL('https://dkagency.com.tr'),
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    alternates: getAlternates(normalizedLocale, `/blog/${article.slug}`),
    openGraph: {
      type: 'article',
      locale:
        normalizedLocale === 'az'
          ? 'az_AZ'
          : normalizedLocale === 'ru'
            ? 'ru_RU'
            : normalizedLocale === 'tr'
              ? 'tr_TR'
              : 'en_US',
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
    twitter: {
      card: 'summary_large_image',
      title: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      images: article.coverImage ? [article.coverImage] : [],
    },
  };
}

export default async function BlogDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const canonicalSlug = LEGACY_BLOG_SLUGS[slug];
  const normalizedLocale = normalizeLocale(locale);
  if (canonicalSlug) {
    redirect(withLocale(normalizedLocale, `/blog/${canonicalSlug}`));
  }

  // DB slug redirect — köhnə slug yeni slug-a 301
  const redirectTarget = await getSlugRedirect(slug);
  if (redirectTarget) {
    redirect(withLocale(normalizedLocale, `/blog/${redirectTarget}`));
  }

  const article = await getBlogPostDetail(slug, normalizedLocale);
  const session = await getServerMemberSession();
  const t = await getTranslations({ locale: normalizedLocale, namespace: 'blogDetail' });

  if (!article) {
    notFound();
  }

  const cat = CATEGORY_CONFIG[article.category];
  const catLabel = t(CATEGORY_I18N_MAP[article.category] || 'catMaliyye');
  const related = await getRelatedBlogPosts(slug, article.category, locale);
  const renderedContent = getProtectedArticleContent(
    article.content || '',
    session,
    article.isPremium
  );
  const cleanMarkdownContent = (renderedContent || '').replace(/^#\s+.+$/m, '').trim();

  const stageKey = article.stage ? STAGE_I18N_MAP[article.stage] : null;
  const stageLabel = stageKey ? t(stageKey) : article.stage;

  const pageUrl = localeUrl(locale, `/blog/${article.slug}`);
  const jsonLd = jsonLdGraph([
    articleNode({
      headline: article.seoTitle || article.title,
      description: article.seoDescription || article.summary,
      url: pageUrl,
      image: article.coverImage || undefined,
      authorName: article.author,
      datePublished: article.publishDate,
      dateModified: article.updatedAt || article.publishDate,
      inLanguage: normalizedLocale || 'az',
      keywords: article.tags?.join(', ') || undefined,
      articleSection: catLabel,
      wordCount: article.wordCount,
      isAccessibleForFree: !article.isPremium,
    }),
    breadcrumbNode([
      { name: t('home'), url: localeUrl(locale, '/') },
      { name: 'Blog', url: localeUrl(locale, '/blog') },
      { name: article.title, url: pageUrl },
    ]),
    organizationNode(),
    faqNode(extractFaqFromMarkdown(cleanMarkdownContent)),
  ]);

  return (
    <BlogContentWrapper articleTitle={article.title} isPremium={article.isPremium}>
      <div className="min-h-screen bg-[var(--dk-paper)] pb-20 text-slate-900">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

        {/* Clean Header Area with Title & Subtitle */}
        <div className="bg-white border-b border-slate-100 py-10 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Link
              href={withLocale(normalizedLocale, '/blog')}
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-red mb-6"
            >
              <ChevronLeft size={18} /> {t('backToBlog')}
            </Link>

            <div className="space-y-4 max-w-4xl">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-brand-red px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl shadow-brand-red/20">
                  {cat?.emoji} {catLabel}
                </span>
                {article.stage && (
                  <span
                    className={`rounded-full px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-xl ${
                      article.stage === 'Başla'
                        ? 'bg-red-500'
                        : article.stage === 'Böyüt'
                          ? 'bg-amber-500'
                          : 'bg-purple-500'
                    }`}
                  >
                    {article.stage === 'Başla' ? '🏗️' : article.stage === 'Böyüt' ? '📊' : '🔄'}{' '}
                    {stageLabel}
                  </span>
                )}
              </div>
              <h1 className="font-display text-3xl font-black leading-tight tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                {article.title}
              </h1>
              {article.subtitle && (
                <p className="max-w-3xl text-base text-slate-500 sm:text-lg leading-relaxed">
                  {article.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:gap-12 lg:grid-cols-12">
            <article className="text-slate-900 lg:col-span-8">
              {/* Metadata Bar */}
              <div className="mb-8 flex flex-wrap items-center gap-3 sm:gap-6 border-b border-slate-200 pb-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-brand-red" />
                  {article.author}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {new Date(article.publishDate).toLocaleDateString(
                    DATE_LOCALE_MAP[normalizedLocale] || 'az-AZ',
                    { day: 'numeric', month: 'long', year: 'numeric' }
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={16} className="text-brand-red" />
                  {t('minRead', { time: article.readingTime })}
                </div>
                <BlogActionBar
                  title={article.title}
                  slug={article.slug}
                  labels={{
                    linkCopied: t('linkCopied'),
                    share: t('share'),
                    save: t('save'),
                    unsave: t('unsave'),
                  }}
                />
              </div>

              {/* Cover Image inside rounded Aspect-Ratio Box */}
              {article.coverImage && (
                <div className="mb-10 overflow-hidden rounded-3xl sm:rounded-[2.5rem] border border-slate-200 bg-slate-50 shadow-lg shadow-slate-100/50 aspect-[16/10] relative">
                  <img
                    src={article.coverImage}
                    alt={article.coverImageAlt || article.title}
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}

              {article.tags && article.tags.length > 0 && (
                <div className="mb-8 flex flex-wrap gap-2">
                  {article.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <MarkdownRenderer content={cleanMarkdownContent} />

              {/* Strukturlu sahələr (editor field-by-field saxlayır) — L-037/Özbahçeci:
                  guruBoxes + doganNote artıq route-a bağlıdır, markdown marker-dən asılı deyil */}
              {article.guruBoxes && article.guruBoxes.length > 0 && (
                <div className="mt-10 space-y-6">
                  {article.guruBoxes.map((box, index) => (
                    <GuruQuoteBox
                      key={`${box.guruName}-${index}`}
                      name={box.guruName}
                      title=""
                      quote={box.quote}
                      source={box.book}
                      tqtaContext=""
                      sourceLabel={t('source')}
                      contextLabel={t('context')}
                    />
                  ))}
                </div>
              )}

              {article.doganNote && (
                <div className="mt-10">
                  <DoganNote variantLabel={t('doganNoteDefault')}>{article.doganNote}</DoganNote>
                </div>
              )}

              {(article.category === 'Hüquqi' || article.category === 'huquqi') && (
                <LegalDisclaimer title={t('legalTitle')} text={t('legalText')} />
              )}

              <div className="mt-12 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-8">
                <h3 className="mb-3 text-xl font-display font-black text-[var(--dk-navy)]">
                  {t('ctaTitle')}
                </h3>
                <p className="mb-6 text-sm leading-relaxed text-slate-600">{t('ctaDesc')}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/994502566279?text=${encodeURIComponent(`Salam, "${article.title}" yazısı ilə bağlı sualım var.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#1da851]"
                  >
                    <span>💬</span>
                    {t('ctaWhatsapp')}
                  </a>
                  <Link
                    href={withLocale(normalizedLocale, '/elaqe')}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-700 transition hover:border-slate-400 hover:bg-slate-50"
                  >
                    {t('ctaContact')}
                  </Link>
                </div>
              </div>
            </article>

            <aside className="space-y-8 lg:col-span-4">
              <div className="sticky top-32 space-y-8">
                <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                  <h3 className="mb-3 text-sm font-bold uppercase tracking-widest text-slate-400">
                    {t('summary')}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-700">{article.summary}</p>
                </div>

                {related.length > 0 && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 text-slate-900 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-slate-400">
                      {t('relatedPosts')}
                    </h3>
                    <div className="space-y-4">
                      {related.map((rel) => (
                        <Link
                          key={rel.slug}
                          href={withLocale(normalizedLocale, `/blog/${rel.slug}`)}
                          className="group block"
                        >
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 text-lg">
                              {CATEGORY_CONFIG[rel.category]?.emoji}
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold leading-snug text-slate-900 transition-colors group-hover:text-brand-red">
                                {rel.title}
                              </h4>
                              <p className="mt-1 text-xs text-slate-400">
                                {t('minRead', { time: rel.readingTime })}
                              </p>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                <div className="rounded-2xl bg-brand-red p-8 text-white shadow-2xl shadow-brand-red/20">
                  <h3 className="mb-3 text-xl font-display font-black leading-tight">
                    {t('freeToolkit')}
                  </h3>
                  <p className="mb-6 text-sm leading-relaxed text-white/80">{t('toolkitDesc')}</p>
                  <Link
                    href={withLocale(normalizedLocale, '/toolkit')}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-black uppercase tracking-widest text-brand-red transition-all hover:bg-slate-50"
                  >
                    {t('viewTools')} <ArrowRight size={16} />
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
