'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import {
  Calculator,
  ChevronLeft,
  AlertTriangle,
  Database,
  Info,
  ShoppingCart,
  Tag,
  PieChart,
  Shield,
  ArrowRight,
  RotateCcw,
  Lightbulb,
  BookOpen,
  Plus,
  X,
} from 'lucide-react';

const UNITS = ['kq', 'qr', 'litr', 'ml', 'ədəd'];

// ── Product Price Suggestion ────────────────────────────────────────

interface PriceSuggestion {
  name: string;
  unit: string;
  avgUnitPrice: number; // qəpiklə
  minUnitPrice: number;
  maxUnitPrice: number;
  occurrences: number;
}

function useProductLookup() {
  const [suggestions, setSuggestions] = useState<PriceSuggestion[]>([]);
  const [activeIngId, setActiveIngId] = useState<string | null>(null);
  const [hasInvoiceData, setHasInvoiceData] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch('/api/food-cost?type=lookup&limit=1')
      .then((r) => r.json())
      .then((json: { data?: PriceSuggestion[] }) => {
        if (json.data && json.data.length > 0) setHasInvoiceData(true);
      })
      .catch(() => { /* ignore */ });
  }, []);

  const search = useCallback((query: string, ingId: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.length < 2) { setSuggestions([]); setActiveIngId(null); return; }

    setActiveIngId(ingId);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/food-cost?type=lookup&q=${encodeURIComponent(query)}&limit=5`);
        const json = (await res.json()) as { data: PriceSuggestion[] };
        setSuggestions(json.data ?? []);
      } catch {
        setSuggestions([]);
      }
    }, 300);
  }, []);

  const clear = useCallback(() => {
    setSuggestions([]);
    setActiveIngId(null);
  }, []);

  return { suggestions, activeIngId, hasInvoiceData, search, clear };
}

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  trimLoss: number;
}

export default function FoodCostCalculator() {
  const t = useTranslations('toolkit.foodCost');

  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: t('defaultIng1Name'), quantity: 0.25, unit: 'kq', pricePerUnit: 9.5, trimLoss: 5 },
    { id: '2', name: t('defaultIng2Name'), quantity: 0.03, unit: 'litr', pricePerUnit: 12, trimLoss: 0 },
    { id: '3', name: t('defaultIng3Name'), quantity: 0.15, unit: 'kq', pricePerUnit: 4.5, trimLoss: 0 },
  ]);
  const [menuPrice, setMenuPrice] = useState<number>(18);
  const [portions, setPortions] = useState<number>(1);
  const [targetFoodCost, setTargetFoodCost] = useState<number>(32);
  const { suggestions, activeIngId, hasInvoiceData, search, clear } = useProductLookup();

  const fourFactors = [
    {
      icon: ShoppingCart,
      title: t('factor1Title'),
      color: 'text-blue-600',
      iconBg: 'bg-blue-100',
      content: t('factor1Content'),
    },
    {
      icon: Tag,
      title: t('factor2Title'),
      color: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      content: t('factor2Content'),
    },
    {
      icon: PieChart,
      title: t('factor3Title'),
      color: 'text-amber-600',
      iconBg: 'bg-amber-100',
      content: t('factor3Content'),
    },
    {
      icon: Shield,
      title: t('factor4Title'),
      color: 'text-red-600',
      iconBg: 'bg-red-100',
      content: t('factor4Content'),
    },
  ];

  const blogLinks = [
    { title: t('blogLink1Title'), slug: '1-porsiya-food-cost-hesablama', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), slug: 'pnl-oxuya-bilmirsen', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), slug: 'menyu-muhendisliyi-satis', tag: t('blogLink3Tag') },
  ];

  const applySuggestion = (ingId: string, sug: PriceSuggestion) => {
    setIngredients((prev) =>
      prev.map((i) =>
        i.id === ingId
          ? { ...i, name: sug.name, unit: sug.unit, pricePerUnit: sug.avgUnitPrice / 100 }
          : i,
      ),
    );
    clear();
  };

  const calc = useMemo(() => {
    const totalRaw = ingredients.reduce((sum, ing) => {
      return sum + ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit;
    }, 0);
    const perPortion = totalRaw / (portions || 1);
    const pct = menuPrice > 0 ? (perPortion / menuPrice) * 100 : 0;
    const gross = menuPrice - perPortion;
    const ideal = targetFoodCost > 0 ? perPortion / (targetFoodCost / 100) : 0;
    const status: 'good' | 'warning' | 'danger' = pct > 35 ? 'danger' : pct > 30 ? 'warning' : 'good';
    return { totalRaw, perPortion, pct, gross, ideal, status };
  }, [ingredients, menuPrice, portions, targetFoodCost]);

  const addIngredient = () => {
    setIngredients([...ingredients, { id: Date.now().toString(), name: '', quantity: 0, unit: 'kq', pricePerUnit: 0, trimLoss: 0 }]);
  };

  const removeIngredient = (id: string) => {
    if (ingredients.length > 1) setIngredients(ingredients.filter((i) => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(ingredients.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const resetAll = () => {
    setIngredients([{ id: '1', name: '', quantity: 0, unit: 'kq', pricePerUnit: 0, trimLoss: 0 }]);
    setMenuPrice(0);
    setPortions(1);
    setTargetFoodCost(32);
  };

  const ss = {
    good: { ring: 'ring-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', label: t('statusGood') },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-600', bg: 'bg-amber-50', label: t('statusWarning') },
    danger: { ring: 'ring-red-500/20', text: 'text-red-600', bg: 'bg-red-50', label: t('statusDanger') },
  }[calc.status];

  return (
    <div className="bg-white pb-24">

      {/* ═══════════════════ HERO ═══════════════════ */}
      <div className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-emerald-500/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-[-30%] left-[-5%] w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[80px]" />
        </div>
        <div className="relative max-w-6xl mx-auto px-6 pt-8 pb-20">
          <Link href="/toolkit" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-sm transition-colors mb-8 group">
            <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
            <span>{t('navigation.toolkit')}</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.1] mb-5">
              {t('title')}<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">{t('titleAccent')}</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              {t('subtitle')}
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════ KPI STRIP ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${ss.bg} rounded-2xl p-5 ring-1 ${ss.ring}`}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">{t('statFoodCost')}</div>
            <div className={`text-3xl font-black ${ss.text} tabular-nums`}>{calc.pct.toFixed(1)}%</div>
            <div className={`text-xs font-semibold ${ss.text} mt-1 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {ss.label}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('statPortionCost')}</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.perPortion.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('statGrossProfit')}</div>
            <div className="text-3xl font-black text-emerald-600 tabular-nums">{calc.gross.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">{t('statIdealPrice')}</div>
            <div className="text-3xl font-black text-blue-600 tabular-nums">{calc.ideal.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
            <div className="text-[10px] text-slate-400 mt-1">{t('statIdealPriceHint', { pct: targetFoodCost })}</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ KALKULYATOR — FULL WIDTH ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">

        {/* Resept Kartı */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <h2 className="text-base font-bold text-slate-900">{t('recipeCardTitle')}</h2>
              {hasInvoiceData && (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 ring-1 ring-emerald-200/60">
                  <Database size={10} /> {t('invoiceDataActive')}
                </span>
              )}
            </div>
            <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
              <RotateCcw size={13} /> {t('reset')}
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left">{t('colProduct')}</th>
                  <th className="px-3 py-3 text-center w-[100px]">{t('colQuantity')}</th>
                  <th className="px-3 py-3 text-center w-[90px]">{t('colUnit')}</th>
                  <th className="px-3 py-3 text-center w-[110px]">{t('colPricePerUnit')}</th>
                  <th className="px-3 py-3 text-center w-[80px]">{t('colTrimPct')}</th>
                  <th className="px-3 py-3 text-right w-[100px]">{t('colTotal')}</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.map((ing) => {
                  const total = ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit;
                  return (
                    <tr key={ing.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="relative px-5 py-3">
                        <input
                          type="text"
                          value={ing.name}
                          onChange={(e) => {
                            updateIngredient(ing.id, 'name', e.target.value);
                            if (hasInvoiceData) search(e.target.value, ing.id);
                          }}
                          onBlur={() => setTimeout(clear, 200)}
                          className="w-full bg-transparent text-slate-900 font-medium outline-none placeholder:text-slate-300"
                          placeholder={t('productNamePlaceholder')}
                        />
                        {activeIngId === ing.id && suggestions.length > 0 && (
                          <div className="absolute left-4 top-full z-20 mt-1 w-72 rounded-xl border border-slate-200 bg-white shadow-xl">
                            {suggestions.map((sug) => (
                              <button
                                key={`${sug.name}-${sug.unit}`}
                                type="button"
                                onMouseDown={() => applySuggestion(ing.id, sug)}
                                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-emerald-50 first:rounded-t-xl last:rounded-b-xl"
                              >
                                <div>
                                  <span className="font-medium text-slate-800">{sug.name}</span>
                                  <span className="ml-1 text-xs text-slate-400">({sug.unit})</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-semibold text-emerald-600">{(sug.avgUnitPrice / 100).toFixed(2)} ₼</span>
                                  <span className="ml-1 text-[10px] text-slate-400">×{sug.occurrences}</span>
                                </div>
                              </button>
                            ))}
                            <div className="border-t border-slate-100 px-3 py-1.5 text-[10px] text-slate-400">
                              <Database size={10} className="mr-1 inline" />
                              {t('invoiceDataHint')}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" step="0.01" value={ing.quantity || ''} onChange={(e) => updateIngredient(ing.id, 'quantity', parseFloat(e.target.value) || 0)} className="w-full text-center bg-slate-100/80 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-shadow" />
                      </td>
                      <td className="px-3 py-3">
                        <select value={ing.unit} onChange={(e) => updateIngredient(ing.id, 'unit', e.target.value)} className="w-full text-center bg-slate-100/80 rounded-lg px-1 py-1.5 text-sm outline-none cursor-pointer">
                          {UNITS.map((u) => (<option key={u} value={u}>{u}</option>))}
                        </select>
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" step="0.01" value={ing.pricePerUnit || ''} onChange={(e) => updateIngredient(ing.id, 'pricePerUnit', parseFloat(e.target.value) || 0)} className="w-full text-center bg-slate-100/80 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-shadow" />
                      </td>
                      <td className="px-3 py-3">
                        <input type="number" step="1" min="0" max="100" value={ing.trimLoss || ''} onChange={(e) => updateIngredient(ing.id, 'trimLoss', parseFloat(e.target.value) || 0)} className="w-full text-center bg-slate-100/80 rounded-lg px-2 py-1.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500/30 transition-shadow" />
                      </td>
                      <td className="px-3 py-3 text-right font-semibold text-slate-900 tabular-nums">{total.toFixed(2)} ₼</td>
                      <td className="pr-4 py-3">
                        <button onClick={() => removeIngredient(ing.id)} className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-all">
                          <X size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-slate-200 bg-slate-50/80">
                  <td colSpan={5} className="px-5 py-4 font-bold text-slate-900 text-sm">{t('totalFoodCost')}</td>
                  <td className="px-3 py-4 text-right font-black text-slate-900 tabular-nums">{calc.totalRaw.toFixed(2)} ₼</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={addIngredient} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              <Plus size={15} /> {t('addIngredient')}
            </button>
          </div>
        </div>

        {/* Parametrlər + Sektor Standartları — yan-yana */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Parametrlər */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">{t('parametersTitle')}</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t('labelMenuPrice')}</label>
                <input type="number" step="0.5" value={menuPrice || ''} onChange={(e) => setMenuPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t('labelPortions')}</label>
                <input type="number" min="1" value={portions || ''} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">{t('labelTargetFoodCost')}</label>
                <input type="number" min="1" max="100" value={targetFoodCost || ''} onChange={(e) => setTargetFoodCost(parseFloat(e.target.value) || 32)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
            </div>
          </div>

          {/* Sektor Standartları */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">{t('sectorStandardsTitle')}</h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-emerald-50 rounded-xl p-3 text-center ring-1 ring-emerald-200/60">
                <div className="text-xl font-black text-emerald-600">28-32%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">{t('sectorRestaurant')}</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center ring-1 ring-blue-200/60">
                <div className="text-xl font-black text-blue-600">22-28%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">{t('sectorFastFood')}</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center ring-1 ring-purple-200/60">
                <div className="text-xl font-black text-purple-600">35-40%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">{t('sectorFineDining')}</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-lg px-3 py-2">🥩 <strong>Prime Cost</strong> ≤65%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">💰 <strong>{t('netProfitLabel')}</strong> 10-15%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">👨‍🍳 <strong>Labor cost</strong> 25-35%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">🏠 <strong>{t('rentLabel')}</strong> ≤10%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ BİLİK PANELİ — 3 SÜTUN ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            {t('educationTitle')} <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t('educationTitleAccent')}</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">{t('educationSubtitle')}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Food Cost Nədir + COGS */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('whatIsFoodCostTitle')}</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              {t('whatIsFoodCostBody1')} <strong className="text-slate-800">{t('whatIsFoodCostBodyBold')}</strong>{t('whatIsFoodCostBody2')}
            </p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-3 mt-auto">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('cogsFormulaTitle')}</p>
              <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
                <p className="text-white">{t('cogsLine1')}</p>
                <p>{t('cogsLine2')}</p>
                <p>{t('cogsLine3')}</p>
                <p className="text-slate-500">{t('cogsLine4')}</p>
                <p className="border-t border-slate-700 pt-1">{t('cogsLine5')}</p>
                <p className="text-emerald-400 font-bold">{t('cogsLine6')}</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="text-[11px] font-mono text-white font-bold">{t('cogsPctFormula')}</p>
              </div>
            </div>
          </div>

          {/* İnventar Qiymətləndirmə */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Calculator size={15} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('inventoryValuationTitle')}</h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">{t('inventoryValuationSubtitle')}</p>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-700">{t('fifoTitle')}</p>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">{t('fifoBody')}</p>
              </div>
              <div className="bg-white ring-1 ring-slate-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-slate-700">{t('wacTitle')}</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">{t('wacBody')}</p>
              </div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-red-700">{t('lastPurchaseTitle')}</p>
                <p className="text-[11px] text-red-600/80 mt-1 leading-relaxed">{t('lastPurchaseBody')}</p>
              </div>
            </div>
          </div>

          {/* Trim Loss */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">{t('trimLossTitle')}</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              {t('trimLossBody1')} <strong className="text-slate-800">{t('trimLossBodyBold')}</strong> {t('trimLossBody2')}
            </p>
            <div className="bg-white ring-1 ring-amber-200/60 rounded-xl p-4 mt-auto">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3">{t('trimLossExamplesTitle')}</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <span className="text-slate-600">{t('trimEx1Label')}: <strong className="text-slate-800">{t('trimEx1Value')}</strong></span>
                <span className="text-slate-600">{t('trimEx2Label')}: <strong className="text-slate-800">{t('trimEx2Value')}</strong></span>
                <span className="text-slate-600">{t('trimEx3Label')}: <strong className="text-slate-800">{t('trimEx3Value')}</strong></span>
                <span className="text-slate-600">{t('trimEx4Label')}: <strong className="text-slate-800">{t('trimEx4Value')}</strong></span>
                <span className="text-slate-600">{t('trimEx5Label')}: <strong className="text-slate-800">{t('trimEx5Value')}</strong></span>
                <span className="text-slate-600">{t('trimEx6Label')}: <strong className="text-slate-800">{t('trimEx6Value')}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ DK + OCAQ — YAN-YANA ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-10">
        <div className="grid md:grid-cols-2 gap-5">
          {/* DK Məsləhət */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-950 to-slate-900 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-[50px]" />
            <div className="relative">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-lg bg-amber-500/20 flex items-center justify-center">
                  <Lightbulb size={16} className="text-amber-400" />
                </div>
                <h3 className="text-base font-bold text-amber-400">{t('dkAdviceLabel')}</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                {t('dkAdviceBody1')} <strong className="text-white">{t('dkAdviceBodyBold')}</strong> {t('dkAdviceBody2')}
              </p>
              <Link href="/blog/1-porsiya-food-cost-hesablama" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                {t('readArticle')} <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OCAQ CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">{t('ocaqTitle')}</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                {t('ocaqBody')}
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[var(--dk-red)] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              {t('ocaqCta')} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════ 4 FAKTOR ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            {t('factorsTitle')} <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">{t('factorsTitleAccent')}</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">{t('factorsSubtitle')}</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {fourFactors.map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="bg-white rounded-2xl ring-1 ring-slate-200/60 p-6 hover:shadow-lg hover:ring-slate-300/60 transition-all duration-300">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl ${f.iconBg} flex items-center justify-center`}>
                    <Icon size={18} className={f.color} />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{f.title}</h3>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{f.content}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════ ƏLAQƏLI YAZILAR ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-20">
        <div className="bg-slate-50 rounded-2xl p-8 sm:p-10">
          <div className="flex items-center gap-2.5 mb-8">
            <BookOpen size={18} className="text-[var(--dk-red)]" />
            <h3 className="text-lg font-bold text-slate-900">{t('learnMoreTitle')}</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {blogLinks.map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300/60 transition-all duration-300">
                <span className="text-[10px] font-bold text-[var(--dk-red)] uppercase tracking-widest">{a.tag}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[var(--dk-red)] transition-colors">{a.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mt-4 group-hover:text-[var(--dk-red)] group-hover:gap-2 transition-all">
                  {t('readLabel')} <ArrowRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
