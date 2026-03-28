'use client';

import { motion } from 'framer-motion';
import { NEWS_ITEMS } from '@/components/constants';
import { ArrowRight, Bookmark, Calendar, Tag } from 'lucide-react';
import Link from 'next/link';

export default function NewsPreview() {
  const featuredNews = NEWS_ITEMS[0];
  const sideNews = NEWS_ITEMS.slice(1);

  return (
    <section id="news" className="bg-white py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-slate-50 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red"
            >
              XƏBƏRLƏR & BLOQ
            </motion.div>
            <h3 className="text-5xl font-display font-extrabold text-slate-900 lg:text-6xl">
              Sektordan ən son
              <br />
              <span className="text-slate-400">yeniliklər</span>
            </h3>
          </div>
          <Link
            href="/haberler"
            className="group flex items-center gap-3 rounded-2xl bg-slate-900 px-8 py-4 font-bold text-white transition-all hover:bg-slate-800 active:scale-95"
          >
            Bütün xəbərlər <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-16 lg:grid-cols-3">
          <Link href={`/blog/${featuredNews.slug}`} className="group cursor-pointer lg:col-span-2">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                <img
                  src={featuredNews.image}
                  alt={featuredNews.title}
                  className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                <div className="absolute left-8 top-8">
                  <span className="rounded-full bg-brand-red px-5 py-2 text-[10px] font-bold uppercase tracking-widest text-white shadow-lg shadow-brand-red/20">
                    {featuredNews.category}
                  </span>
                </div>
                <button className="absolute right-8 top-8 flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all hover:bg-white hover:text-slate-900">
                  <Bookmark size={20} />
                </button>
              </div>
              <div className="mb-6 flex items-center gap-6 text-xs font-bold uppercase tracking-widest text-slate-400">
                <div className="flex items-center gap-2">
                  <Calendar size={16} className="text-brand-red" />
                  {featuredNews.date}
                </div>
                <div className="flex items-center gap-2">
                  <Tag size={16} className="text-brand-red" />
                  {featuredNews.category}
                </div>
              </div>
              <h4 className="mb-6 text-4xl font-display font-extrabold leading-tight text-slate-900 transition-colors group-hover:text-brand-red">
                {featuredNews.title}
              </h4>
              <p className="mb-8 text-xl font-medium leading-relaxed text-slate-500">{featuredNews.excerpt}</p>
              <div className="flex items-center gap-3 font-bold text-slate-900 transition-all group-hover:gap-5">
                Davamını oxu <ArrowRight size={20} className="text-brand-red" />
              </div>
            </motion.div>
          </Link>

          <div className="space-y-12">
            {sideNews.map((news, index) => (
              <Link key={news.id} href={`/blog/${news.slug}`} className="group block cursor-pointer">
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex gap-8">
                    <div className="h-28 w-28 flex-shrink-0 overflow-hidden rounded-3xl shadow-lg shadow-slate-200/50">
                      <img
                        src={news.image}
                        alt={news.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="flex-1 py-1">
                      <span className="mb-3 block text-[10px] font-bold uppercase tracking-widest text-brand-red">
                        {news.category}
                      </span>
                      <h5 className="mb-3 line-clamp-2 text-lg font-display font-bold leading-snug text-slate-900 transition-colors group-hover:text-brand-red">
                        {news.title}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        <Calendar size={12} />
                        {news.date}
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}

            <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 p-10 text-white shadow-2xl shadow-slate-900/20">
              <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-brand-red/10 blur-3xl" />
              <h5 className="relative z-10 mb-4 text-2xl font-display font-bold">Həftəlik bülleten</h5>
              <p className="relative z-10 mb-8 text-sm leading-relaxed text-slate-400">
                Sektordakı son xəbərləri və analizləri birbaşa e-poçtunuza alın.
              </p>
              <div className="relative z-10 space-y-4">
                <input
                  type="email"
                  placeholder="E-poçt ünvanınız"
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm backdrop-blur-sm transition-colors focus:border-brand-red focus:outline-none"
                />
                <button className="w-full rounded-2xl bg-brand-red py-4 text-sm font-bold text-white shadow-lg shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95">
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
