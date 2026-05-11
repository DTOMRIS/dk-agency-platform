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
  az: { salat: 'Salat', shorba: 'Şorba', et: 'Ət', toyuq: 'Toyuq', baliq: 'Balıq', sandvic: 'Sandviç', shirniyyat: 'Şirniyyat', icki: 'İçki' },
  en: { salat: 'Salad', shorba: 'Soup', et: 'Meat', toyuq: 'Poultry', baliq: 'Fish', sandvic: 'Sandwich', shirniyyat: 'Dessert', icki: 'Drink' },
  tr: { salat: 'Salata', shorba: 'Çorba', et: 'Et', toyuq: 'Tavuk', baliq: 'Balık', sandvic: 'Sandviç', shirniyyat: 'Tatlı', icki: 'İçecek' },
  ru: { salat: 'Салат', shorba: 'Суп', et: 'Мясо', toyuq: 'Птица', baliq: 'Рыба', sandvic: 'Сэндвич', shirniyyat: 'Десерт', icki: 'Напиток' },
};

const formCopy: Record<Locale, {
  restName: string; addItem: string; itemName: string; category: string; price: string;
  cost: string; costHelp: string; monthlySales: string; salesHelp: string;
  submit: string; submitting: string; minItems: string; remove: string;
}> = {
  az: { restName: 'Restoran adı', addItem: '+ Yemək əlavə et', itemName: 'Yemək adı', category: 'Kateqoriya', price: 'Qiymət (AZN)',
    cost: 'Maliyyət %', costHelp: 'Bilmirsənsə boş burax', monthlySales: 'Aylıq satış', salesHelp: 'Opsional',
    submit: 'Menyumu Analiz Et', submitting: 'AI fikirləşir...', minItems: 'Ən az 5 yemək əlavə edin', remove: 'Sil' },
  en: { restName: 'Restaurant name', addItem: '+ Add item', itemName: 'Item name', category: 'Category', price: 'Price (AZN)',
    cost: 'Cost %', costHelp: 'Leave empty if unsure', monthlySales: 'Monthly sales', salesHelp: 'Optional',
    submit: 'Analyze My Menu', submitting: 'AI is thinking...', minItems: 'Add at least 5 items', remove: 'Remove' },
  tr: { restName: 'Restoran adı', addItem: '+ Yemek ekle', itemName: 'Yemek adı', category: 'Kategori', price: 'Fiyat (AZN)',
    cost: 'Maliyet %', costHelp: 'Bilmiyorsanız boş bırakın', monthlySales: 'Aylık satış', salesHelp: 'Opsiyonel',
    submit: 'Menümü Analiz Et', submitting: 'AI düşünüyor...', minItems: 'En az 5 yemek ekleyin', remove: 'Sil' },
  ru: { restName: 'Название ресторана', addItem: '+ Добавить блюдо', itemName: 'Название блюда', category: 'Категория', price: 'Цена (AZN)',
    cost: 'Себестоимость %', costHelp: 'Оставьте пустым если не знаете', monthlySales: 'Продажи/мес', salesHelp: 'Опционально',
    submit: 'Анализировать меню', submitting: 'ИИ думает...', minItems: 'Минимум 5 блюд', remove: 'Удалить' },
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
      {/* Restaurant name */}
      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.restName}</label>
        <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={loading}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
      </div>

      {/* Menu items */}
      <div className="space-y-3">
        {items.map((item, idx) => (
          <div key={idx} className="flex gap-2 rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex flex-1 flex-wrap gap-2">
              <input type="text" placeholder={t.itemName} value={item.name}
                onChange={(e) => updateItem(idx, 'name', e.target.value)} disabled={loading}
                className="min-w-[120px] flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none" />
              <select value={item.category} onChange={(e) => updateItem(idx, 'category', e.target.value)} disabled={loading}
                className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none">
                <option value="" disabled>{t.category}</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{cats[c]}</option>)}
              </select>
              <input type="number" placeholder={t.price} value={item.price || ''} min={0.1} step={0.01}
                onChange={(e) => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} disabled={loading}
                className="w-24 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none" />
              <input type="number" placeholder={t.cost} value={item.costPercent ?? ''} min={0} max={100}
                onChange={(e) => updateItem(idx, 'costPercent', e.target.value ? parseFloat(e.target.value) : undefined)} disabled={loading}
                title={t.costHelp}
                className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none" />
              <input type="number" placeholder={t.monthlySales} value={item.monthlySales ?? ''} min={0}
                onChange={(e) => updateItem(idx, 'monthlySales', e.target.value ? parseInt(e.target.value) : undefined)} disabled={loading}
                title={t.salesHelp}
                className="w-20 rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none" />
            </div>
            {items.length > 5 && (
              <button type="button" onClick={() => removeItem(idx)} disabled={loading}
                className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500" title={t.remove}>
                <Trash2 size={16} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add + status */}
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

      {/* Submit */}
      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
