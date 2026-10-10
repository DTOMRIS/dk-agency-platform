'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';

/** Option values sent to the API (labels: messages mqForms.persona.concepts/segments/peaks). */
const CONCEPTS = ['fast-food', 'fine-dining', 'cafe', 'fast-casual', 'fine-casual', 'pub', 'traditional', 'other'] as const;
const SEGMENTS = ['families', 'young-professionals', 'students', 'tourists', 'business', 'seniors', 'mixed'] as const;
const PEAKS = ['morning', 'lunch', 'evening', 'late-night', 'all'] as const;

const inputClass = 'w-full rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-[#0F172A] transition focus:border-[#D63B54] focus:outline-none focus:ring-2 focus:ring-[#D63B54]/15';

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function PersonaForm({ locale, onResult, onError }: Props) {
  // TASK-0516: copy lives in messages/*.json → mqForms.persona (was an in-file locale map).
  const t = useTranslations('mqForms.persona');
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
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('restName')}</label>
          <input type="text" value={form.restaurantName} onChange={(e) => set('restaurantName', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('concept')}</label>
          <select value={form.concept} onChange={(e) => set('concept', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {CONCEPTS.map((v) => <option key={v} value={v}>{t(`concepts.${v}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('city')}</label>
          <input type="text" value={form.city} onChange={(e) => set('city', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('segment')}</label>
          <select value={form.targetSegment} onChange={(e) => set('targetSegment', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {SEGMENTS.map((v) => <option key={v} value={v}>{t(`segments.${v}`)}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('avgTicket')}</label>
          <input type="number" value={form.avgTicket} onChange={(e) => set('avgTicket', e.target.value)} disabled={loading} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('peakHours')}</label>
          <select value={form.peakHours} onChange={(e) => set('peakHours', e.target.value)} disabled={loading} className={inputClass}>
            <option value="" disabled>—</option>
            {PEAKS.map((v) => <option key={v} value={v}>{t(`peaks.${v}`)}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('observations')}</label>
        <textarea value={form.observations} onChange={(e) => set('observations', e.target.value)} disabled={loading}
          placeholder={t('obsPlaceholder')} rows={3} maxLength={500} className={inputClass} />
      </div>

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t('submitting')}</> : t('submit')}
      </button>
    </div>
  );
}
