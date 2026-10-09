'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Calculator, AlertTriangle, Database, Info, ShoppingCart, Tag, PieChart, Shield, ArrowRight, RotateCcw, Lightbulb, BookOpen } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { normalizeLocale, withLocale } from '@/i18n/config';
import { numberLocale } from '@/lib/i18n/format';
import home from '@/components/home/v2/homeV2.module.css';
import { Icon, whatsappHref } from '@/components/home/v2/shared';
import s from '@/components/inner/inner.module.css';

const UNITS = ['kq', 'qr', 'litr', 'ml', 'ədəd'];

/** Sector bands of this tool (source of truth for food cost targets, owner 2026-10-09). */
const SECTOR_BANDS = [
  { key: 'sectorRestaurant', lo: 28, hi: 32 },
  { key: 'sectorFastFood', lo: 22, hi: 28 },
  { key: 'sectorFineDining', lo: 35, hi: 40 },
] as const;
/** Band scale of the result bar: 0 … 60%. */
const BAND_MAX = 60;

interface PriceSuggestion { name: string; unit: string; avgUnitPrice: number; minUnitPrice: number; maxUnitPrice: number; occurrences: number; }

function useProductLookup() {
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);
  const [activeIngId, setActiveIngId] = useState<string | null>(null);
  const [hasInvoiceData, setHasInvoiceData] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => { fetch('/api/food-cost?type=lookup&limit=1').then((r) => r.json()).then((json: { data?: PriceSuggestion[] }) => { if (json.data && json.data.length > 0) setHasInvoiceData(true); }).catch(() => {}); }, []);
  const search = useCallback((query: string, ingId: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); setActiveIngId(null); return; }
    setActiveIngId(ingId);
    debounceRef.current = setTimeout(async () => { try { const res = await fetch(`/api/food-cost?type=lookup&q=${encodeURIComponent(query)}&limit=5`); const json = (await res.json()) as { data: PriceSuggestion[] }; setSuggestions(json.data ?? []); } catch { setSuggestions([]); } }, 300);
  }, []);
  const clear = useCallback(() => { setSuggestions([]); setActiveIngId(null); }, []);
  return { suggestions, activeIngId, hasInvoiceData, search, clear };
}

interface Ingredient { id: string; name: string; quantity: number; unit: string; pricePerUnit: number; trimLoss: number; }

