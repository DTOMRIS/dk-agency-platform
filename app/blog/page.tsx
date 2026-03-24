'use client';

import { getAllBlogArticles, CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const articles = getAllBlogArticles();

export default function BlogGridPage() {
  return (
    <div className="bg-white min-h-screen pb-20">
      {/* Header */}
      <div className="bg-slate-950 py-24 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-red/10 rounded-full blur-[120px]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="bg-brand-red text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 inline-block">
              Ekspert Analiz
            </span>
            <h1 className="text-5xl lg:text-7xl font-display font-black uppercase tracking-tighter leading-none mb-8">
              DK Agency <br />
              <span className="text-slate-500">Blog</span>
            </h1>
            <p className="max-w-2xl text-xl text-slate-400 leading-relaxed font-medium">
              HoReCa sektorunda ekspert analizlər, addım-addım bələdçilər və sektor trendləri.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article, index) => {
            const cat = CATEGORY_CONFIG[article.category];
            return (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={`/blog/${article.slug}`} className="group block bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-brand-red/10 transition-all">
                  <div className="aspect-[16/10] overflow-hidden relative">
                    <Image
                      src={article.coverImage}
                      alt={article.coverImageAlt}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-1000"
                    />
                    <div className="absolute top-6 left-6">
                      <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {cat.emoji} {cat.label}
                      </span>
                    </div>
                  </div>
                  <div className="p-10">
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-brand-red" />
                        {new Date(article.publishDate).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-brand-red" />
                        {article.readingTime} dəq
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-black text-slate-900 leading-tight mb-4 group-hover:text-brand-red transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-sm text-slate-500 mb-6 line-clamp-2">{article.summary}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-brand-red" />
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{article.author}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-900 font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                        Oxu <ArrowRight size={16} className="text-brand-red" />
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
