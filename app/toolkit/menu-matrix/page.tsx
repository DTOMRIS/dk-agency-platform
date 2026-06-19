'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Info, Lightbulb, Plus, RotateCcw, TrendingUp, UtensilsCrossed, X } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';

interface MenuItem { id: string; name: string; salesCount: number; contributionMargin: number; }
type Category = 'star' | 'plowHorse' | 'puzzle' | 'dog';

function classify(items: MenuItem[]): { item: MenuItem; category: Category }[] {
  if (items.length === 0) return [];
  const avgSales = items.reduce((s, i) => s + i.salesCount, 0) / items.length;
  const avgMargin = items.reduce((s, i) => s + i.contributionMargin, 0) / items.length;
  return items.map((item) => {
    const highSales = item.salesCount >= avgSales;
    const highMargin = item.contributionMargin >= avgMargin;
    const category: Category = highSales && highMargin ? 'star' : highSales ? 'plowHorse' : highMargin ? 'puzzle' : 'dog';
    return { item, category };
  });
}

export default function MenuMatrixPage() {
  const t = useTranslations('toolkit.menuMatrix');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const fmt0 = (n: number) => new Intl.NumberFormat(locale).format(Math.round(Number.isFinite(n) ? n : 0));
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const CATEGORY_META: Record<Category, { emoji: string; label: string; labelEn: string; color: string; bg: string; ring: string; advice: string }> = {
    star: { emoji: '⭐', label: t('catStarLabel'), labelEn: 'Star', color: 'text-yellow-600', bg: 'bg-yellow-50', ring: 'ring-yellow-200/60', advice: t('catStarAdvice') },
    plowHorse: { emoji: '🐴', label: t('catPlowHorseLabel'), labelEn: 'Plow Horse', color: 'text-blue-600', bg: 'bg-blue-50', ring: 'ring-blue-200/60', advice: t('catPlowHorseAdvice') },
    puzzle: { emoji: '🧩', label: t('catPuzzleLabel'), labelEn: 'Puzzle', color: 'text-purple-600', bg: 'bg-purple-50', ring: 'ring-purple-200/60', advice: t('catPuzzleAdvice') },
    dog: { emoji: '🐕', label: t('catDogLabel'), labelEn: 'Dog', color: 'text-red-600', bg: 'bg-red-50', ring: 'ring-red-200/60', advice: t('catDogAdvice') },
  };

  const DEFAULT_ITEMS: MenuItem[] = [
    { id: '1', name: t('defaultItem1'), salesCount: 120, contributionMargin: 8.5 },
    { id: '2', name: t('defaultItem2'), salesCount: 95, contributionMargin: 4.2 },
    { id: '3', name: t('defaultItem3'), salesCount: 40, contributionMargin: 9.0 },
    { id: '4', name: t('defaultItem4'), salesCount: 25, contributionMargin: 14.0 },
    { id: '5', name: t('defaultItem5'), salesCount: 110, contributionMargin: 3.5 },
    { id: '6', name: t('defaultItem6'), salesCount: 30, contributionMargin: 6.0 },
  ];

  const blogLinks = [
    { title: t('blogLink1Title'), slug: 'menyu-muhendisliyi-satis', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), slug: '1-porsiya-food-cost-hesablama', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), slug: 'pnl-oxuya-bilmirsen', tag: t('blogLink3Tag') },
  ];

  const [items, setItems] = useState<MenuItem[]>(DEFAULT_ITEMS);
  const classified = useMemo(() => classify(items), [items]);
  const avgSales = useMemo(() => items.length === 0 ? 0 : items.reduce((s, i) => s + i.salesCount, 0) / items.length, [items]);
  const avgMargin = useMemo(() => items.length === 0 ? 0 : items.reduce((s, i) => s + i.contributionMargin, 0) / items.length, [items]);
  const counts = useMemo(() => { const n = { star: 0, plowHorse: 0, puzzle: 0, dog: 0 }; classified.forEach(({ category }) => { n[category] += 1; }); return n; }, [classified]);

  const addItem = () => setItems((p) => [...p, { id: Date.now().toString(), name: '', salesCount: 0, contributionMargin: 0 }]);
  const removeItem = (id: string) => setItems((p) => (p.length > 1 ? p.filter((i) => i.id !== id) : p));
  const updateItem = (id: string, field: keyof MenuItem, value: string | number) => setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  const resetAll = () => setItems(DEFAULT_ITEMS);

  // ── Input Section (editable table) ────────────────────────────────

  const inputSection = (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-bold text-slate-900">{t('itemListTitle')}</h2>
        <div className="flex items-center gap-4">
          <div className="text-xs text-slate-600">
            {t('avgSalesLabel')}: <strong className="text-slate-600">{fmt0(avgSales)}</strong> | {t('avgMarginLabel')}: <strong className="text-slate-600">{avgMargin.toFixed(1)} ₼</strong>
          </div>
          <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-600 transition-colors hover:text-red-500">
            <RotateCcw size={13} /> {t('reset')}
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60 text-[10px] font-bold uppercase tracking-widest text-slate-600">
              <th className="px-4 py-3 text-left">{t('colFoodName')}</th>
              <th className="w-[120px] px-3 py-3 text-center">{t('colSalesCount')}</th>
              <th className="w-[140px] px-3 py-3 text-center">{t('colContributionMargin')}</th>
              <th className="w-[130px] px-3 py-3 text-center">{t('colCategory')}</th>
              <th className="px-3 py-3 text-left">{t('colAdvice')}</th>
              <th className="w-10" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {classified.map(({ item, category }) => {
              const meta = CATEGORY_META[category];
              return (
                <tr key={item.id} className="group transition-colors hover:bg-slate-50/50">
                  <td className="px-4 py-3">
                    <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                      className="w-full bg-transparent font-medium text-slate-900 outline-none placeholder:text-slate-300" placeholder={t('foodNamePlaceholder')} />
                  </td>
                  <td className="px-3 py-3">
                    <input type="number" min="0" value={item.salesCount || ''} onChange={(e) => updateItem(item.id, 'salesCount', parseInt(e.target.value, 10) || 0)}
                      className="w-full rounded-lg bg-slate-100/80 px-2 py-1.5 text-center text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500/30" />
                  </td>
                  <td className="px-3 py-3">
                    <input type="number" min="0" step="0.1" value={item.contributionMargin || ''} onChange={(e) => updateItem(item.id, 'contributionMargin', parseFloat(e.target.value) || 0)}
                      className="w-full rounded-lg bg-slate-100/80 px-2 py-1.5 text-center text-sm outline-none transition-shadow focus:ring-2 focus:ring-purple-500/30" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}>
                      {meta.emoji} {meta.label}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-500">{meta.advice}</td>
                  <td className="pr-3 py-3">
                    <button onClick={() => removeItem(item.id)} className="text-slate-300 opacity-0 transition-all hover:text-red-500 group-hover:opacity-100"><X size={15} /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <button onClick={addItem} className="inline-flex items-center gap-1.5 text-sm font-semibold text-purple-600 transition-colors hover:text-purple-700">
        <Plus size={15} /> {t('addItem')}
      </button>
    </div>
  );

  // ── Result Section (category counts) ──────────────────────────────

  const resultSection = (
    <div className="space-y-3">
      {(['star', 'plowHorse', 'puzzle', 'dog'] as Category[]).map((cat) => {
        const meta = CATEGORY_META[cat];
        return (
          <div key={cat} className={`${meta.bg} rounded-xl p-4 ring-1 ${meta.ring}`}>
            <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{meta.emoji} {meta.label}</div>
            <div className={`mt-1 text-3xl font-black tabular-nums ${meta.color}`}>{counts[cat]}</div>
            <div className="mt-1 text-[10px] text-slate-600">{meta.labelEn}</div>
          </div>
        );
      })}
    </div>
  );

  // ── Bottom Section (education + CTA + blog) ───────────────────────

  const bottomSection = (
    <>
      <div className="mb-10">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-display font-black tracking-tight text-slate-900 sm:text-3xl">
            {t('educationTitle')} <span className="bg-gradient-to-r from-purple-600 to-fuchsia-500 bg-clip-text text-transparent">{t('educationTitleAccent')}</span>
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">{t('educationSubtitle')}</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-purple-50/60 to-white p-6 ring-1 ring-purple-200/40">
            <div className="mb-4 flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-purple-100"><Info size={15} className="text-purple-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('whatIsTitle')}</h3></div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-600">{t('whatIsBody1')} <strong className="text-slate-800">{t('whatIsBodyBold1')}</strong> {t('whatIsBody2')} <strong className="text-slate-800">{t('whatIsBodyBold2')}</strong> {t('whatIsBody3')}</p>
            <div className="mt-auto space-y-2 rounded-xl bg-slate-900 p-4">
              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400">{t('processLabel')}</p>
              <div className="space-y-0.5 font-mono text-[12px] text-slate-300"><p className="text-white">{t('processStep1')}</p><p>{t('processStep2')}</p><p>{t('processStep3')}</p><p className="font-bold text-purple-400">{t('processStep4')}</p></div>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-slate-50 to-white p-6 ring-1 ring-slate-200/60">
            <div className="mb-4 flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100"><UtensilsCrossed size={15} className="text-slate-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('bcgTitle')}</h3></div>
            <p className="mb-4 text-[12px] text-slate-500">{t('bcgSubtitle')}</p>
            <div className="mt-auto grid grid-cols-2 gap-2.5">
              {(['star', 'plowHorse', 'puzzle', 'dog'] as Category[]).map((cat) => { const m = CATEGORY_META[cat]; return (
                <div key={cat} className={`rounded-xl ${m.bg} p-3 ring-1 ${m.ring}`}><p className={`text-xs font-bold ${m.color}`}>{m.emoji} {m.label}</p><p className="mt-1 text-[11px] text-slate-500">{t(`bcg${cat.charAt(0).toUpperCase() + cat.slice(1)}Desc` as 'bcgStarDesc')}</p></div>
              ); })}
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-gradient-to-br from-fuchsia-50/60 to-white p-6 ring-1 ring-fuchsia-200/40">
            <div className="mb-4 flex items-center gap-2.5"><div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-fuchsia-100"><TrendingUp size={15} className="text-fuchsia-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('strategiesTitle')}</h3></div>
            <div className="mt-auto space-y-2.5">
              {(['star', 'plowHorse', 'puzzle', 'dog'] as Category[]).map((cat) => { const m = CATEGORY_META[cat]; return (
                <div key={cat} className={`rounded-xl ${m.bg} p-3.5 ring-1 ${m.ring}`}><p className={`text-xs font-bold ${m.color}`}>{m.emoji} {m.label} → {t(`strategy${cat.charAt(0).toUpperCase() + cat.slice(1)}Verb` as 'strategyStarVerb')}</p><p className="mt-1 text-[11px] text-slate-500">{t(`strategy${cat.charAt(0).toUpperCase() + cat.slice(1)}Body` as 'strategyStarBody')}</p></div>
              ); })}
            </div>
          </div>
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8">
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-purple-500/10 blur-[50px]" />
          <div className="relative"><div className="mb-4 flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/20"><Lightbulb size={16} className="text-amber-400" /></div><h3 className="text-base font-bold text-amber-400">{t('dkAdviceLabel')}</h3></div>
            <p className="mb-5 text-[13px] leading-relaxed text-slate-400">{t('dkAdviceBody1')} <strong className="text-white">{t('dkAdviceBodyBold')}</strong> {t('dkAdviceBody2')}</p>
            <Link href="/blog/menyu-muhendisliyi-satis" className="group inline-flex items-center gap-2 text-sm font-bold text-amber-400 transition-colors hover:text-amber-300">{t('readArticle')} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" /></Link></div>
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15">
          <div><h3 className="mb-3 text-xl font-display font-black">{t('ocaqTitle')}</h3><p className="mb-6 text-sm leading-relaxed text-white/80">{t('ocaqBody')}</p></div>
          <Link href="/auth/register" className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-[var(--dk-red)] transition-all hover:shadow-lg active:scale-[0.98]">{t('ocaqCta')} <ArrowRight size={15} /></Link>
        </div>
      </div>
      <div className="mt-10 rounded-2xl bg-slate-50 p-8 sm:p-10">
        <div className="mb-8 flex items-center gap-2.5"><BookOpen size={18} className="text-[var(--dk-red)]" /><h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {blogLinks.map((a) => (
            <Link key={a.slug} href={`/blog/${a.slug}`} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[var(--dk-red)]">{a.tag}</span>
              <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 group-hover:text-[var(--dk-red)]">{a.title}</h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-600 group-hover:text-[var(--dk-red)]">{t('readLabel')} <ArrowRight size={12} /></div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="menu-matrix" toolName={t('title')} toolDescription={t('subtitle')} tier="kalfa"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'menu-matrix', locale, result: { starCount: counts.star, plowHorseCount: counts.plowHorse, puzzleCount: counts.puzzle, dogCount: counts.dog, totalItems: items.length, avgMargin } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
