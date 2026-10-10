'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

type LeadFormProps = {
  toolSource: 'readiness_test' | 'roi_calc' | 'buyer_checklist' | 'franchbook_gate' | 'academy' | 'consulting';
  score?: Record<string, unknown>;
};

export default function LeadForm({ toolSource, score }: LeadFormProps) {
  const t = useTranslations('franchiseLead');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [contact, setContact] = useState('');
  const [kvkk, setKvkk] = useState(false);
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');

  async function submit() {
    if (!name.trim() || !contact.trim() || !kvkk) return;
    setStatus('sending');
    try {
      const res = await fetch('/api/member/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, brand, contact, toolSource, score, locale, consentKvkk: true, consentVersion: 'v1' }),
      });
      if (res.ok) setStatus('ok');
      else setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'ok') {
    return (
      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-6 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <p className="font-bold text-emerald-700">{t('success')}</p>
      </div>
    );
  }

  // TASK-0531: v2 look (was navy + gold) — white card, cream inputs, the red action button.
  const inputCls =
    'w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] placeholder:text-slate-400 outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';

  return (
    <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8">
      <div className="grid gap-6 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
        <div>
          <h3 className="text-[22px] font-black leading-tight tracking-[-0.03em] text-[#0F172A]">{t('title')}</h3>
          <p className="mt-2 text-[14.5px] leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="space-y-3">
          <input className={inputCls} placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} />
          <input className={inputCls} placeholder={t('brand')} value={brand} onChange={e => setBrand(e.target.value)} />
          <input className={inputCls} placeholder={t('contact')} value={contact} onChange={e => setContact(e.target.value)} />
          <label className="flex items-start gap-2 text-left text-[12.5px] leading-5 text-slate-600">
            <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} className="mt-0.5 accent-[#D63B54]" />
            {t('kvkk')}
          </label>
          <button
            type="button"
            onClick={submit}
            disabled={!name.trim() || !contact.trim() || !kvkk || status === 'sending'}
            className="inline-flex min-h-11 items-center rounded-full bg-dk-red-strong px-6 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === 'sending' ? '...' : t('cta')}
          </button>
          {status === 'error' && <p className="text-[13px] font-semibold text-[#BE2F47]">{t('error')}</p>}
        </div>
      </div>
    </div>
  );
}
