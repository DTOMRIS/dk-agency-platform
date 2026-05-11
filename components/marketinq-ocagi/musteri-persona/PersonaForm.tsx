'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

const copy: Record<Locale, {
  restName: string; concept: string; city: string; segment: string; avgTicket: string;
  peakHours: string; observations: string; obsPlaceholder: string;
  submit: string; submitting: string;
  concepts: Record<string, string>; segments: Record<string, string>; peaks: Record<string, string>;
}> = {
  az: {
    restName: 'Restoran adı', concept: 'Konsept', city: 'Şəhər', segment: 'Hədəf segment', avgTicket: 'Ort. hesab (AZN)',
    peakHours: 'Pik saatlar', observations: 'Əlavə müşahidə', obsPlaceholder: 'Müştəriləriniz haqqında bildiyiniz detallar...',
    submit: 'Personamı Yarat', submitting: 'AI fikirləşir...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Kafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Fine casual', pub: 'Pub/Bar', traditional: 'Ənənəvi', other: 'Digər' },
    segments: { families: 'Ailələr', 'young-professionals': 'Gənc peşəkarlar', students: 'Tələbələr', tourists: 'Turistlər', business: 'İş adamları', seniors: 'Yaşlılar', mixed: 'Qarışıq' },
    peaks: { morning: 'Səhər', lunch: 'Nahar', evening: 'Axşam', 'late-night': 'Gec gecə', all: 'Hamısı' },
  },
  en: {
    restName: 'Restaurant name', concept: 'Concept', city: 'City', segment: 'Target segment', avgTicket: 'Avg ticket (AZN)',
    peakHours: 'Peak hours', observations: 'Additional observations', obsPlaceholder: 'Details about your customers...',
    submit: 'Create My Persona', submitting: 'AI is thinking...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Cafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Fine casual', pub: 'Pub/Bar', traditional: 'Traditional', other: 'Other' },
    segments: { families: 'Families', 'young-professionals': 'Young professionals', students: 'Students', tourists: 'Tourists', business: 'Business', seniors: 'Seniors', mixed: 'Mixed' },
    peaks: { morning: 'Morning', lunch: 'Lunch', evening: 'Evening', 'late-night': 'Late night', all: 'All day' },
  },
  tr: {
    restName: 'Restoran adı', concept: 'Konsept', city: 'Şehir', segment: 'Hedef segment', avgTicket: 'Ort. hesap (AZN)',
    peakHours: 'Yoğun saatler', observations: 'Ek gözlem', obsPlaceholder: 'Müşterileriniz hakkında bildiğiniz detaylar...',
    submit: 'Personamı Oluştur', submitting: 'AI düşünüyor...',
    concepts: { 'fast-food': 'Fast food', 'fine-dining': 'Fine dining', cafe: 'Kafe', 'fast-casual': 'Fast casual', 'fine-casual': 'Fine casual', pub: 'Pub/Bar', traditional: 'Geleneksel', other: 'Diğer' },
    segments: { families: 'Aileler', 'young-professionals': 'Genç profesyoneller', students: 'Öğrenciler', tourists: 'Turistler', business: 'İş insanları', seniors: 'Yaşlılar', mixed: 'Karışık' },
    peaks: { morning: 'Sabah', lunch: 'Öğle', evening: 'Akşam', 'late-night': 'Gece geç', all: 'Tüm gün' },
  },
  ru: {
    restName: 'Название ресторана', concept: 'Концепт', city: 'Город', segment: 'Целевой сегмент', avgTicket: 'Ср. чек (AZN)',
    peakHours: 'Пиковые часы', observations: 'Дополнительные наблюдения', obsPlaceholder: 'Детали о ваших клиентах...',
    submit: 'Создать персону', submitting: 'ИИ думает...',
    concepts: { 'fast-food': 'Фаст-фуд', 'fine-dining': 'Fine dining', cafe: 'Кафе', 'fast-casual': 'Fast casual', 'fine-casual': 'Fine casual', pub: 'Паб/Бар', traditional: 'Традиционный', other: 'Другой' },
    segments: { families: 'Семьи', 'young-professionals': 'Молодые специалисты', students: 'Студенты', tourists: 'Туристы', business: 'Бизнес', seniors: 'Пожилые', mixed: 'Смешанный' },
    peaks: { morning: 'Утро', lunch: 'Обед', evening: 'Вечер', 'late-night': 'Поздний вечер', all: 'Весь день' },
  },
};

const inputClass = 'w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20';

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function PersonaForm({ locale, onResult, onError }: Props) {
  const t = copy[locale];
  const [form, setForm] = useState({ restaurantName: '', concept: '', city: '', targetSegment: '', avgTicket: '', peakHours: '', observations: '' });
  const [loading, setLoading] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const isValid = form.restaurantName.length >= 2 && form.concept && form.city.length >= 2 && form.targetSegment && form.peakHours;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/musteri-persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, avgTicket: form.avgTicket ? parseFloat(form.avgTicket) : undefined, locale }),
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
          <input type="text" value={form.restaurantName} onChange={(e) => set('restaurantName', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.concept}</label>
          <select value={form.concept} onChange={(e) => set('concept', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {Object.entries(t.concepts).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.city}</label>
          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.segment}</label>
          <select value={form.targetSegment} onChange={(e) => set('targetSegment', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {Object.entries(t.segments).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.avgTicket}</label>
          <input type="number" value={form.avgTicket} onChange={(e) => set('avgTicket', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.peakHours}</label>
          <select value={form.peakHours} onChange={(e) => set('peakHours', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {Object.entries(t.peaks).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.observations}</label>
        <textarea value={form.observations} onChange={(e) => set('observations', e.target.value)} disabled={loading}
          placeholder={t.obsPlaceholder} rows={3} maxLength={500} className={inputClass} />
      </div>

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
