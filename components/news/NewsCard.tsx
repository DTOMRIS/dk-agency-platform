import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

function formatDate(dateStr: string | null) {
  if (!dateStr) return null;
  try { return new Date(dateStr).toLocaleDateString('az-AZ', { day: 'numeric', month: 'short', year: 'numeric' }); } catch { return null; }
}

export default function NewsCard({ post }: { post: NewsArticle }) {
  const t = useTranslations('news');
  const categoryKey = `category${post.category.charAt(0).toUpperCase() + post.category.slice(1)}` as 'categoryHoreca';
  const categoryLabel = t.has(categoryKey) ? t(categoryKey) : post.category;
  const date = formatDate(post.publishDate);

  return (
    <Link href={`/haberler/${post.slug}`} className="group block">
      <article className="flex flex-row overflow-hidden rounded-2xl border border-[var(--dk-warm-border)] bg-white shadow-sm transition-all hover:border-[var(--dk-gold)]/40 hover:shadow-lg md:flex-col">
        <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden md:h-48 md:w-full">
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[var(--dk-navy)] to-[var(--dk-ink)]">
            <Newspaper size={28} className="text-white/30" />
          </div>
          <span className="absolute left-3 top-3 hidden rounded-full bg-[var(--dk-gold)]/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--dk-navy)] backdrop-blur-sm md:inline-block">
            {categoryLabel}
          </span>
          {post.isPremium && (
            <span className="absolute right-3 top-3 hidden rounded-full bg-yellow-500/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-900 backdrop-blur-sm md:inline-block">
              Premium
            </span>
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-between p-3 md:p-4">
          <div className="mb-1 flex items-center gap-2 md:mb-2">
            <span className="rounded-full bg-[var(--dk-gold)]/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[var(--dk-gold)] md:hidden">
              {categoryLabel}
            </span>
            {date && <span className="text-[11px] text-slate-400">{date}</span>}
          </div>
          <h2 className="line-clamp-2 text-sm font-bold leading-snug text-[var(--dk-ink)] transition-colors group-hover:text-[var(--dk-gold)] md:line-clamp-3 md:text-base">
            {post.title}
          </h2>
          <p className="mt-2 hidden line-clamp-2 text-xs text-slate-500 md:block">{post.summary}</p>
          <div className="mt-1 flex items-center justify-between md:mt-3">
            <span className="truncate text-[11px] text-slate-400">{post.author}</span>
          </div>
        </div>
      </article>
    </Link>
  );
}
