'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ChevronLeft,
  Info,
  Lightbulb,
  Plus,
  RotateCcw,
  TrendingUp,
  UtensilsCrossed,
  X,
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  salesCount: number;
  contributionMargin: number;
}

type Category = 'star' | 'plowHorse' | 'puzzle' | 'dog';

const CATEGORY_META: Record<
  Category,
  {
    emoji: string;
    label: string;
    labelEn: string;
    color: string;
    bg: string;
    ring: string;
    advice: string;
  }
> = {
  star: {
    emoji: '⭐',
    label: 'Ulduz',
    labelEn: 'Star',
    color: 'text-yellow-600',
    bg: 'bg-yellow-50',
    ring: 'ring-yellow-200/60',
    advice: 'Saxla, qiyməti artır və menyuda daha görünən yerə qoy.',
  },
  plowHorse: {
    emoji: '🐴',
    label: 'At',
    labelEn: 'Plow Horse',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-200/60',
    advice: 'Maya dəyərini azalt, porsiya və garniri optimallaşdır.',
  },
  puzzle: {
    emoji: '🧩',
    label: 'Puzzle',
    labelEn: 'Puzzle',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-200/60',
    advice: 'Tanıtımı artır, ofisiant tövsiyəsi və görünürlük ver.',
  },
  dog: {
    emoji: '🐕',
    label: 'İt',
    labelEn: 'Dog',
    color: 'text-red-600',
    bg: 'bg-red-50',
    ring: 'ring-red-200/60',
    advice: 'Menyudan çıxar və ya resepti tam yenidən düşün.',
  },
};

const DEFAULT_ITEMS: MenuItem[] = [
  { id: '1', name: 'Toyuq Sac', salesCount: 120, contributionMargin: 8.5 },
  { id: '2', name: 'Dönər', salesCount: 95, contributionMargin: 4.2 },
  { id: '3', name: 'Caesar Salat', salesCount: 40, contributionMargin: 9.0 },
  { id: '4', name: 'Steak', salesCount: 25, contributionMargin: 14.0 },
  { id: '5', name: 'Şorba', salesCount: 110, contributionMargin: 3.5 },
  { id: '6', name: 'Tiramisu', salesCount: 30, contributionMargin: 6.0 },
];

function classify(items: MenuItem[]): { item: MenuItem; category: Category }[] {
  if (items.length === 0) return [];

  const avgSales = items.reduce((sum, item) => sum + item.salesCount, 0) / items.length;
  const avgMargin =
    items.reduce((sum, item) => sum + item.contributionMargin, 0) / items.length;

  return items.map((item) => {
    const highSales = item.salesCount >= avgSales;
    const highMargin = item.contributionMargin >= avgMargin;

    let category: Category;
    if (highSales && highMargin) category = 'star';
    else if (highSales) category = 'plowHorse';
    else if (highMargin) category = 'puzzle';
    else category = 'dog';

    return { item, category };
  });
}

