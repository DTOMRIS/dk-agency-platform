'use client';

import { useState } from 'react';
import { Loader2, Plus } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { toCostPercent } from '@/lib/marketing/cost-percent';

interface MenuItem {
  name: string;
  category: string;
  price: number;
  /** Food cost of one portion in manat. The API expects a percentage → converted in toCostPercent(). */
  costAmount: number | undefined;
  monthlySales: number | undefined;
}

const CATEGORIES = ['salat', 'shorba', 'et', 'toyuq', 'baliq', 'sandvic', 'shirniyyat', 'icki'] as const;

const EMPTY_ITEM: MenuItem = { name: '', category: '', price: 0, costAmount: undefined, monthlySales: undefined };

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function MenyuAnalitiyiForm({ locale, onResult, onError }: Props) {
  // TASK-0516: copy lives in messages/*.json → mqForms.menyu (labels were AZ-only in the JSX).
  const t = useTranslations('mqForms.menyu');
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
            ...(toCostPercent(it.costAmount, it.price) !== undefined
              ? { costPercent: toCostPercent(it.costAmount, it.price) }
              : {}),
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
        <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('restName')}</label>
        <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={loading}
          className="w-full rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-[#0F172A] transition focus:border-[#D63B54] focus:outline-none focus:ring-2 focus:ring-[#D63B54]/15" />
      </div>

      <div className="space-y-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-lg p-4 mb-3 hover:border-blue-300 hover:shadow-sm transition-all"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-gray-700">
                {t('item', { n: idx + 1 })}
              </span>
              {items.length > 5 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  disabled={loading}
                  className="text-red-500 hover:text-red-700 text-sm"
                  aria-label={t('remove')}
                >
                  ✕ {t('remove')}
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Yemek adı - tam genişlik mobile, 2/2 desktop */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('itemName')}
                  <span className="text-red-500 ml-1">*</span>
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(idx, 'name', e.target.value)}
                  placeholder={t('itemPlaceholder')}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
              </div>

              {/* Kateqoriya */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('category')}
                </label>
                <select
                  value={item.category}
                  onChange={(e) => updateItem(idx, 'category', e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="">{t('choose')}</option>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{t(`categories.${c}`)}</option>)}
                </select>
              </div>

              {/* Qiymət */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('price')}
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
                <p className="text-xs text-gray-500 mt-1">{t('priceHelp')}</p>
              </div>

              {/* Maliyyət */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('cost')}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={item.costAmount || ''}
                  onChange={(e) => updateItem(idx, 'costAmount', e.target.value ? parseFloat(e.target.value) : undefined)}
                  placeholder="0.00"
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">{t('costHelp')}</p>
                {item.price > 0 && item.costAmount !== undefined && item.costAmount > item.price ? (
                  <p className="text-xs text-red-700 mt-1">{t('costOverPrice')}</p>
                ) : null}
              </div>

              {/* Aylıq satış */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('sales')}
                </label>
                <input
                  type="number"
                  value={item.monthlySales || ''}
                  onChange={(e) => updateItem(idx, 'monthlySales', e.target.value ? parseInt(e.target.value) : undefined)}
                  placeholder={t('salesPlaceholder')}
                  disabled={loading}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                />
                <p className="text-xs text-gray-500 mt-1">{t('salesHelp')}</p>
              </div>

              {/* Marja kalkulyatoru — read-only göstər */}
              {item.price > 0 && item.costAmount ? (
                <div className="md:col-span-2 bg-blue-50 px-3 py-2 rounded text-sm">
                  <span className="text-blue-900">
                    <strong>{t('foodCostPct')}</strong> {(toCostPercent(item.costAmount, item.price) ?? 0).toFixed(1)}%
                    {' • '}
                    <strong>{t('margin')}</strong> {((1 - item.costAmount / item.price) * 100).toFixed(1)}%
                    {' • '}
                    <strong>{t('monthlyProfit')}</strong> {new Intl.NumberFormat(AZ_NUMBER_LOCALE, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format((item.price - item.costAmount) * (item.monthlySales || 0))} AZN
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={addItem} disabled={loading || items.length >= 50}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[#0F172A] hover:text-[#0F172A]">
          <Plus size={14} />{t('addItem')}
        </button>
        <span className="text-xs text-slate-400">{filledItems.length} / {items.length}</span>
      </div>

      {filledItems.length < 5 && (
        <p className="text-xs text-amber-600">{t('minItems')}</p>
      )}

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t('submitting')}</> : t('submit')}
      </button>
    </div>
  );
}
