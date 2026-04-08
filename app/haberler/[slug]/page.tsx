import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ShareButtons } from '@/components/blog/BlogSidebars';
import { formatDateAz } from '@/lib/formatDate';
import { getNewsArticleBySlug, getRelatedApprovedNewsArticles } from '@/lib/repositories/newsRepository';

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

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    return { title: 'Xəbər tapılmadı | DK Agency' };
  }

  return {
    title: `${article.title} | DK Agency`,
    description: article.summary,
  };
}

export default async function HaberDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getNewsArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const related = await getRelatedApprovedNewsArticles(article.id, article.category);
  const shareUrl = `https://dkagency.az/haberler/${article.slug}`;

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10 text-[#1A1A2E]">
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start">
        <article className="rounded-[32px] border border-slate-200 bg-white px-6 py-8 shadow-sm md:px-10 md:py-10">
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
                {(article.sourceName || 'Mənbə yoxdur') + ' · ' + formatDateAz(article.publishedAt)}
              </span>
            </div>
            <h1 className="mt-5 max-w-[720px] font-display text-[36px] font-bold leading-tight text-[#1A1A2E] md:text-[42px]">
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

          <div className="mt-8 max-w-[720px] text-[17px] leading-[1.8] text-slate-700 md:text-[18px]">
            <p>{article.summary}</p>
          </div>

          <footer className="mt-10 flex max-w-[720px] flex-col gap-5 border-t border-slate-200 pt-8">
            <a
              href={article.externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-fit items-center rounded-full bg-[#E94560] px-6 py-3 text-sm font-bold text-white transition hover:bg-[#d73753]"
            >
              Mənbədə tam xəbəri oxu →
            </a>
            <div className="max-w-[280px]">
              <ShareButtons title={article.title} url={shareUrl} />
            </div>
          </footer>
        </article>

        {related.length > 0 ? (
          <aside className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="font-display text-2xl font-bold text-[#1A1A2E]">Əlaqəli xəbərlər</h3>
            <div className="mt-5 space-y-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/haberler/${item.slug}`}
                  className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-[#C5A022] hover:bg-white"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A022]">
                    {getCategoryLabel(item.category)}
                  </div>
                  <div className="mt-2 text-sm font-bold leading-6 text-[#1A1A2E]">{item.title}</div>
                  <div className="mt-2 text-xs text-slate-500">
                    {(item.sourceName || 'Mənbə yoxdur') + ' · ' + formatDateAz(item.publishedAt)}
                  </div>
                </Link>
              ))}
            </div>
          </aside>
        ) : null}
      </div>
    </main>
  );
}
