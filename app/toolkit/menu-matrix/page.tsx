'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { withLocale } from '@/i18n/config';
import { ArrowRight, BookOpen, CircleMinus, Lightbulb, Megaphone, Plus, ShieldCheck, Tag, X, type LucideIcon } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { numberLocale } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import { classifyMenu, menuThresholds, type MenuCategory as Category, type MenuMatrixItem as MenuItem } from '@/lib/toolkit/menu-matrix';

/**
 * TASK-0517 (owner feedback 2026-10-09): the four groups are shown as ACTIONS — «Qoru»,
 * «Qiymətini düzəlt», «Tanıt», «Çıxar» — instead of animal / BCG names. The classification
 * itself (lib/toolkit/menu-matrix.ts, TASK-0515) is unchanged; internal ids stay.
 * A row with neither sales nor profit is «not filled in yet» and is left out of the calculation.
 */

const CATEGORY_ORDER: Category[] = ['star', 'plowHorse', 'puzzle', 'dog'];

const isEmptyRow = (i: MenuItem) => i.salesCount === 0 && i.contributionMargin === 0;

export default function MenuMatrixPage() {
  const t = useTranslations('toolkit.menuMatrix');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const fmt1 = (n: number) => new Intl.NumberFormat(numberLocale(locale), { maximumFractionDigits: 1 }).format(Number.isFinite(n) ? n : 0);
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  // Text colours ≥ 4.5:1 on their tinted backgrounds.
  const CATEGORY_META: Record<Category, { Icon: LucideIcon; label: string; sub: string; color: string; bg: string; ring: string; advice: string }> = {
    star: { Icon: ShieldCheck, label: t('catKeepLabel'), sub: t('catKeepSub'), color: 'text-emerald-800', bg: 'bg-emerald-50', ring: 'ring-emerald-200/70', advice: t('catKeepAdvice') },
    plowHorse: { Icon: Tag, label: t('catFixLabel'), sub: t('catFixSub'), color: 'text-amber-800', bg: 'bg-amber-50', ring: 'ring-amber-200/70', advice: t('catFixAdvice') },
    puzzle: { Icon: Megaphone, label: t('catPromoteLabel'), sub: t('catPromoteSub'), color: 'text-violet-800', bg: 'bg-violet-50', ring: 'ring-violet-200/70', advice: t('catPromoteAdvice') },
    dog: { Icon: CircleMinus, label: t('catRemoveLabel'), sub: t('catRemoveSub'), color: 'text-red-700', bg: 'bg-red-50', ring: 'ring-red-200/70', advice: t('catRemoveAdvice') },
  };

  const exampleItems = (): MenuItem[] => [
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

  const [items, setItems] = useState<MenuItem[]>(exampleItems);
  const filled = useMemo(() => items.filter((i) => !isEmptyRow(i)), [items]);
  const categoryById = useMemo(() => {
    const map = new Map<string, Category>();
    classifyMenu(filled).forEach(({ item, category }) => map.set(item.id, category));
    return map;
  }, [filled]);
  const thresholds = useMemo(() => menuThresholds(filled), [filled]);
  const avgMargin = thresholds.margin;
  const counts = useMemo(() => {
    const n: Record<Category, number> = { star: 0, plowHorse: 0, puzzle: 0, dog: 0 };
    categoryById.forEach((category) => { n[category] += 1; });
    return n;
  }, [categoryById]);

  const addItem = () => setItems((p) => [...p, { id: `${Date.now()}-${p.length}`, name: '', salesCount: 0, contributionMargin: 0 }]);
  const removeItem = (id: string) => setItems((p) => (p.length > 1 ? p.filter((i) => i.id !== id) : p));
  const updateItem = (id: string, field: keyof MenuItem, value: string | number) => setItems((p) => p.map((i) => (i.id === id ? { ...i, [field]: value } : i)));

  // ── Input Section (rows: a grid table on ≥ 640px, stacked cards on phones) ──

  const numCls = 'w-full min-w-[72px] rounded-lg bg-slate-100/80 px-2 py-2 text-center text-sm tabular-nums text-slate-900 outline-none transition-shadow focus:ring-2 focus:ring-violet-500/30';
  const rowGrid = 'sm:grid-cols-[minmax(130px,1.4fr)_92px_116px_minmax(130px,1fr)_40px] sm:items-center sm:gap-3';

  const inputSection = (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-bold text-slate-900">{t('itemListTitle')}</h2>
        <ToolResetControls
          snapshot={() => items}
          restore={(saved) => setItems(saved)}
          onClear={() => setItems((p) => p.map((i) => ({ ...i, name: '', salesCount: 0, contributionMargin: 0 })))}
          onLoadExample={() => setItems(exampleItems())}
        />
      </div>

      <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 ring-1 ring-slate-200">
        <p><strong className="text-slate-900">{t('colContributionMargin')}</strong> = {t('marginHelp')}</p>
        <p className="mt-1">
          {t('avgSalesLabel')}: <strong className="text-slate-900" data-testid="mm-pop-threshold">{fmt1(thresholds.popularity)}</strong>
          {' · '}
          {t('avgMarginLabel')}: <strong className="text-slate-900" data-testid="mm-cm-threshold">{fmt1(avgMargin)} ₼</strong>
        </p>
      </div>

      <div className="rounded-xl ring-1 ring-slate-200">
        <div className={`hidden border-b border-slate-100 bg-slate-50/60 px-3 py-3 text-[11px] font-bold text-slate-700 sm:grid ${rowGrid}`}>
          <span>{t('colFoodName')}</span>
          <span className="text-center">{t('colSalesCount')}</span>
          <span className="text-center">{t('colContributionMarginShort')}</span>
          <span>{t('colCategory')}</span>
          <span />
        </div>
        <ul className="divide-y divide-slate-100">
          {items.map((item) => {
            const category = isEmptyRow(item) ? null : categoryById.get(item.id) ?? null;
            const meta = category ? CATEGORY_META[category] : null;
            const Icon = meta?.Icon;
            return (
              <li key={item.id} className={`grid grid-cols-2 gap-x-3 gap-y-2 px-3 py-3 ${rowGrid}`} data-testid="tool-row">
                <label className="col-span-2 block min-w-0 sm:col-span-1">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-700 sm:hidden">{t('colFoodName')}</span>
                  <input type="text" value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                    aria-label={t('colFoodName')} placeholder={t('foodNamePlaceholder')}
                    className="w-full rounded-lg bg-white px-2 py-2 font-medium text-slate-900 outline-none ring-1 ring-slate-200 placeholder:text-slate-500 focus:ring-2 focus:ring-violet-500/30" />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-700 sm:hidden">{t('colSalesCount')}</span>
                  <DecimalInput blankZero inputMode="numeric" aria-label={t('colSalesCount')} value={item.salesCount} onValueChange={(v) => updateItem(item.id, 'salesCount', Math.max(0, Math.round(v)))} className={numCls} />
                </label>
                <label className="block min-w-0">
                  <span className="mb-1 block text-[11px] font-semibold text-slate-700 sm:hidden">{t('colContributionMarginShort')}</span>
                  <DecimalInput blankZero aria-label={t('colContributionMargin')} value={item.contributionMargin} onValueChange={(v) => updateItem(item.id, 'contributionMargin', v)} className={numCls} />
                </label>
                <div className="min-w-0">
                  {meta && Icon ? (
                    <>
                      <span data-testid="mm-cat" data-cat={category} className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${meta.bg} ${meta.color} ring-1 ${meta.ring}`}>
                        <Icon size={13} aria-hidden="true" /> {meta.label}
                      </span>
                      <p className="mt-1 text-[11px] leading-snug text-slate-700">{meta.advice}</p>
                    </>
                  ) : (
                    <span data-testid="mm-cat" data-cat="empty" className="text-xs text-slate-700">{t('catEmptyLabel')}</span>
                  )}
                </div>
                <div className="flex items-end justify-end sm:items-center">
                  <button type="button" onClick={() => removeItem(item.id)} aria-label={t('removeItem')} data-testid="tool-remove-row"
                    disabled={items.length <= 1}
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-700 transition-colors hover:bg-red-50 hover:text-red-700 disabled:opacity-40">
                    <X size={15} aria-hidden="true" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
      <button type="button" onClick={addItem} data-testid="tool-add-row" className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg border border-violet-200 bg-white px-3 text-sm font-semibold text-violet-800 transition-colors hover:bg-violet-50">
        <Plus size={15} aria-hidden="true" /> {t('addItem')}
      </button>
    </div>
  );

  // ── Result Section (how many dishes per action) ───────────────────

  const resultSection = (
    <div className="space-y-3">
      {CATEGORY_ORDER.map((cat) => {
        const meta = CATEGORY_META[cat];
        const Icon = meta.Icon;
        return (
          <div key={cat} className={`${meta.bg} rounded-xl p-4 ring-1 ${meta.ring}`}>
            <div className={`flex items-center gap-1.5 text-xs font-bold ${meta.color}`}><Icon size={14} aria-hidden="true" /> {meta.label}</div>
            <div className={`mt-1 text-3xl font-black tabular-nums ${meta.color}`} data-testid={`mm-count-${cat}`}>{counts[cat]}</div>
            <div className="mt-1 text-xs text-slate-700">{meta.sub}</div>
          </div>
        );
      })}
    </div>
  );

  // ── Bottom Section (rule of thumb + CTA + blog) ────────────────────

  const bottomSection = (
    <>
      <div className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200 sm:p-8">
          <div className="mb-3 flex items-center gap-2.5"><div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50"><Lightbulb size={16} className="text-amber-800" aria-hidden="true" /></div><h3 className="text-base font-bold text-slate-900">{t('ruleLabel')}</h3></div>
          <p className="mb-5 text-[13px] leading-relaxed text-slate-700">{t('ruleBody')}</p>
          <Link href={withLocale(locale, '/blog/menyu-muhendisliyi-satis')} className="group inline-flex min-h-[24px] items-center gap-2 text-sm font-bold text-dk-red-deep hover:underline">{t('readArticle')} <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" /></Link>
        </div>
        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-dk-red-strong to-dk-red-deep p-6 text-white shadow-xl shadow-red-500/15 sm:p-8">
          <div><h3 className="mb-3 text-xl font-display font-black">{t('ocaqTitle')}</h3><p className="mb-6 text-sm leading-relaxed text-white/90">{t('ocaqBody')}</p></div>
          <Link href={withLocale(locale, '/auth/register')} className="flex w-full items-center justify-center gap-2 rounded-xl bg-white py-3.5 text-sm font-black text-dk-red-deep transition-all hover:shadow-lg active:scale-[0.98]">{t('ocaqCta')} <ArrowRight size={15} aria-hidden="true" /></Link>
        </div>
      </div>
      <div className="mt-10 rounded-2xl bg-slate-50 p-6 sm:p-10">
        <div className="mb-6 flex items-center gap-2.5"><BookOpen size={18} className="text-dk-red-deep" aria-hidden="true" /><h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3></div>
        <div className="grid gap-4 sm:grid-cols-3">
          {blogLinks.map((a) => (
            <Link key={a.slug} href={withLocale(locale, `/blog/${a.slug}`)} className="group block rounded-xl bg-white p-5 ring-1 ring-slate-200/60 transition-all duration-300 hover:shadow-md">
              <span className="text-[10px] font-bold uppercase tracking-widest text-dk-red-deep">{a.tag}</span>
              <h4 className="mt-2.5 text-sm font-bold leading-snug text-slate-900 group-hover:text-dk-red-deep">{a.title}</h4>
              <div className="mt-4 flex items-center gap-1 text-xs font-semibold text-slate-700 group-hover:text-dk-red-deep">{t('readLabel')} <ArrowRight size={12} aria-hidden="true" /></div>
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
        const res = await getToolkitInsight({ toolId: 'menu-matrix', locale, result: { keepCount: counts.star, fixPriceCount: counts.plowHorse, promoteCount: counts.puzzle, removeCount: counts.dog, totalItems: filled.length, avgMargin } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
