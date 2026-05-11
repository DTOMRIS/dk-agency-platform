'use client';

import { Star, TrendingDown, HelpCircle, Skull } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MatrixItem { name: string; category: string; price: number; margin?: number; reason: string }
interface CategoryInfo { count: number; avgPrice: number; avgMargin: number; recommendation: string }
interface PricingInfo { priceSpread: number; psychologicalPricing: string[]; anchorItems: string[] }

interface MenyuResult {
  matrix: { stars: MatrixItem[]; plowhorses: MatrixItem[]; puzzles: MatrixItem[]; dogs: MatrixItem[] };
  categoryBalance: Record<string, CategoryInfo>;
  pricing: PricingInfo;
  topRecommendations: string[];
  ahilikQuote: string;
}

const copy: Record<Locale, {
  matrixTitle: string; stars: string; starsDesc: string; plowhorses: string; plowhorsesDesc: string;
  puzzles: string; puzzlesDesc: string; dogs: string; dogsDesc: string;
  catBalance: string; pricingTitle: string; spread: string; recsTitle: string;
  redo: string; next: string;
}> = {
  az: {
    matrixTitle: 'Menyu Mühəndisliyi Matrisi', stars: 'Ulduzlar', starsDesc: 'Yüksək satış + yüksək kar — QORUYUN',
    plowhorses: 'İş atları', plowhorsesDesc: 'Yüksək satış + aşağı kar — QİYMƏT/MALİYYƏ yenilə',
    puzzles: 'Tapmacalar', puzzlesDesc: 'Aşağı satış + yüksək kar — MARKETİNQ gücləndir',
    dogs: 'İtlər', dogsDesc: 'Aşağı satış + aşağı kar — MENYUDAN SİL',
    catBalance: 'Kateqoriya Balansı', pricingTitle: 'Qiymət Analizi', spread: 'Qiymət aralığı',
    recsTitle: 'Tövsiyələr', redo: 'Yenidən Analiz Et', next: 'Növbəti Alət',
  },
  en: {
    matrixTitle: 'Menu Engineering Matrix', stars: 'Stars', starsDesc: 'High sales + high margin — KEEP',
    plowhorses: 'Plowhorses', plowhorsesDesc: 'High sales + low margin — REPRICE',
    puzzles: 'Puzzles', puzzlesDesc: 'Low sales + high margin — PROMOTE',
    dogs: 'Dogs', dogsDesc: 'Low sales + low margin — REMOVE',
    catBalance: 'Category Balance', pricingTitle: 'Pricing Analysis', spread: 'Price spread',
    recsTitle: 'Recommendations', redo: 'Re-analyze', next: 'Next Tool',
  },
  tr: {
    matrixTitle: 'Menü Mühendisliği Matrisi', stars: 'Yıldızlar', starsDesc: 'Yüksek satış + yüksek kâr — KORUYUN',
    plowhorses: 'İş atları', plowhorsesDesc: 'Yüksek satış + düşük kâr — FİYAT/MALİYET yenile',
    puzzles: 'Bulmacalar', puzzlesDesc: 'Düşük satış + yüksek kâr — PAZARLAMA güçlendir',
    dogs: 'Köpekler', dogsDesc: 'Düşük satış + düşük kâr — MENÜDEN ÇIKAR',
    catBalance: 'Kategori Dengesi', pricingTitle: 'Fiyat Analizi', spread: 'Fiyat aralığı',
    recsTitle: 'Öneriler', redo: 'Tekrar Analiz', next: 'Sonraki Araç',
  },
  ru: {
    matrixTitle: 'Матрица Меню', stars: 'Звёзды', starsDesc: 'Высокие продажи + маржа — СОХРАНИТЬ',
    plowhorses: 'Рабочие лошади', plowhorsesDesc: 'Высокие продажи + низкая маржа — ПЕРЕСМОТРЕТЬ ЦЕНУ',
    puzzles: 'Загадки', puzzlesDesc: 'Низкие продажи + высокая маржа — ПРОДВИГАТЬ',
    dogs: 'Собаки', dogsDesc: 'Низкие продажи + низкая маржа — УБРАТЬ',
    catBalance: 'Баланс Категорий', pricingTitle: 'Ценовой Анализ', spread: 'Ценовой разброс',
    recsTitle: 'Рекомендации', redo: 'Перевнализировать', next: 'Следующий',
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
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.matrixTitle}</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {QUADRANTS.map(({ key, icon: Icon, color, textColor }) => {
            const items = result.matrix[key];
            const label = t[key];
            const desc = t[`${key}Desc` as keyof typeof t];
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
                        {item.margin !== undefined && <span className="text-slate-500"> (margin {item.margin}%)</span>}
                        <p className="mt-0.5 text-[10px] text-slate-500">{item.reason}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs italic text-slate-400">—</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Category balance */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t.catBalance}</h3>
        <div className="space-y-3">
          {Object.entries(result.categoryBalance).map(([cat, info]) => (
            <div key={cat} className="flex items-start justify-between rounded-lg border border-slate-100 px-3 py-2">
              <div>
                <span className="text-xs font-bold text-[var(--dk-navy)] capitalize">{cat}</span>
                <span className="ml-2 text-[10px] text-slate-400">{info.count} yemək, ort. {info.avgPrice} ₼</span>
              </div>
              <p className="max-w-[50%] text-right text-[10px] text-slate-600">{info.recommendation}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{t.pricingTitle}</h3>
        <p className="mb-3 text-xs text-slate-600">{t.spread}: <span className="font-bold">{result.pricing.priceSpread}x</span></p>
        <ul className="space-y-1 text-xs text-slate-600">
          {result.pricing.psychologicalPricing.map((tip, i) => <li key={i}>• {tip}</li>)}
          {result.pricing.anchorItems.map((tip, i) => <li key={`a${i}`}>• {tip}</li>)}
        </ul>
      </div>

      {/* Recommendations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{t.recsTitle}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          {result.topRecommendations.map((rec, i) => <li key={i}>{rec}</li>)}
        </ol>
      </div>

      {/* Ahilik */}
      <p className="text-center text-xs italic text-slate-400">&ldquo;{result.ahilikQuote}&rdquo; — Əhilik</p>

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]">{t.redo}</button>
        <a href="/dashboard/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90">{t.next}</a>
      </div>
    </div>
  );
}
