'use client';

import { useState } from 'react';
import { Loader2, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { Locale } from '@/i18n/config';
import { DateInputAZ } from '@/components/marketing-tools/DateInputAZ';

interface Complaint { text: string; source: string; date: string }

const SOURCES = ['google', '2gis', 'instagram', 'whatsapp', 'verbal', 'other'] as const;
const PERIODS = ['last-week', 'last-month', 'last-quarter', 'custom'] as const;

const EMPTY: Complaint = { text: '', source: '', date: '' };

interface Props { locale: Locale; onResult: (data: unknown) => void; onError: (msg: string) => void }

export default function SikayetForm({ locale, onResult, onError }: Props) {
  // TASK-0516: copy lives in messages/*.json → mqForms.sikayet (was an in-file locale map).
  const t = useTranslations('mqForms.sikayet');
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
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('restName')}</label>
          <input type="text" value={restaurantName} onChange={(e) => setRestaurantName(e.target.value)} disabled={loading}
            className="w-full rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-[#0F172A] transition focus:border-[#D63B54] focus:outline-none focus:ring-2 focus:ring-[#D63B54]/15" />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-[#0F172A]">{t('period')}</label>
          <select value={period} onChange={(e) => setPeriod(e.target.value)} disabled={loading}
            className="w-full rounded-2xl border border-[#E4DCCD] bg-white px-4 py-3 text-sm text-[#0F172A] transition focus:border-[#D63B54] focus:outline-none">
            {PERIODS.map((p) => <option key={p} value={p}>{t(`periods.${p}`)}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {complaints.map((c, idx) => (
          <div key={idx} className="rounded-2xl border border-[#E4DCCD] bg-white p-3">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-12">
              <textarea placeholder={t('complaintText')} value={c.text} onChange={(e) => update(idx, 'text', e.target.value)} disabled={loading} rows={2}
                className="min-h-[80px] w-full resize-none rounded-lg border border-[#E4DCCD] px-3 py-2 text-sm focus:border-[#D63B54] focus:outline-none md:col-span-6" />
              <select value={c.source} onChange={(e) => update(idx, 'source', e.target.value)} disabled={loading}
                className="w-full rounded-lg border border-[#E4DCCD] px-3 py-2 text-sm focus:border-[#D63B54] focus:outline-none md:col-span-3">
                <option value="" disabled>{t('source')}</option>
                {SOURCES.map((s) => <option key={s} value={s}>{t(`sources.${s}`)}</option>)}
              </select>
              <div className="flex flex-col gap-1 md:col-span-3">
                <DateInputAZ
                  value={c.date}
                  onChange={(val) => update(idx, 'date', val)}
                  label={t('date')}
                />
              </div>
              {complaints.length > 3 && (
                <button type="button" onClick={() => remove(idx)} disabled={loading}
                  className="rounded-lg p-2 text-slate-400 transition hover:bg-red-50 hover:text-red-500 md:col-span-12" title={t('remove')} aria-label={t('remove')}>
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <button type="button" onClick={add} disabled={loading || complaints.length >= 30}
          className="inline-flex items-center gap-1 rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs font-semibold text-slate-500 transition hover:border-[#0F172A] hover:text-[#0F172A]">
          <Plus size={14} />{t('addComplaint')}
        </button>
        <span className="text-xs text-slate-600">{filled.length} / {complaints.length}</span>
      </div>

      {filled.length < 3 && <p className="text-xs text-amber-600">{t('minItems')}</p>}

      <button type="button" onClick={handleSubmit} disabled={!isValid || loading}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50">
        {loading ? <><Loader2 size={16} className="animate-spin" />{t('submitting')}</> : t('submit')}
      </button>
    </div>
  );
}
