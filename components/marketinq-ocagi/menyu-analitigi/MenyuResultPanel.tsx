'use client';

import Link from 'next/link';
import { Star, TrendingDown, HelpCircle, Skull } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MatrixItem { name: string; category: string; price: number; margin?: number; reason: string }
interface CategoryInfo { count: number; avgPrice: number; avgMargin: number; recommendation: string }
interface PricingInfo { priceSpread: number; psychologicalPricing: string[]; anchorItems: string[] }

interface MenyuResult {
  matrix: { stars: MatrixItem[]; plowhorses: MatrixItem[]; puzzles: MatrixItem[]; dogs: MatrixItem[] };
  /** TASK-0523: dishes without monthly sales or cost % — not placed in a group (older runs: absent). */
  needsData?: string[];
  categoryBalance: Record<string, CategoryInfo>;
  pricing: PricingInfo;
  topRecommendations: string[];
  ahilikQuote: string;
}

// TASK-0523: group names are actions (owner: «kateqoriya = eylem adı»), same as /toolkit/menu-matrix.
const copy: Record<Locale, {
  matrixTitle: string; stars: string; starsDesc: string; plowhorses: string; plowhorsesDesc: string;
  puzzles: string; puzzlesDesc: string; dogs: string; dogsDesc: string;
  catBalance: string; pricingTitle: string; spread: string; recsTitle: string;
  redo: string; next: string; profit: string; dishes: string; avg: string;
  needsDataTitle: string; needsDataBody: string; cats: Record<string, string>;
}> = {
  az: {
    matrixTitle: 'Menyu qrupları', stars: 'Qoru', starsDesc: 'Çox satılır, porsiyadan qazanc yüksəkdir',
    plowhorses: 'Qiymətini düzəlt', plowhorsesDesc: 'Çox satılır, porsiyadan qazanc azdır',
    puzzles: 'Tanıt', puzzlesDesc: 'Az satılır, porsiyadan qazanc yüksəkdir',
    dogs: 'Çıxar', dogsDesc: 'Az satılır, porsiyadan qazanc azdır',
    catBalance: 'Menyu bölmələri', pricingTitle: 'Qiymət', spread: 'Ən baha / ən ucuz',
    recsTitle: 'Tövsiyələr', redo: 'Yenidən təhlil et', next: 'Növbəti alət',
    profit: 'qazanc', dishes: 'yemək', avg: 'orta',
    needsDataTitle: 'Məlumat lazımdır', needsDataBody: 'Bu yeməklərin aylıq satış sayı və ya maya dəyəri (%) yazılmayıb — qrupa salınmadı. Rəqəmləri əlavə edib yenidən təhlil edin.',
    cats: { salat: 'Salat', shorba: 'Şorba', et: 'Ət', toyuq: 'Toyuq', baliq: 'Balıq', sandvic: 'Sendviç', shirniyyat: 'Şirniyyat', icki: 'İçki' },
  },
  en: {
    matrixTitle: 'Menu groups', stars: 'Keep', starsDesc: 'Sells a lot, high profit per portion',
    plowhorses: 'Fix the price', plowhorsesDesc: 'Sells a lot, low profit per portion',
    puzzles: 'Promote', puzzlesDesc: 'Sells little, high profit per portion',
    dogs: 'Remove', dogsDesc: 'Sells little, low profit per portion',
    catBalance: 'Menu sections', pricingTitle: 'Pricing', spread: 'Most / least expensive',
    recsTitle: 'Recommendations', redo: 'Re-analyse', next: 'Next tool',
    profit: 'profit', dishes: 'dishes', avg: 'avg',
    needsDataTitle: 'Data needed', needsDataBody: 'Monthly sales or cost % is missing for these dishes, so they were not grouped. Add the numbers and run again.',
    cats: { salat: 'Salads', shorba: 'Soups', et: 'Meat', toyuq: 'Chicken', baliq: 'Fish', sandvic: 'Sandwiches', shirniyyat: 'Desserts', icki: 'Drinks' },
  },
  tr: {
    matrixTitle: 'Menü grupları', stars: 'Koru', starsDesc: 'Çok satılıyor, porsiyon kazancı yüksek',
    plowhorses: 'Fiyatını düzelt', plowhorsesDesc: 'Çok satılıyor, porsiyon kazancı düşük',
    puzzles: 'Tanıt', puzzlesDesc: 'Az satılıyor, porsiyon kazancı yüksek',
    dogs: 'Çıkar', dogsDesc: 'Az satılıyor, porsiyon kazancı düşük',
    catBalance: 'Menü bölümleri', pricingTitle: 'Fiyat', spread: 'En pahalı / en ucuz',
    recsTitle: 'Öneriler', redo: 'Tekrar analiz et', next: 'Sonraki araç',
    profit: 'kazanç', dishes: 'yemek', avg: 'ort.',
    needsDataTitle: 'Veri gerekli', needsDataBody: 'Bu yemeklerin aylık satış adedi ya da maliyet yüzdesi yazılmamış — gruplanmadı. Rakamları ekleyip tekrar analiz edin.',
    cats: { salat: 'Salata', shorba: 'Çorba', et: 'Et', toyuq: 'Tavuk', baliq: 'Balık', sandvic: 'Sandviç', shirniyyat: 'Tatlı', icki: 'İçecek' },
  },
  ru: {
    matrixTitle: 'Группы меню', stars: 'Беречь', starsDesc: 'Хорошо продаётся, прибыль с порции высокая',
    plowhorses: 'Поправить цену', plowhorsesDesc: 'Хорошо продаётся, прибыль с порции низкая',
    puzzles: 'Продвигать', puzzlesDesc: 'Продаётся мало, прибыль с порции высокая',
    dogs: 'Убрать', dogsDesc: 'Продаётся мало, прибыль с порции низкая',
    catBalance: 'Разделы меню', pricingTitle: 'Цены', spread: 'Самое дорогое / самое дешёвое',
    recsTitle: 'Рекомендации', redo: 'Проанализировать снова', next: 'Следующий инструмент',
    profit: 'прибыль', dishes: 'блюд', avg: 'ср.',
    needsDataTitle: 'Нужны данные', needsDataBody: 'Для этих блюд не указаны продажи в месяц или себестоимость (%) — они не распределены. Добавьте цифры и запустите снова.',
    cats: { salat: 'Салаты', shorba: 'Супы', et: 'Мясо', toyuq: 'Курица', baliq: 'Рыба', sandvic: 'Сэндвичи', shirniyyat: 'Десерты', icki: 'Напитки' },
  },
};

