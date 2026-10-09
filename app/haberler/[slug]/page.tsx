/**
 * /haberler/[slug] — news detail, v2 inner design (TASK-0514, owner-approved mockup 09.10.2026).
 * Serif headline + dek, byline with WhatsApp/Telegram share, image or generated category cover,
 * old-template section blocks (### headings) as coloured blocks, source line, sticky sidebar with
 * related toolkit / related blog (only when the article has them), other news and t.me/dkagenc.
 * No «Bu həftə 1 addım» card — owner decision 2026-10-09 (lib/news/editorial.ts stays as is).
 *
 * TASK-0515 (owner 2026-10-09): «Son İlanlar» is back in the sidebar with REAL listings
 * (getLatestShowcaseListings — status showcase_ready, i.e. approved in dashboard/ilanlar); the box
 * is hidden when there are none. Ads from dashboard/reklamlar: «news-sidebar» (sidebar) and
 * «news-inline» (after the article); AdSlot renders nothing without an active ad. The fake
 * read-only newsletter form stays removed.
 */
import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale, getTranslations } from 'next-intl/server';

import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import AdSlot from '@/components/ads/AdSlot';
import { MarkdownRenderer } from '@/components/blog';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { localeUrl } from '@/lib/seo/structured-data';
import { TELEGRAM_HANDLE, TELEGRAM_URL } from '@/lib/contact-channels';
import { getBlogPostDetail } from '@/lib/db/blog-repository';
import { getLatestShowcaseListings } from '@/lib/db/listings-repository';
import { getToolkitEntries } from '@/lib/news/toolkit-catalog';
import { getToolMeta } from '@/lib/toolkit/tool-directory';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon } from '@/components/home/v2/shared';
import {
  Crumbs,
  NewsCover,
  ShareLinks,
  TOOL_GROUP_CLASS,
  ToolMini,
  formatInnerDate,
  readMinutes,
  stripMarkdown,
} from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';
import {
  getNewsArticleBySlug,
  getRelatedApprovedNewsArticles,
} from '@/lib/repositories/newsRepository';

const NEWS_CATEGORIES = ['finance', 'operations', 'growth', 'market', 'technology'];

/* ── News section parsing (old template with ### headings) ── */


interface NewsSection {
  type: 'event' | 'important' | 'lesson' | 'risk' | 'opinion' | 'content';
  title?: string;
  body: string;
}

