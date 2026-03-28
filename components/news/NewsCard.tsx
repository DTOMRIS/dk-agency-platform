// components/news/NewsCard.tsx
// DK Agency - Haber Kartı

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

const CATEGORY_LABELS: Record<string, string> = {
  horeca: 'HORECA',
  yatirim: 'Yatırım',
  egitim: 'Eğitim',
  operasyon: 'Operasyon',
};

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return null;
  }
}

export default function NewsCard({ post }: { post: NewsArticle }) {
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category;
  const date = formatDate(post.publishDate);

  return (
    <Link href={`/haberler/${post.slug}`} className="group block">
      <article className="flex flex-row md:flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all hover:border-red-200 hover:shadow-lg">
        {/* Image */}
        <div className="relative w-24 h-24 md:w-full md:h-48 flex-shrink-0 overflow-hidden">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--dk-ink)] to-[var(--dk-ink-soft)]">
            <Newspaper size={28} className="text-white/30" />
          </div>
          {/* Category badge on image (desktop only) */}
          <span className="hidden md:inline-block absolute top-3 left-3 rounded-full bg-red-600/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            {categoryLabel}
          </span>
          {/* Premium badge */}
          {post.isPremium && (
            <span className="hidden md:inline-block absolute top-3 right-3 rounded-full bg-yellow-500/90 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-900">
              Premium
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-between p-3 md:p-4 min-w-0">
          {/* Mobile category + date row */}
          <div className="flex items-center gap-2 mb-1 md:mb-2">
            <span className="md:hidden rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">
              {categoryLabel}
            </span>
            {post.isPremium && (
              <span className="md:hidden rounded-full bg-yellow-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-yellow-700">
                Premium
              </span>
            )}
            {date && (
              <span className="text-[11px] text-gray-400">{date}</span>
            )}
          </div>

          <h2 className="text-sm md:text-base font-bold leading-snug text-gray-900 line-clamp-2 md:line-clamp-3 group-hover:text-red-600 transition-colors">
            {post.title}
          </h2>

          <p className="hidden md:block text-xs text-gray-500 mt-2 line-clamp-2">
            {post.summary}
          </p>

          {/* Author */}
          <div className="mt-1 md:mt-3 flex items-center justify-between">
            <span className="text-[11px] text-gray-400 truncate">
              {post.author}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
