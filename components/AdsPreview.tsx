'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AD_ITEMS } from '@/components/constants';
import { ArrowUpRight, Clock, Filter, MapPin, Plus } from 'lucide-react';

export default function AdsPreview() {
  const [activeCategory, setActiveCategory] = useState('Bütün');
  const categories = ['Bütün', 'Devir', 'Avadanlıq', 'İnvestisiya', 'B2B Tərəfdaş'];

  const filteredAds =
    activeCategory === 'Bütün' ? AD_ITEMS : AD_ITEMS.filter((ad) => ad.category === activeCategory);

  return (
    <section id="ads" className="bg-slate-50 py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-16 flex flex-col items-start justify-between gap-8 md:flex-row md:items-end">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-brand-red"
            >
              ELANLAR LÖVHƏSİ
            </motion.div>
            <h3 className="text-5xl font-display font-extrabold text-slate-900 lg:text-6xl">
              Fürsətləri
              <br />
              <span className="text-slate-400">qaçırmayın</span>
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="flex items-center gap-2 rounded-2xl bg-brand-red px-8 py-4 font-bold text-white shadow-xl shadow-brand-red/20 transition-all hover:bg-rose-600 active:scale-95">
              <Plus size={20} /> Elan yerləşdir
            </button>
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group overflow-hidden rounded-[2.5rem] border border-slate-100 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)]"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute left-6 top-6">
                    <span className="rounded-full bg-white/90 px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-lg backdrop-blur-md">
                      {ad.category}
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div className="rounded-2xl bg-brand-red px-5 py-2 text-lg font-extrabold text-white shadow-xl shadow-brand-red/20">
                      {ad.price}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="mb-4 flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-red" />
                      {ad.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-red" />
                      {ad.date}
                    </div>
                  </div>
                  <h4 className="mb-4 line-clamp-2 text-xl font-display font-bold leading-tight text-slate-900 transition-colors group-hover:text-brand-red">
                    {ad.title}
                  </h4>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-6">
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Təfərrüatlara bax</span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-900 transition-all group-hover:bg-brand-red group-hover:text-white">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAds.length === 0 && (
          <div className="py-20 text-center">
            <Filter className="mx-auto mb-6 h-16 w-16 text-slate-200" />
            <p className="text-xl font-medium text-slate-400">Bu kateqoriyada hələ elan yoxdur.</p>
          </div>
        )}
      </div>
    </section>
  );
}
