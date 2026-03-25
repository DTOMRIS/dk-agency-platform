'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  ChevronLeft,
  ArrowRight,
  Lightbulb,
  BookOpen,
  Plus,
  X,
  RotateCcw,
  Info,
  TrendingUp,
  UtensilsCrossed,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  salesCount: number;
  contributionMargin: number;
}

type Category = 'star' | 'plowHorse' | 'puzzle' | 'dog';

const CATEGORY_META: Record<Category, { emoji: string; label: string; labelAz: string; color: string; bg: string; ring: string; advice: string }> = {
  star: {
    emoji: '\u2B50',
    label: 'Ulduz',
    labelAz: 'Star',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-200/60',
    advice: 'Saxla, qiymət artır, onu birinci g\u00f6r\u00fcn\u00fcr et',
  },
  plowHorse: {
    emoji: '\uD83D\uDC34',
    label: 'At',
    labelAz: 'Plow Horse',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200/60',
    advice: 'Maya d\u0259y\u0259rini azalt, porsiya \u00f6l\u00e7\u00fcs\u00fcn\u00fc optimallaşdır',
  },
  puzzle: {
    emoji: '\uD83E\uDDE9',
    label: 'Puzzle',
    labelAz: 'Puzzle',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-200/60',
    advice: 'Tanıtımı artır, menyuda g\u00f6r\u00fcn\u00fcrl\u00fcy\u00fc yüksəlt',
  },
  dog: {
    emoji: '\uD83D\uDC15',
    label: '\u0130t',
    labelAz: 'Dog',
    color: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'ring-red-200/60',
    advice: 'Menyudan \u00e7ıxar v\u0259 ya tam yenid\u0259n dizayn et',
  },
};

const DEFAULT_ITEMS: MenuItem[] = [
  { id: '1', name: 'Toyuq Sac', salesCount: 120, contributionMargin: 8.5 },
  { id: '2', name: 'D\u00f6n\u00e9r', salesCount: 95, contributionMargin: 4.2 },
  { id: '3', name: 'Caesar Salat', salesCount: 40, contributionMargin: 9.0 },
  { id: '4', name: 'Steak', salesCount: 25, contributionMargin: 14.0 },
  { id: '5', name: '\u015eorba', salesCount: 110, contributionMargin: 3.5 },
  { id: '6', name: 'Tiramisu', salesCount: 30, contributionMargin: 6.0 },
];

function classify(items: MenuItem[]): { item: MenuItem; category: Category }[] {
  if (items.length === 0) return [];
  const avgSales = items.reduce((s, i) => s + i.salesCount, 0) / items.length;
  const avgMargin = items.reduce((s, i) => s + i.contributionMargin, 0) / items.length;
  return items.map((item) => {
    const highSales = item.salesCount >= avgSales;
    const highMargin = item.contributionMargin >= avgMargin;
    let category: Category;
    if (highSales && highMargin) category = 'star';
    else if (highSales && !highMargin) category = 'plowHorse';
    else if (!highSales && highMargin) category = 'puzzle';
    else category = 'dog';
    return { item, category };
  });
}

