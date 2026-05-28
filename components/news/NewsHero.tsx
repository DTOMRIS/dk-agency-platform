import Link from 'next/link';
import { Newspaper } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { NewsArticle } from '@/lib/data/mockNewsDB';

interface NewsHeroProps {
  post: NewsArticle;
}

export default function NewsHero({ post }: NewsHeroProps) {
  const t = useTranslations('news');
  const categoryKey = `category${post.category.charAt(0).toUpperCase() + post.category.slice(1)}` as 'categoryHoreca';
  const categoryLabel = t.has(categoryKey) ? t(categoryKey) : post.category.toUpperCase();

  return (
    <Link href={`/haberler/${post.slug}`}
      className="group relative block h-[320px] w-full overflow-hidden rounded-2xl sm:h-[420px] md:h-[480px]">
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--dk-navy)] via-[var(--dk-ink)] to-[var(--dk-ink-soft)]">
        <Newspaper size={64} className="text-white/10" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-8">
        <span className="mb-3 inline-block rounded-full bg-[var(--dk-gold)]/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--dk-navy)] backdrop-blur">
          {categoryLabel}
        </span>
        {post.isPremium && (
          <span className="mb-3 ml-2 inline-block rounded-full bg-yellow-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-300 backdrop-blur">
            Premium
          </span>
        )}
        <h2 className="mb-2 text-xl font-bold leading-tight text-white md:text-2xl">{post.title}</h2>
        <p className="mb-3 line-clamp-2 text-sm text-white/70">{post.summary}</p>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold text-white/80 backdrop-blur">{post.author}</span>
          <span className="rounded-full bg-[var(--dk-gold)]/20 px-2 py-0.5 text-[10px] font-bold text-[var(--dk-gold)] backdrop-blur">{t('latestBadge')}</span>
        </div>
      </div>
    </Link>
  );
}
