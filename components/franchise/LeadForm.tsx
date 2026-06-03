'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

type LeadFormProps = {
  toolSource: 'readiness_test' | 'roi_calc' | 'buyer_checklist' | 'academy' | 'consulting';
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
      <div className="rounded-2xl bg-emerald-50 p-6 text-center">
        <div className="mb-2 text-2xl">✓</div>
        <p className="font-bold text-emerald-700">{t('success')}</p>
      </div>
    );
  }

  const inputCls = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:border-[var(--dk-gold)] focus:outline-none';

  return (
    <div className="rounded-2xl bg-[var(--dk-navy)] p-6 text-center">
      <h3 className="mb-2 font-display text-xl font-bold text-white">{t('title')}</h3>
      <p className="mb-4 text-sm text-slate-300">{t('subtitle')}</p>
      <div className="mx-auto max-w-md space-y-3">
        <input className={inputCls} placeholder={t('name')} value={name} onChange={e => setName(e.target.value)} />
        <input className={inputCls} placeholder={t('brand')} value={brand} onChange={e => setBrand(e.target.value)} />
        <input className={inputCls} placeholder={t('contact')} value={contact} onChange={e => setContact(e.target.value)} />
        <label className="flex items-start gap-2 text-left text-xs text-slate-300">
          <input type="checkbox" checked={kvkk} onChange={e => setKvkk(e.target.checked)} className="mt-0.5" />
          {t('kvkk')}
        </label>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={submit}
            disabled={!name.trim() || !contact.trim() || !kvkk || status === 'sending'}
            className="rounded-full bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400 disabled:opacity-40"
          >
            {status === 'sending' ? '...' : t('cta')}
          </button>
        </div>
        {status === 'error' && <p className="text-xs text-red-400">{t('error')}</p>}
      </div>
    </div>
  );
}
