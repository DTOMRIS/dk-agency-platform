import type { Metadata } from 'next';
import Link from 'next/link';
import { getTranslations } from 'next-intl/server';
import {
  ArrowRight,
  BookOpen,
  ClipboardCheck,
  FileText,
  Handshake,
  PieChart,
  Radar,
  Store,
  Wand2,
} from 'lucide-react';

import { normalizeLocale, withLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import {
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  localeUrl,
  organizationNode,
} from '@/lib/seo/structured-data';
import home from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';
import { Crumbs } from '@/components/inner/InnerParts';
import s from '@/components/inner/inner.module.css';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale?: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  const t = await getTranslations({ locale, namespace: 'franchisePillar' });
  return {
    title: t('meta.title'),
    description: t('meta.description'),
    alternates: getAlternates(locale, '/franchise'),
  };
}

/** Başlıq/xülasədə franchise keçən yazılar — DB əlçatmazsa səhifə sınmamalıdır. */
async function getFranchisePosts(locale: string) {
  try {
    const { posts } = await getBlogPostsFromDb(
      { status: 'published', limit: 60, offset: 0 },
      locale
    );
    const needle = /franchise|françayz|francayz|franchayz|royalti/i;
    return posts
      .filter((post) =>
        needle.test([post.title, post.summary, post.focusKeyword, ...(post.tags ?? [])].join(' '))
      )
      .slice(0, 3);
  } catch {
    return [];
  }
}