const QUADRANTS = [
  { key: 'stars', icon: Star, color: 'border-green-300 bg-green-50', textColor: 'text-green-700' },
  { key: 'plowhorses', icon: TrendingDown, color: 'border-blue-300 bg-blue-50', textColor: 'text-blue-700' },
  { key: 'puzzles', icon: HelpCircle, color: 'border-amber-300 bg-amber-50', textColor: 'text-amber-700' },
  { key: 'dogs', icon: Skull, color: 'border-red-300 bg-red-50', textColor: 'text-red-700' },
] as const;

interface Props { result: MenyuResult; locale: Locale; onRedo: () => void }

export default function MenyuResultPanel({ result, locale, onRedo }: Props) {
  const t = copy[locale];

  return (
    <div className="space-y-6">
      {/* Matrix */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.matrixTitle}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUADRANTS.map(({ key, icon: Icon, color, textColor }) => {
            const items = result.matrix[key];
            const label = t[key];
            const desc = t[`${key}Desc` as `${typeof key}Desc`];
            return (
              <div key={key} className={`rounded-xl border p-4 ${color}`}>
                <div className="mb-2 flex items-center gap-2">
                  <Icon size={16} className={textColor} />
                  <span className={`text-sm font-bold ${textColor}`}>{label}</span>
                  <span className="text-[10px] text-slate-500">({items.length})</span>
                </div>
                <p className="mb-3 text-[10px] text-slate-500">{desc}</p>
                {items.length > 0 ? (
                  <ul className="space-y-1.5">
                    {items.map((item, i) => (
                      <li key={i} className="text-xs text-slate-700">
                        <span className="font-semibold">{item.name}</span> — {item.price} ₼
                        {item.margin !== undefined && <span className="text-slate-500"> ({t.profit} {item.margin}%)</span>}
                        {item.reason && <p className="mt-0.5 text-[10px] text-slate-500">{item.reason}</p>}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic text-slate-600">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {result.needsData && result.needsData.length > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5" data-testid="menu-needs-data">
          <h3 className="mb-1 text-sm font-bold text-amber-800">{t.needsDataTitle}</h3>
          <p className="mb-2 text-xs text-amber-800">{t.needsDataBody}</p>
          <p className="text-xs font-semibold text-amber-900">{result.needsData.join(', ')}</p>
        </div>
      )}

      {/* Category balance */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.catBalance}</h3>
        <div className="space-y-3">
          {Object.entries(result.categoryBalance).map(([cat, info]) => (
            <div key={cat} className="flex items-start justify-between rounded-lg border border-[#EFE9DE] px-3 py-2">
              <div>
                <span className="text-xs font-bold text-[#0F172A]">{t.cats[cat] ?? cat}</span>
                <span className="ml-2 text-[10px] text-slate-600">{info.count} {t.dishes}, {t.avg} {info.avgPrice} ₼</span>
              </div>
              <p className="max-w-[50%] text-right text-[10px] text-slate-600">{info.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{t.pricingTitle}</h3>
        <p className="mb-3 text-xs text-slate-600">{t.spread}: <span className="font-bold">{result.pricing.priceSpread}x</span></p>
        <ul className="space-y-1 text-xs text-slate-600">
          {result.pricing.psychologicalPricing.map((tip, i) => <li key={i}>• {tip}</li>)}
          {result.pricing.anchorItems.map((tip, i) => <li key={`a${i}`}>• {tip}</li>)}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{t.recsTitle}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          {result.topRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ol>
      </div>

      {/* TASK-0523: no more AI-written «Ahilik» quotes; older saved runs still show theirs. */}
      {result.ahilikQuote && <p className="text-center text-xs italic text-slate-600">&ldquo;{result.ahilikQuote}&rdquo; — Əhilik</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-[#E4DCCD] px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A]">{t.redo}</button>
        <Link href="/b2b-panel/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-dk-red-strong px-4 py-3 text-sm font-semibold text-white transition hover:bg-dk-red-deep">{t.next}</Link>
      </div>
    </div>
  );
}
