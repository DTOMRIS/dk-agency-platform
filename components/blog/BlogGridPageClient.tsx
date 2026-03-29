'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { getAllBlogArticles, CATEGORY_CONFIG, type BlogArticle } from '@/lib/data/blogArticles';
import { formatDateAz } from '@/lib/formatDate';

const allCategories = Object.entries(CATEGORY_CONFIG).map(([key, val]) => ({
  key,
  label: val.label,
  emoji: val.emoji,
}));

export default function BlogGridPage() {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const articles = getAllBlogArticles();

  const filtered = activeCategory === 'all'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  return (
    <div className="bg-[var(--dk-paper)] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-slate-950 py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <span className="bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 inline-block">
              Insights & Intelligence
            </span>
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-8">
              DK Agency <br />
              <span className="text-slate-500">Blog</span>
            </h1>
            <p className="max-w-2xl text-xl text-slate-400 leading-relaxed font-medium">
              Restoran sektoru haqqinda ekspert yazilari, addim-addim beledciler ve sektor trendleri.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Category Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 relative z-20 mb-12">
        <div className="flex flex-wrap items-center gap-2 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
              activeCategory === 'all' ? 'bg-[var(--dk-navy)] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            Hamisi
          </button>
          {allCategories.map((cat) => (
            <button
              key={cat.key}
              onClick={() => setActiveCategory(cat.key)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                activeCategory === cat.key ? 'bg-[var(--dk-navy)] text-white shadow-lg' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((article, index) => (
            <motion.div
              key={article.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <BlogCard article={article} />
            </motion.div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-slate-400 font-medium">Bu kateqoriyada hele meqale yoxdur.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function BlogCard({ article }: { article: BlogArticle }) {
  const cat = CATEGORY_CONFIG[article.category];

  return (
    <Link
      href={`/blog/${article.slug}`}
      className="group block bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
    >
      <div className="aspect-[16/10] overflow-hidden relative">
        {article.coverImage ? (
          <img
            src={article.coverImage}
            alt={article.coverImageAlt}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[color-mix(in srgb, var(--dk-gold) 22%, white)] to-[color-mix(in srgb, var(--dk-red) 24%, white)]" />
        )}
        <div className="absolute top-4 left-4">
          <span className="bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
            {cat.emoji} {cat.label}
          </span>
        </div>
        {article.isPremium && (
          <div className="absolute top-4 right-4">
            <span className="bg-[var(--dk-gold)] text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Premium
            </span>
          </div>
        )}
      </div>
      <div className="p-8">
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar size={12} className="text-brand-red" />
            {formatDateAz(article.publishDate) ?? article.publishDate}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-brand-red" />
            {article.readingTime} deq
          </div>
        </div>
        <h3 className="text-xl font-display font-black text-slate-900 leading-tight mb-3 group-hover:text-brand-red transition-colors line-clamp-2">
          {article.title}
        </h3>
        <p className="text-sm text-slate-500 leading-relaxed line-clamp-2 mb-6">{article.summary}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <User size={14} />
            {article.author}
          </div>
          <div className="flex items-center gap-1 text-brand-red text-xs font-bold uppercase tracking-widest group-hover:gap-3 transition-all">
            Oxu <ArrowRight size={14} />
          </div>
        </div>
      </div>
    </Link>
  );
}


