'use client';

import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Download, FileSpreadsheet, Plus, RotateCcw, Trash2 } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';

type Ingredient = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  trimLoss: number;
};

type Copy = {
  title: string;
  subtitle: string;
  backToList: string;
  tier: string;
  whyTitle: string;
  why: string;
  recipeName: string;
  menuPrice: string;
  portions: string;
  targetFoodCost: string;
  ingredients: string;
  ingredient: string;
  quantity: string;
  unit: string;
  unitPrice: string;
  trimLoss: string;
  lineCost: string;
  addIngredient: string;
  reset: string;
  exportCsv: string;
  exportExcel: string;
  totalCost: string;
  costPerPortion: string;
  foodCostPercent: string;
  grossProfit: string;
  idealPrice: string;
  statusGood: string;
  statusWarning: string;
  statusDanger: string;
  notesTitle: string;
};

const copy: Record<Locale, Copy> = {
  az: {
    title: 'Yemək Xərci Kalkulyatoru',
    subtitle: 'Resept kartı qur, trim loss əlavə et, porsiya maya dəyərini dərhal gör.',
    backToList: 'Bütün alətlər',
    tier: 'ŞAGİRD',
    whyTitle: 'Niyə bu vacibdir?',
    why: 'Menyu qiyməti göz ölçüsü ilə qoyulanda marja itir. Bu alət hər məhsulu, trim loss-u və porsiya sayını hesablayıb real food cost faizini göstərir.',
    recipeName: 'Yemək adı',
    menuPrice: 'Satış qiyməti (AZN)',
    portions: 'Porsiya sayı',
    targetFoodCost: 'Hədəf food cost %',
    ingredients: 'Resept kartı',
    ingredient: 'Məhsul',
    quantity: 'Miqdar',
    unit: 'Vahid',
    unitPrice: 'Vahid qiyməti',
    trimLoss: 'Trim loss %',
    lineCost: 'Cəm',
    addIngredient: 'Məhsul əlavə et',
    reset: 'Sıfırla',
    exportCsv: 'CSV',
    exportExcel: 'Excel',
    totalCost: 'Cəm ərzaq xərci',
    costPerPortion: 'Porsiya maya',
    foodCostPercent: 'Food Cost %',
    grossProfit: 'Porsiya brüt mənfəət',
    idealPrice: 'Hədəfə görə ideal qiymət',
    statusGood: 'Sağlam',
    statusWarning: 'Diqqət',
    statusDanger: 'Yüksək risk',
    notesTitle: 'Oxuma qaydası',
  },
  en: {
    title: 'Food Cost Calculator',
    subtitle: 'Build a recipe card, include trim loss, and see portion cost instantly.',
    backToList: 'All tools',
    tier: 'STARTER',
    whyTitle: 'Why is this important?',
    why: 'Menu prices set by guesswork leak margin. This tool calculates ingredient cost, trim loss and portions to show the real food cost percentage.',
    recipeName: 'Dish name',
    menuPrice: 'Menu price (AZN)',
    portions: 'Portions',
    targetFoodCost: 'Target food cost %',
    ingredients: 'Recipe card',
    ingredient: 'Ingredient',
    quantity: 'Quantity',
    unit: 'Unit',
    unitPrice: 'Unit price',
    trimLoss: 'Trim loss %',
    lineCost: 'Total',
    addIngredient: 'Add ingredient',
    reset: 'Reset',
    exportCsv: 'CSV',
    exportExcel: 'Excel',
    totalCost: 'Total ingredient cost',
    costPerPortion: 'Cost per portion',
    foodCostPercent: 'Food Cost %',
    grossProfit: 'Gross profit per portion',
    idealPrice: 'Ideal price by target',
    statusGood: 'Healthy',
    statusWarning: 'Watch',
    statusDanger: 'High risk',
    notesTitle: 'How to read it',
  },
  tr: {
    title: 'Yemek Maliyeti Hesaplayıcı',
    subtitle: 'Reçete kartı kur, fire ekle, porsiyon maliyetini hemen gör.',
    backToList: 'Tüm araçlar',
    tier: 'ÇIRAK',
    whyTitle: 'Bu neden önemli?',
    why: 'Menü fiyatı göz kararı konulunca marj kaçar. Bu araç ürünleri, fireyi ve porsiyon sayısını hesaplayıp gerçek food cost yüzdesini gösterir.',
    recipeName: 'Yemek adı',
    menuPrice: 'Satış fiyatı (AZN)',
    portions: 'Porsiyon sayısı',
    targetFoodCost: 'Hedef food cost %',
    ingredients: 'Reçete kartı',
    ingredient: 'Ürün',
    quantity: 'Miktar',
    unit: 'Birim',
    unitPrice: 'Birim fiyatı',
    trimLoss: 'Fire %',
    lineCost: 'Toplam',
    addIngredient: 'Ürün ekle',
    reset: 'Sıfırla',
    exportCsv: 'CSV',
    exportExcel: 'Excel',
    totalCost: 'Toplam ürün maliyeti',
    costPerPortion: 'Porsiyon maliyeti',
    foodCostPercent: 'Food Cost %',
    grossProfit: 'Porsiyon brüt kar',
    idealPrice: 'Hedefe göre ideal fiyat',
    statusGood: 'Sağlıklı',
    statusWarning: 'Dikkat',
    statusDanger: 'Yüksek risk',
    notesTitle: 'Nasıl okunur?',
  },
  ru: {
    title: 'Food Cost Calculator',
    subtitle: 'Build a recipe card, include trim loss, and see portion cost instantly.',
    backToList: 'All tools',
    tier: 'STARTER',
    whyTitle: 'Why is this important?',
    why: 'Menu prices set by guesswork leak margin. This tool calculates ingredient cost, trim loss and portions to show the real food cost percentage.',
    recipeName: 'Dish name',
    menuPrice: 'Menu price (AZN)',
    portions: 'Portions',
    targetFoodCost: 'Target food cost %',
    ingredients: 'Recipe card',
    ingredient: 'Ingredient',
    quantity: 'Quantity',
    unit: 'Unit',
    unitPrice: 'Unit price',
    trimLoss: 'Trim loss %',
    lineCost: 'Total',
    addIngredient: 'Add ingredient',
    reset: 'Reset',
    exportCsv: 'CSV',
    exportExcel: 'Excel',
    totalCost: 'Total ingredient cost',
    costPerPortion: 'Cost per portion',
    foodCostPercent: 'Food Cost %',
    grossProfit: 'Gross profit per portion',
    idealPrice: 'Ideal price by target',
    statusGood: 'Healthy',
    statusWarning: 'Watch',
    statusDanger: 'High risk',
    notesTitle: 'How to read it',
  },
};

