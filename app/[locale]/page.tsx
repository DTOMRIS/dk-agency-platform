'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

import AdsPreview from '@/components/AdsPreview';
import { DoganNote, JoinCTA } from '@/components/CTASections';
import Hero from '@/components/Hero';
import NewsPreview from '@/components/NewsPreview';
import PartnersCarousel from '@/components/PartnersCarousel';
import StageSelector from '@/components/StageSelector';
import ToolkitShowcase from '@/components/ToolkitShowcase';
import CookiesBanner from '@/components/ui/CookiesBanner';

const featuredBlogs = [
  {
    slug: '1-porsiya-food-cost-hesablama',
    category: 'Food Cost',
    title: '1 porsiya food cost necə hesablanır?',
    excerpt: 'Porsiya maya dəyəri, resept kartı və düzgün qiymət arasında əlaqəni sadə nümunə ilə izah edirik.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80',
  },
  {
    slug: 'menyu-muhendisliyi-satis',
    category: 'Menyu',
    title: 'Menyu mühəndisliyi ilə satışı necə artırmaq olar?',
    excerpt: 'Ulduz, At, Puzzle və İt matrisi ilə menyunu data ilə idarə etməyin əsasları.',
    image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&q=80',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <PartnersCarousel />
      <ToolkitShowcase />

      <section className="bg-white py-20">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <h2 className="mb-12 text-3xl font-display font-black text-slate-900">Necə işləyir?</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50">
                <span className="text-2xl">1️⃣</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Pulsuz alətləri sına</h3>
              <p className="text-sm text-slate-500">
                Food cost, P&amp;L, menyu matrisi — 10 pulsuz alət ilə restoranını analiz et.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
                <span className="text-2xl">2️⃣</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">Bilikləri öyrən</h3>
              <p className="text-sm text-slate-500">
                10 ekspert yazısı və KAZAN AI danışmanı ilə HoReCa biliyini artır.
              </p>
            </div>
            <div>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
                <span className="text-2xl">3️⃣</span>
              </div>
              <h3 className="mb-2 text-lg font-bold text-slate-900">OCAQ Panelə keç</h3>
              <p className="text-sm text-slate-500">
                Bütün alətlər bir yerdə, avtomatik hesabat və real-time nəzarət.
              </p>
            </div>
          </div>
        </div>
      </section>

      <StageSelector />

      <section className="bg-slate-50 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 flex items-center justify-between border-b border-slate-200 pb-8">
            <div>
              <h2 className="text-4xl font-display font-black uppercase tracking-tighter text-slate-900">
                Bloq & Analizlər
              </h2>
              <p className="mt-2 text-slate-500">Sektor peşəkarları üçün dərin analizlər və praktik bələdçilər.</p>
            </div>
            <Link
              href="/blog"
              className="group flex items-center gap-2 rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-brand-red hover:bg-brand-red hover:text-white"
            >
              Hamısını gör <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {featuredBlogs.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`} className="group block">
                <div className="mb-8 aspect-[16/9] overflow-hidden rounded-[2.5rem] shadow-2xl shadow-slate-200/50">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                  />
                </div>
                <span className="mb-4 block text-[10px] font-black uppercase tracking-[0.2em] text-brand-red">
                  {post.category}
                </span>
                <h3 className="text-3xl font-display font-black leading-tight text-slate-900 transition-colors group-hover:text-brand-red">
                  {post.title}
                </h3>
                <p className="mt-4 line-clamp-2 text-slate-500">{post.excerpt}</p>
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
