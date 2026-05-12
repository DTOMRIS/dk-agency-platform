'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

const MONTHS_AZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'İyun', 'İyul', 'Avqust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr'];
const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

const monthNames: Record<Locale, string[]> = { az: MONTHS_AZ, en: MONTHS_EN, tr: MONTHS_TR, ru: MONTHS_RU };

const CONCEPTS = ['fast-food', 'fine-dining', 'cafe', 'fast-casual', 'fine-casual', 'pub', 'traditional', 'other'] as const;

const copy: Record<Locale, {
  restName: string; concept: string; city: string; months: string; monthsHelp: string;
  budget: string; budgetHelp: string; events: string; eventsPlaceholder: string;
  submit: string; submitting: string;
  concepts: Record<string, string>;
}> = {
  az: {
    restName: 'Restoran adı', concept: 'Konsept', city: 'Şəhər', months: 'Plan aylarını seç', monthsHelp: 'Ən az 1 ay seç',
    budget: 'İllik marketinq büdcəsi (AZN)', budgetHelp: 'Opsional — AI bölüşdürəcək', events: 'Yerli xüsusi günlər', eventsPlaceholder: 'Məs: şəhər günü, yerli festival...',
    submit: 'Takvim Yarat', submitting: 'AI planlaşdırır...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Kafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Ailə restoranı', pub: 'Pub/Bar', traditional: 'Ənənəvi', other: 'Digər' },
  },
  en: {
    restName: 'Restaurant name', concept: 'Concept', city: 'City', months: 'Select months', monthsHelp: 'Select at least 1 month',
    budget: 'Annual marketing budget (AZN)', budgetHelp: 'Optional — AI will distribute', events: 'Local special events', eventsPlaceholder: 'E.g. city day, local festival...',
    submit: 'Create Calendar', submitting: 'AI is planning...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Cafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Family restaurant', pub: 'Pub/Bar', traditional: 'Traditional', other: 'Other' },
  },
  tr: {
    restName: 'Restoran adı', concept: 'Konsept', city: 'Şehir', months: 'Plan aylarını seç', monthsHelp: 'En az 1 ay seç',
    budget: 'Yıllık pazarlama bütçesi (AZN)', budgetHelp: 'Opsiyonel', events: 'Yerel özel günler', eventsPlaceholder: 'Ör: şehir günü, yerel festival...',
    submit: 'Takvim Oluştur', submitting: 'AI planlıyor...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Kafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Aile restoranı', pub: 'Pub/Bar', traditional: 'Geleneksel', other: 'Diğer' },
  },
  ru: {
    restName: 'Название ресторана', concept: 'Концепт', city: 'Город', months: 'Выберите месяцы', monthsHelp: 'Минимум 1 месяц',
    budget: 'Годовой бюджет маркетинга (AZN)', budgetHelp: 'Опционально', events: 'Местные мероприятия', eventsPlaceholder: 'Напр: день города, фестиваль...',
    submit: 'Создать календарь', submitting: 'ИИ планирует...',
    concepts: { 'fast-food': 'Фаст-фуд', 'fine-dining': 'Fine dining', cafe: 'Кафе', 'fast-casual': 'Fast casual', 'fine-casual': 'Семейный ресторан', pub: 'Паб/Бар', traditional: 'Традиционный', other: 'Другой' },
  },
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20';

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function SezonForm({ locale, onResult, onError }: Props) {
  const t = copy[locale];
  const months = monthNames[locale];
  const [form, setForm] = useState({ restaurantName: '', concept: '', city: '', budget: '', localEvents: '' });
  const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  function toggleMonth(m: number) {
    setSelectedMonths((prev) => prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m].sort((a, b) => a - b));
  }

  const isValid = form.restaurantName.length >= 2 && form.concept && form.city.length >= 2 && selectedMonths.length >= 1;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/sezon-planlama', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: form.restaurantName, concept: form.concept, city: form.city,
          targetMonths: selectedMonths, annualBudget: form.budget ? parseFloat(form.budget) : undefined,
          localEvents: form.localEvents || undefined, locale,
        }),
      });
      const data = await res.json();
      if (!res.ok) { onError(data.error ?? 'unknown'); return; }
      onResult(data.data);
    } catch { onError('network'); } finally { setLoading(false); }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.restName}</label>
          <input type="text" value={form.restaurantName} onChange={(e) => setForm((p) => ({ ...p, restaurantName: e.target.value }))} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.concept}</label>
          <select value={form.concept} onChange={(e) => setForm((p) => ({ ...p, concept: e.target.value }))} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {CONCEPTS.map((c) => <option key={c} value={c}>{t.concepts[c]}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.city}</label>
          <input type="text" value={form.city} onChange={(e) => setForm((p) => ({ ...p, city: e.target.value }))} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.budget}</label>
          <input type="number" value={form.budget} onChange={(e) => setForm((p) => ({ ...p, budget: e.target.value }))} disabled={loading} placeholder={t.budgetHelp} className={inputClass} />
        </div>
      </div>

      {/* Month selector */}
      <div>
        <label className="mb-2 block text-sm font-semibold text-[var(--dk-navy)]">{t.months}</label>
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
          {months.map((name, i) => {
            const m = i + 1;
            const selected = selectedMonths.includes(m);
            return (
              <button key={m} type="button" onClick={() => toggleMonth(m)} disabled={loading}
                className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                  selected ? 'border-[var(--dk-gold)] bg-[var(--dk-gold)]/10 text-[var(--dk-navy)]' : 'border-slate-200 text-slate-500 hover:border-[var(--dk-gold)]'
                }`}>
                {name}
              </button>
            );
          })}
        </div>
        {selectedMonths.length === 0 && <p className="mt-1 text-xs text-amber-600">{t.monthsHelp}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.events}</label>
        <textarea value={form.localEvents} onChange={(e) => setForm((p) => ({ ...p, localEvents: e.target.value }))} disabled={loading}
          placeholder={t.eventsPlaceholder} rows={2} maxLength={500} className={inputClass} />
      </div>

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
