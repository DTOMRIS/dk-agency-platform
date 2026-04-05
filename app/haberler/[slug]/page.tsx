import Link from 'next/link';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { getNewsArticleBySlug, getRelatedApprovedNewsArticles } from '@/lib/repositories/newsRepository';

function buildImageFallback(title: string) {
  return `https://placehold.co/1200x800/1A1A2E/C5A022?text=${encodeURIComponent(title.slice(0, 36))}`;
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

  return (
    <main className="min-h-screen bg-[#FAFAF8] px-4 py-10 text-[#1A1A2E]">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_320px]">
        <article className="space-y-8">
          <Link
            href="/haberler"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#C5A022]"
          >
            ← Bütün xəbərlər
          </Link>

          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
              <span className="rounded-full bg-[#FFF8E7] px-3 py-1 text-[#C5A022]">{article.category}</span>
              <span>{article.sourceName || 'Mənbə yoxdur'}</span>
              <span>•</span>
              <span>{new Date(article.publishedAt).toLocaleDateString('az-AZ')}</span>
            </div>

            <h1 className="mt-5 font-display text-5xl font-black leading-tight">{article.title}</h1>
            <p className="mt-5 text-lg leading-8 text-slate-600">{article.summary}</p>

            <div className="mt-8 overflow-hidden rounded-3xl bg-slate-100">
              <img
                src={article.imageUrl || buildImageFallback(article.title)}
                alt={article.title}
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="mt-8 space-y-4 text-sm leading-7 text-slate-700">
              <p>{article.summary}</p>
              {article.originalSummary && article.originalSummary !== article.summary ? (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Original Summary</div>
                  <p className="mt-3">{article.originalSummary}</p>
                </div>
              ) : null}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={article.externalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-[#1A1A2E] px-5 py-3 text-sm font-bold text-white"
              >
                Orijinal xəbəri aç
              </a>
              {article.sourceName ? (
                <span className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-600">
                  Mənbə: {article.sourceName}
                </span>
              ) : null}
            </div>
          </div>
        </article>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black">Əlaqəli xəbərlər</h2>
            <div className="mt-4 space-y-4">
              {related.map((item) => (
                <Link
                  key={item.id}
                  href={`/haberler/${item.slug}`}
                  className="block rounded-2xl border border-slate-100 bg-slate-50 p-4 transition hover:border-[#C5A022]"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#C5A022]">{item.category}</div>
                  <div className="mt-2 text-sm font-bold leading-6 text-[#1A1A2E]">{item.title}</div>
                  <div className="mt-2 text-xs text-slate-500">{item.sourceName || 'Mənbə yoxdur'}</div>
                </Link>
              ))}

              {related.length === 0 ? (
                <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm text-slate-500">
                  Bu kateqoriyada əlaqəli xəbər yoxdur.
                </div>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
