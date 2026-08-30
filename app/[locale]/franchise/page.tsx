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

import { normalizeLocale } from '@/i18n/config';
import { getAlternates } from '@/lib/seo/alternates';
import { getBlogPostsFromDb } from '@/lib/db/blog-repository';
import {
  breadcrumbNode,
  faqNode,
  jsonLdGraph,
  localeUrl,
  organizationNode,
} from '@/lib/seo/structured-data';

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

  return (
    <div className="min-h-screen bg-[var(--dk-paper)]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="border-b border-slate-100 bg-white py-14 sm:py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-amber-50 px-3.5 py-1.5 text-xs font-black uppercase tracking-wider text-[var(--dk-gold)]">
            <Handshake size={14} /> {t('hero.badge')}
          </div>
          <h1 className="font-serif text-4xl font-black leading-tight text-slate-900 sm:text-5xl">
            {t('hero.title')}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            {t('hero.subtitle')}
          </p>
        </div>
      </section>

      {/* ── İki yol ──────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-2">
          {[
            {
              ns: 'giver',
              icon: Store,
              tools: giverTools,
              accent: 'text-[var(--dk-red)]',
              ring: 'ring-red-200/70',
              chip: 'bg-red-50',
            },
            {
              ns: 'taker',
              icon: Handshake,
              tools: takerTools,
              accent: 'text-[var(--dk-gold)]',
              ring: 'ring-amber-200/70',
              chip: 'bg-amber-50',
            },
          ].map((path) => {
            const PathIcon = path.icon;
            return (
              <div key={path.ns} className={`rounded-2xl bg-white p-6 ring-1 sm:p-8 ${path.ring}`}>
                <div
                  className={`mb-4 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-widest ${path.chip} ${path.accent}`}
                >
                  <PathIcon size={13} /> {t(`${path.ns}.eyebrow`)}
                </div>
                <h2 className="font-serif text-2xl font-black text-slate-900">
                  {t(`${path.ns}.title`)}
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  {t(`${path.ns}.desc`)}
                </p>

                <div className="mt-6 space-y-3">
                  {path.tools.map((tool) => {
                    const ToolIcon = tool.icon;
                    return (
                      <Link
                        key={tool.key}
                        href={tool.href}
                        className="group flex items-start gap-3 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
                      >
                        <ToolIcon size={18} className={`mt-0.5 shrink-0 ${path.accent}`} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-sm font-bold text-slate-900 group-hover:text-[var(--dk-red)]">
                              {t(`tools.${tool.key}.title`)}
                            </h3>
                            {tool.badge && (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-800">
                                {tool.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-slate-600">
                            {t(`tools.${tool.key}.desc`)}
                          </p>
                          <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-[var(--dk-red)]">
                            {t('tools.open')} <ArrowRight size={12} />
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Doğan Tomris notu ────────────────────────────────── */}
      <section className="mx-auto max-w-4xl px-4 pb-14 sm:px-6 sm:pb-16">
        <figure className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-7 sm:p-10">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-red-500/15 blur-3xl" />
          <blockquote className="relative">
            <p className="font-serif text-lg leading-relaxed text-slate-100 sm:text-xl">
              “{t('note.quote')}”
            </p>
            <figcaption className="mt-5 text-sm font-bold text-red-300">
              — {t('note.author')}
            </figcaption>
          </blockquote>
        </figure>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="mb-8 font-serif text-2xl font-black text-slate-900 sm:text-3xl">
            {t('faq.title')}
          </h2>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <div key={item.question} className="rounded-xl bg-slate-50 p-5 sm:p-6">
                <h3 className="text-base font-bold text-slate-900">{item.question}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-slate-700">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Bloq yazıları (real DB) ──────────────────────────── */}
      {posts.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <BookOpen size={18} className="text-[var(--dk-red)]" />
              <h2 className="font-serif text-2xl font-black text-slate-900">{t('blog.title')}</h2>
            </div>
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-[var(--dk-red)]"
            >
              {t('blog.cta')} <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/70 transition-all hover:shadow-md"
              >
                <h3 className="text-sm font-bold leading-snug text-slate-900 group-hover:text-[var(--dk-red)]">
                  {post.title}
                </h3>
                {post.summary && (
                  <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-slate-600">
                    {post.summary}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-white py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-2xl font-black text-slate-900 sm:text-3xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-slate-600">
            {t('cta.desc')}
          </p>
          <Link
            href="/elaqe"
            className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--dk-gold)] px-6 py-3.5 text-sm font-black text-[var(--dk-navy)] transition-all hover:opacity-90 active:scale-95"
          >
            {t('cta.button')} <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
