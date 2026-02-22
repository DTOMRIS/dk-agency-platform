// app/haberler/page.tsx
// DK Agency — Sektör NABZI
// The Caterer ilhamı ilə professional HoReCa portal

import Link from 'next/link';
import { getAllBlogArticles, CATEGORY_CONFIG } from '@/lib/data/blogArticles';
import { Star, Zap } from 'lucide-react';
import SektorNabziTabs from '@/components/news/SektorNabziTabs';

export const metadata = {
  title: 'Sektör NABZI - DK Agency',
  description: 'Azərbaycan HoReCa sektorunun ən güclü resurs mərkəzi. Ekspert yazıları, trend analizləri, maliyyə bələdçiləri.',
};

// Kategori renkleri
const CAT_COLORS: Record<string, string> = {
  maliyye: 'bg-emerald-600',
  kadr: 'bg-blue-600',
  emeliyyat: 'bg-purple-600',
  konsept: 'bg-pink-600',
  acilis: 'bg-orange-600',
  satis: 'bg-cyan-600',
};

export default function SektorNabzi() {
  const allArticles = getAllBlogArticles();

  return (
    <div className="min-h-screen bg-white">
      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TOP NAVIGATION BAR - The Caterer Style */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 border-b-4 border-amber-500">
        {/* Üst banner */}
        <div className="bg-slate-800 py-2 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-xs">
            <div className="flex items-center gap-4">
              <span className="text-slate-400">📧 newsletter@dkagency.az</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-400 font-medium">🔴 Canlı: 2,847 oxucu online</span>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/contact" className="text-slate-300 hover:text-amber-400 transition-colors">Əlaqə</Link>
              <Link href="/about" className="text-slate-300 hover:text-amber-400 transition-colors">Haqqında</Link>
            </div>
          </div>
        </div>

        {/* Logo və menyu */}
        <div className="py-4 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <Link href="/haberler" className="flex items-center gap-3">
              <div className="bg-amber-500 p-2 rounded-lg">
                <Zap className="w-6 h-6 text-slate-900" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight">SEKTÖR <span className="text-amber-500">NABZI</span></h1>
                <p className="text-[10px] text-slate-400 tracking-widest uppercase">by DK Agency</p>
              </div>
            </Link>

            {/* Subscribe button */}
            <Link 
              href="/contact"
              className="bg-amber-500 hover:bg-amber-400 text-slate-900 px-6 py-2.5 rounded-lg font-bold text-sm transition-colors flex items-center gap-2"
            >
              <Star className="w-4 h-4" />
              Abunə ol
            </Link>
          </div>
        </div>

        {/* Kategori menüsü */}
        <div className="bg-slate-800/50 px-4">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-hide">
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                <Link 
                  key={key}
                  href={`/haberler?category=${key}`}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 hover:text-amber-400 hover:bg-slate-700/50 rounded-lg transition-all whitespace-nowrap"
                >
                  <span>{config.emoji}</span>
                  <span>{config.label}</span>
                </Link>
              ))}
              <div className="w-px h-6 bg-slate-600 mx-2" />
              <Link 
                href="/toolkit"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-all whitespace-nowrap"
              >
                <span>🧰</span>
                <span>Toolkit</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* TAB BASED CONTENT */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <SektorNabziTabs 
        articles={allArticles}
        categoryConfig={CATEGORY_CONFIG}
        catColors={CAT_COLORS}
      />

      {/* ═══════════════════════════════════════════════════════════════ */}
      {/* FOOTER CTA */}
      {/* ═══════════════════════════════════════════════════════════════ */}
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <span className="text-amber-400 text-sm font-bold tracking-wider uppercase">DK Agency Toolkit</span>
          <h2 className="text-3xl font-bold text-white mt-4 mb-4">
            Oxuduqlarını praktikaya çevir
          </h2>
          <p className="text-slate-400 mb-8">
            Food Cost kalkulyatoru, P&L şablonu, Return Analizi və digər 7 professional alət səni gözləyir.
          </p>
          <Link 
            href="/toolkit"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-900 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg shadow-amber-500/20"
          >
            🧰 Pulsuz Toolkit-ə keç
          </Link>
        </div>
      </div>
    </div>
  );
}