export default async function FranchisePillarPage({
  params,
}: {
  params: Promise<{ locale?: string }>;
}) {
  const { locale: raw } = await params;
  const locale = normalizeLocale(raw);
  const t = await getTranslations({ locale, namespace: 'franchisePillar' });
  const tb = await getTranslations({ locale, namespace: 'pageBack' });
  const posts = await getFranchisePosts(locale);

  const giverTools = [
    {
      key: 'readiness',
      href: '/franchise/hazirliq-testi',
      icon: ClipboardCheck,
      badge: null as string | null,
    },
    {
      key: 'franchbook',
      href: '/franchise/francbuk-generatoru',
      icon: Wand2,
      badge: t('tools.franchbook.badge'),
    },
  ];

  const takerTools = [
    { key: 'radar', href: '/franchise/radar', icon: Radar, badge: null as string | null },
    {
      key: 'roi',
      href: '/franchise/roi-kalkulyatoru',
      icon: PieChart,
      badge: null as string | null,
    },
    {
      key: 'buyer',
      href: '/franchise/alici-cheklisti',
      icon: FileText,
      badge: null as string | null,
    },
  ];

  const faqItems = [1, 2, 3, 4].map((i) => ({
    question: t(`faq.q${i}`),
    answer: t(`faq.a${i}`),
  }));

  const jsonLd = jsonLdGraph([
    organizationNode(),
    breadcrumbNode([
      { name: 'DK Agency', url: localeUrl(locale, '/') },
      { name: t('hero.title'), url: localeUrl(locale, '/franchise') },
    ]),
    faqNode(faqItems),
  ]);

  // Franchise v2 redesign: cream v2 frame + Inter, toolkit-style header, rounded-[22px] cards, one red accent.
  const sectionTitle = 'text-[clamp(24px,2.8vw,34px)] font-black leading-tight tracking-[-0.035em] text-[#0F172A]';

  return (
    <div className={`${s.page} ${inter.className}`}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <div className={home.wrap}>
        <Crumbs backHref={withLocale(locale, '/')} backLabel={tb('home')} trail={t('hero.badge')} />

        {/* ── Hero ─────────────────────────────────────────────── */}
        <div className={s.tpHead}>
          <div style={{ minWidth: 0 }}>
            <div className={s.tpHeadMeta}>
              <span className={home.eyebrow}>
                <span className={home.dot} />
                {t('hero.badge')}
              </span>
            </div>
            <h1>{t('hero.title')}</h1>
            <p className={s.lead}>{t('hero.subtitle')}</p>
          </div>
        </div>

        {/* ── İki yol ──────────────────────────────────────────── */}
        <section className="grid gap-5 lg:grid-cols-2">
          {[
            { ns: 'giver', icon: Store, tools: giverTools },
            { ns: 'taker', icon: Handshake, tools: takerTools },
          ].map((path) => {
            const PathIcon = path.icon;
            return (
              <div key={path.ns} className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8">
                <p className="inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#BE2F47]">
                  <PathIcon size={14} aria-hidden="true" /> {t(`${path.ns}.eyebrow`)}
                </p>
                <h2 className={`mt-3 ${sectionTitle}`}>{t(`${path.ns}.title`)}</h2>
                <p className="mt-3 text-[15px] leading-7 text-slate-600">{t(`${path.ns}.desc`)}</p>

                <div className="mt-6 space-y-3">
                  {path.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.key}
                        href={withLocale(locale, tool.href)}
                        className="group flex items-start gap-3.5 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4 transition-colors hover:border-[#0F172A] hover:bg-white"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white text-[#BE2F47] ring-1 ring-[#E4DCCD]">
                          <ToolIcon size={18} aria-hidden="true" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-[15.5px] font-black tracking-[-0.01em] text-[#0F172A]">
                              {t(`tools.${tool.key}.title`)}
                            </h3>
                            {tool.badge && (
                              <span className="rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.12em] text-[#BE2F47] ring-1 ring-[#F4B8C3]">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[13.5px] leading-6 text-slate-600">{t(`tools.${tool.key}.desc`)}</p>
                          <span className="mt-2 inline-flex items-center gap-1 text-[13px] font-bold text-[#0F172A] group-hover:text-[#BE2F47]">
                            {t('tools.open')} <ArrowRight size={13} aria-hidden="true" />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>

        {/* ── Doğan Tomris notu ────────────────────────────────── */}
        <figure className="mt-8 rounded-[22px] bg-[#0F172A] p-7 text-white sm:p-10">
          <blockquote>
            <p className="text-[clamp(18px,2vw,22px)] font-semibold leading-relaxed tracking-[-0.01em] text-slate-100">
              “{t('note.quote')}”
            </p>
          </blockquote>
          <figcaption className="mt-5 flex items-center gap-3 text-[14px] font-bold text-[#F28A9B]">
            <span className="grid h-10 w-10 place-items-center rounded-full bg-dk-red-strong text-[13px] font-black text-white" aria-hidden="true">
              DT
            </span>
            {t('note.author')}
          </figcaption>
        </figure>

        {/* ── FAQ ──────────────────────────────────────────────── */}
        <section className="mx-auto mt-14 max-w-3xl">
          <h2 className={`mb-6 ${sectionTitle}`}>{t('faq.title')}</h2>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6">
                <h3 className="text-[16px] font-black text-[#0F172A]">{item.question}</h3>
                <p className="mt-2 text-[14.5px] leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Bloq yazıları (real DB) ──────────────────────────── */}
        {posts.length > 0 && (
          <section className="mt-14">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <BookOpen size={20} className="text-[#BE2F47]" aria-hidden="true" />
                <h2 className={sectionTitle}>{t('blog.title')}</h2>
              </div>
              <Link
                href={withLocale(locale, '/blog')}
                className="inline-flex items-center gap-1.5 text-[14px] font-bold text-[#0F172A] hover:text-[#BE2F47]"
              >
                {t('blog.cta')} <ArrowRight size={14} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid gap-5 md:grid-cols-3">
              {posts.map((post) => (
                <Link
                  key={post.slug}
                  href={withLocale(locale, `/blog/${post.slug}`)}
                  className="group block rounded-[22px] border border-[#E4DCCD] bg-white p-5 transition-colors hover:border-[#0F172A]"
                >
                  <h3 className="text-[15.5px] font-black leading-snug text-[#0F172A] group-hover:text-[#BE2F47]">
                    {post.title}
                  </h3>
                  {post.summary && (
                    <p className="mt-2 line-clamp-3 text-[13.5px] leading-6 text-slate-600">{post.summary}</p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ── CTA ──────────────────────────────────────────────── */}
        <section className="mt-14 flex flex-col gap-5 rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className={sectionTitle}>{t('cta.title')}</h2>
            <p className="mt-2 max-w-xl text-[15px] leading-7 text-slate-600">{t('cta.desc')}</p>
          </div>
          <Link
            href={withLocale(locale, '/elaqe')}
            className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 self-start rounded-full bg-dk-red-strong px-6 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep sm:self-auto"
          >
            {t('cta.button')} <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </div>
  );
}
