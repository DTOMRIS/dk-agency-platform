'use client';

import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { BLOG_ARTICLES, CATEGORY_CONFIG } from '@/lib/data/blogArticles';

interface SektorBlogTeaserGridProps {
  namespace: string;
  sectionTitleKey: string;
  blogSlugs: string[];
  maxCount?: number;
}

export default function SektorBlogTeaserGrid({
  namespace,
  sectionTitleKey,
  blogSlugs,
  maxCount = 3,
}: SektorBlogTeaserGridProps) {
  const t = useTranslations(namespace);
  const locale = useLocale();

  const articles = blogSlugs
    .map((slug) => BLOG_ARTICLES.find((a) => a.slug === slug))
    .filter(Boolean)
    .slice(0, maxCount);

  if (articles.length === 0) return null;

  return (
    <section className="bg-slate-50 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-12 text-center font-display text-3xl font-black tracking-tighter text-slate-900 sm:text-4xl">
          {t(sectionTitleKey)}
        </h2>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {articles.map((article) => {
            if (!article) return null;
            const cat = CATEGORY_CONFIG[article.category] || { emoji: '', label: article.category };
            return (
              <Link
                key={article.slug}
                href={`/${locale}/blog/${article.slug}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg"
              >
                <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt={article.coverImageAlt || article.title}
                      className="h-full w-full object-cover transition group-hover:scale-105"
                    />
                  )}
                  <div className="absolute left-3 top-3">
                    <span className="rounded-full bg-white/90 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 backdrop-blur">
                      {cat.emoji} {cat.label}
                    </span>
                  </div>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="mb-2 text-sm font-bold leading-snug text-slate-900 group-hover:text-[var(--dk-red)]">
                    {article.title}
                  </h3>
                  <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-slate-500">
                    {article.summary}
                  </p>
                  <span className="mt-3 text-xs font-semibold text-[var(--dk-red)]">
                    Oxu →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
