'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AD_ITEMS } from '@/components/constants';
import { MapPin, Clock, Plus, Filter, ArrowUpRight } from 'lucide-react';

export default function AdsPreview() {
  const [activeCategory, setActiveCategory] = useState('Bütün');
  const categories = ['Bütün', 'Lahiyə', 'İnvestisiya', 'B2B Tərəfdaş', 'Franchise'];

  const filteredAds = activeCategory === 'Bütün' 
    ? AD_ITEMS 
    : AD_ITEMS.filter(ad => ad.category === activeCategory);

  return (
    <section id="ads" className="py-32 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-8">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-brand-red text-[10px] font-bold uppercase tracking-[0.3em] mb-6"
            >
              ELANLAR LÖVHƏSİ
            </motion.div>
            <h3 className="text-5xl lg:text-6xl font-display font-extrabold text-slate-900">
              Fırsatları <br />
              <span className="text-slate-400">qaçırmayın</span>
            </h3>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeCategory === cat
                      ? 'bg-slate-900 text-white shadow-lg'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            <button className="bg-brand-red text-white px-8 py-4 rounded-2xl font-bold hover:bg-rose-600 transition-all flex items-center gap-2 shadow-xl shadow-brand-red/20 active:scale-95">
              <Plus size={20} /> Elan Yerləşdir
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredAds.map((ad, index) => (
              <motion.div
                key={ad.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img
                    src={ad.image}
                    alt={ad.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-6 left-6">
                    <span className="bg-white/90 backdrop-blur-md text-slate-900 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
                      {ad.category}
                    </span>
                  </div>
                  <div className="absolute bottom-6 right-6">
                    <div className="bg-brand-red text-white px-5 py-2 rounded-2xl text-lg font-display font-extrabold shadow-xl shadow-brand-red/20">
                      {ad.price}
                    </div>
                  </div>
                </div>
                
                <div className="p-8">
                  <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 mb-4 uppercase tracking-widest">
                    <div className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-brand-red" />
                      {ad.location}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-brand-red" />
                      {ad.date}
                    </div>
                  </div>
                  <h4 className="text-xl font-display font-bold text-slate-900 mb-4 group-hover:text-brand-red transition-colors line-clamp-2 leading-tight">
                    {ad.title}
                  </h4>
                  <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Təfərrüatlara bax</span>
                    <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-900 group-hover:bg-brand-red group-hover:text-white transition-all">
                      <ArrowUpRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredAds.length === 0 && (
          <div className="text-center py-20">
            <Filter className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <p className="text-xl text-slate-400 font-medium">Bu kateqoriyada hələ elan yoxdur.</p>
          </div>
        )}
      </div>
    </section>
  );
}