export default function MenuMatrixPage() {
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);

  const classified = useMemo(() => classify(items), [items]);
  const avgSales = items.length > 0 ? items.reduce((s, i) => s + i.salesCount, 0) / items.length : 0;
  const avgMargin = items.length > 0 ? items.reduce((s, i) => s + i.contributionMargin, 0) / items.length : 0;

  const counts = useMemo(() => {
    const c = { star: 0, plowHorse: 0, puzzle: 0, dog: 0 };
    classified.forEach(({ category }) => c[category]++);
    return c;
  }, [classified]);

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), name: '', salesCount: 0, contributionMargin: 0 }]);
  };
  const removeItem = (id: string) => {
    if (items.length > 1) setItems(items.filter((i) => i.id !== id));
  };
  const updateItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };
  const resetAll = () => setItems(DEFAULT_ITEMS);

  return (
    <div className="bg-white pb-24">

      {/* HERO */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[400px] h-[400px] bg-fuchsia-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.1] mb-5">
              Menyu<br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-300 bg-clip-text text-transparent">Matrisi</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Yeməklərini 4 kateqoriyaya ayır — hansını saxla, hansını sil, hansını tanıt. BCG matrisi ilə menyu m\u00fch\u00e9ndisliyi.
            </p>
          </div>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {(['star', 'plowHorse', 'puzzle', 'dog'] as Category[]).map((cat) => {
            const m = CATEGORY_META[cat];
            return (
              <div key={cat} className={`${m.bg} rounded-2xl p-5 ring-1 ${m.ring}`}>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{m.emoji} {m.label}</div>
                <div className={`text-3xl font-black ${m.color} tabular-nums`}>{counts[cat]}</div>
                <div className="text-[10px] text-slate-400 mt-1">{m.labelAz}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* CALCULATOR TABLE */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Yem\u0259k Siyah\u0131s\u0131</h2>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-400">
                Ort. sat\u0131\u015f: <strong className="text-slate-600">{avgSales.toFixed(0)}</strong> | Ort. marja: <strong className="text-slate-600">{avgMargin.toFixed(1)} \u20BC</strong>
              </div>
              <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
                <RotateCcw size={13} /> S\u0131f\u0131rla
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left">Yem\u0259k ad\u0131</th>
                  <th className="px-3 py-3 text-center w-[130px]">Sat\u0131\u015f say\u0131</th>
                  <th className="px-3 py-3 text-center w-[160px]">Contribution Margin (\u20BC)</th>
                  <th className="px-3 py-3 text-center w-[140px]">Kateqoriya</th>
                  <th className="px-3 py-3 text-left">T\u00f6vsiy\u0259</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classified.map(({ item, category }) => {
                  const m = CATEGORY_META[category];
                  return (
                    <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="w-full bg-transparent text-slate-900 font-medium outline-none placeholder:text-slate-300" placeholder="Yem\u0259k ad\u0131" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" min="0" value={item.salesCount || ''} onChange={(e) => updateItem(item.id, 'salesCount', parseInt(e.target.value) || 0)} className="w-full text-center bg-slate-100/80 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 transition-shadow" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" step="0.1" min="0" value={item.contributionMargin || ''} onChange={(e) => updateItem(item.id, 'contributionMargin', parseFloat(e.target.value) || 0)} className="w-full text-center bg-slate-100/80 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-purple-500/30 transition-shadow" />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${m.bg} ${m.color} ring-1 ${m.ring}`}>
                          {m.emoji} {m.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">{m.advice}</td>
                      <td className="pr-4 py-3">
                        <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={addItem} className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors">
              <Plus size={15} /> \u018Flav\u0259 et
            </button>
          </div>
        </div>
      </div>

      {/* B\u0130L\u0130K PANEL\u0130 */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Menyu M\u00fch\u0259ndisliyini <span className="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">Anlamaq</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">Menyunu data il\u0259 idar\u0259 et, intuisiya il\u0259 yox.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Menyu M\u00fch\u0259ndisliyi N\u0259dir */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-50/60 to-white ring-1 ring-purple-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Menyu M\u00fch\u0259ndisliyi N\u0259dir?</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Menyu m\u00fch\u0259ndisliyi — yem\u0259kl\u0259ri <strong className="text-slate-800">sat\u0131\u015f h\u0259cmi</strong> v\u0259 <strong className="text-slate-800">m\u0259nf\u0259\u0259t marjas\u0131</strong> \u00fczr\u0259 t\u0259hlil ed\u0259r\u0259k, menyunun optimallaşd\u0131r\u0131lmas\u0131d\u0131r. 1982-ci ild\u0259 Michael Kasavana v\u0259 Donald Smith t\u0259r\u0259find\u0259n yarad\u0131l\u0131b.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-2 mt-auto">
              <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Proses</p>
              <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
                <p className="text-white">1. Sat\u0131\u015f data-s\u0131n\u0131 topla</p>
                <p>2. H\u0259r yem\u0259yin CM hesabla</p>
                <p>3. Ortalamalarla m\u00fcqayis\u0259 et</p>
                <p className="text-purple-400 font-bold">4. 4 kateqoriyaya ay\u0131r</p>
              </div>
            </div>
          </div>

          {/* BCG Matrisi */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <UtensilsCrossed size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">BCG Matrisi</h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">Boston Consulting Group matrisi restorana uy\u011funlaşd\u0131r\u0131l\u0131b:</p>
            <div className="grid grid-cols-2 gap-2.5 mt-auto">
              <div className="bg-yellow-50 ring-1 ring-yellow-200/60 rounded-xl p-3">
                <p className="text-xs font-bold text-yellow-700">\u2B50 Ulduz</p>
                <p className="text-[11px] text-yellow-600/80 mt-1">Y\u00fcks\u0259k sat\u0131\u015f + y\u00fcks\u0259k marja</p>
              </div>
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3">
                <p className="text-xs font-bold text-blue-700">\uD83D\uDC34 At</p>
                <p className="text-[11px] text-blue-600/80 mt-1">Y\u00fcks\u0259k sat\u0131\u015f + a\u015fa\u011f\u0131 marja</p>
              </div>
              <div className="bg-purple-50 ring-1 ring-purple-200/60 rounded-xl p-3">
                <p className="text-xs font-bold text-purple-700">\uD83E\uDDE9 Puzzle</p>
                <p className="text-[11px] text-purple-600/80 mt-1">A\u015fa\u011f\u0131 sat\u0131\u015f + y\u00fcks\u0259k marja</p>
              </div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-3">
                <p className="text-xs font-bold text-red-700">\uD83D\uDC15 \u0130t</p>
                <p className="text-[11px] text-red-600/80 mt-1">A\u015fa\u011f\u0131 sat\u0131\u015f + a\u015fa\u011f\u0131 marja</p>
              </div>
            </div>
          </div>

          {/* Strategiyalar */}
          <div className="rounded-2xl bg-gradient-to-br from-fuchsia-50/60 to-white ring-1 ring-fuchsia-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-100 flex items-center justify-center shrink-0">
                <TrendingUp size={15} className="text-fuchsia-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Strategiyalar</h3>
            </div>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-yellow-50 ring-1 ring-yellow-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-yellow-700">\u2B50 Ulduz \u2192 Qoru</p>
                <p className="text-[11px] text-yellow-600/80 mt-1">Qiym\u0259ti art\u0131r, menyuda \u00f6n s\u0131raya qoy, offici\u0131ant t\u00f6vsiy\u0259 etsin.</p>
              </div>
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-700">\uD83D\uDC34 At \u2192 Optimallaşd\u0131r</p>
                <p className="text-[11px] text-blue-600/80 mt-1">Maya d\u0259y\u0259rini azalt, porsiya \u00f6l\u00e7\u00fcs\u00fcn\u00fc kiçilt, garniri d\u0259yiş.</p>
              </div>
              <div className="bg-purple-50 ring-1 ring-purple-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-purple-700">\uD83E\uDDE9 Puzzle \u2192 Tan\u0131t</p>
                <p className="text-[11px] text-purple-600/80 mt-1">Menyuda g\u00f6r\u00fcn\u00fcrl\u00fcy\u00fc art\u0131r, endirim v\u0259 ya set t\u0259klifi et.</p>
              </div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-red-700">\uD83D\uDC15 \u0130t \u2192 \u00c7\u0131xar</p>
                <p className="text-[11px] text-red-600/80 mt-1">Menyudan sil v\u0259 ya tam resepti d\u0259yiş. Vaxt itirm\u0259.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DK + OCAQ */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid md:grid-cols-2 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-purple-500/10 rounded-full blur-[50px]" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">DK Agency M\u0259sl\u0259h\u0259ti</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                Menyuda <strong className="text-white">20% yem\u0259k, sat\u0131\u015f\u0131n 80%-ni</strong> g\u0259tirir. Bu qaydan\u0131 bilm\u0259k az, t\u0259tbiq etm\u0259k \u00e7oxdur. H\u0259r ay matris yenilənsin, ofici\u0131antlar Ulduz yem\u0259kl\u0259ri t\u00f6vsiy\u0259 etsin.
              </p>
              <Link href="/blog/menyu-muhendisliyi-satis" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                Tam yaz\u0131n\u0131 oxu <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          <div className="rounded-2xl bg-gradient-to-br from-[#E94560] to-[#d63b54] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">OCAQ Panel</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Menyu matrisini avtomatik hesabla, sat\u0131\u015f data-s\u0131n\u0131 POS-dan \u00e7\u0259k, real-time analitika al.
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[#E94560] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              Pulsuz ba\u015fla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* \u018FLAQ\u018FL\u0130 YAZILAR */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <BookOpen size={18} className="text-[#E94560]" />
            <h3 className="text-lg font-bold text-slate-900">Daha D\u0259rin \u00d6yr\u0259n</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Menyu M\u00fch\u0259ndisliyi: Ulduz v\u0259 \u0130t', slug: 'menyu-muhendisliyi-satis', tag: '\u018fm\u0259liyyat' },
              { title: 'Food Cost-un Qanl\u0131 H\u0259qiq\u0259ti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyy\u0259' },
              { title: 'P&L Oxuya Bilmirs\u0259n?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyy\u0259' },
            ].map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300/60 transition-all duration-300">
                <span className="text-[10px] font-bold text-[#E94560] uppercase tracking-widest">{a.tag}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[#E94560] transition-colors">{a.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mt-4 group-hover:text-[#E94560] group-hover:gap-2 transition-all">
                  Oxu <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
