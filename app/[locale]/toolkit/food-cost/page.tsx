'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Calculator,
  ChevronLeft,
  AlertTriangle,
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

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  trimLoss: number;
}

const FOUR_FACTORS = [
  {
    icon: ShoppingCart,
    title: 'Alış Qiyməti',
    color: 'text-blue-600',
    iconBg: 'bg-blue-100',
    content:
      'Çiy məhsulları almaq üçün ödədiyiniz maliyyət. Satınalma sizin nəzarətinizdədir: pazara gedin, firmaların alternativlərini araşdırın, eyni keyfiyyətdə daha ucuz tədarükçü tapın. İGİÇ (İlk Girən İlk Çıxar) prinsipini tətbiq edin — köhnə mal əvvəl istifadə olunmalıdır. Həftəlik qiymət müqayisəsi aparın.',
  },
  {
    icon: Tag,
    title: 'Satış Qiyməti',
    color: 'text-emerald-600',
    iconBg: 'bg-emerald-100',
    content:
      'Resept çıxmadan, maya dəyəri hesablanmadan satış qiyməti qoymaq olmaz. Əvvəlcə food cost-u hesabla, sonra hədəf faizinə görə qiymət müəyyən et. "Rəqib nə yazıb" prinsipi ilə qiymət qoymaq ən böyük xətadır. Düzgün yol: maya dəyəri × hədəf çarpan = satış qiyməti.',
  },
  {
    icon: PieChart,
    title: 'Məhsul Dağılımı (Product Mix)',
    color: 'text-amber-600',
    iconBg: 'bg-amber-100',
    content:
      'Eyni qiymətə eyni məhsulu satırsan, amma maliyyət fərqlidir — niyə? Biri karlı məhsul (Ulduz) satır, digəri karsız (İt). Müştəriyə, ekipə, yerə görə dəyişir. Həll: menyu mühəndisliyi ilə Ulduz məhsulları önerili satışa çıxar, İt məhsulları ya dəyiş ya sil.',
  },
  {
    icon: Shield,
    title: 'Restoran Nəzarəti',
    color: 'text-red-600',
    iconBg: 'bg-red-100',
    content:
      'Reseptlər, personal yeməyi, zay məhsul, ikramlar, kassa kəsrləri — hamısı nəzarət altında olmalıdır. İGİÇ prinsipi tətbiq edin — köhnə mal əvvəl istifadə olunsun. Ət ən dəyərli itki mənbəyidir — ondan başlayın. Zay inventar sayımlarını həftəlik aparın, fərq hesabatı ilə müqayisə edin.',
  },
];

