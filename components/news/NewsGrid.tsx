// components/news/NewsGrid.tsx
// DK Agency - Haber Grid Görünümü

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

const CATEGORY_LABELS: Record<string, string> = {
  horeca: 'HORECA',
  yatirim: 'YATIRIM',
  egitim: 'EĞİTİM',
  operasyon: 'OPERASYON',
};

interface NewsGridProps {
  posts: NewsArticle[];
}

export default function NewsGrid({ posts }: NewsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {posts.map((post) => {
        const categoryLabel = CATEGORY_LABELS[post.category] || post.category.toUpperCase();
        
        return (
          <Link
            key={post.id}
            href={`/haberler/${post.slug}`}
            className="group block rounded-xl overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-lg hover:border-red-200 transition-all"
          >
            {/* Image placeholder */}
            <div className="relative h-32 md:h-40 overflow-hidden">
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--dk-ink)] to-[var(--dk-ink-soft)]">
                <Newspaper size={28} className="text-white/15" />
              </div>

              {/* Category badge overlay */}
              <span className="absolute top-2 left-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-red-600 text-white rounded-full">
                {categoryLabel}
              </span>

              {/* Premium badge */}
              {post.isPremium && (
                <span className="absolute top-2 right-2 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-yellow-500 text-yellow-900 rounded-full">
                  Premium
                </span>
              )}
            </div>

            {/* Title */}
            <div className="p-3">
              <h3 className="text-xs md:text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
                {post.title}
              </h3>
              <p className="text-[10px] text-gray-500 mt-1">{post.author}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
