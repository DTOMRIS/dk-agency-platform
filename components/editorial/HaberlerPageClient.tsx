'use client';

import { motion } from 'framer-motion';
import { NEWS_ITEMS } from '@/lib/data/editorialContent';
import { getAllBlogArticles, CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import {
  Mail,
  TrendingUp,
  User,
  FileText,
  ArrowRight,
  Rss,
  Calendar,
  MapPin,
} from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { formatDateAz } from '@/lib/formatDate';

const SECTORS = [
  { id: 'hotel', label: 'Otel', slug: 'hotel' },
  { id: 'restaurant', label: 'Restoran', slug: 'restaurant' },
  { id: 'cafe', label: 'Kafe', slug: 'cafe' },
  { id: 'catering', label: 'Katerinq', slug: 'catering' },
  { id: 'supply', label: 'Tədarük', slug: 'supply' },
  { id: 'hr', label: 'Kadr', slug: 'hr' },
  { id: 'corporate', label: 'Korporativ', slug: 'corporate' },
] as const;

const BLOG_TO_SECTOR: Record<string, string> = {
  maliyye: 'corporate',
  kadr: 'hr',
  emeliyyat: 'restaurant',
  konsept: 'cafe',
  acilis: 'hotel',
  satis: 'catering',
};

const EVENTS = [
  {
    id: 'evt-1',
    title: 'HoReCa Summit Bakı 2026',
    date: '15 mart 2026',
    location: 'Hilton Baku',
    description: 'Azərbaycan HoReCa sektorunun ən böyük tədbiri — operatorlar, tədarükçülər və investitorlar bir arada.',
    tag: 'Konfrans',
  },
  {
    id: 'evt-2',
    title: 'DK Agency Food Cost Masterclass',
    date: '22 mart 2026',
    location: 'DK Agency Ofis',
    description: 'Food cost hesablama, resept kartı və menyu mühəndisliyi üzrə praktik təlim.',
    tag: 'Təlim',
  },
  {
    id: 'evt-3',
    title: 'Restoran Sahibləri Networking',
    date: '5 aprel 2026',
    location: 'Port Baku Towers',
    description: 'Sektor peşəkarları ilə networking, təcrübə mübadiləsi və tərəfdaşlıq imkanları.',
    tag: 'Networking',
  },
];

function NewsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeSector = searchParams.get('sector');

  const blogArticles = getAllBlogArticles();
  const filteredArticles = activeSector
    ? blogArticles.filter((a) => BLOG_TO_SECTOR[a.category] === activeSector)
    : blogArticles;

  const featured = filteredArticles.slice(0, 3);
  const row2 = filteredArticles.slice(3, 6);
  const row3 = filteredArticles.slice(6, 12);
  const supplyNews = NEWS_ITEMS.filter((n) => n.type === 'Report' || n.type === 'Announcement');

  const setSector = (slug: string | null) => {
    if (!slug) router.push('/haberler');
    else router.push(`/haberler?sector=${slug}`);
  };

  return (
    <div className="min-h-screen bg-[#fafaf9]">
      {/* Category Bar — HORECA TREND style */}
      <div className="sticky top-[7rem] z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide py-4">
            <button
              onClick={() => setSector(null)}
              className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !activeSector
                  ? 'bg-slate-900 text-white shadow-lg'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              Hamısı
            </button>
            {SECTORS.map((s) => (
              <button
                key={s.id}
                onClick={() => setSector(s.slug)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
                  activeSector === s.slug
                    ? 'bg-slate-900 text-white shadow-lg'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid lg:grid-cols-12 gap-10">
          {/* Main — 8 cols */}
          <div className="lg:col-span-8 space-y-14">
            {/* Son Xəbərlər — curated news feed (xəbər saytı hissi) */}
            {supplyNews.filter((n) => n.sourceUrl).length > 0 && (
              <section>
                <h2 className="text-xl font-display font-black text-slate-900 tracking-tight mb-4">
                  Son xəbərlər
                </h2>
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <ul className="divide-y divide-slate-100">
                    {supplyNews
                      .filter((n) => n.sourceUrl)
                      .slice(0, 6)
                      .map((news, i) => (
                        <li key={news.id}>
                          <a
                            href={news.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex gap-4 p-4 hover:bg-slate-50/80 transition-colors group"
                          >
                            <span className="text-sm font-black text-slate-300 w-6 flex-shrink-0">
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">
                                {news.category}
                              </span>
                              <h3 className="mt-0.5 text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-brand-red transition-colors">
                                {news.title}
                              </h3>
                              <span className="text-[10px] font-bold text-slate-400">{news.source}</span>
                            </div>
                            <ArrowRight size={16} className="text-slate-300 group-hover:text-brand-red group-hover:translate-x-0.5 transition-all flex-shrink-0" />
                          </a>
                        </li>
                      ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Row 1: 3 Featured Cards — DK blog */}
            <section>
              <h2 className="text-xl font-display font-black text-slate-900 tracking-tight mb-4">
                DK Agency məqalələri
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                {featured.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                  >
                    <Link href={`/haberler/${article.slug}`} className="group block">
                      <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all duration-300">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={article.coverImageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-6">
                          <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.15em]">
                            {CATEGORY_CONFIG[article.category]?.label}
                          </span>
                          <h3 className="mt-2 text-lg font-display font-black text-slate-900 leading-tight line-clamp-2 group-hover:text-brand-red transition-colors">
                            {article.title}
                          </h3>
                          <p className="mt-2 text-[13px] text-slate-500 line-clamp-2">
                            {article.summary}
                          </p>
                          <div className="mt-4 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                            <span>{article.author}</span>
                            <span>•</span>
                            <span>{formatDateAz(article.publishDate)}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Row 2: 3 Horizontal Cards */}
            <section>
              <div className="space-y-4">
                {row2.map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.06 }}
                  >
                    <Link href={`/haberler/${article.slug}`} className="group flex gap-6 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:border-slate-200/80 transition-all duration-300">
                      <div className="w-48 flex-shrink-0 aspect-[4/3] rounded-xl overflow-hidden">
                        <img
                          src={article.coverImage}
                          alt={article.coverImageAlt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-black text-brand-red uppercase tracking-[0.15em]">
                          {CATEGORY_CONFIG[article.category]?.label}
                        </span>
                        <h3 className="mt-2 text-xl font-display font-black text-slate-900 leading-tight group-hover:text-brand-red transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="mt-2 text-sm text-slate-500 line-clamp-2">
                          {article.summary}
                        </p>
                        <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-slate-400">
                          <span>{article.author}</span>
                          <span>•</span>
                          <span>{article.readingTime} dəq</span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-brand-red group-hover:translate-x-1 transition-all flex-shrink-0 hidden sm:block" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>

            {/* Row 3: 6 Cards Grid — Tədarük / Supply */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">
                  Tədarük sənayesində trendlər
                </h2>
                <Link
                  href="/haberler?sector=supply"
                  className="text-sm font-bold text-brand-red hover:underline flex items-center gap-1"
                >
                  Hamısı <ArrowRight size={14} />
                </Link>
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {(row3.length ? row3 : blogArticles.slice(0, 6)).map((article, i) => (
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + i * 0.05 }}
                  >
                    <Link href={`/haberler/${article.slug}`} className="group block">
                      <div className="bg-white rounded-xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition-all duration-300">
                        <div className="aspect-[16/10] overflow-hidden">
                          <img
                            src={article.coverImage}
                            alt={article.coverImageAlt}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="p-4">
                          <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">
                            {CATEGORY_CONFIG[article.category]?.label}
                          </span>
                          <h3 className="mt-2 text-sm font-display font-black text-slate-900 leading-snug line-clamp-2 group-hover:text-brand-red transition-colors">
                            {article.title}
                          </h3>
                          <div className="mt-2 text-[10px] font-bold text-slate-400">
                            {formatDateAz(article.publishDate)}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar — 4 cols */}
          <aside className="lg:col-span-4 space-y-8">
            {/* Supplier News — sticky qaldırıldı, overflow yoxdur */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-50 rounded-lg">
                    <FileText size={18} className="text-slate-500" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Tədarükçü xəbərləri
                  </h3>
                </div>
                <a href="/api/rss/haberler" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-slate-400 hover:text-brand-red flex items-center gap-1">
                  <Rss size={12} /> RSS
                </a>
              </div>
              <div className="space-y-5">
                {supplyNews.slice(0, 8).map((news) => {
                  const Wrapper = news.sourceUrl ? 'a' : 'div';
                  const wrapperProps = news.sourceUrl
                    ? { href: news.sourceUrl, target: '_blank', rel: 'noopener noreferrer', className: 'block pb-4 border-b border-slate-50 last:border-0 last:pb-0 group cursor-pointer hover:opacity-90 transition-opacity' }
                    : { className: 'pb-4 border-b border-slate-50 last:border-0 last:pb-0' };
                  return (
                    <Wrapper key={news.id} {...wrapperProps}>
                      <span className="text-[9px] font-black text-brand-red uppercase tracking-widest">
                        {news.category}
                      </span>
                      <h4 className={`mt-1 text-sm font-bold text-slate-900 leading-snug line-clamp-2 transition-colors ${news.sourceUrl ? 'group-hover:text-brand-red' : ''}`}>
                        {news.title}
                      </h4>
                      <p className="mt-1 text-[11px] text-slate-500 line-clamp-2">{news.excerpt}</p>
                      <span className="text-[9px] font-bold text-slate-400">{news.source}</span>
                    </Wrapper>
                  );
                })}
              </div>
            </div>

            {/* Newsletter */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-8 text-white shadow-xl">
              <Mail size={32} className="mb-4 text-brand-red" />
              <h3 className="text-xl font-display font-black mb-2">
                Həftəlik bülleten
              </h3>
              <p className="text-sm text-slate-300 mb-6 leading-relaxed">
                Sektor trendləri və praktik məsləhətlər birbaşa e-poçtunuza.
              </p>
              <input
                type="email"
                placeholder="E-poçt"
                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-brand-red placeholder:text-slate-400 mb-3"
              />
              <button className="w-full bg-brand-red hover:bg-rose-600 text-white py-3 rounded-xl font-bold text-sm transition-colors">
                Abunə ol
              </button>
            </div>

            {/* Most Read */}
            <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Ən oxunan
                </h3>
                <TrendingUp size={18} className="text-brand-red" />
              </div>
              <div className="space-y-5">
                {blogArticles.slice(0, 5).map((article, i) => (
                  <Link key={article.id} href={`/haberler/${article.slug}`} className="flex gap-4 group">
                    <span className="text-2xl font-display font-black text-slate-100 group-hover:text-brand-red transition-colors w-8">
                      0{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <span className="text-[9px] font-black text-brand-red uppercase tracking-widest block">
                        {CATEGORY_CONFIG[article.category]?.label}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 line-clamp-2 group-hover:text-brand-red transition-colors">
                        {article.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Appointments */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  Təyinatlar
                </h3>
                <User size={18} className="text-brand-red" />
              </div>
              <div className="space-y-4">
                {NEWS_ITEMS.filter((n) => n.type === 'Appointment').slice(0, 4).map((news) => (
                  <div key={news.id} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 flex-shrink-0">
                      <img
                        src={news.author?.avatar || 'https://picsum.photos/seed/av/100/100'}
                        alt=""
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{news.author?.name}</h4>
                      <p className="text-[10px] text-slate-500">{news.author?.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>

        {/* Events & Awards — The Caterer style */}
        <section className="mt-20">
          <h2 className="text-2xl font-display font-black text-slate-900 mb-8 pb-3 border-b-2 border-amber-400/60 inline-block">
            Tədbirlər & Mükafatlar
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {EVENTS.map((evt, i) => (
              <motion.div
                key={evt.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl overflow-hidden border border-slate-700/50 hover:border-slate-600 transition-all group"
              >
                <div className="p-8">
                  <span className="text-[10px] font-black text-amber-400 uppercase tracking-[0.2em]">
                    {evt.tag}
                  </span>
                  <h3 className="mt-4 text-xl font-display font-black text-white leading-tight group-hover:text-amber-400 transition-colors">
                    {evt.title}
                  </h3>
                  <div className="mt-6 flex flex-wrap gap-4 text-amber-400/90 text-sm font-bold">
                    <span className="flex items-center gap-2">
                      <Calendar size={16} />
                      {evt.date}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin size={16} />
                      {evt.location}
                    </span>
                  </div>
                  <p className="mt-4 text-sm text-slate-300 leading-relaxed line-clamp-3">
                    {evt.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* 2 Horizontal Featured — The Caterer style */}
        <section className="mt-20">
          <h2 className="text-2xl font-display font-black text-slate-900 mb-8 pb-3 border-b-2 border-amber-400/60 inline-block">
            Əlavə vurğular
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {blogArticles.slice(6, 8).map((article, i) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.06 }}
              >
                <Link href={`/haberler/${article.slug}`} className="group block">
                  <div className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-300">
                    <div className="aspect-[16/10] overflow-hidden relative">
                      <img
                        src={article.coverImage}
                        alt={article.coverImageAlt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute bottom-4 left-4">
                        <span className="bg-amber-400 text-slate-900 px-4 py-1.5 rounded text-[10px] font-black uppercase tracking-wider">
                          {CATEGORY_CONFIG[article.category]?.label}
                        </span>
                      </div>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-display font-black text-slate-900 leading-tight group-hover:text-brand-red transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="mt-4 text-slate-500 leading-relaxed line-clamp-2">
                        {article.summary}
                      </p>
                      <div className="mt-6 flex items-center gap-3 text-[11px] font-bold text-slate-400">
                        <span>{article.author}</span>
                        <span>•</span>
                        <span>{article.readingTime} dəq oxu</span>
                        <span>•</span>
                        <span>{formatDateAz(article.publishDate)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default function HaberlerPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
          <div className="animate-pulse text-slate-400">Yüklənir...</div>
        </div>
      }
    >
      <NewsContent />
    </Suspense>
  );
}
