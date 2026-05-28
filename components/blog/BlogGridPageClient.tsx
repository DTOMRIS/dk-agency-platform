'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { getAllBlogArticles, CATEGORY_CONFIG, type BlogArticle } from '@/lib/data/blogArticles';
import { formatDateAz } from '@/lib/formatDate';

const allCategories = Object.entries(CATEGORY_CONFIG).map(([key, val]) => ({
  key, label: val.label, emoji: val.emoji,
}));
const FALLBACK_CATEGORY = { emoji: '📝', label: 'Bloq', color: 'slate' };

export default function BlogGridPage() {
  const t = useTranslations('blog');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const articles = getAllBlogArticles();
  const filtered = activeCategory === 'all' ? articles : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="bg-[var(--dk-paper)] min-h-screen pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-[var(--dk-navy)] to-slate-950 py-24 text-white">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[var(--dk-gold)]/8 blur-[100px]" />
        </div>
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="mb-8 inline-block rounded-full bg-[var(--dk-gold)]/20 px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--dk-gold)]">
              {t('badge')}
            </span>
            <h1 className="mb-8 text-3xl font-display font-black uppercase tracking-tighter leading-none md:text-5xl lg:text-7xl">
              {t('title')}
            </h1>
            <p className="max-w-2xl text-xl font-medium leading-relaxed text-slate-400">
              {t('subtitle')}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="relative z-20 mx-auto -mt-6 mb-12 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
          <button onClick={() => setActiveCategory('all')}
            className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeCategory === 'all' ? 'bg-[var(--dk-navy)] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
            {t('filterAll')}
          </button>
          {allCategories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`rounded-xl px-5 py-2.5 text-sm font-bold transition-all ${activeCategory === cat.key ? 'bg-[var(--dk-navy)] text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((article, index) => (
            <motion.div key={article.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <BlogCard article={article} t={t} />
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="py-20 text-center">
            <p className="text-xl font-medium text-slate-400">{t('empty')}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ article, t }: { article: BlogArticle; t: ReturnType<typeof useTranslations> }) {
  const cat = CATEGORY_CONFIG[article.category] ?? FALLBACK_CATEGORY;

  return (
    <Link href={`/blog/${article.slug}`}
      className="group block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative aspect-[16/10] overflow-hidden">
        {article.coverImage ? (
          <img src={article.coverImage} alt={article.coverImageAlt}
            className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" referrerPolicy="no-referrer" />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-[color-mix(in_srgb,var(--dk-gold)_22%,white)] to-[color-mix(in_srgb,var(--dk-red)_24%,white)]" />
        )}
        <div className="absolute left-4 top-4">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-900 backdrop-blur-md">
            {cat.emoji} {cat.label}
          </span>
        </div>
        {article.isPremium && (
          <div className="absolute right-4 top-4">
            <span className="rounded-full bg-[var(--dk-gold)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
              {t('premium')}
            </span>
          </div>
        )}
      </div>
      <div className="p-6">
        <div className="mb-3 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-[var(--dk-gold)]" />
            {formatDateAz(article.publishDate) ?? article.publishDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-[var(--dk-gold)]" />
            {article.readingTime} {t('minutes')}
          </div>
        </div>
        <h3 className="mb-3 line-clamp-2 text-xl font-display font-black leading-tight text-slate-900 transition-colors group-hover:text-[var(--dk-gold)]">
          {article.title}
        </h3>
        <p className="mb-6 line-clamp-2 text-sm leading-relaxed text-slate-500">{article.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User size={14} /> {article.author}
          </div>
          <div className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest text-[var(--dk-gold)] transition-all group-hover:gap-3">
            {t('read')} <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}
