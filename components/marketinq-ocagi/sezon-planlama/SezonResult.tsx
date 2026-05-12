'use client';

import { Calendar, Tag, Target } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface Campaign { name: string; type: string; startDay: number; endDay: number; description: string; budget: string; channel: string; kpi: string }
interface MonthPlan { month: number; monthName: string; campaigns: Campaign[] }
interface BudgetSummary { allocated: string; perMonth: string; topCategory: string }

interface SezonResultData {
  calendar: MonthPlan[];
  totalCampaigns: number;
  budgetSummary: BudgetSummary;
  topRecommendations: string[];
  ahilikQuote: string;
}

const typeColors: Record<string, string> = {
  bayram: 'bg-red-100 text-red-700', movsum: 'bg-blue-100 text-blue-700',
  event: 'bg-purple-100 text-purple-700', promo: 'bg-green-100 text-green-700',
  community: 'bg-amber-100 text-amber-700',
};

const copy: Record<Locale, {
  title: string; total: string; budget: string; perMonth: string; topCat: string;
  types: Record<string, string>; channel: string; kpi: string;
  recsTitle: string; redo: string; next: string;
}> = {
  az: {
    title: 'Sezon Takvimi', total: 'Cəmi kampaniya', budget: 'Ayrılan büdcə', perMonth: 'Aylıq ort.', topCat: 'Əsas kateqoriya',
    types: { bayram: 'Bayram', movsum: 'Mövsüm', event: 'Event', promo: 'Promo', community: 'İcma' },
    channel: 'Kanal', kpi: 'KPI', recsTitle: 'Tövsiyələr', redo: 'Yenidən Planla', next: 'Növbəti Alət',
  },
  en: {
    title: 'Season Calendar', total: 'Total campaigns', budget: 'Allocated', perMonth: 'Monthly avg', topCat: 'Top category',
    types: { bayram: 'Holiday', movsum: 'Seasonal', event: 'Event', promo: 'Promo', community: 'Community' },
    channel: 'Channel', kpi: 'KPI', recsTitle: 'Recommendations', redo: 'Replan', next: 'Next Tool',
  },
  tr: {
    title: 'Sezon Takvimi', total: 'Toplam kampanya', budget: 'Ayrılan', perMonth: 'Aylık ort.', topCat: 'Ana kategori',
    types: { bayram: 'Bayram', movsum: 'Mevsim', event: 'Etkinlik', promo: 'Promo', community: 'Topluluk' },
    channel: 'Kanal', kpi: 'KPI', recsTitle: 'Öneriler', redo: 'Tekrar Planla', next: 'Sonraki Araç',
  },
  ru: {
    title: 'Сезонный Календарь', total: 'Всего кампаний', budget: 'Выделено', perMonth: 'Среднее/мес', topCat: 'Основная категория',
    types: { bayram: 'Праздник', movsum: 'Сезон', event: 'Событие', promo: 'Промо', community: 'Комьюнити' },
    channel: 'Канал', kpi: 'KPI', recsTitle: 'Рекомендации', redo: 'Перепланировать', next: 'Следующий',
  },
};

interface Props { result: SezonResultData; locale: Locale; onRedo: () => void }

export default function SezonResult({ result, locale, onRedo }: Props) {
  const t = copy[locale];

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-400">{t.total}</p>
          <p className="mt-1 text-2xl font-bold text-[var(--dk-navy)]">{result.totalCampaigns}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-400">{t.budget}</p>
          <p className="mt-1 text-sm font-bold text-[var(--dk-navy)]">{result.budgetSummary.allocated}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-400">{t.perMonth}</p>
          <p className="mt-1 text-sm font-bold text-[var(--dk-navy)]">{result.budgetSummary.perMonth}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-400">{t.topCat}</p>
          <p className="mt-1 text-sm font-bold text-[var(--dk-navy)]">{result.budgetSummary.topCategory}</p>
        </div>
      </div>

      {/* Calendar by month */}
      {result.calendar.map((month) => (
        <div key={month.month} className="rounded-2xl border border-slate-200 bg-white p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-[var(--dk-navy)]">
            <Calendar size={16} className="text-[var(--dk-gold)]" />
            {month.monthName}
            <span className="text-xs text-slate-400">({month.campaigns.length})</span>
          </h3>
          <div className="space-y-3">
            {month.campaigns.map((c, i) => (
              <div key={i} className="rounded-xl border border-slate-100 p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${typeColors[c.type] ?? 'bg-slate-100 text-slate-600'}`}>
                    {t.types[c.type] ?? c.type}
                  </span>
                  <span className="text-sm font-bold text-[var(--dk-navy)]">{c.name}</span>
                  <span className="text-[10px] text-slate-400">{c.startDay}-{c.endDay}</span>
                </div>
                <p className="mb-2 text-xs text-slate-600">{c.description}</p>
                <div className="flex flex-wrap gap-3 text-[10px] text-slate-500">
                  {c.budget && <span className="flex items-center gap-1"><Tag size={10} />{c.budget}</span>}
                  <span className="flex items-center gap-1">{t.channel}: {c.channel}</span>
                  <span className="flex items-center gap-1"><Target size={10} />{t.kpi}: {c.kpi}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Recommendations */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">{t.recsTitle}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          {result.topRecommendations.map((r, i) => <li key={i}>{r}</li>)}
        </ol>
      </div>

      <p className="text-center text-xs italic text-slate-400">&ldquo;{result.ahilikQuote}&rdquo; — Əhilik</p>

      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]">{t.redo}</button>
        <a href="/dashboard/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90">{t.next}</a>
      </div>
    </div>
  );
}
