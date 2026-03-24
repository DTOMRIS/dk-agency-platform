'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Plus, Trash2 } from 'lucide-react';

interface Ingredient {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
}

export default function FoodCostPage() {
  const [dishName, setDishName] = useState('');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [ingredients, setIngredients] = useState<Ingredient[]>([
    { id: '1', name: '', quantity: 0, unit: 'kq', pricePerUnit: 0 },
  ]);

  const addIngredient = () => {
    setIngredients(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      quantity: 0,
      unit: 'kq',
      pricePerUnit: 0,
    }]);
  };

  const removeIngredient = (id: string) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  };

  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setIngredients(prev => prev.map(i => i.id === id ? { ...i, [field]: value } : i));
  };

  const totalCost = ingredients.reduce((sum, i) => sum + (i.quantity * i.pricePerUnit), 0);
  const foodCostPercent = sellingPrice > 0 ? ((totalCost / sellingPrice) * 100) : 0;
  const grossProfit = sellingPrice - totalCost;

  const getHealthColor = (pct: number) => {
    if (pct === 0) return 'text-slate-400';
    if (pct <= 30) return 'text-emerald-600';
    if (pct <= 35) return 'text-amber-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pb-20">
      <div className="bg-slate-950 py-16 text-white">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/toolkit" className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm mb-6 transition-colors">
            <ArrowLeft size={16} /> Toolkit
          </Link>
          <h1 className="text-4xl font-display font-black tracking-tighter mb-4">
            Food Cost Hesablayici
          </h1>
          <p className="text-slate-400 text-lg">
            Porsiya maya deyerini hesabla. Ideal food cost: 28-32%.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6">
        {/* Results Card */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-8">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Maya deyeri</p>
              <p className="text-2xl font-black text-slate-900">{totalCost.toFixed(2)} AZN</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Food Cost %</p>
              <p className={`text-2xl font-black ${getHealthColor(foodCostPercent)}`}>
                {foodCostPercent.toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Xalis menfe</p>
              <p className="text-2xl font-black text-slate-900">{grossProfit.toFixed(2)} AZN</p>
            </div>
          </div>
        </div>

        {/* Dish Info */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Yemek adi</label>
              <input
                type="text"
                value={dishName}
                onChange={e => setDishName(e.target.value)}
                placeholder="mes. Toyuq Sac"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Satis qiymeti (AZN)</label>
              <input
                type="number"
                value={sellingPrice || ''}
                onChange={e => setSellingPrice(Number(e.target.value))}
                placeholder="18.00"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 text-slate-900 focus:border-brand-red focus:ring-1 focus:ring-brand-red outline-none"
              />
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Erzaqlar</h2>
            <button onClick={addIngredient} className="flex items-center gap-1 text-sm text-brand-red font-bold hover:underline">
              <Plus size={16} /> Elave et
            </button>
          </div>

          <div className="space-y-3">
            {ingredients.map((ing) => (
              <div key={ing.id} className="grid grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={ing.name}
                  onChange={e => updateIngredient(ing.id, 'name', e.target.value)}
                  placeholder="Erzaq adi"
                  className="col-span-4 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-red"
                />
                <input
                  type="number"
                  value={ing.quantity || ''}
                  onChange={e => updateIngredient(ing.id, 'quantity', Number(e.target.value))}
                  placeholder="Miqdari"
                  className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-red"
                />
                <select
                  value={ing.unit}
                  onChange={e => updateIngredient(ing.id, 'unit', e.target.value)}
                  className="col-span-2 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-red"
                >
                  <option value="kq">kq</option>
                  <option value="qr">qr</option>
                  <option value="litr">litr</option>
                  <option value="eded">eded</option>
                </select>
                <input
                  type="number"
                  value={ing.pricePerUnit || ''}
                  onChange={e => updateIngredient(ing.id, 'pricePerUnit', Number(e.target.value))}
                  placeholder="Qiymet"
                  className="col-span-3 px-3 py-2 rounded-lg border border-slate-200 text-sm outline-none focus:border-brand-red"
                />
                <button onClick={() => removeIngredient(ing.id)} className="col-span-1 flex justify-center text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
