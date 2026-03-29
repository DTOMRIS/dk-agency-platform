// components/news/NewsHero.tsx
// DK Agency - Ana Haber Hero Kartı

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

const CATEGORY_LABELS: Record<string, string> = {
  horeca: 'HORECA',
  yatirim: 'YATIRIM',
  egitim: 'EĞİTİM',
  operasyon: 'OPERASYON',
};

interface NewsHeroProps {
  post: NewsArticle;
}

export default function NewsHero({ post }: NewsHeroProps) {
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category.toUpperCase();

  return (
    <Link
      href={`/haberler/${post.slug}`}
      className="block relative w-full h-[420px] md:h-[480px] rounded-2xl overflow-hidden group"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--dk-ink)] via-[var(--dk-ink-soft)] to-[var(--dk-ink-soft)]">
        <Newspaper size={64} className="text-white/10" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
        {/* Category badge */}
        <span className="inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white bg-red-600/90 backdrop-blur rounded-full mb-3">
          {categoryLabel}
        </span>

        {/* Premium badge */}
        {post.isPremium && (
          <span className="ml-2 inline-block px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300 bg-yellow-500/20 backdrop-blur rounded-full mb-3">
            Premium
          </span>
        )}

        {/* Title */}
        <h2 className="text-xl md:text-2xl font-bold text-white leading-tight mb-2">
          {post.title}
        </h2>

        {/* Summary */}
        <p className="text-sm text-white/70 line-clamp-2 mb-3">{post.summary}</p>

        {/* Meta pills */}
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 text-[10px] font-bold bg-white/10 backdrop-blur text-white/80 rounded-full">
            {post.author}
          </span>
          <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/20 backdrop-blur text-red-200 rounded-full">
            SON HABER
          </span>
        </div>
      </div>
    </Link>
  );
}
