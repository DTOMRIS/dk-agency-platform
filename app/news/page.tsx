'use client';

import { motion } from 'framer-motion';
import { NEWS_ITEMS } from '@/components/constants';
import { Calendar, ArrowRight, Tag, Bookmark, Search, User, Mail, ChevronRight, Clock, MessageSquare, TrendingUp, X } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function NewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeCat = searchParams.get('cat');

  const filteredNews = activeCat 
    ? NEWS_ITEMS.filter(n => n.category.toLowerCase() === activeCat.toLowerCase() || n.type.toLowerCase() === activeCat.toLowerCase())
    : NEWS_ITEMS;

  const featuredNews = filteredNews[0] || NEWS_ITEMS[0];
  const latestNews = filteredNews.slice(1, 10);
  const opinionNews = NEWS_ITEMS.filter(n => n.type === 'Opinion');
  const appointmentNews = NEWS_ITEMS.filter(n => n.type === 'Appointment');
  const reportNews = NEWS_ITEMS.filter(n => n.type === 'Report');

  const clearFilter = () => router.push('/news');

  return (
    <div className="bg-white pb-20">
      {/* Breaking News Ticker */}
      {!activeCat && (
        <div className="bg-slate-50 border-b border-slate-100 py-3">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-4">
            <span className="bg-brand-red text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">Trending</span>
            <div className="flex-1 overflow-hidden whitespace-nowrap">
              <motion.p 
                animate={{ x: [0, -1000] }}
                transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
                className="text-[11px] font-bold text-slate-600 uppercase tracking-wider"
              >
                {NEWS_ITEMS.map(n => n.title).join(' • ')}
              </motion.p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* Active Filter Header */}
        {activeCat && (
          <div className="mb-12 flex items-center justify-between bg-slate-900 p-8 rounded-2xl text-white">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red mb-2">Category Archive</p>
              <h1 className="text-4xl font-display font-black uppercase tracking-tighter">{activeCat}</h1>
            </div>
            <button 
              onClick={clearFilter}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-xs font-bold transition-all"
            >
              <X size={14} /> Clear Filter
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-12 gap-12">
          {/* Main Content Area (8 Columns) */}
          <div className="lg:col-span-8 space-y-16">
            {filteredNews.length === 0 ? (
              <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                <Search size={48} className="mx-auto text-slate-300 mb-4" />
                <h3 className="text-xl font-display font-black text-slate-900">No articles found</h3>
                <p className="text-slate-500 mt-2">Try selecting another category or clear the filter.</p>
              </div>
            ) : (
              <>
                {/* Featured Hero */}
                <section>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group cursor-pointer"
                  >
                    <div className="relative aspect-[21/9] rounded-[2.5rem] overflow-hidden mb-10 shadow-2xl shadow-slate-200/50">
                      <img
                        src={featuredNews.image}
                        alt={featuredNews.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent"></div>
                      <div className="absolute bottom-10 left-10 right-10">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="bg-brand-red text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-[0.2em]">
                            {featuredNews.category}
                          </span>
                          <span className="text-white/60 text-[9px] font-bold uppercase tracking-widest">
                            {featuredNews.date}
                          </span>
                        </div>
                        <h1 className="text-3xl lg:text-6xl font-display font-black text-white leading-[1.1] tracking-tight mb-6">
                          {featuredNews.title}
                        </h1>
                        <div className="flex items-center gap-6 text-white/60 text-[10px] font-bold uppercase tracking-widest">
                          <div className="flex items-center gap-2">
                            <User size={14} className="text-brand-red" />
                            {featuredNews.author?.name}
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock size={14} />
                            6 min read
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-2xl text-slate-600 leading-relaxed font-medium">
                      {featuredNews.excerpt}
                    </p>
                  </motion.div>
                </section>

                {/* Latest News List */}
                <section>
                  <div className="flex items-center justify-between border-b border-slate-900 pb-4 mb-12">
                    <h2 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tighter">
                      {activeCat ? `More in ${activeCat}` : 'Latest Intelligence'}
                    </h2>
                  </div>
                  <div className="space-y-12">
                    {latestNews.map((news) => (
                      <div key={news.id} className="flex flex-col md:flex-row gap-10 group cursor-pointer border-b border-slate-100 pb-12 last:border-0">
                        <div className="md:w-72 aspect-video rounded-2xl overflow-hidden shadow-xl shadow-slate-200/50 flex-shrink-0">
                          <img
                            src={news.image}
                            alt={news.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-[9px] font-black text-brand-red uppercase tracking-[0.2em]">{news.category}</span>
                            <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">5 min read</span>
                          </div>
                          <h3 className="text-2xl font-display font-black text-slate-900 mb-4 group-hover:text-brand-red transition-colors leading-[1.2]">
                            {news.title}
                          </h3>
                          <p className="text-base text-slate-500 line-clamp-2 leading-relaxed mb-6">
                            {news.excerpt}
                          </p>
                          <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Source: <span className="text-slate-900">{news.source}</span> • {news.date}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </>
            )}

            {/* Opinion Section (Always show some opinions) */}
            <section className="bg-slate-950 rounded-3xl p-12 text-white">
              <div className="flex items-center gap-4 mb-12">
                <MessageSquare size={32} className="text-brand-red" />
                <h2 className="text-3xl font-display font-black uppercase tracking-tighter">Industry Opinion</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-12">
                {opinionNews.slice(0, 4).map((news) => (
                  <div key={news.id} className="space-y-6 group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-brand-red">
                        <img src={news.author?.avatar || 'https://picsum.photos/seed/avatar/100/100'} alt={news.author?.name} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white">{news.author?.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{news.author?.role}</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-display font-black text-white group-hover:text-brand-red transition-colors leading-tight">
                      {"\u201C"}{news.title}{"\u201D"}
                    </h3>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar (4 Columns) */}
          <aside className="lg:col-span-4 space-y-16">
            {/* Newsletter Signup */}
            <div className="bg-brand-red rounded-3xl p-10 text-white shadow-2xl shadow-brand-red/20">
              <Mail size={40} className="mb-6" />
              <h3 className="text-2xl font-display font-black mb-4 leading-tight">Stay ahead of the curve</h3>
              <p className="text-sm text-white/80 mb-8 leading-relaxed">
                Join 50,000+ hospitality professionals receiving our daily intelligence briefing.
              </p>
              <div className="space-y-4">
                <input 
                  type="email" 
                  placeholder="Your professional email" 
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-5 py-4 text-sm focus:outline-none focus:border-white transition-all placeholder:text-white/40"
                />
                <button className="w-full bg-white text-brand-red py-4 rounded-xl font-black text-sm hover:bg-slate-50 transition-all uppercase tracking-widest">
                  Subscribe Now
                </button>
              </div>
            </div>

            {/* Most Popular */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-8">
                <h2 className="text-xl font-display font-black text-slate-900 uppercase tracking-tighter">Most Popular</h2>
                <TrendingUp size={20} className="text-brand-red" />
              </div>
              <div className="space-y-8">
                {NEWS_ITEMS.slice(0, 5).map((news, index) => (
                  <div key={news.id} className="flex gap-6 group cursor-pointer">
                    <div className="text-4xl font-display font-black text-slate-100 group-hover:text-brand-red transition-colors">
                      0{index + 1}
                    </div>
                    <div>
                      <span className="text-[9px] font-black text-brand-red uppercase tracking-widest block mb-2">{news.category}</span>
                      <h4 className="text-sm font-display font-black text-slate-900 leading-snug group-hover:text-brand-red transition-colors line-clamp-2">
                        {news.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Appointments */}
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-display font-black text-slate-900 uppercase tracking-tighter">Appointments</h2>
                <User size={20} className="text-brand-red" />
              </div>
              <div className="space-y-6">
                {appointmentNews.slice(0, 5).map((news) => (
                  <div key={news.id} className="flex items-center gap-4 group cursor-pointer border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-md flex-shrink-0">
                      <img src={news.author?.avatar} alt={news.author?.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 group-hover:text-brand-red transition-colors">{news.author?.name}</h4>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{news.author?.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Reports */}
            <div>
              <div className="flex items-center justify-between border-b-2 border-slate-900 pb-4 mb-8">
                <h2 className="text-xl font-display font-black text-slate-900 uppercase tracking-tighter">Market Reports</h2>
              </div>
              <div className="space-y-6">
                {reportNews.slice(0, 5).map((news) => (
                  <div key={news.id} className="group cursor-pointer">
                    <h4 className="text-sm font-display font-black text-slate-900 group-hover:text-brand-red transition-colors leading-tight mb-2">
                      {news.title}
                    </h4>
                    <div className="flex items-center gap-3 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                      <span>{news.source}</span>
                      <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                      <span>{news.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default function NewsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center">Loading...</div>}>
      <NewsContent />
    </Suspense>
  );
}