export default function MenuMatrixPage() {
  const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);

  const classified = useMemo(() => classify(items), [items]);

  const avgSales = useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.salesCount, 0) / items.length;
  }, [items]);

  const avgMargin = useMemo(() => {
    if (items.length === 0) return 0;
    return items.reduce((sum, item) => sum + item.contributionMargin, 0) / items.length;
  }, [items]);

  const counts = useMemo(() => {
    const next = { star: 0, plowHorse: 0, puzzle: 0, dog: 0 };
    classified.forEach(({ category }) => {
      next[category] += 1;
    });
    return next;
  }, [classified]);

  const addItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now().toString(), name: '', salesCount: 0, contributionMargin: 0 },
    ]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => (prev.length > 1 ? prev.filter((item) => item.id !== id) : prev));
  };

  const updateItem = (id: string, field: keyof MenuItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    );
  };

  const resetAll = () => {
    setItems(DEFAULT_ITEMS);
  };

  return (
    <div className="bg-white pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="absolute inset-0">
          <div className="absolute right-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-purple-500/8 blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] h-[400px] w-[400px] rounded-full bg-fuchsia-500/5 blur-[80px]" />
        </div>
        <div className="relative mx-auto max-w-6xl px-6 pb-20 pt-8">
          <Link
            href="/toolkit"
            className="group mb-8 inline-flex items-center gap-1.5 text-sm text-slate-500 transition-colors hover:text-slate-300"
          >
            <ChevronLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="mb-5 text-4xl font-display font-black leading-[1.1] tracking-tight text-white sm:text-5xl">
              Menyu
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-fuchsia-300 bg-clip-text text-transparent">
                Matrisi
              </span>
            </h1>
            <p className="max-w-lg text-lg leading-relaxed text-slate-400">
              Yeməklərini 4 kateqoriyaya ayır, hansını saxla, hansını sil, hansını tanıt. BCG
              matrisi ilə menyu mühəndisliyi.
            </p>
          </div>
        </div>
      </div>

      <div className="relative z-10 mx-auto -mt-10 max-w-6xl px-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {(['star', 'plowHorse', 'puzzle', 'dog'] as Category[]).map((category) => {
            const meta = CATEGORY_META[category];
            return (
              <div key={category} className={`${meta.bg} rounded-2xl p-5 ring-1 ${meta.ring}`}>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-500">
                  {meta.emoji} {meta.label}
                </div>
                <div className={`text-3xl font-black tabular-nums ${meta.color}`}>
                  {counts[category]}
                </div>
                <div className="mt-1 text-[10px] text-slate-400">{meta.labelEn}</div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl space-y-6 px-6">
        <div className="overflow-hidden rounded-2xl bg-white shadow-lg shadow-slate-200/40 ring-1 ring-slate-200/80">
          <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
            <h2 className="text-base font-bold text-slate-900">Yemək Siyahısı</h2>
            <div className="flex items-center gap-4">
              <div className="text-xs text-slate-400">
                Ort. satış: <strong className="text-slate-600">{avgSales.toFixed(0)}</strong> |
                Ort. marja:{' '}
                <strong className="text-slate-600">{avgMargin.toFixed(1)} ₼</strong>
              </div>
              <button
                onClick={resetAll}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-red-500"
              >
                <RotateCcw size={13} /> Sıfırla
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  <th className="px-5 py-3 text-left">Yemək adı</th>
                  <th className="w-[130px] px-3 py-3 text-center">Satış sayı</th>
                  <th className="w-[160px] px-3 py-3 text-center">Contribution Margin (₼)</th>
                  <th className="w-[140px] px-3 py-3 text-center">Kateqoriya</th>
                  <th className="px-3 py-3 text-left">Tövsiyə</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classified.map(({ item, category }) => {
                  const meta = CATEGORY_META[category];
                  return (
                    <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                      <td className="px-5 py-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(event) => updateItem(item.id, 'name', event.target.value)}
                          className="w-full bg-transparent font-medium text-slate-900 outline-none placeholder:text-slate-300"
                          placeholder="Yemək adı"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          value={item.salesCount || ''}
                          onChange={(event) =>
                            updateItem(item.id, 'salesCount', parseInt(event.target.value, 10) || 0)
                          }
                          className="w-full rounded-lg bg-slate-100/80 px-2 py-1.5 text-center text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500/30"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={item.contributionMargin || ''}
                          onChange={(event) =>
                            updateItem(
                              item.id,
                              'contributionMargin',
                              parseFloat(event.target.value) || 0
                            )
                          }
                          className="w-full rounded-lg bg-slate-100/80 px-2 py-1.5 text-center text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500/30"
                        />
                      </td>
                      <td className="px-3 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}
                        >
                          {meta.emoji} {meta.label}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-500">{meta.advice}</td>
                      <td className="pr-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"
                        >
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4">
            <button
              onClick={addItem}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700"
            >
              <Plus size={15} /> Əlavə et
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-16 max-w-6xl px-6">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 sm:text-3xl">
            Menyu Mühəndisliyini{' '}
            <span className="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">
              Anlamaq
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
            Menyunu data ilə idarə et, intuisiya ilə yox.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-purple-50/60 to-white p-6 ring-1 ring-purple-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100">
                <Info size={15} className="text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Menyu Mühəndisliyi Nədir?</h3>
            </div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">
              Menyu mühəndisliyi yeməkləri <strong className="text-slate-800">satış həcmi</strong>{' '}
              və <strong className="text-slate-800">mənfəət marjası</strong> üzrə təhlil edib
              menyunu optimallaşdırmaqdır.
            </p>
            <div className="mt-auto space-y-2 rounded-xl bg-slate-900 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">
                Proses
              </p>
              <div className="space-y-0.5 font-mono text-[12px] text-slate-300">
                <p className="text-white">1. Satış datasını topla</p>
                <p>2. Hər yeməyin CM-ni hesabla</p>
                <p>3. Ortalamalarla müqayisə et</p>
                <p className="font-bold text-purple-400">4. 4 kateqoriyaya ayır</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-200/60">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <UtensilsCrossed size={15} className="text-slate-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">BCG Matrisi</h3>
            </div>
            <p className="mb-4 text-[12px] text-slate-500">
              Boston Consulting Group matrisi restorana uyğunlaşdırılıb:
            </p>
            <div className="mt-auto grid grid-cols-2 gap-2.5">
              <div className="rounded-xl bg-yellow-50 p-3 ring-1 ring-yellow-200/60">
                <p className="text-xs font-bold text-yellow-700">⭐ Ulduz</p>
                <p className="mt-1 text-[11px] text-yellow-600/80">Yüksək satış + yüksək marja</p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 ring-1 ring-blue-200/60">
                <p className="text-xs font-bold text-blue-700">🐴 At</p>
                <p className="mt-1 text-[11px] text-blue-600/80">Yüksək satış + aşağı marja</p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3 ring-1 ring-purple-200/60">
                <p className="text-xs font-bold text-purple-700">🧩 Puzzle</p>
                <p className="mt-1 text-[11px] text-purple-600/80">Aşağı satış + yüksək marja</p>
              </div>
              <div className="rounded-xl bg-red-50 p-3 ring-1 ring-red-200/60">
                <p className="text-xs font-bold text-red-700">🐕 İt</p>
                <p className="mt-1 text-[11px] text-red-600/80">Aşağı satış + aşağı marja</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-fuchsia-50/60 to-white p-6 ring-1 ring-fuchsia-200/40">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-100">
                <TrendingUp size={15} className="text-fuchsia-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Strategiyalar</h3>
            </div>
            <div className="mt-auto space-y-2.5">
              <div className="rounded-xl bg-yellow-50 p-3.5 ring-1 ring-yellow-200/60">
                <p className="text-xs font-bold text-yellow-700">⭐ Ulduz → Qoru</p>
                <p className="mt-1 text-[11px] text-yellow-600/80">
                  Qiyməti artır, menyuda ön sıraya qoy, ofisiant tövsiyə etsin.
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3.5 ring-1 ring-blue-200/60">
                <p className="text-xs font-bold text-blue-700">🐴 At → Optimallaşdır</p>
                <p className="mt-1 text-[11px] text-blue-600/80">
                  Maya dəyərini azalt, porsiya ölçüsünü kiçilt, garniri dəyiş.
                </p>
              </div>
              <div className="rounded-xl bg-purple-50 p-3.5 ring-1 ring-purple-200/60">
                <p className="text-xs font-bold text-purple-700">🧩 Puzzle → Tanıt</p>
                <p className="mt-1 text-[11px] text-purple-600/80">
                  Menyuda görünürlüğü artır, set və tövsiyə mexanizmi ver.
                </p>
              </div>
              <div className="rounded-xl bg-red-50 p-3.5 ring-1 ring-red-200/60">
                <p className="text-xs font-bold text-red-700">🐕 İt → Çıxar</p>
                <p className="mt-1 text-[11px] text-red-600/80">
                  Menyudan sil və ya resepti tam yenidən düşün.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-6xl px-6">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
            <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/10 blur-[50px]" />
            <div className="relative">
              <div className="mb-4 flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">DK Agency Məsləhəti</h3>
              </div>
              <p className="mb-5 text-[13px] leading-relaxed text-slate-400">
                Menyuda <strong className="text-white">20% yemək satışın 80%-ni</strong> gətirir.
                Bu qaydanı hər ay ölçməsən, yaxşı yeməyi zəif yeməklə subsidiyalaşdıracaqsan.
              </p>
              <Link
                href="/blog/menyu-muhendisliyi-satis"
                className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300"
              >
                Tam yazını oxu
                <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15">
            <div>
              <h3 className="mb-3 text-xl font-display font-black">OCAQ Panel</h3>
              <p className="mb-6 text-sm leading-relaxed text-white/80">
                Menyu matrisini avtomatik hesabla, satış datasını POS-dan çək və trendi real
                vaxtda izlə.
              </p>
            </div>
            <Link
              href="/auth/register"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-[var(--dk-red)] transition-all hover:shadow-lg active:scale-[0.98]"
            >
              Pulsuz başla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl px-6">
        <div className="rounded-2xl bg-slate-50 p-8 sm:p-10">
          <div className="mb-8 flex items-center gap-2.5">
            <BookOpen size={18} className="text-[var(--dk-red)]" />
            <h3 className="text-lg font-bold text-slate-900">Daha Dərin Öyrən</h3>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: 'Menyu Mühəndisliyi: Ulduz və İt',
                slug: 'menyu-muhendisliyi-satis',
                tag: 'Əməliyyat',
              },
              {
                title: 'Food Cost-un Qanlı Həqiqəti',
                slug: '1-porsiya-food-cost-hesablama',
                tag: 'Maliyyə',
              },
              {
                title: 'P&L Oxuya Bilmirsən?',
                slug: 'pnl-oxuya-bilmirsen',
                tag: 'Maliyyə',
              },
            ].map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md hover:ring-slate-300/60"
              >
                <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dk-red)]">
                  {article.tag}
                </span>
                <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 transition-colors group-hover:text-[var(--dk-red)]">
                  {article.title}
                </h4>
                <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-400 transition-all group-hover:gap-2 group-hover:text-[var(--dk-red)]">
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
