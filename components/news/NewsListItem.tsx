// components/news/NewsListItem.tsx
// DK Agency - Haber Liste Öğesi

import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

const CATEGORY_LABELS: Record<string, string> = {
  horeca: 'HORECA',
  yatirim: 'YATIRIM',
  egitim: 'EĞİTİM',
  operasyon: 'OPERASYON',
};

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} dk önce`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} saat önce`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay} gün önce`;
  return date.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
}

interface NewsListItemProps {
  post: NewsArticle;
}

export default function NewsListItem({ post }: NewsListItemProps) {
  const categoryLabel = CATEGORY_LABELS[post.category] || post.category.toUpperCase();

  return (
    <Link
      href={`/haberler/${post.slug}`}
      className="flex gap-3 py-3 group border-b border-gray-100 last:border-0"
    >
      {/* Thumbnail */}
      <div className="flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--dk-ink)] to-[var(--dk-ink-soft)]">
          <Newspaper size={20} className="text-white/20" />
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
          {categoryLabel}
        </span>
        <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
          {post.title}
        </h3>
        <div className="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
          <span>{post.author}</span>
          <span>&middot;</span>
          <span>{timeAgo(post.publishDate)}</span>
        </div>
      </div>
    </Link>
  );
}