export default function FoodCostCalculator() {
  const t = useTranslations('toolkit.foodCost');
  const tv = useTranslations('innerV2.foodCost');
  const tc = useTranslations('innerV2.common');
  const tt = useTranslations('innerV2.toolkit.tools');
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: t('defaultIng1Name'), quantity: 0.25, unit: 'kq', pricePerUnit: 9.5, trimLoss: 5 },
    { id: '2', name: t('defaultIng2Name'), quantity: 0.03, unit: 'litr', pricePerUnit: 12, trimLoss: 0 },
    { id: '3', name: t('defaultIng3Name'), quantity: 0.15, unit: 'kq', pricePerUnit: 4.5, trimLoss: 0 },
  ]);
  const [menuPrice, setMenuPrice] = useState(18);
  const [portions, setPortions] = useState(1);
  const [targetFoodCost, setTargetFoodCost] = useState(32);
  const { suggestions, activeIngId, hasInvoiceData, search, clear } = useProductLookup();
  const locale = normalizeLocale(useLocale());
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const nf2 = useMemo(() => new Intl.NumberFormat(numberLocale(locale), { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const nf1 = useMemo(() => new Intl.NumberFormat(numberLocale(locale), { minimumFractionDigits: 1, maximumFractionDigits: 1 }), [locale]);
  const azn = (v: number) => `${nf2.format(v)} ₼`;

  const fourFactors = [
    { icon: ShoppingCart, title: t('factor1Title'), color: 'text-blue-600', iconBg: 'bg-blue-100', content: t('factor1Content') },
    { icon: Tag, title: t('factor2Title'), color: 'text-emerald-600', iconBg: 'bg-emerald-100', content: t('factor2Content') },
    { icon: PieChart, title: t('factor3Title'), color: 'text-amber-600', iconBg: 'bg-amber-100', content: t('factor3Content') },
    { icon: Shield, title: t('factor4Title'), color: 'text-red-600', iconBg: 'bg-red-100', content: t('factor4Content') },
  ];
  const blogLinks = [
    { title: t('blogLink1Title'), slug: '1-porsiya-food-cost-hesablama', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), slug: 'pnl-oxuya-bilmirsen', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), slug: 'menyu-muhendisliyi-satis', tag: t('blogLink3Tag') },
  ];

  const applySuggestion = (ingId: string, sug: PriceSuggestion) => { setIngredients((prev) => prev.map((i) => i.id === ingId ? { ...i, name: sug.name, unit: sug.unit, pricePerUnit: sug.avgUnitPrice / 100 } : i)); clear(); };
  const calc = useMemo(() => {
    const totalRaw = ingredients.reduce((sum, ing) => sum + ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit, 0);
    const perPortion = totalRaw / (portions || 1);
    const pct = menuPrice > 0 ? (perPortion / menuPrice) * 100 : 0;
    const gross = menuPrice - perPortion;
    const ideal = targetFoodCost > 0 ? perPortion / (targetFoodCost / 100) : 0;
    const status: 'good' | 'warning' | 'danger' = pct > 35 ? 'danger' : pct > 30 ? 'warning' : 'good';
    return { totalRaw, perPortion, pct, gross, ideal, status };
  }, [ingredients, menuPrice, portions, targetFoodCost]);
  const addIngredient = () => setIngredients([...ingredients, { id: Date.now().toString(), name: '', quantity: 0, unit: 'kq', pricePerUnit: 0, trimLoss: 0 }]);
  const removeIngredient = (id: string) => { if (ingredients.length > 1) setIngredients(ingredients.filter((i) => i.id !== id)); };
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => setIngredients(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  const resetAll = () => { setIngredients([{ id: '1', name: '', quantity: 0, unit: 'kq', pricePerUnit: 0, trimLoss: 0 }]); setMenuPrice(0); setPortions(1); setTargetFoodCost(32); };

  const ready = menuPrice > 0 && calc.perPortion > 0;
  const statusClass = { good: s.sOk, warning: s.sWarn, danger: s.sDanger }[calc.status];
  const statusLabel = { good: t('statusGood'), warning: t('statusWarning'), danger: t('statusDanger') }[calc.status];
  const pctText = ready ? `${nf1.format(calc.pct)}%` : '—';
  const dish = ingredients.find((i) => i.name.trim())?.name.trim() || tv('dishFallback');
  const overTarget = ready && calc.pct > targetFoodCost;
  const signal = !ready
    ? tv('signalPending')
    : overTarget
      ? tv('signalHigh', { pct: nf1.format(calc.pct), target: targetFoodCost })
      : tv('signalOk', { pct: nf1.format(calc.pct), target: targetFoodCost });
  const signalSub = overTarget
    ? tv('signalHighSub', { ideal: azn(calc.ideal), cut: azn(calc.perPortion - (menuPrice * targetFoodCost) / 100) })
    : '';
  const resultText = [
    tv('waIntro'),
    tv('waLine', { dish, cost: azn(calc.perPortion), price: azn(menuPrice), pct: pctText }),
    tv('waIdeal', { target: targetFoodCost, ideal: azn(calc.ideal) }),
    signal,
  ].join('\n');
  const shareHref = `https://wa.me/?text=${encodeURIComponent(resultText)}`;
  const talkHref = whatsappHref(tv('talkText', { dish, pct: pctText, price: azn(menuPrice) }));
  const restaurant = SECTOR_BANDS[0];

  // ── Input Section ─────────────────────────────────────────────────
  const inputSection = (
    <div>
      <div className={s.pcHead}>
        <h2>{t('recipeCardTitle')}</h2>
        <div className={s.pcTools}>
          {hasInvoiceData && <span className={s.invoiceOn}><Database size={10} className="mr-1 inline" />{t('invoiceDataActive')}</span>}
          <button type="button" onClick={resetAll} className={s.preset}><RotateCcw size={13} /> {t('reset')}</button>
        </div>
      </div>

      <div className={s.rowsH} aria-hidden="true">
        <span>{t('colProduct')}</span><span>{t('colQuantity')}</span><span>{t('colUnit')}</span><span>{t('colPricePerUnit')}</span><span>{t('colTrimPct')}</span><span>{t('colTotal')}</span><span />
      </div>
      {ingredients.map((ing) => {
        const total = ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit;
        return (
          <div key={ing.id} className={s.fcRow}>
            <div className={s.cNm}>
              <span className={s.lbl}>{t('colProduct')}</span>
              <input type="text" className={s.nm} value={ing.name} aria-label={t('colProduct')} placeholder={t('productNamePlaceholder')}
                onChange={(e) => { updateIngredient(ing.id, 'name', e.target.value); if (hasInvoiceData) search(e.target.value, ing.id); }}
                onBlur={() => setTimeout(clear, 200)} />
              {activeIngId === ing.id && suggestions.length > 0 && (
                <div className={s.sugg}>
                  {suggestions.map((sug) => (
                    <button key={`${sug.name}-${sug.unit}`} type="button" onMouseDown={() => applySuggestion(ing.id, sug)}>
                      <span><b>{sug.name}</b> ({sug.unit})</span>
                      <span>{azn(sug.avgUnitPrice / 100)} · x{sug.occurrences}</span>
                    </button>
                  ))}
                  <div className={s.suggHint}>{t('invoiceDataHint')}</div>
                </div>
              )}
            </div>
            <div className={s.cQ}>
              <span className={s.lbl}>{t('colQuantity')}</span>
              <input type="number" step="0.01" min="0" inputMode="decimal" aria-label={t('colQuantity')} value={ing.quantity || ''} onChange={(e) => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)} />
            </div>
            <div className={s.cU}>
              <span className={s.lbl}>{t('colUnit')}</span>
              <select aria-label={t('colUnit')} value={ing.unit} onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)}>{UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}</select>
            </div>
            <div className={s.cP}>
              <span className={s.lbl}>{t('colPricePerUnit')}</span>
              <input type="number" step="0.01" min="0" inputMode="decimal" aria-label={t('colPricePerUnit')} value={ing.pricePerUnit || ''} onChange={(e) => updateIngredient(ing.id, 'pricePerUnit', parseFloat(e.target.value) || 0)} />
            </div>
            <div className={s.cT}>
              <span className={s.lbl}>{t('colTrimPct')}</span>
              <input type="number" step="1" min="0" max="100" inputMode="numeric" aria-label={t('colTrimPct')} value={ing.trimLoss || ''} onChange={(e) => updateIngredient(ing.id, 'trimLoss', parseFloat(e.target.value) || 0)} />
            </div>
            <div className={s.tot}>{azn(total)}</div>
            <button type="button" className={s.rm} onClick={() => removeIngredient(ing.id)} aria-label={tv('removeRow')} disabled={ingredients.length < 2}><Icon name="x" /></button>
          </div>
        );
      })}
      <button type="button" onClick={addIngredient} className={s.add}><Icon name="plus" /> {t('addIngredient')}</button>
      <div className={s.sumRow}><span>{t('totalFoodCost')}</span><b data-testid="fc-total">{azn(calc.totalRaw)}</b></div>

      <div className={s.params}>
        <div className={s.fld}><label htmlFor="fc-price">{t('labelMenuPrice')}</label><input id="fc-price" type="number" step="0.1" min="0" inputMode="decimal" value={menuPrice || ''} onChange={(e) => setMenuPrice(parseFloat(e.target.value) || 0)} /></div>
        <div className={s.fld}><label htmlFor="fc-portions">{t('labelPortions')}</label><input id="fc-portions" type="number" min="1" inputMode="numeric" value={portions || ''} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} /></div>
        <div className={s.fld}><label htmlFor="fc-target">{t('labelTargetFoodCost')}</label><input id="fc-target" type="number" min="1" max="100" inputMode="numeric" value={targetFoodCost || ''} onChange={(e) => setTargetFoodCost(parseFloat(e.target.value) || 32)} /></div>
      </div>
      <div className={s.std} aria-label={t('sectorStandardsTitle')} role="group">
        {SECTOR_BANDS.map((band, i) => (
          <div key={band.key} className={i === 0 ? s.stdOn : undefined}><b>{band.lo}–{band.hi}%</b><span>{t(band.key)}</span></div>
        ))}
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────
  const resultSection = (
    <div className={statusClass} data-testid="fc-result">
      <div className={s.rsTop}>
        <div><small>{t('statFoodCost')}</small><div className={s.rsPct} data-testid="fc-pct">{pctText}</div></div>
        {ready ? <span className={s.stPill}>{statusLabel}</span> : null}
      </div>
      <div className={s.band} aria-hidden="true">
        <span className={s.bandZone} style={{ left: `${(restaurant.lo / BAND_MAX) * 100}%`, width: `${((restaurant.hi - restaurant.lo) / BAND_MAX) * 100}%` }} />
        {ready ? <span className={s.bandMk} style={{ left: `${Math.min(100, Math.max(0, (calc.pct / BAND_MAX) * 100))}%` }} /> : null}
      </div>
      <div className={s.bandL}><span>0%</span><span>{t('sectorRestaurant')}: {restaurant.lo}–{restaurant.hi}%</span><span>{BAND_MAX}%</span></div>
      <div className={s.kv}>
        <div><small>{t('statPortionCost')}</small><b>{azn(calc.perPortion)}</b></div>
        <div><small>{t('statGrossProfit')}</small><b>{azn(calc.gross)}</b></div>
        <div><small>{t('statIdealPrice')} ({targetFoodCost}%)</small><b>{azn(calc.ideal)}</b></div>
      </div>
      <div className={`${s.agent} ${overTarget ? '' : s.agentOk}`}>
        <div className={s.agentTag}><span className={s.agentSq}><Icon name="check" /></span>{tv('signalTag')}</div>
        <p className={s.agentMsg}>{signal}</p>
        {signalSub ? <p className={s.rsFoot}>{signalSub}</p> : null}
      </div>
      <div className={s.rsBtns}>
        <a className={`${home.btn} ${s.btnWa} ${s.btnBlock}`} href={shareHref} target="_blank" rel="noopener noreferrer" data-testid="fc-wa"><Icon name="chat" />{tv('sendWa')}</a>
        <div className={s.row2}>
          <button type="button" className={`${home.btn} ${home.btnGhost} ${home.btnSm}`} onClick={() => window.print()} data-testid="fc-pdf"><Icon name="file" />{tv('pdf')}</button>
          <a className={`${home.btn} ${home.btnDark} ${home.btnSm}`} href={talkHref} target="_blank" rel="noopener noreferrer" data-testid="fc-talk">{tv('talk')}</a>
        </div>
      </div>
      <p className={s.rsFoot}>{tv('privacy')}</p>
    </div>
  );

  const headerAside = (
    <div className={s.formula}>
      <small>{tv('formulaLabel')}</small>
      <code>{tv('formula')}</code>
      <p>{tv('formulaNote')}</p>
    </div>
  );

  // Print-only sheet (PDF al → window.print → «Save as PDF»). No new package.
  const printSheet = (
    <div className={s.printSheet} aria-hidden="true">
      <h1>{tv('printTitle')} — {dish}</h1>
      <div>{tv('printDate', { date: new Date().toLocaleDateString(numberLocale(locale)) })}</div>
      <table>
        <thead><tr><th>{t('colProduct')}</th><th className="num">{t('colQuantity')}</th><th>{t('colUnit')}</th><th className="num">{t('colPricePerUnit')}</th><th className="num">{t('colTrimPct')}</th><th className="num">{t('colTotal')}</th></tr></thead>
        <tbody>
          {ingredients.map((ing) => (
            <tr key={ing.id}><td>{ing.name || '—'}</td><td className="num">{ing.quantity}</td><td>{ing.unit}</td><td className="num">{azn(ing.pricePerUnit)}</td><td className="num">{ing.trimLoss}%</td><td className="num">{azn(ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit)}</td></tr>
          ))}
          <tr><td colSpan={5}><b>{t('totalFoodCost')}</b></td><td className="num"><b>{azn(calc.totalRaw)}</b></td></tr>
        </tbody>
      </table>
      <div className={s.printKpi}>
        <div>{t('labelMenuPrice')}<b>{azn(menuPrice)}</b></div>
        <div>{t('labelPortions')}<b>{portions}</b></div>
        <div>{t('statFoodCost')}<b>{pctText}</b></div>
        <div>{t('statPortionCost')}<b>{azn(calc.perPortion)}</b></div>
        <div>{t('statGrossProfit')}<b>{azn(calc.gross)}</b></div>
        <div>{t('statIdealPrice')} ({targetFoodCost}%)<b>{azn(calc.ideal)}</b></div>
      </div>
      <p>{signal}</p>
      <p>{tv('printFooter')}</p>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────
  const bottomSection = (
    <>
      {printSheet}
      <div className={s.after}>
        <Link className={s.linkCard} href={withLocale(locale, '/blog/1-porsiya-food-cost-hesablama')}>
          <small>{tv('afterBlog')}</small>
          <h3>{t('blogLink1Title')}</h3>
          <p>{tv('afterBlogDesc')}</p>
          <span className={s.linkMeta}>{tc('read')} <Icon name="arrow" /></span>
        </Link>
        <Link className={s.linkCard} href={withLocale(locale, '/toolkit/delivery-calc')}>
          <small>{tv('afterNext')}</small>
          <h3>{tt('delivery-calc.t')}</h3>
          <p>{tv('afterDeliveryDesc')}</p>
          <span className={s.linkMeta}>{tc('openTool')} <Icon name="arrow" /></span>
        </Link>
        <Link className={s.linkCard} href={withLocale(locale, '/toolkit/menu-matrix')}>
          <small>{tv('afterThen')}</small>
          <h3>{tt('menu-matrix.t')}</h3>
          <p>{tv('afterMenuDesc')}</p>
          <span className={s.linkMeta}>{tc('openTool')} <Icon name="arrow" /></span>
        </Link>
      </div>
      {/* Education */}
      <div className="mb-10">
        <div className="text-center mb-8"><h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">{t('educationTitle')} <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t('educationTitleAccent')}</span></h2><p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">{t('educationSubtitle')}</p></div>
        <div className="grid md:grid-cols-3 gap-5">
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4"><div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0"><Info size={15} className="text-emerald-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('whatIsFoodCostTitle')}</h3></div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">{t('whatIsFoodCostBody1')} <strong className="text-slate-800">{t('whatIsFoodCostBodyBold')}</strong>{t('whatIsFoodCostBody2')}</p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-3 mt-auto"><p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('cogsFormulaTitle')}</p><div className="text-[12px] font-mono text-slate-300 space-y-0.5"><p className="text-white">{t('cogsLine1')}</p><p>{t('cogsLine2')}</p><p>{t('cogsLine3')}</p><p className="text-slate-500">{t('cogsLine4')}</p><p className="border-t border-slate-700 pt-1">{t('cogsLine5')}</p><p className="text-emerald-400 font-bold">{t('cogsLine6')}</p></div><div className="border-t border-slate-700 pt-2"><p className="text-[11px] font-mono text-white font-bold">{t('cogsPctFormula')}</p></div></div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4"><div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0"><Calculator size={15} className="text-blue-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('inventoryValuationTitle')}</h3></div>
            <p className="text-[12px] text-slate-500 mb-4">{t('inventoryValuationSubtitle')}</p>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5"><p className="text-xs font-bold text-blue-700">{t('fifoTitle')}</p><p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">{t('fifoBody')}</p></div>
              <div className="bg-white ring-1 ring-slate-200/60 rounded-xl p-3.5"><p className="text-xs font-bold text-slate-700">{t('wacTitle')}</p><p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t('wacBody')}</p></div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-3.5"><p className="text-xs font-bold text-red-700">{t('lastPurchaseTitle')}</p><p className="text-[11px] text-red-600/80 mt-1 leading-relaxed">{t('lastPurchaseBody')}</p></div>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4"><div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0"><AlertTriangle size={15} className="text-amber-600" /></div><h3 className="text-sm font-bold text-slate-900">{t('trimLossTitle')}</h3></div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">{t('trimLossBody1')} <strong className="text-slate-800">{t('trimLossBodyBold')}</strong> {t('trimLossBody2')}</p>
            <div className="bg-white ring-1 ring-amber-200/60 rounded-xl p-4 mt-auto"><p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3">{t('trimLossExamplesTitle')}</p><div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]"><span className="text-slate-600">{t('trimEx1Label')}: <strong className="text-slate-800">{t('trimEx1Value')}</strong></span><span className="text-slate-600">{t('trimEx2Label')}: <strong className="text-slate-800">{t('trimEx2Value')}</strong></span><span className="text-slate-600">{t('trimEx3Label')}: <strong className="text-slate-800">{t('trimEx3Value')}</strong></span><span className="text-slate-600">{t('trimEx4Label')}: <strong className="text-slate-800">{t('trimEx4Value')}</strong></span><span className="text-slate-600">{t('trimEx5Label')}: <strong className="text-slate-800">{t('trimEx5Value')}</strong></span><span className="text-slate-600">{t('trimEx6Label')}: <strong className="text-slate-800">{t('trimEx6Value')}</strong></span></div></div>
          </div>
        </div>
      </div>

      {/* 4 Factors */}
      <div className="mb-10"><div className="text-center mb-8"><h2 className="text-2xl font-display font-black text-slate-900 tracking-tight">{t('factorsTitle')} <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t('factorsTitleAccent')}</span></h2><p className="text-slate-500 mt-2 max-w-lg mx-auto text-sm">{t('factorsSubtitle')}</p></div>
        <div className="grid sm:grid-cols-2 gap-5">{fourFactors.map((f, i) => { const Icon = f.icon; return (<div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 hover:shadow-lg transition-all"><div className="flex items-center gap-3 mb-4"><div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center`}><Icon size={18} className={f.color} /></div><h3 className="text-base font-bold text-slate-900">{f.title}</h3></div><p className="text-sm text-slate-600 leading-relaxed">{f.content}</p></div>); })}</div>
      </div>

      {/* CTA + Blog */}
      <div className="grid md:grid-cols-2 gap-5 mb-10">
        <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 relative overflow-hidden"><div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px]" /><div className="relative"><div className="flex items-center gap-2.5 mb-4"><div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center"><Lightbulb size={16} className="text-amber-400" /></div><h3 className="text-base font-bold text-amber-400">{t('dkAdviceLabel')}</h3></div><p className="text-[13px] text-slate-400 leading-relaxed mb-5">{t('dkAdviceBody1')} <strong className="text-white">{t('dkAdviceBodyBold')}</strong> {t('dkAdviceBody2')}</p><Link href={withLocale(locale, '/blog/1-porsiya-food-cost-hesablama')} className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 group">{t('readArticle')} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" /></Link></div></div>
        <div className="rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between"><div><h3 className="text-xl font-display font-black mb-3">{t('ocaqTitle')}</h3><p className="text-sm text-white/80 leading-relaxed mb-6">{t('ocaqBody')}</p></div><Link href={withLocale(locale, '/auth/register')} className="flex items-center justify-center gap-2 w-full bg-white text-[var(--dk-red)] py-3.5 rounded-xl font-black text-sm hover:shadow-lg active:scale-[0.98]">{t('ocaqCta')} <ArrowRight size={15} /></Link></div>
      </div>

      <div className="rounded-2xl bg-slate-50 p-8 sm:p-10"><div className="flex items-center gap-2.5 mb-8"><BookOpen size={18} className="text-[var(--dk-red)]" /><h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3></div>
        <div className="grid sm:grid-cols-3 gap-4">{blogLinks.map((a) => (<Link key={a.slug} href={withLocale(locale, `/blog/${a.slug}`)} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md transition-all"><span className="text-[10px] font-bold text-[var(--dk-red)] uppercase tracking-widest">{a.tag}</span><h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[var(--dk-red)]">{a.title}</h4><div className="flex items-center gap-1 text-xs text-slate-600 font-semibold mt-4 group-hover:text-[var(--dk-red)]">{t('readLabel')} <ArrowRight size={12} /></div></Link>))}</div>
      </div>
    </>
  );

  return (
    <ToolkitStudioLayout toolId="food-cost" toolName={t('title')} toolDescription={t('subtitle')} tier="sagird"
      inputSection={inputSection} resultSection={resultSection} bottomSection={bottomSection}
      resultSummary={ready ? <span className={statusClass}><span className={s.rsPct} style={{ fontSize: 'inherit', margin: 0 }}>{pctText}</span> · <span className={s.stPill}>{statusLabel}</span></span> : undefined}
      headerAside={headerAside}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'food-cost', locale, result: { foodCostPct: calc.pct, portionCost: calc.perPortion, grossProfit: calc.gross, idealPrice: calc.ideal, menuPrice } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