const units = ['kq', 'qr', 'litr', 'ml', 'ədəd'];

const starterIngredients: Ingredient[] = [
  { id: '1', name: 'Toyuq filesi', quantity: 0.25, unit: 'kq', unitPrice: 9.5, trimLoss: 5 },
  { id: '2', name: 'Basmati düyü', quantity: 0.12, unit: 'kq', unitPrice: 4.5, trimLoss: 0 },
  { id: '3', name: 'Sous', quantity: 0.04, unit: 'litr', unitPrice: 7, trimLoss: 0 },
];

function toNumber(value: string) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function money(value: number) {
  return `${value.toFixed(2)} AZN`;
}

function lineCost(ingredient: Ingredient) {
  return ingredient.quantity * ingredient.unitPrice * (1 + ingredient.trimLoss / 100);
}

function downloadText(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function YemekXerciPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const t = copy[locale];
  const tierColors = TIER_COLORS.sagird;

  const [recipeName, setRecipeName] = useState('Toyuq Bowl');
  const [menuPrice, setMenuPrice] = useState(18);
  const [portions, setPortions] = useState(1);
  const [targetFoodCost, setTargetFoodCost] = useState(32);
  const [ingredients, setIngredients] = useState<Ingredient[]>(starterIngredients);

  const result = useMemo(() => {
    const totalCost = ingredients.reduce((sum, ingredient) => sum + lineCost(ingredient), 0);
    const costPerPortion = totalCost / Math.max(portions, 1);
    const foodCostPercent = menuPrice > 0 ? (costPerPortion / menuPrice) * 100 : 0;
    const grossProfit = menuPrice - costPerPortion;
    const idealPrice = targetFoodCost > 0 ? costPerPortion / (targetFoodCost / 100) : 0;
    const status = foodCostPercent > 38 ? 'danger' : foodCostPercent > 33 ? 'warning' : 'good';
    return { totalCost, costPerPortion, foodCostPercent, grossProfit, idealPrice, status };
  }, [ingredients, menuPrice, portions, targetFoodCost]);

  const statusCopy = {
    good: { label: t.statusGood, className: 'border-emerald-200 bg-emerald-50 text-emerald-700' },
    warning: { label: t.statusWarning, className: 'border-amber-200 bg-amber-50 text-amber-700' },
    danger: { label: t.statusDanger, className: 'border-red-200 bg-red-50 text-red-700' },
  }[result.status];

  function updateIngredient(id: string, field: keyof Ingredient, value: string | number) {
    setIngredients((prev) =>
      prev.map((ingredient) =>
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient,
      ),
    );
  }

  function addIngredient() {
    setIngredients((prev) => [
      ...prev,
      { id: String(Date.now()), name: '', quantity: 0, unit: 'kq', unitPrice: 0, trimLoss: 0 },
    ]);
  }

  function removeIngredient(id: string) {
    if (ingredients.length <= 1) return;
    setIngredients((prev) => prev.filter((ingredient) => ingredient.id !== id));
  }

  function reset() {
    setRecipeName('Toyuq Bowl');
    setMenuPrice(18);
    setPortions(1);
    setTargetFoodCost(32);
    setIngredients(starterIngredients);
  }

  function exportCsv() {
    const rows = [
      ['Yemək', recipeName],
      ['Satış qiyməti', menuPrice.toFixed(2)],
      ['Porsiya sayı', String(portions)],
      ['Hədəf food cost %', String(targetFoodCost)],
      [],
      ['Məhsul', 'Miqdar', 'Vahid', 'Vahid qiyməti', 'Trim loss %', 'Cəm'],
      ...ingredients.map((ingredient) => [
        ingredient.name,
        String(ingredient.quantity),
        ingredient.unit,
        ingredient.unitPrice.toFixed(2),
        String(ingredient.trimLoss),
        lineCost(ingredient).toFixed(2),
      ]),
      [],
      ['Cəm ərzaq xərci', result.totalCost.toFixed(2)],
      ['Porsiya maya', result.costPerPortion.toFixed(2)],
      ['Food Cost %', result.foodCostPercent.toFixed(2)],
      ['Porsiya brüt mənfəət', result.grossProfit.toFixed(2)],
      ['Hədəfə görə ideal qiymət', result.idealPrice.toFixed(2)],
    ];
    const csv = `\uFEFF${rows.map((row) => row.map((cell) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\r\n')}`;
    downloadText(`yemek-xerci-${recipeName || 'resept'}.csv`, csv, 'text/csv;charset=utf-8');
  }

  async function exportExcel() {
    const XLSX = await import('xlsx');
    const rows = ingredients.map((ingredient) => ({
      'Məhsul': ingredient.name,
      'Miqdar': ingredient.quantity,
      'Vahid': ingredient.unit,
      'Vahid qiyməti': ingredient.unitPrice,
      'Trim loss %': ingredient.trimLoss,
      'Cəm': Number(lineCost(ingredient).toFixed(2)),
    }));
    rows.push({
      'Məhsul': 'CƏM',
      'Miqdar': portions,
      'Vahid': 'porsiya',
      'Vahid qiyməti': Number(result.costPerPortion.toFixed(2)),
      'Trim loss %': Number(result.foodCostPercent.toFixed(2)),
      'Cəm': Number(result.totalCost.toFixed(2)),
    });

    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = [{ wch: 24 }, { wch: 10 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 12 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Yemek Xerci');
    XLSX.writeFile(wb, `yemek-xerci-${recipeName || 'resept'}.xlsx`, { bookSST: true });
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <Link href="/dashboard/marketinq-ocagi" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />{t.backToList}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{t.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-500">{t.subtitle}</p>
        </div>
        <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>
          {t.tier}
        </span>
      </div>

      <ToolInfoBox title={t.whyTitle} variant="info">
        <p>{t.why}</p>
      </ToolInfoBox>

      <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-5">
        <ResultCard label={t.totalCost} value={money(result.totalCost)} />
        <ResultCard label={t.costPerPortion} value={money(result.costPerPortion)} />
        <ResultCard label={t.foodCostPercent} value={`${result.foodCostPercent.toFixed(1)}%`} badge={statusCopy.label} badgeClassName={statusCopy.className} />
        <ResultCard label={t.grossProfit} value={money(result.grossProfit)} />
        <ResultCard label={t.idealPrice} value={money(result.idealPrice)} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
            <Field label={t.recipeName}>
              <input value={recipeName} onChange={(e) => setRecipeName(e.target.value)} className="input" />
            </Field>
            <Field label={t.menuPrice}>
              <input type="number" min="0" step="0.01" value={menuPrice || ''} onChange={(e) => setMenuPrice(toNumber(e.target.value))} className="input" />
            </Field>
            <Field label={t.portions}>
              <input type="number" min="1" step="1" value={portions || ''} onChange={(e) => setPortions(Math.max(1, Math.round(toNumber(e.target.value))))} className="input" />
            </Field>
            <Field label={t.targetFoodCost}>
              <input type="number" min="1" max="100" step="1" value={targetFoodCost || ''} onChange={(e) => setTargetFoodCost(toNumber(e.target.value))} className="input" />
            </Field>
          </div>

          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-[var(--dk-navy)]">{t.ingredients}</h2>
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:text-red-600">
              <RotateCcw size={14} />{t.reset}
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ingredient, index) => (
              <div key={ingredient.id} className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-700">#{index + 1}</span>
                  <button type="button" onClick={() => removeIngredient(ingredient.id)} disabled={ingredients.length <= 1} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-400 transition hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40">
                    <Trash2 size={14} />Sil
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
                  <Field label={t.ingredient} className="md:col-span-4">
                    <input value={ingredient.name} onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)} className="input" placeholder="Toyuq filesi" />
                  </Field>
                  <Field label={t.quantity} className="md:col-span-2">
                    <input type="number" min="0" step="0.01" value={ingredient.quantity || ''} onChange={(e) => updateIngredient(ingredient.id, 'quantity', toNumber(e.target.value))} className="input" />
                  </Field>
                  <Field label={t.unit} className="md:col-span-2">
                    <select value={ingredient.unit} onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)} className="input bg-white">
                      {units.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
                    </select>
                  </Field>
                  <Field label={t.unitPrice} className="md:col-span-2">
                    <input type="number" min="0" step="0.01" value={ingredient.unitPrice || ''} onChange={(e) => updateIngredient(ingredient.id, 'unitPrice', toNumber(e.target.value))} className="input" />
                  </Field>
                  <Field label={t.trimLoss} className="md:col-span-1">
                    <input type="number" min="0" max="100" step="1" value={ingredient.trimLoss || ''} onChange={(e) => updateIngredient(ingredient.id, 'trimLoss', toNumber(e.target.value))} className="input" />
                  </Field>
                  <div className="md:col-span-1">
                    <div className="mb-1.5 text-xs font-semibold text-slate-500">{t.lineCost}</div>
                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-right text-sm font-bold text-[var(--dk-navy)]">
                      {lineCost(ingredient).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button type="button" onClick={addIngredient} className="mt-4 inline-flex items-center gap-2 rounded-xl border border-dashed border-slate-300 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
            <Plus size={16} />{t.addIngredient}
          </button>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-base font-bold text-[var(--dk-navy)]">{t.notesTitle}</h2>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-600">
              <li><strong>28-33%</strong> food cost sağlam aralıqdır.</li>
              <li><strong>34-38%</strong> diqqət tələb edir; porsiya və alış qiymətini yoxla.</li>
              <li><strong>38%+</strong> menyu qiyməti və resept kartı yenidən qurulmalıdır.</li>
            </ul>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid grid-cols-2 gap-3">
              <button type="button" onClick={exportCsv} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-bold text-white transition hover:bg-[var(--dk-navy)]/90">
                <Download size={16} />{t.exportCsv}
              </button>
              <button type="button" onClick={() => void exportExcel()} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:border-[var(--dk-gold)]">
                <FileSpreadsheet size={16} />{t.exportExcel}
              </button>
            </div>
          </div>
        </aside>
      </div>

      <style jsx>{`
        .input {
          width: 100%;
          border-radius: 0.75rem;
          border: 1px solid rgb(226 232 240);
          background: white;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          color: var(--dk-navy);
          outline: none;
        }
        .input:focus {
          border-color: var(--dk-gold);
          box-shadow: 0 0 0 2px color-mix(in srgb, var(--dk-gold) 20%, transparent);
        }
      `}</style>
    </div>
  );
}

function Field({ label, children, className = '' }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={className}>
      <span className="mb-1.5 block text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function ResultCard({ label, value, badge, badgeClassName }: { label: string; value: string; badge?: string; badgeClassName?: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className="mt-2 text-2xl font-black tabular-nums text-[var(--dk-navy)]">{value}</div>
      {badge && <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${badgeClassName}`}>{badge}</span>}
    </div>
  );
}
