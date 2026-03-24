'use client';

import { NEWS_ITEMS } from '@/components/constants';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Components
import Hero from '../components/Hero';
import PartnersCarousel from '../components/PartnersCarousel';
import StageSelector from '../components/StageSelector';
import ToolkitShowcase from '../components/ToolkitShowcase';
import NewsPreview from '../components/NewsPreview';
import AdsPreview from '../components/AdsPreview';
import { DoganNote, JoinCTA } from '../components/CTASections';
import CookiesBanner from '../components/ui/CookiesBanner';

export default function Home() {
  return (
    <div className="bg-white min-h-screen">
      <Hero />
      <PartnersCarousel />
      <StageSelector />
      <ToolkitShowcase />
      
      {/* Blog & Insights Section (Özel Bölüm) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between border-b border-slate-200 pb-8 mb-12">
            <div>
              <h2 className="text-4xl font-display font-black text-slate-900 uppercase tracking-tighter">Blog & Analizler</h2>
              <p className="text-slate-500 mt-2">Sektör profesyonelleri için derinlemesine incelemeler.</p>
            </div>
            <Link href="/blog" className="group flex items-center gap-2 bg-white border border-slate-200 px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest hover:bg-brand-red hover:text-white hover:border-brand-red transition-all">
              Tümünü Gör <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12">
            {NEWS_ITEMS.slice(0, 2).map((news) => (
              <Link key={news.id} href={`/blog/pl-hesablama`} className="group block">
                <div className="aspect-[16/9] rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl shadow-slate-200/50">
                  <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
                </div>
                <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.2em] mb-4 block">{news.category}</span>
                <h3 className="text-3xl font-display font-black text-slate-900 leading-tight group-hover:text-brand-red transition-colors">
                  {news.title}
                </h3>
                <p className="text-slate-500 mt-4 line-clamp-2">{news.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsPreview />
      <AdsPreview />
      <DoganNote />
      <JoinCTA />

      <CookiesBanner />
    </div>
  );
}
