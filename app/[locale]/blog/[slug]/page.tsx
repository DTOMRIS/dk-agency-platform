/**
 * /blog/[slug] — blog post, v2 inner design (TASK-0514, owner-approved mockup 09.10.2026):
 * serif hero, real cover, sticky TOC from `##` headings, reading progress (BlogContentWrapper),
 * a mid-article tool card only when the post maps to a tool (BLOG_TOOL_MAP), founder card,
 * KAZAN AI box (link only — /kazan-ai has no ?q= prefill), related posts, back button.
 * Read time is computed from the word count (not the stored read_time).
 */
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import AdSlot from '@/components/ads/AdSlot';

import { MarkdownRenderer, LegalDisclaimer, GuruQuoteBox, DoganNote } from '@/components/blog';
import BlogContentWrapper from '@/components/news/BlogContentWrapper';
import BlogToc from '@/components/blog/BlogToc';
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
import { BLOG_CATEGORY_MESSAGE, normalizeBlogCategory } from '@/lib/blog/category-groups';
import { extractToc } from '@/lib/blog/toc';
import { BLOG_TOOL_MAP, getToolMeta } from '@/lib/toolkit/tool-directory';
import { TELEGRAM_HANDLE, TELEGRAM_URL, whatsappHref } from '@/lib/contact-channels';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Icon } from '@/components/home/v2/shared';
import {
  Crumbs,
  FounderCard,
  KazanBox,
  ShareLinks,
  TOOL_GROUP_CLASS,
  ToolMini,
  formatInnerDate,
  readMinutes,
} from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';

// BLOG_OVERRIDES removed — all content served from DB (L-037)

