'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import AdsPreview from '@/components/AdsPreview';
import { DoganNote, JoinCTA } from '@/components/CTASections';
import Hero from '@/components/Hero';
import NewsPreview from '@/components/NewsPreview';
import PartnersCarousel from '@/components/PartnersCarousel';
import StageSelector from '@/components/StageSelector';
import ToolkitShowcase from '@/components/ToolkitShowcase';

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
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <h2 className="mb-12 text-3xl font-display font-black text-slate-900">Necə işləyir?</h2>
          <div className="grid gap-8 md:grid-cols-3 lg:grid-cols-1">
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
          <Image
            src="/images/consulting-meeting.png"
            alt="Restoran sahibi ilə biznes konsultasiyası"
            width={640}
            height={480}
            className="hidden max-h-[400px] w-full object-contain lg:block"
          />
        </div>
      </section>

      <StageSelector />

      <section className="bg-slate-50 py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:mb-12 sm:flex-row sm:items-center sm:justify-between sm:pb-8">
            <div>
              <h2 className="text-3xl font-display font-black uppercase tracking-tighter text-slate-900 sm:text-4xl">
                Bloq & Analizlər
              </h2>
              <p className="mt-2 text-slate-500">Sektor peşəkarları üçün dərin analizlər və praktik bələdçilər.</p>
            </div>
            <Link
              href="/blog"
              className="group inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-3 text-xs font-black uppercase tracking-widest transition-all hover:border-brand-red hover:bg-brand-red hover:text-white sm:w-auto sm:px-6"
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
                <h3 className="text-2xl font-display font-black leading-tight text-slate-900 transition-colors group-hover:text-brand-red sm:text-3xl">
                  {post.title}
                </h3>
                <p className="mt-4 line-clamp-2 text-slate-500">{post.excerpt}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <NewsPreview />

      <section className="bg-slate-50 py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="rounded-full bg-[var(--dk-navy)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
              B2B Ekosistem
            </span>
            <h2 className="mt-4 text-3xl font-display font-black text-slate-900 sm:text-4xl">
              HORECA B2B Elanlar
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-slate-500">
              Restoran devri, franchise, ortaq axtarışı, investisiya — bir platformada.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { title: 'Restoran Devri', desc: 'İşlətmənizi devir edin və ya hazır restoran alın', href: '/ilanlar', emoji: '🍽️' },
              { title: 'Franchise', desc: 'Franchise verin və ya hazır brend ilə başlayın', href: '/ilanlar', emoji: '🤝' },
              { title: 'Ortaq Tapmaq', desc: 'Layihəniz üçün sermaye və ya əməliyyat ortağı tapın', href: '/ilanlar', emoji: '👥' },
              { title: 'Yeni İnvestisiya', desc: 'Yatırımçı axtaran yeni layihələr', href: '/ilanlar', emoji: '📈' },
              { title: 'Obyekt İcarəsi', desc: 'HoReCa uyğun məkan kiralayın', href: '/ilanlar', emoji: '🏢' },
              { title: 'HORECA Ekipman', desc: 'Peşəkar avadanlıq alın və ya satın', href: '/ilanlar', emoji: '⚙️' },
            ].map((item) => (
              <Link
                key={item.title}
                href={item.href}
                className="group rounded-2xl border border-slate-200 bg-white p-6 transition-all hover:border-[var(--dk-gold)] hover:shadow-lg"
              >
                <span className="text-2xl">{item.emoji}</span>
                <h3 className="mt-3 text-lg font-bold text-slate-900 group-hover:text-[var(--dk-red)]">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-500">{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link
              href="/ilanlar"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-navy)] px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-slate-800"
            >
              Bütün elanları gör
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <AdsPreview />
      <DoganNote />
      <JoinCTA />
    </div>
  );
}
