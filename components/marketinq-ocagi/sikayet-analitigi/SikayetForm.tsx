'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface Complaint { text: string; source: string; date: string }

const SOURCES = ['google', '2gis', 'instagram', 'whatsapp', 'verbal', 'other'] as const;
const PERIODS = ['last-week', 'last-month', 'last-quarter', 'custom'] as const;

const copy: Record<Locale, {
  restName: string; period: string; periods: Record<string, string>;
  sources: Record<string, string>; addComplaint: string; complaintText: string;
  source: string; submit: string; submitting: string; minItems: string; remove: string;
}> = {
  az: {
    restName: 'Restoran adı',
    period: 'Dövr',
    periods: { 'last-week': 'Son həftə', 'last-month': 'Son ay', 'last-quarter': 'Son 3 ay', custom: 'Xüsusi' },
    sources: { google: 'Google Reviews', '2gis': '2GIS / Wolt / TripAdvisor', instagram: 'Instagram', whatsapp: 'WhatsApp', verbal: 'Birbaşa müştəri', other: 'Digər' },
    addComplaint: '+ Şikayət əlavə et',
    complaintText: 'Şikayət mətni',
    source: 'Mənbə seç',
    submit: 'Şikayətləri Analiz Et',
    submitting: 'AI fikirləşir...',
    minItems: 'Ən az 3 şikayət əlavə edin',
    remove: 'Sil',
  },
  en: {
    restName: 'Restaurant name',
    period: 'Period',
    periods: { 'last-week': 'Last week', 'last-month': 'Last month', 'last-quarter': 'Last quarter', custom: 'Custom' },
    sources: { google: 'Google Reviews', '2gis': '2GIS / Wolt / TripAdvisor', instagram: 'Instagram', whatsapp: 'WhatsApp', verbal: 'Direct customer', other: 'Other' },
    addComplaint: '+ Add complaint',
    complaintText: 'Complaint text',
    source: 'Select source',
    submit: 'Analyze Complaints',
    submitting: 'AI is thinking...',
    minItems: 'Add at least 3 complaints',
    remove: 'Remove',
  },
  tr: {
    restName: 'Restoran adı',
    period: 'Dönem',
    periods: { 'last-week': 'Son hafta', 'last-month': 'Son ay', 'last-quarter': 'Son 3 ay', custom: 'Özel' },
    sources: { google: 'Google Reviews', '2gis': '2GIS / Wolt / TripAdvisor', instagram: 'Instagram', whatsapp: 'WhatsApp', verbal: 'Direkt müşteri', other: 'Diğer' },
    addComplaint: '+ Şikayet ekle',
    complaintText: 'Şikayet metni',
    source: 'Kaynak seç',
    submit: 'Sikayetleri Analiz Et',
    submitting: 'AI düşünüyor...',
    minItems: 'En az 3 şikayet ekleyin',
    remove: 'Sil',
  },
  ru: {
    restName: 'Название ресторана',
    period: 'Период',
    periods: { 'last-week': 'Последняя неделя', 'last-month': 'Последний месяц', 'last-quarter': 'Последний квартал', custom: 'Другой' },
    sources: { google: 'Google Reviews', '2gis': '2GIS / Wolt / TripAdvisor', instagram: 'Instagram', whatsapp: 'WhatsApp', verbal: 'Клиент напрямую', other: 'Другое' },
    addComplaint: '+ Добавить жалобу',
    complaintText: 'Текст жалобы',
    source: 'Выберите источник',
    submit: 'Анализировать жалобы',
    submitting: 'ИИ думает...',
    minItems: 'Минимум 3 жалобы',
    remove: 'Удалить',
  },
};

const EMPTY: Complaint = { text: '', source: '', date: '' };

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

function formatDateAZ(iso: string) {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  return day && month && year ? `${day}.${month}.${year}` : iso;
}

export default function SikayetForm({ locale, onResult, onError }: Props) {
  const t = copy[locale];
  const [restaurantName, setRestaurantName] = useState('');
  const [period, setPeriod] = useState<string>('last-month');
  const [complaints, setComplaints] = useState<Complaint[]>([{ ...EMPTY }, { ...EMPTY }, { ...EMPTY }]);
  const [loading, setLoading] = useState(false);

  function update(idx: number, field: keyof Complaint, val: string) {
    setComplaints((prev) => prev.map((c, i) => i === idx ? { ...c, [field]: val } : c));
  }
  function add() { if (complaints.length < 30) setComplaints((prev) => [...prev, { ...EMPTY }]); }
  function remove(idx: number) { if (complaints.length > 3) setComplaints((prev) => prev.filter((_, i) => i !== idx)); }

  const filled = complaints.filter((c) => c.text.trim().length >= 5 && c.source);
  const isValid = restaurantName.trim().length >= 2 && filled.length >= 3;

  async function handleSubmit() {
    if (!isValid) return;
    setLoading(true);
    try {
      const res = await fetch('/api/marketing-tools/sikayet-analitigi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restaurantName, complaints: filled.map((c) => ({ text: c.text.trim(), source: c.source, ...(c.date ? { date: c.date } : {}) })), period, locale }),
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
          <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none focus:ring-2 focus:ring-[var(--dk-gold)]/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[var(--dk-navy)]">{t.period}</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} disabled={loading}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[var(--dk-navy)] transition focus:border-[var(--dk-gold)] focus:outline-none">
            {PERIODS.map((p) => <option key={p} value={p}>{t.periods[p]}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {complaints.map((c, idx) => (
          <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <textarea placeholder={t.complaintText} value={c.text} onChange={(e) => update(idx, 'text', e.target.value)} disabled={loading} rows={2}
                className="min-h-[80px] w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none md:col-span-6" />
              <select value={c.source} onChange={(e) => update(idx, 'source', e.target.value)} disabled={loading}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none md:col-span-3">
                <option value="" disabled>{t.source}</option>
                {SOURCES.map((s) => <option key={s} value={s}>{t.sources[s]}</option>)}
              </select>
              <div className="flex flex-col gap-1 md:col-span-3">
                <input type="date" value={c.date} onChange={(e) => update(idx, 'date', e.target.value)} disabled={loading}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-[var(--dk-gold)] focus:outline-none" />
                {c.date && <span className="block text-xs text-slate-500">Seçildi: {formatDateAZ(c.date)}</span>}
              </div>
              {complaints.length > 3 && (
                <button type="button" onClick={() => remove(idx)} disabled={loading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 md:col-span-12" title={t.remove}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={add} disabled={loading || complaints.length >= 30}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]">
          <Plus size={14} />{t.addComplaint}
        </button>
        <span className="text-xs text-slate-400">{filled.length} / {complaints.length}</span>
      </div>

      {filled.length < 3 && <p className="text-xs text-amber-600">{t.minItems}</p>}

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t.submitting}</> : t.submit}
      </button>
    </div>
  );
}
