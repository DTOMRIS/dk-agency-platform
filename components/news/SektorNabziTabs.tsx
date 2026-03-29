// components/news/SektorNabziTabs.tsx
// Sektör NABZI - Editorial Tab Layout (foodinlife.com + thecaterer.com style)
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Clock, TrendingUp, ChevronRight, Flame, Calendar, MapPin, Users, Ticket, Newspaper, BookOpen, PartyPopper, Star } from 'lucide-react';
import type { BlogArticle } from '@/lib/data/blogArticles';

interface SektorNabziTabsProps {
  articles: BlogArticle[];
  categoryConfig: Record<string, { emoji: string; label: string; color: string }>;
  catColors: Record<string, string>;
}

// Örnek etkinlikler
const EVENTS = [
  {
    id: 'evt-1',
    title: 'HoReCa Summit Bakı 2026',
    date: '2026-03-15',
    location: 'Hilton Baku',
    attendees: 250,
    price: 'Pulsuz',
    category: 'Konfrans',
    image: '🎤',
  },
  {
    id: 'evt-2', 
    title: 'Food Cost Masterclass',
    date: '2026-03-22',
    location: 'DK Agency Office',
    attendees: 30,
    price: '150 ₼',
    category: 'Təlim',
    image: '📊',
  },
  {
    id: 'evt-3',
    title: 'Restoran Sahibləri Networking',
    date: '2026-04-05',
    location: 'Port Baku Towers',
    attendees: 80,
    price: '50 ₼',
    category: 'Networking',
    image: '🤝',
  },
  {
    id: 'evt-4',
    title: 'AQTA Compliance Workshop',
    date: '2026-04-12',
    location: 'Holiday Inn Baku',
    attendees: 45,
    price: '200 ₼',
    category: 'Workshop',
    image: '📋',
  },
];

// Örnek haberler (kısa, güncel)
const NEWS_ITEMS = [
  {
    id: 'news-1',
    title: 'Wolt Azərbaycanda komissiyon faizini 5% artırdı',
    date: '2026-02-20',
    category: 'Breaking',
    hot: true,
  },
  {
    id: 'news-2',
    title: 'AQTA yeni gigiyena qaydalarını açıqladı',
    date: '2026-02-19',
    category: 'Qanunvericilik',
    hot: false,
  },
  {
    id: 'news-3',
    title: 'Bakıda 2025-ci ildə 127 yeni restoran açıldı',
    date: '2026-02-18',
    category: 'Statistika',
    hot: false,
  },
  {
    id: 'news-4',
    title: 'Bolt Food Azərbaycana giriş planlarını açıqladı',
    date: '2026-02-17', 
    category: 'Bazaar',
    hot: true,
  },
  {
    id: 'news-5',
    title: 'Minimum əmək haqqı artımı restoranları narahat edir',
    date: '2026-02-16',
    category: 'İqtisadiyyat',
    hot: false,
  },
];