export default function FoodCostCalculator() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: 'Toyuq filesi', quantity: 0.25, unit: 'kq', pricePerUnit: 9.5, trimLoss: 5 },
    { id: '2', name: 'Zeytun yağı', quantity: 0.03, unit: 'litr', pricePerUnit: 12, trimLoss: 0 },
    { id: '3', name: 'Basmati düyü', quantity: 0.15, unit: 'kq', pricePerUnit: 4.5, trimLoss: 0 },
  ]);
  const [menuPrice, setMenuPrice] = useState<number>(18);
  const [portions, setPortions] = useState<number>(1);
  const [targetFoodCost, setTargetFoodCost] = useState<number>(32);

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
    good: { ring: 'ring-emerald-500/20', text: 'text-emerald-600', bg: 'bg-emerald-50', label: 'Optimal' },
    warning: { ring: 'ring-amber-500/20', text: 'text-amber-600', bg: 'bg-amber-50', label: 'Diqqət' },
    danger: { ring: 'ring-red-500/20', text: 'text-red-600', bg: 'bg-red-50', label: 'Yüksək' },
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
            <span>Toolkit</span>
          </Link>
          <div className="max-w-2xl">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-[1.1] mb-5">
              Food Cost<br />
              <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Kalkulyator</span>
            </h1>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg">
              Resept kartı yarat, trim loss daxil et, porsiya maya dəyərini hesabla. Real food cost — göz ölçüsü yox.
            </p>
          </div>
        </div>
      </div>

      {/* ═══════════════════ KPI STRIP ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 -mt-10 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className={`${ss.bg} rounded-2xl p-5 ring-1 ${ss.ring}`}>
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">Food Cost</div>
            <div className={`text-3xl font-black ${ss.text} tabular-nums`}>{calc.pct.toFixed(1)}%</div>
            <div className={`text-xs font-semibold ${ss.text} mt-1 flex items-center gap-1`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current" />
              {ss.label}
            </div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Porsiya Maya</div>
            <div className="text-3xl font-black text-slate-900 tabular-nums">{calc.perPortion.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Qross Mənfəət</div>
            <div className="text-3xl font-black text-emerald-600 tabular-nums">{calc.gross.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
          </div>
          <div className="bg-white rounded-2xl p-5 ring-1 ring-slate-200/60 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">İdeal Qiymət</div>
            <div className="text-3xl font-black text-blue-600 tabular-nums">{calc.ideal.toFixed(2)}<span className="text-lg ml-1">₼</span></div>
            <div className="text-[10px] text-slate-400 mt-1">hədəf {targetFoodCost}%</div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ KALKULYATOR — FULL WIDTH ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-10 space-y-6">

        {/* Resept Kartı */}
        <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 overflow-hidden">
          <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Resept Kartı</h2>
            <button onClick={resetAll} className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-red-500 transition-colors">
              <RotateCcw size={13} /> Sıfırla
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100 bg-slate-50/60">
                  <th className="px-5 py-3 text-left">Məhsul</th>
                  <th className="px-3 py-3 text-center w-[100px]">Miqdar</th>
                  <th className="px-3 py-3 text-center w-[90px]">Vahid</th>
                  <th className="px-3 py-3 text-center w-[110px]">₼/vahid</th>
                  <th className="px-3 py-3 text-center w-[80px]">Trim %</th>
                  <th className="px-3 py-3 text-right w-[100px]">Cəm</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {ingredients.map((ing) => {
                  const total = ing.quantity * (1 + ing.trimLoss / 100) * ing.pricePerUnit;
                  return (
                    <tr key={ing.id} className="group hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3">
                        <input type="text" value={ing.name} onChange={(e) => updateIngredient(ing.id, 'name', e.target.value)} className="w-full bg-transparent text-slate-900 font-medium outline-none placeholder:text-slate-300" placeholder="Məhsul adı" />
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
                  <td colSpan={5} className="px-5 py-4 font-bold text-slate-900 text-sm">Cəm ərzaq xərci</td>
                  <td className="px-3 py-4 text-right font-black text-slate-900 tabular-nums">{calc.totalRaw.toFixed(2)} ₼</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-slate-100">
            <button onClick={addIngredient} className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition-colors">
              <Plus size={15} /> Əlavə et
            </button>
          </div>
        </div>

        {/* Parametrlər + Sektor Standartları — yan-yana */}
        <div className="grid lg:grid-cols-[1fr_1fr] gap-6">
          {/* Parametrlər */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Parametrlər</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Menyu qiyməti (₼)</label>
                <input type="number" step="0.5" value={menuPrice || ''} onChange={(e) => setMenuPrice(parseFloat(e.target.value) || 0)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Porsiya sayı</label>
                <input type="number" min="1" value={portions || ''} onChange={(e) => setPortions(parseInt(e.target.value) || 1)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 mb-1.5 block">Hədəf food cost %</label>
                <input type="number" min="1" max="100" value={targetFoodCost || ''} onChange={(e) => setTargetFoodCost(parseFloat(e.target.value) || 32)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 font-semibold text-slate-900 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300 transition-all" />
              </div>
            </div>
          </div>

          {/* Sektor Standartları */}
          <div className="bg-white rounded-2xl ring-1 ring-slate-200/80 shadow-lg shadow-slate-200/40 p-6">
            <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-5">Sektor Standartları</h3>
            <div className="grid grid-cols-3 gap-4 mb-5">
              <div className="bg-emerald-50 rounded-xl p-3 text-center ring-1 ring-emerald-200/60">
                <div className="text-xl font-black text-emerald-600">28-32%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Restoran / Kafe</div>
              </div>
              <div className="bg-blue-50 rounded-xl p-3 text-center ring-1 ring-blue-200/60">
                <div className="text-xl font-black text-blue-600">22-28%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Fast Food</div>
              </div>
              <div className="bg-purple-50 rounded-xl p-3 text-center ring-1 ring-purple-200/60">
                <div className="text-xl font-black text-purple-600">35-40%</div>
                <div className="text-[11px] text-slate-500 font-medium mt-1">Fine Dining</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="bg-slate-50 rounded-lg px-3 py-2">🥩 <strong>Prime Cost</strong> ≤65%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">💰 <strong>Net mənfəət</strong> 10-15%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">👨‍🍳 <strong>Labor cost</strong> 25-35%</div>
              <div className="bg-slate-50 rounded-lg px-3 py-2">🏠 <strong>İcarə</strong> ≤10%</div>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════ BİLİK PANELİ — 3 SÜTUN ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-display font-black text-slate-900 tracking-tight">
            Food Cost-u <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Anlamaq</span>
          </h2>
          <p className="text-slate-500 mt-2 max-w-md mx-auto text-sm">Hesablamadan əvvəl, arxasındakı məntiqi bil.</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {/* Food Cost Nədir + COGS */}
          <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-white ring-1 ring-slate-200/60 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                <Info size={15} className="text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Food Cost Nədir?</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              Restoranın satdığı yeməklərin <strong className="text-slate-800">ərzaq maya dəyəridir.</strong> İşçi maaşı, icarə, kommunal bura daxil deyil — yalnız boşqaba düşən materialın dəyəri.
            </p>
            <div className="bg-slate-900 rounded-xl p-4 space-y-3 mt-auto">
              <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Tam COGS Formulu</p>
              <div className="text-[12px] font-mono text-slate-300 space-y-0.5">
                <p className="text-white">Açılış İnventarı</p>
                <p>+ Dövr ərzində alışlar</p>
                <p>− İadələr</p>
                <p className="text-slate-500">= Əlçatan mal</p>
                <p className="border-t border-slate-700 pt-1">− Bağlanış İnventarı</p>
                <p className="text-emerald-400 font-bold">= İstifadə (COGS)</p>
              </div>
              <div className="border-t border-slate-700 pt-2">
                <p className="text-[11px] font-mono text-white font-bold">Food Cost % = COGS ÷ Satış × 100</p>
              </div>
            </div>
          </div>

          {/* İnventar Qiymətləndirmə */}
          <div className="rounded-2xl bg-gradient-to-br from-blue-50/60 to-white ring-1 ring-blue-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
                <Calculator size={15} className="text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">İnventar Qiymətləndirmə</h3>
            </div>
            <p className="text-[12px] text-slate-500 mb-4">Eyni malı fərqli qiymətə aldın — hansı qiymətlə hesablayacaqsan?</p>
            <div className="space-y-2.5 mt-auto">
              <div className="bg-blue-50 ring-1 ring-blue-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-blue-700">İGİÇ (FIFO) — Məsləhət edilir</p>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">İlk girən ilk çıxar. Köhnə qiymətdən hesablanır. Restoranlar üçün ən dəqiq üsul.</p>
              </div>
              <div className="bg-white ring-1 ring-slate-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-slate-700">WAC (Orta Çəkili Maya)</p>
                <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">Ümumi dəyər ÷ mal sayı = orta maya. Sadədir, amma qiymət dəyişikliyi zamanı tam göstərmir.</p>
              </div>
              <div className="bg-red-50 ring-1 ring-red-200/60 rounded-xl p-3.5">
                <p className="text-xs font-bold text-red-700">Son alış qiyməti — Yanıltıcı</p>
                <p className="text-[11px] text-red-600/80 mt-1 leading-relaxed">Paçal alınıbsa yüksək göstərər. Köhnə malı yeni qiymətdən hesablamaq food cost-u təhrif edir.</p>
              </div>
            </div>
          </div>

          {/* Trim Loss */}
          <div className="rounded-2xl bg-gradient-to-br from-amber-50/80 to-white ring-1 ring-amber-200/40 p-6 flex flex-col">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
                <AlertTriangle size={15} className="text-amber-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Trim Loss Nədir?</h3>
            </div>
            <p className="text-[13px] text-slate-600 leading-relaxed mb-5">
              1 kq toyuqdan təmizlədikdən sonra <strong className="text-slate-800">850qr</strong> istifadə olunur — 15% trim loss. Bu, real maya dəyərini artırır.
            </p>
            <div className="bg-white ring-1 ring-amber-200/60 rounded-xl p-4 mt-auto">
              <p className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mb-3">Nümunə trim loss faizləri</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
                <span className="text-slate-600">Toyuq filesi: <strong className="text-slate-800">5–8%</strong></span>
                <span className="text-slate-600">Bütöv toyuq: <strong className="text-slate-800">35–40%</strong></span>
                <span className="text-slate-600">Mal əti: <strong className="text-slate-800">15–25%</strong></span>
                <span className="text-slate-600">Balıq filesi: <strong className="text-slate-800">40–55%</strong></span>
                <span className="text-slate-600">Tərəvəz: <strong className="text-slate-800">10–20%</strong></span>
                <span className="text-slate-600">Soğan/sarımsaq: <strong className="text-slate-800">10–15%</strong></span>
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
                <h3 className="text-base font-bold text-amber-400">DK Agency Məsləhəti</h3>
              </div>
              <p className="text-[13px] text-slate-400 leading-relaxed mb-5">
                Azərbaycanda restoranların <strong className="text-white">90%-i</strong> food cost-u bilmədən işləyir. POS sistemi ilə İGİÇ prinsipini tətbiq edin, hər şeyi nəzarətdə saxlayın.
              </p>
              <Link href="/blog/1-porsiya-food-cost-hesablama" className="inline-flex items-center gap-2 text-sm font-bold text-amber-400 hover:text-amber-300 transition-colors group">
                Tam yazını oxu <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* OCAQ CTA */}
          <div className="rounded-2xl bg-gradient-to-br from-[var(--dk-red)] to-[var(--dk-red-strong)] p-8 text-white shadow-xl shadow-red-500/15 flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-display font-black mb-3">OCAQ Panel</h3>
              <p className="text-sm text-white/80 leading-relaxed mb-6">
                Bütün reseptləri saxla, avtomatik food cost hesabla, İGİÇ ilə inventar izlə. Real-time maliyyət nəzarəti.
              </p>
            </div>
            <Link href="/auth/register" className="flex items-center justify-center gap-2 w-full bg-white text-[var(--dk-red)] py-3.5 rounded-xl font-black text-sm hover:shadow-lg transition-all active:scale-[0.98]">
              Pulsuz başla <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      {/* ═══════════════════ 4 FAKTOR ═══════════════════ */}
      <div className="max-w-6xl mx-auto px-6 mt-24 scroll-mt-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-display font-black text-slate-900 tracking-tight">
            Food Cost-a Təsir Edən <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">4 Faktor</span>
          </h2>
          <p className="text-slate-500 mt-3 max-w-lg mx-auto">Bu faktorlar dəyişdiyi üçün, food cost da restorandan restorana fərqlidir.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5">
          {FOUR_FACTORS.map((f, i) => {
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
            <h3 className="text-lg font-bold text-slate-900">Daha Dərin Öyrən</h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'Food Cost-un Qanlı Həqiqəti', slug: '1-porsiya-food-cost-hesablama', tag: 'Maliyyə' },
              { title: 'P&L Oxuya Bilmirsən?', slug: 'pnl-oxuya-bilmirsen', tag: 'Maliyyə' },
              { title: 'Menyu Mühəndisliyi: Ulduz və İt', slug: 'menyu-muhendisliyi-satis', tag: 'Əməliyyat' },
            ].map((a) => (
              <Link key={a.slug} href={`/blog/${a.slug}`} className="group block bg-white rounded-xl p-5 ring-1 ring-slate-200/60 hover:shadow-md hover:ring-slate-300/60 transition-all duration-300">
                <span className="text-[10px] font-bold text-[var(--dk-red)] uppercase tracking-widest">{a.tag}</span>
                <h4 className="text-sm font-bold text-slate-900 mt-2.5 leading-snug group-hover:text-[var(--dk-red)] transition-colors">{a.title}</h4>
                <div className="flex items-center gap-1 text-xs text-slate-400 font-semibold mt-4 group-hover:text-[var(--dk-red)] group-hover:gap-2 transition-all">
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
