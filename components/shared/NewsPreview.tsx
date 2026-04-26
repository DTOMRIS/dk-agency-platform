'use client';

import { motion } from 'framer-motion';
import { NEWS_ITEMS } from '@/components/constants';
import { Calendar, ArrowRight, Tag, Bookmark } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function NewsPreview() {
  const featuredNews = NEWS_ITEMS[0];
  const sideNews = NEWS_ITEMS.slice(1);

  return (
    <section id="news" className="py-32 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-100 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
            >
              XƏBƏRLƏR & BLOG
            </motion.div>
            <h3 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900">
              Sektordan ən son <br />
              <span className="text-slate-400">yeniliklər</span>
            </h3>
          </div>
          <Link href="/news" className="flex items-center gap-3 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition-all active:scale-95 group">
            Bütün xəbərlər <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid lg:grid-cols-3 gap-16">
          {/* Featured News */}
          <Link href="/news" className="lg:col-span-2 group cursor-pointer">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="relative aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl shadow-slate-200/50">
                <Image
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent"></div>
                <div className="absolute top-8 left-8">
                  <span className="bg-brand-red text-white px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-brand-red/20">
                    {featuredNews.category}
                  </span>
                </div>
                <button className="absolute top-8 right-8 w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white transition-all hover:text-slate-900">
                  <Bookmark size={20} />
                </button>
              </div>
              <div className="flex items-center gap-6 text-xs font-bold text-slate-400 mb-6 uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {featuredNews.date}
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-brand-red" />
                  AQTA, Gigiyena
                </div>
              </div>
              <h4 className="text-4xl font-display font-extrabold text-slate-900 mb-6 group-hover:text-brand-red transition-colors leading-tight">
                {featuredNews.title}
              </h4>
              <p className="text-xl text-slate-500 leading-relaxed mb-8 font-medium">
                {featuredNews.excerpt}
              </p>
              <div className="flex items-center gap-3 text-slate-900 font-bold group-hover:gap-5 transition-all">
                Davamını oxu <ArrowRight size={20} className="text-brand-red" />
              </div>
            </motion.div>
          </Link>

          {/* Sidebar News */}
          <div className="space-y-12">
            {sideNews.map((news, index) => (
              <Link
                key={news.id}
                href="/news"
                className="group cursor-pointer block"
              >
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-8">
                    <div className="w-28 h-28 flex-shrink-0 rounded-3xl overflow-hidden shadow-lg shadow-slate-200/50">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <span className="text-[10px] font-bold text-brand-red uppercase tracking-widest block mb-3">
                        {news.category}
                      </span>
                      <h5 className="text-lg font-display font-bold text-slate-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-2 mb-3">
                        {news.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        <Calendar size={12} />
                        {news.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            {/* Newsletter Signup in Sidebar */}
            <div className="bg-slate-950 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-red/10 rounded-full blur-3xl"></div>
              <h5 className="text-2xl font-display font-bold mb-4 relative z-10">Həftəlik bülleten</h5>
              <p className="text-sm text-slate-400 mb-8 leading-relaxed relative z-10">
                Sektordakı ən son xəbərləri və analizləri birbaşa e-poçtunuza alın.
              </p>
              <div className="space-y-4 relative z-10">
                <input
                  type="email"
                  placeholder="E-poçt ünvanınız"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:border-brand-red transition-colors backdrop-blur-sm"
                />
                <button className="w-full bg-brand-red hover:bg-rose-600 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-brand-red/20 active:scale-95">
                  Abunə ol
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