/** Split markdown at the `## ` heading closest to the middle (for the inline tool card). */
function splitAtMiddleHeading(md: string): [string, string] {
  const lines = md.split('\n');
  const heads: number[] = [];
  let inFence = false;
  lines.forEach((line, i) => {
    if (/^\s*```/.test(line)) inFence = !inFence;
    if (!inFence && /^##\s+/.test(line)) heads.push(i);
  });
  if (heads.length < 2) return [md, ''];
  const mid = lines.length / 2;
  const at = heads.slice(1).reduce((best, i) => (Math.abs(i - mid) < Math.abs(best - mid) ? i : best), heads[1]);
  return [lines.slice(0, at).join('\n'), lines.slice(at).join('\n')];
}

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

  const catKey = normalizeBlogCategory(article.category);
  const catLabel = catKey ? t(BLOG_CATEGORY_MESSAGE[catKey]) : article.category;
  const related = await getRelatedBlogPosts(slug, article.category, normalizedLocale);
  const renderedContent = getProtectedArticleContent(
    article.content || '',
    session,
    false // paywall disabled — serve full content (see BlogContentWrapper PAYWALL_ENABLED)
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


  const minutes = readMinutes(cleanMarkdownContent || article.summary || '');
  const toc = extractToc(cleanMarkdownContent);
  const toolSlug = BLOG_TOOL_MAP[article.slug];
  const tool = toolSlug ? getToolMeta(toolSlug) : undefined;
  // TASK-0516: the body is split at the middle `##` for the tool card (when the post maps to a tool)
  // and for the admin «blog-inline» ad. With a tool card, the ad goes to the middle of the second half
  // so the two never sit together; without enough headings the ad follows the body.
  const [partA, rest] = splitAtMiddleHeading(cleanMarkdownContent);
  const [partB, partC] = tool && rest ? splitAtMiddleHeading(rest) : [rest, ''];
  const ti = await getTranslations({ locale: normalizedLocale, namespace: 'innerV2.blog' });
  const tc = await getTranslations({ locale: normalizedLocale, namespace: 'innerV2.common' });
  const tt = await getTranslations({ locale: normalizedLocale, namespace: 'innerV2.toolkit.tools' });
  const toolHref = tool ? withLocale(normalizedLocale, `/toolkit/${tool.slug}`) : '';

  const toolCard = tool ? (
    <Link href={toolHref} className={s.toolInline}>
      <span className={`${s.tkMiniIc} ${TOOL_GROUP_CLASS[tool.group]}`}>
        <Icon name={tool.icon} />
      </span>
      <span>
        <small>{ti('toolEyebrow')}</small>
        <b>{tt(`${tool.slug}.t`)}</b>
        <span>{tt(`${tool.slug}.r`)}</span>
      </span>
      <span className={`${home.btn} ${home.btnRed} ${home.btnSm}`}>
        {ti('toolCta')}
        <Icon name="arrow" />
      </span>
    </Link>
  ) : null;

  return (
    <BlogContentWrapper articleTitle={article.title} isPremium={article.isPremium}>
      <div className={`${s.page} ${inter.className}`}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
        <div className={home.wrap}>
          <Crumbs
            backHref={withLocale(normalizedLocale, '/blog')}
            backLabel={ti('back')}
            trail={`${ti('back')} / ${catLabel}`}
          />
          <header className={s.postHero}>
            <div className={s.metaRow}>
              <span className={s.cat}>{catLabel}</span>
              {article.stage ? <span className={s.stageT}>{stageLabel}</span> : null}
              <span>{article.author}</span>
              <span>·</span>
              <span>{formatInnerDate(article.publishDate, normalizedLocale)}</span>
              <span>·</span>
              <span>{tc('minRead', { n: minutes })}</span>
            </div>
            <h1>{article.title}</h1>
            {article.subtitle ? <p className={s.postSub}>{article.subtitle}</p> : null}
            <ShareLinks url={pageUrl} title={article.title} waLabel={tc('whatsapp')} tgLabel={tc('telegram')} />
          </header>

          {article.coverImage ? (
            <div className={s.postCover}>
              {/* Cover: local /images/* or an editor-uploaded URL on any host. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={article.coverImage} alt={article.coverImageAlt || article.title} referrerPolicy="no-referrer" />
            </div>
          ) : null}

          <div className={s.postGrid}>
            <BlogToc items={toc} title={ti('toc')} />

            <article className={s.prose}>
              {toc.length > 0 ? (
                <details className={s.tocM}>
                  <summary>{ti('tocMobile', { count: toc.length })}</summary>
                  <ol>
                    {toc.map((item) => (
                      <li key={item.id}>
                        <a href={`#${item.id}`}>{item.text}</a>
                      </li>
                    ))}
                  </ol>
                </details>
              ) : null}

              <MarkdownRenderer content={partA} headingIds />
              {tool ? toolCard : null}
              {!tool && partB ? <AdSlot placement="blog-inline" className={s.adInline} /> : null}
              {partB ? <MarkdownRenderer content={partB} headingIds /> : null}
              {tool && partC ? <AdSlot placement="blog-inline" className={s.adInline} /> : null}
              {partC ? <MarkdownRenderer content={partC} headingIds /> : null}
              {/* No mid-article split point → the inline ad follows the body. */}
              {(!tool && !partB) || (tool && !partC) ? (
                <AdSlot placement="blog-inline" className={s.adInline} />
              ) : null}

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

              {catKey === 'huquqi' && <LegalDisclaimer title={t('legalTitle')} text={t('legalText')} />}

              <FounderCard
                eyebrow={ti('founderEyebrow')}
                name={ti('founderName')}
                role={ti('founderRole')}
                body={ti('founderBody')}
                cta={ti('founderCta')}
                ctaHref={whatsappHref(ti('founderText', { title: article.title }))}
              />
              <KazanBox
                eyebrow={ti('kazanEyebrow')}
                title={ti('kazanTitle')}
                body={ti('kazanBody')}
                cta={ti('kazanCta')}
                href={withLocale(normalizedLocale, '/kazan-ai')}
                foot={ti('kazanFoot')}
              />

              {/* TASK-0453 CTA kept (e2e/blog-cta.spec.ts): direct WhatsApp with the post title + contact page. */}
              <div className="mt-10 rounded-3xl border border-[#E4DCCD] bg-white p-7 shadow-sm">
                <h3 className="mb-2 text-xl font-black tracking-tight text-slate-900">{t('ctaTitle')}</h3>
                <p className="mb-5 text-sm leading-relaxed text-slate-700">{t('ctaDesc')}</p>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={`https://wa.me/994502566279?text=${encodeURIComponent(t('ctaWhatsappMessage', { title: article.title }))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#128C4A] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#0f7a40]"
                  >
                    {t('ctaWhatsapp')}
                  </a>
                  <Link
                    href={withLocale(normalizedLocale, '/elaqe')}
                    className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
                  >
                    {t('ctaContact')}
                  </Link>
                </div>
              </div>
            </article>

            <aside className={s.aside} aria-label={ti('founderEyebrow')}>
              <div className={s.author}>
                <span className={s.av} aria-hidden="true">DT</span>
                <b>{ti('founderName')}</b>
                <span className={s.role}>{ti('founderRole')}</span>
                <p style={{ fontSize: 13.5, color: 'var(--ink-2)', margin: '8px 0 0' }}>{ti('asideNote')}</p>
              </div>
              {tool ? (
                <ToolMini
                  href={toolHref}
                  icon={tool.icon}
                  iconClass={TOOL_GROUP_CLASS[tool.group]}
                  title={tt(`${tool.slug}.t`)}
                  sub={tt(`${tool.slug}.r`)}
                />
              ) : null}
              <a className={`${s.sh} ${s.shTg}`} href={TELEGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ justifyContent: 'center', height: 42 }}>
                <Icon name="tg" />
                t.me/{TELEGRAM_HANDLE}
              </a>
              <AdSlot placement="blog-sidebar" />
            </aside>
          </div>

          {related.length > 0 ? (
            <section aria-labelledby="rel-posts-title">
              <div className={s.secHead} style={{ marginBottom: 16 }}>
                <div>
                  <span className={home.eyebrow}>
                    <span className={home.dot} />
                    {ti('relEyebrow')}
                  </span>
                  <h2 id="rel-posts-title" className={s.h2}>{ti('relTitle')}</h2>
                </div>
              </div>
              <div className={s.relPosts}>
                {related.map((rel) => {
                  const relCat = normalizeBlogCategory(rel.category);
                  return (
                    <Link key={rel.slug} className={s.bcard} href={withLocale(normalizedLocale, `/blog/${rel.slug}`)}>
                      <div className={s.ph}>
                        {rel.coverImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={rel.coverImage} alt={rel.coverImageAlt || rel.title} loading="lazy" />
                        ) : (
                          <span className={s.phFallback} aria-hidden="true"><Icon name="book" /></span>
                        )}
                      </div>
                      <div className={s.bb}>
                        <span className={s.ctag}>{relCat ? t(BLOG_CATEGORY_MESSAGE[relCat]) : rel.category}</span>
                        <h3>{rel.title}</h3>
                        <div className={s.bmeta}>
                          <span>
                            <Icon name="clock" />
                            {tc('minRead', { n: readMinutes(rel.content || rel.summary || '') })}
                          </span>
                          <span>{formatInnerDate(rel.publishDate, normalizedLocale)}</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          ) : null}

          <Link href={withLocale(normalizedLocale, '/blog')} className={s.back}>
            <Icon name="left" />
            {ti('back')}
          </Link>
        </div>
      </div>
    </BlogContentWrapper>
  );
}