const SECTION_PATTERNS: Array<{ re: RegExp; type: NewsSection['type'] }> = [
  { re: /###\s+(N[əe] ba[şs] verdi)/i, type: 'event' },
  { re: /###\s+(Niy[əe] [öo]n[əe]mli(?:dir)?)/i, type: 'important' },
  { re: /###\s+(.*?(?:[üu][çc][üu]n\s+d[əe]rs|[üu][çc][üu]n\s+n[əe]tic[əe]))/i, type: 'lesson' },
  { re: /###\s+(Risk)/i, type: 'risk' },
  { re: /###\s+(DK bax[ıi][şs][ıi])/i, type: 'opinion' },
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


const BLOCK_CLASS: Record<Exclude<NewsSection['type'], 'content'>, string> = {
  event: s.b_event,
  important: s.b_important,
  lesson: s.b_lesson,
  risk: s.b_risk,
  opinion: s.b_opinion,
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
    const t = await getTranslations({ locale: normalizeLocale(locale), namespace: 'innerV2.news' });
    return { title: `${t('notFound')} | DK Agency` };
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
  const locale = normalizeLocale(await getLocale());
  const article = await getNewsArticleBySlug(slug, locale, isPreview);

  if (!article) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: 'innerV2.news' });
  const tc = await getTranslations({ locale, namespace: 'innerV2.common' });
  const tt = await getTranslations({ locale, namespace: 'innerV2.toolkit.tools' });

  const related = (await getRelatedApprovedNewsArticles(article.id, article.category, locale)).slice(0, 4);
  const toolSlugs = (article as { relatedToolkits?: string[] }).relatedToolkits ?? [];
  const tools = getToolkitEntries(toolSlugs)
    .map((entry) => getToolMeta(entry.slug))
    .filter((meta, i, arr): meta is NonNullable<typeof meta> => !!meta && arr.findIndex((m) => m?.slug === meta.slug) === i);
  const blogSlug = (article as { relatedBlogSlug?: string | null }).relatedBlogSlug ?? null;
  const blog = blogSlug ? await getBlogPostDetail(blogSlug, locale).catch(() => null) : null;
  const latestListings = await getLatestShowcaseListings(3, locale).catch(() => []);
  const tl = await getTranslations({ locale, namespace: 'b2bPanel.categoryLabels' });
  const listingType = (type: string) => (tl.has(type) ? tl(type) : '');
  const listingPrice = (item: (typeof latestListings)[number]) =>
    item.priceLabel ||
    (item.price && item.price > 0
      ? `${new Intl.NumberFormat(locale === 'en' ? 'en-US' : 'de-DE').format(item.price)} ${item.currency === 'AZN' ? '₼' : item.currency}`
      : '');

  const catLabel = (cat: string) => (NEWS_CATEGORIES.includes(cat) ? t(`cats.${cat}`) : cat);
  const sourceName = article.sourceName || t('noSource');
  const shareUrl = localeUrl(locale, `/haberler/${article.slug}`);
  // TASK-0478: the analysis is written by DK Agency — the aggregator name (e.g. "Bundle") used to be
  // marked up as a Person author. The original report is credited via isBasedOn.
  const sourceUrl =
    article.externalUrl && /^https?:\/\//.test(article.externalUrl) ? article.externalUrl : undefined;
  let sourceHost = '';
  if (!article.isManual && sourceUrl) {
    try {
      sourceHost = new URL(sourceUrl).hostname.replace('www.', '');
    } catch {
      sourceHost = '';
    }
  }
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.summary,
    image: article.imageUrl ? [article.imageUrl] : undefined,
    author: { '@id': 'https://dkagency.com.tr/#organization', '@type': 'Organization', name: 'DK Agency', url: 'https://dkagency.com.tr' },
    publisher: {
      '@type': 'Organization',
      name: 'DK Agency',
      url: 'https://dkagency.com.tr',
      logo: { '@type': 'ImageObject', url: 'https://dkagency.com.tr/icon-512.png', width: 512, height: 512 },
    },
    isBasedOn: sourceUrl,
    datePublished: article.publishedAt,
    dateModified: article.publishedAt,
    mainEntityOfPage: localeUrl(locale, `/haberler/${article.slug}`),
    inLanguage: locale,
  };

  const sections = article.content ? parseNewsContent(article.content) : [];
  let blockNo = 0;

  return (
    <BlogContentWrapper articleTitle={article.title} isPremium>
      <div className={`${s.page} ${inter.className}`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <div className={home.wrap}>
          <Crumbs
            backHref={withLocale(locale, '/haberler')}
            backLabel={t('back')}
            trail={`${t('crumb')} / ${catLabel(article.category)}`}
          />
          <div className={s.artGrid}>
            <article className={s.art}>
              <div className={s.metaRow}>
                <span className={s.cat}>{catLabel(article.category)}</span>
                <span>{sourceName}</span>
                <span>·</span>
                <span>{formatInnerDate(article.publishedAt, locale)}</span>
                <span>·</span>
                <span>{tc('minRead', { n: readMinutes(`${article.summary} ${article.content}`) })}</span>
              </div>
              <h1>{article.title}</h1>
              {article.summary ? <p className={s.dek}>{stripMarkdown(article.summary)}</p> : null}
              <div className={s.byline}>
                <span className={s.who}>
                  <span className={s.markSm} aria-hidden="true">DK</span>
                  <span>{t.rich('byline', { b: (chunks) => <b>{chunks}</b> })}</span>
                </span>
                <ShareLinks url={shareUrl} title={article.title} waLabel={tc('whatsapp')} tgLabel={tc('telegram')} />
              </div>
              <NewsCover
                category={article.category}
                categoryLabel={catLabel(article.category)}
                source={sourceName}
                brand={t('brand')}
                imageUrl={article.imageUrl}
                alt={article.title}
                priority
                sizes="(max-width: 980px) 100vw, 860px"
              />

              <div className={s.artBody}>
                {sections.map((section, i) =>
                  section.type === 'content' ? (
                    <MarkdownRenderer key={i} content={section.body} className="text-slate-700 md:text-[18px]" />
                  ) : (
                    <section key={i} className={`${s.blk} ${BLOCK_CLASS[section.type]}`}>
                      <div className={s.blkH}>
                        <span className={s.blkN}>{++blockNo}</span>
                        <h2>{section.title}</h2>
                      </div>
                      <MarkdownRenderer content={section.body} className="text-slate-700 md:text-[18px]" />
                    </section>
                  )
                )}
              </div>

              <div className={s.src}>
                {sourceHost ? (
                  article.content ? (
                    <span>
                      {t('source')}{' '}
                      <a href={sourceUrl} target="_blank" rel="noopener noreferrer">{sourceHost}</a> — {t('sourceOriginal')}
                    </span>
                  ) : (
                    <a className={`${home.btn} ${home.btnRed} ${home.btnSm}`} href={sourceUrl} target="_blank" rel="noopener noreferrer">
                      {t('readFull')} <Icon name="arrow" />
                    </a>
                  )
                ) : (
                  <span />
                )}
                <ShareLinks url={shareUrl} title={article.title} waLabel={tc('share')} tgLabel={tc('share')} />
              </div>
              <AdSlot placement="news-inline" className={s.adInline} />
            </article>

            <aside className={s.side}>
              {tools.length > 0 ? (
                <div>
                  <h4>{t('relatedTool')}</h4>
                  {tools.map((tool) => (
                    <ToolMini
                      key={tool.slug}
                      href={withLocale(locale, `/toolkit/${tool.slug}`)}
                      icon={tool.icon}
                      iconClass={TOOL_GROUP_CLASS[tool.group]}
                      title={tt(`${tool.slug}.t`)}
                      sub={t('toolSub')}
                    />
                  ))}
                </div>
              ) : null}
              {blog ? (
                <div>
                  <h4>{t('relatedBlog')}</h4>
                  <Link className={s.linkCard} href={withLocale(locale, `/blog/${blog.slug}`)} style={{ padding: 16 }}>
                    <h3 style={{ fontSize: 16 }}>{blog.title}</h3>
                    <span className={s.linkMeta}>
                      <Icon name="clock" />
                      {tc('minRead', { n: readMinutes(blog.content || '') })}
                    </span>
                  </Link>
                </div>
              ) : null}
              {related.length > 0 ? (
                <div>
                  <h4>{t('otherNews')}</h4>
                  <div className={s.relList}>
                    {related.map((item) => (
                      <Link key={item.id} href={withLocale(locale, `/haberler/${item.slug}`)} className={s.rel}>
                        <NewsCover
                          compact
                          category={item.category}
                          categoryLabel={catLabel(item.category)}
                          source={item.sourceName || t('noSource')}
                          brand={t('brand')}
                          imageUrl={item.imageUrl}
                          alt={item.title}
                        />
                        <span>
                          <b>{item.title}</b>
                          <small>
                            {catLabel(item.category)} · {formatInnerDate(item.publishedAt, locale, false)}
                          </small>
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}
              {latestListings.length > 0 ? (
                <div data-testid="news-latest-listings">
                  <h4>{t('latestListings')}</h4>
                  <ul className={s.lstList}>
                    {latestListings.map((item) => (
                      <li key={item.id}>
                        <Link href={withLocale(locale, `/ilanlar/${item.slug}`)} className={s.lstItem}>
                          <small>
                            {[listingType(item.type), item.city].filter(Boolean).join(' · ')}
                          </small>
                          <b>{item.title}</b>
                          {listingPrice(item) ? <span>{listingPrice(item)}</span> : null}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={withLocale(locale, '/ilanlar')} className={s.linkMeta}>
                    {t('allListings')} <Icon name="arrow" />
                  </Link>
                </div>
              ) : null}
              <a className={`${home.btn} ${home.btnGhost} ${s.btnBlock}`} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Icon name="tg" />
                t.me/{TELEGRAM_HANDLE}
              </a>
              <AdSlot placement="news-sidebar" />
            </aside>
          </div>
        </div>
      </div>
    </BlogContentWrapper>
  );
}