// ═══════════════════════════════════════════════════════════════
// BLOG CARD COMPONENT - InDepth style
// ═══════════════════════════════════════════════════════════════
function BlogCard({ article, categoryConfig, catColors }: { 
  article: BlogArticle; 
  categoryConfig: Record<string, { emoji: string; label: string; color: string }>;
  catColors: Record<string, string>;
}) {
  const catConfig = categoryConfig[article.category];
  return (
    <Link href={`/haberler/${article.slug}`} className="group block">
      <div className="rounded-2xl overflow-hidden border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] bg-[var(--dk-surface-dark)] transition-all duration-300 group-hover:-translate-y-1 group-hover:border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)]">
        {/* Image */}
        <div className="aspect-[16/10] relative overflow-hidden bg-gradient-to-br from-[var(--dk-night)] to-[var(--dk-surface-dark)]">
          <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-110">
            <span className="text-6xl opacity-40">{catConfig?.emoji || '📝'}</span>
          </div>
          {/* Category badge on image */}
          <span className={`absolute bottom-3 left-3 ${catColors[article.category] || 'bg-[var(--dk-muted)]'} text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-md`}>
            {catConfig?.label || article.category}
          </span>
          {/* Reading time badge */}
          <div className="absolute top-3 right-3 bg-[var(--dk-night)]/80 backdrop-blur-sm text-[var(--dk-text)] px-2.5 py-1 rounded-full text-[11px] font-medium flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {article.readingTime} dəq
          </div>
        </div>
        
        {/* Content */}
        <div className="p-5">
          <h3 className="text-[17px] font-bold leading-snug mb-2 text-[var(--dk-text)] group-hover:text-[var(--dk-gold)] transition-colors line-clamp-2">
            {article.title}
          </h3>
          <p className="text-[13px] text-[var(--dk-muted)] leading-relaxed line-clamp-2 mb-4">
            {article.summary}
          </p>
          <div className="flex items-center gap-3 text-[12px] text-[color:color-mix(in_srgb,var(--dk-muted)_38%,transparent)]">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-[var(--dk-gold)]" />
              {article.category === 'maliyye' ? 'Yüksək' : article.category === 'emeliyyat' ? 'Kritik' : 'Orta'} Təsir
            </span>
            <span>•</span>
            <span>{article.readingTime} dəq oxu</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ═══════════════════════════════════════════════════════════════
// SIDEBAR NEWS LIST COMPONENT
// ═══════════════════════════════════════════════════════════════
function SidebarNewsList({ articles, categoryConfig }: { 
  articles: BlogArticle[];
  categoryConfig: Record<string, { emoji: string; label: string; color: string }>;
}) {
  return (
    <div className="space-y-1">
      {articles.map(article => {
        const catConfig = categoryConfig[article.category];
        return (
          <Link 
            key={article.id} 
            href={`/haberler/${article.slug}`}
            className="flex gap-3 p-3 rounded-xl hover:bg-[color:color-mix(in_srgb,var(--dk-gold)_3%,transparent)] transition-colors group"
          >
            {/* Thumbnail */}
            <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)] flex items-center justify-center">
              <span className="text-xl">{catConfig?.emoji || '📝'}</span>
            </div>
            
            {/* Text */}
            <div className="flex-1 min-w-0">
              <span className="text-[10px] font-bold text-[var(--dk-gold)] uppercase tracking-wider">
                {catConfig?.label || article.category}
              </span>
              <h4 className="text-[14px] font-semibold leading-tight text-[var(--dk-body)] line-clamp-2 group-hover:text-[var(--dk-gold)] transition-colors mt-0.5">
                {article.title}
              </h4>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

export default function SektorNabziTabs({ articles, categoryConfig, catColors }: SektorNabziTabsProps) {
  const [activeTab, setActiveTab] = useState<'news' | 'blog' | 'events'>('blog');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const tabs = [
    { id: 'news' as const, label: 'Xəbərlər', icon: Newspaper, count: NEWS_ITEMS.length },
    { id: 'blog' as const, label: 'Blog', icon: BookOpen, count: articles.length },
    { id: 'events' as const, label: 'Etkinliklər', icon: PartyPopper, count: EVENTS.length },
  ];

  // Featured article
  const featuredArticle = articles[0];
  const sideArticles = articles.slice(1, 6);
  
  // Filter articles by category
  const filteredArticles = selectedCategory 
    ? articles.filter(a => a.category === selectedCategory)
    : articles;
  
  const inDepthArticles = filteredArticles.slice(0, 6);

  return (
    <div>
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB NAVIGATION */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-[var(--dk-navy)] border-b border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 font-semibold text-sm border-b-2 transition-all
                    ${isActive 
                      ? 'border-[var(--dk-gold)] text-[var(--dk-gold)] bg-[color:color-mix(in_srgb,var(--dk-gold)_6%,transparent)]' 
                      : 'border-transparent text-[var(--dk-muted)] hover:text-[var(--dk-text)] hover:bg-[color:color-mix(in_srgb,var(--dk-muted)_6%,transparent)]'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                  <span className={`
                    text-xs px-2 py-0.5 rounded-full
                    ${isActive ? 'bg-[var(--dk-gold)] text-[var(--dk-night)]' : 'bg-[color:color-mix(in_srgb,var(--dk-muted)_13%,transparent)] text-[var(--dk-muted)]'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}

      {/* XƏBƏRLƏR TAB */}
      {activeTab === 'news' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Ana xəbər listesi */}
            <div className="lg:col-span-2 space-y-4">
              {NEWS_ITEMS.map((news, idx) => (
                <div 
                  key={news.id}
                  className={`
                    flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer
                    ${news.hot 
                      ? 'bg-[color:color-mix(in_srgb,var(--dk-red)_8%,transparent)] border-[var(--dk-red)]/30 hover:border-[var(--dk-red)]' 
                      : 'bg-[var(--dk-surface-dark)] border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] hover:border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)]'
                    }
                  `}
                >
                  {/* Numara */}
                  <div className={`
                    w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg flex-shrink-0
                    ${news.hot ? 'bg-[var(--dk-red)] text-white' : 'bg-[color:color-mix(in_srgb,var(--dk-muted)_13%,transparent)] text-[var(--dk-muted)]'}
                  `}>
                    {String(idx + 1).padStart(2, '0')}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Kategori ve tarih */}
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`
                        text-xs font-bold uppercase tracking-wider
                        ${news.hot ? 'text-[var(--dk-red)]' : 'text-[var(--dk-muted)]'}
                      `}>
                        {news.category}
                      </span>
                      {news.hot && (
                        <span className="text-xs bg-[var(--dk-red)] text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
                          🔥 HOT
                        </span>
                      )}
                    </div>

                    {/* Başlık */}
                    <h3 className="font-semibold text-[var(--dk-text)] leading-snug">
                      {news.title}
                    </h3>

                    {/* Tarih */}
                    <p className="text-xs text-[color:color-mix(in_srgb,var(--dk-muted)_38%,transparent)] mt-1">
                      {new Date(news.date).toLocaleDateString('az-AZ', { day: 'numeric', month: 'long' })}
                    </p>
                  </div>

                  <ChevronRight className="w-5 h-5 text-slate-300 flex-shrink-0" />
                </div>
              ))}
            </div>

            {/* Sağ sidebar */}
            <div>
              <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-6 border border-slate-200">
                <h3 className="text-amber-600 font-bold mb-4 flex items-center gap-2">
                  <Flame className="w-5 h-5" />
                  Həftənin Ən Çox Oxunanları
                </h3>
                <div className="space-y-3">
                  {articles.slice(0, 4).map((article, idx) => (
                    <Link 
                      key={article.id}
                      href={`/haberler/${article.slug}`}
                      className="flex items-start gap-3 group"
                    >
                      <span className="text-amber-500 font-bold text-sm">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <p className="text-slate-700 text-sm group-hover:text-amber-600 transition-colors line-clamp-2">
                        {article.title}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BLOG TAB - Editorial Layout */}
      {activeTab === 'blog' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-12 gap-8">
            {/* ─────────────────────────────────────────────────────────── */}
            {/* SOL SIDEBAR - Küçük haberler listesi */}
            {/* ─────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <div className="lg:sticky lg:top-24">
                <h3 className="text-xs font-bold text-[var(--dk-muted)] uppercase tracking-wider mb-4">
                  Son Yazılar
                </h3>
                <SidebarNewsList articles={sideArticles} categoryConfig={categoryConfig} />

                {/* Trending Section */}
                <div className="mt-8 pt-6 border-t border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)]">
                  <div className="flex items-center gap-2 mb-4">
                    <Flame className="w-5 h-5 text-[var(--dk-red)]" />
                    <span className="font-bold text-[var(--dk-text)]">Trend Mövzular</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Food Cost', 'P&L', 'AQTA', 'Wolt', 'İşçi Saxlama', 'Menyu'].map((tag) => (
                      <span key={tag} className="px-3 py-1.5 bg-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] hover:bg-[color:color-mix(in_srgb,var(--dk-gold)_8%,transparent)] hover:text-[var(--dk-gold)] text-[var(--dk-muted)] text-xs rounded-full cursor-pointer transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ─────────────────────────────────────────────────────────── */}
            {/* MƏRKƏZ - Featured Article */}
            {/* ─────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-6 order-1 lg:order-2">
              {featuredArticle && (
                <Link href={`/haberler/${featuredArticle.slug}`} className="group block">
                  {/* Featured Image */}
                  <div className="relative aspect-[16/10] bg-gradient-to-br from-slate-800 via-slate-700 to-slate-900 rounded-2xl overflow-hidden mb-5 shadow-xl">
                    <div className="absolute inset-0 flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                      <span className="text-9xl opacity-15">{categoryConfig[featuredArticle.category]?.emoji}</span>
                    </div>
                    
                    <div className="absolute bottom-4 left-4">
                      <span className={`${catColors[featuredArticle.category]} text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg`}>
                        {categoryConfig[featuredArticle.category]?.label}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {featuredArticle.readingTime} dəq
                    </div>
                  </div>

                  {/* Title */}
                  <h2 className="text-2xl md:text-3xl font-bold text-[var(--dk-text)] group-hover:text-[var(--dk-gold)] transition-colors leading-tight mb-3">
                    {featuredArticle.title}
                  </h2>

                  {/* Summary */}
                  <p className="text-[var(--dk-body)] leading-relaxed line-clamp-3 text-[16px]">
                    {featuredArticle.summary}
                  </p>

                  {/* Author info */}
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)]">
                    <div className="w-11 h-11 rounded-full bg-[var(--dk-gold)] flex items-center justify-center text-[var(--dk-night)] font-bold shadow-md">
                      DT
                    </div>
                    <div>
                      <p className="font-semibold text-[var(--dk-text)]">{featuredArticle.author}</p>
                      <p className="text-xs text-[var(--dk-muted)]">
                        {new Date(featuredArticle.publishDate).toLocaleDateString('az-AZ', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                </Link>
              )}
            </div>

            {/* ─────────────────────────────────────────────────────────── */}
            {/* SAĞ SIDEBAR - Newsletter + Viewpoint */}
            {/* ─────────────────────────────────────────────────────────── */}
            <div className="lg:col-span-3 order-3">
              <div className="lg:sticky lg:top-24 space-y-6">
                {/* Newsletter Widget */}
                <div className="bg-[var(--dk-surface-dark)] rounded-2xl p-6 border border-[color:color-mix(in_srgb,var(--dk-gold)_13%,transparent)]">
                  <h3 className="text-[var(--dk-text)] font-bold mb-2 flex items-center gap-2">
                    📬 Həftəlik Bülletin
                  </h3>
                  <p className="text-[var(--dk-muted)] text-sm mb-4">HoReCa trend analizləri birbaşa e-poçtunuza</p>
                  <input 
                    type="email" 
                    placeholder="E-poçt ünvanınız"
                    className="w-full px-4 py-2.5 rounded-xl bg-[var(--dk-night)] border border-[color:color-mix(in_srgb,var(--dk-muted)_13%,transparent)] text-[var(--dk-text)] placeholder:text-[color:color-mix(in_srgb,var(--dk-muted)_38%,transparent)] text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]"
                  />
                  <button className="w-full bg-[var(--dk-red)] hover:bg-[var(--dk-gold)] text-white py-2.5 rounded-xl font-bold text-sm transition-colors shadow-md">
                    Abunə ol
                  </button>
                </div>

                {/* Viewpoint Widget */}
                <div className="bg-[color:color-mix(in_srgb,var(--dk-surface-dark)_38%,transparent)] rounded-2xl p-5 border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)]">
                  <span className="text-xs font-bold text-[var(--dk-gold)] uppercase tracking-wider flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Viewpoint
                  </span>
                  <blockquote className="mt-3 text-[15px] leading-relaxed italic text-[var(--dk-body)]">
                    {"\u201C"}Restoran biznesi rəqəmlərlə idarə olunur, duyğularla yox{"\u201D"}
                  </blockquote>
                  <div className="mt-4 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--dk-gold)] flex items-center justify-center text-[var(--dk-night)] text-xs font-bold">
                      DT
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-[var(--dk-text)]">Doğan Tomris</p>
                      <p className="text-[11px] text-[var(--dk-muted)]">DK Agency qurucusu</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* CATEGORY FILTER */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mt-10 pt-8 border-t border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)]">
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-sm font-semibold text-[var(--dk-muted)] mr-2">Kateqoriyalar:</span>
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  !selectedCategory 
                    ? 'bg-[var(--dk-gold)] text-[var(--dk-night)]' 
                    : 'bg-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] text-[var(--dk-muted)] hover:bg-[color:color-mix(in_srgb,var(--dk-muted)_15%,transparent)]'
                }`}
              >
                Hamısı
              </button>
              {Object.entries(categoryConfig).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-1.5 ${
                    selectedCategory === key 
                      ? `${catColors[key] || 'bg-[var(--dk-muted)]'} text-white` 
                      : 'bg-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] text-[var(--dk-muted)] hover:bg-[color:color-mix(in_srgb,var(--dk-muted)_15%,transparent)]'
                  }`}
                >
                  <span>{config.emoji}</span>
                  {config.label}
                </button>
              ))}
            </div>
          </div>

          {/* ═══════════════════════════════════════════════════════════════ */}
          {/* INDEPTH SECTION - Blog Cards Grid */}
          {/* ═══════════════════════════════════════════════════════════════ */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-1 h-8 bg-[var(--dk-gold)] rounded-full" />
                <h2 className="text-2xl font-bold text-[var(--dk-text)] italic">InDepth</h2>
              </div>
              <span className="text-sm text-[var(--dk-muted)]">{filteredArticles.length} yazı</span>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {inDepthArticles.map((article) => (
                <BlogCard 
                  key={article.id} 
                  article={article} 
                  categoryConfig={categoryConfig}
                  catColors={catColors}
                />
              ))}
            </div>

            {/* Load more button */}
            {filteredArticles.length > 6 && (
              <div className="mt-10 text-center">
                <button className="px-8 py-3 bg-[var(--dk-red)] hover:bg-[var(--dk-gold)] text-white rounded-xl font-bold transition-colors">
                  Daha çox yüklə →
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ETKİNLİKLƏR TAB */}
      {activeTab === 'events' && (
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Upcoming Events Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {EVENTS.map((event) => (
              <div 
                key={event.id}
                className="bg-[var(--dk-surface-dark)] rounded-2xl border border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)] overflow-hidden hover:border-[color:color-mix(in_srgb,var(--dk-gold)_19%,transparent)] hover:shadow-xl transition-all group"
              >
                {/* Event header */}
                <div className={`
                  p-6 relative
                  ${event.category === 'Konfrans' ? 'bg-gradient-to-br from-purple-600 to-indigo-700' : ''}
                  ${event.category === 'Təlim' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : ''}
                  ${event.category === 'Networking' ? 'bg-gradient-to-br from-[var(--dk-gold)] to-[var(--dk-red)]' : ''}
                  ${event.category === 'Workshop' ? 'bg-gradient-to-br from-blue-600 to-cyan-700' : ''}
                `}>
                  <span className="text-6xl opacity-30 absolute right-4 top-4">{event.image}</span>
                  <span className="text-white/80 text-xs font-bold uppercase tracking-wider">{event.category}</span>
                  <h3 className="text-xl font-bold text-white mt-2 relative z-10">{event.title}</h3>
                </div>

                {/* Event details */}
                <div className="p-6 space-y-3">
                  <div className="flex items-center gap-3 text-[var(--dk-body)]">
                    <Calendar className="w-5 h-5 text-[var(--dk-gold)]" />
                    <span className="font-medium">
                      {new Date(event.date).toLocaleDateString('az-AZ', { 
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-3 text-[var(--dk-body)]">
                    <MapPin className="w-5 h-5 text-[var(--dk-gold)]" />
                    <span>{event.location}</span>
                  </div>

                  <div className="flex items-center gap-3 text-[var(--dk-body)]">
                    <Users className="w-5 h-5 text-[var(--dk-gold)]" />
                    <span>{event.attendees} iştirakçı limiti</span>
                  </div>

                  {/* Price & CTA */}
                  <div className="flex items-center justify-between pt-4 mt-4 border-t border-[color:color-mix(in_srgb,var(--dk-muted)_8%,transparent)]">
                    <div className="flex items-center gap-2">
                      <Ticket className="w-5 h-5 text-[var(--dk-success)]" />
                      <span className={`font-bold ${event.price === 'Pulsuz' ? 'text-[var(--dk-success)]' : 'text-[var(--dk-text)]'}`}>
                        {event.price}
                      </span>
                    </div>
                    <button className="bg-[var(--dk-red)] hover:bg-[var(--dk-gold)] text-white px-6 py-2.5 rounded-lg font-bold text-sm transition-colors">
                      Qeydiyyat
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Past events teaser */}
          <div className="mt-12 text-center">
            <p className="text-[var(--dk-muted)] mb-4">Keçmiş tədbir arxivimiz</p>
            <button className="text-[var(--dk-gold)] font-semibold hover:underline">
              2025 Arxivinə bax →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
