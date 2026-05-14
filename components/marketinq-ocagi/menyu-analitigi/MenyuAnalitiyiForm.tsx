'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MenuItem {
  name: string;
  category: string;
  price: number;
  costPercent: number | undefined;
  monthlySales: number | undefined;
}

const CATEGORIES = ['salat', 'shorba', 'et', 'toyuq', 'baliq', 'sandvic', 'shirniyyat', 'icki'] as const;

const catLabels: Record<Locale, Record<string, string>> = {
  az: {
    salat: 'Salat', shorba: 'Sorba', et: 'Esas yemek', toyuq: 'Toyuq', baliq: 'Baliq', sandvic: 'Sandvic', shirniyyat: 'Dessert', icki: 'Icki',
  },
  en: {
    salat: 'Salad', shorba: 'Soup', et: 'Main dish', toyuq: 'Poultry', baliq: 'Fish', sandvic: 'Sandwich', shirniyyat: 'Dessert', icki: 'Drink',
  },
  tr: {
    salat: 'Salata', shorba: 'Corba', et: 'Ana yemek', toyuq: 'Tavuk', baliq: 'Balik', sandvic: 'Sandvic', shirniyyat: 'Dessert', icki: 'Icecek',
  },
  ru: {
    salat: 'Salad', shorba: 'Soup', et: 'Main dish', toyuq: 'Poultry', baliq: 'Fish', sandvic: 'Sandwich', shirniyyat: 'Dessert', icki: 'Drink',
  },
};

const formCopy: Record<Locale, {
  restName: string; addItem: string; itemName: string; category: string; price: string;
  cost: string; costHelp: string; monthlySales: string; salesHelp: string;
  submit: string; submitting: string; minItems: string; remove: string;
}> = {
  az: {
    restName: 'Restoran adi', addItem: '+ Yemek elave et', itemName: 'Yemek adi', category: 'Kateqoriya sec',
    price: 'Qiymet (AZN)', cost: 'Food Cost %', costHelp: 'Bilmirsense bos burax',
    monthlySales: 'Aylik satis (eded)', salesHelp: 'Opsional',
    submit: 'Menyumu Analiz Et', submitting: 'AI fikirlesir...', minItems: 'En az 5 yemek elave edin', remove: 'Sil',
  },
  en: {
    restName: 'Restaurant name', addItem: '+ Add item', itemName: 'Item name', category: 'Select category',
    price: 'Price (AZN)', cost: 'Food Cost %', costHelp: 'Leave empty if unsure',
    monthlySales: 'Monthly sales (pcs)', salesHelp: 'Optional',
    submit: 'Analyze My Menu', submitting: 'AI is thinking...', minItems: 'Add at least 5 items', remove: 'Remove',
  },
  tr: {
    restName: 'Restoran adi', addItem: '+ Yemek ekle', itemName: 'Yemek adi', category: 'Kategori sec',
    price: 'Fiyat (AZN)', cost: 'Food Cost %', costHelp: 'Bilmiyorsaniz bos birakin',
    monthlySales: 'Aylik satis (adet)', salesHelp: 'Opsiyonel',
    submit: 'Menumu Analiz Et', submitting: 'AI dusunuyor...', minItems: 'En az 5 yemek ekleyin', remove: 'Sil',
  },
  ru: {
    restName: 'Restaurant name', addItem: '+ Add item', itemName: 'Item name', category: 'Select category',
    price: 'Price (AZN)', cost: 'Food Cost %', costHelp: 'Leave empty if unsure',
    monthlySales: 'Monthly sales (pcs)', salesHelp: 'Optional',
    submit: 'Analyze My Menu', submitting: 'AI is thinking...', minItems: 'Add at least 5 items', remove: 'Remove',
  },
};

const EMPTY_ITEM: MenuItem = { name: '', category: '', price: 0, costPercent: undefined, monthlySales: undefined };

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function MenyuAnalitiyiForm({ locale, onResult, onError }: Props) {
  const t = formCopy[locale];
  const cats = catLabels[locale];
  const [restaurantName, setRestaurantName] = useState('');
  const [items, setItems] = useState<MenuItem[]>([{ ...EMPTY_ITEM }, { ...EMPTY_ITEM }, { ...EMPTY_ITEM }, { ...EMPTY_ITEM }, { ...EMPTY_ITEM }]);
  const [loading, setLoading] = useState(false);

  function updateItem(idx: number, field: keyof MenuItem, val: string | number | undefined) {
    setItems((prev) => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  }

  function addItem() {
    if (items.length >= 50) return;
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  }

  function removeItem(idx: number) {
    if (items.length <= 5) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
  }

  const filledItems = items.filter((it) => it.name.trim() && it.category && it.price > 0);
  const isValid = restaurantName.trim().length >= 2 && filledItems.length >= 5;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/menyu-analitigi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName,
          menuItems: filledItems.map((it) => ({
            name: it.name.trim(),
            category: it.category,
            price: it.price,
            ...(it.costPercent !== undefined ? { costPercent: it.costPercent } : {}),
            ...(it.monthlySales !== undefined ? { monthlySales: it.monthlySales } : {}),
          })),
          locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'unknown'); return; }
      onResult(data.data);
    } catch { onError('network'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.restName}</label>
        <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 mb-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                Yemək #{idx + 1}
              </span>
              {items.length > 5 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label="Sil"
                >
                  ✕ Sil
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Yemek adı - tam genişlik mobile, 2/2 desktop */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Yemək adı
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder="məs: Adana Kababı, Caesar Salat"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Kateqoriya */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kateqoriya
                </label>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(idx, 'category', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">Seçin...</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{cats[c]}</option>)}
                </select>
              </div>

              {/* Qiymət */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Satış qiyməti (AZN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.price || ''}
                  onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Müştəriyə təqdim olunan qiymət</p>
              </div>

              {/* Maliyyət */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Food Cost (AZN)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.costPercent || ''}
                  onChange={(e) => updateItem(idx, 'costPercent', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Çiy məhsul + qablaşdırma</p>
              </div>

              {/* Aylıq satış */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Aylıq satış sayı
                </label>
                <input
                  type="number"
                  value={item.monthlySales || ''}
                  onChange={(e) => updateItem(idx, 'monthlySales', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder="məs: 250"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">Orta hesabla ayda neçə porsiya</p>
              </div>

              {/* Marja kalkulyatoru — read-only göstər */}
              {item.price && item.costPercent && (
                <div className="md:col-span-2 bg-blue-50 px-3 py-2 rounded text-sm">
                  <span className="text-blue-900">
                    <strong>Marja:</strong> {((1 - item.costPercent / item.price) * 100).toFixed(1)}%
                    {' • '}
                    <strong>Aylıq mənfəət:</strong> {((item.price - item.costPercent) * (item.monthlySales || 0)).toFixed(2)} AZN
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={addItem} disabled={loading || items.length >= 50}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
          <Plus size={14} />{t.addItem}
        </button>
        <span className="text-xs text-slate-400">{filledItems.length} / {items.length}</span>
      </div>

      {filledItems.length < 5 && (
        <p className="text-xs text-amber-600">{t.minItems}</p>
      )}

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
