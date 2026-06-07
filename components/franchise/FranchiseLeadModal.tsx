'use client';

import { FormEvent, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Loader2, X } from 'lucide-react';
import { trackFranchiseRadar } from '@/lib/analytics/franchiseEvents';

type Props = {
  brandSlug: string;
  brandName: string;
  onClose: () => void;
};

export default function FranchiseLeadModal({ brandSlug, brandName, onClose }: Props) {
  const t = useTranslations('franchiseRadar');
  const locale = useLocale();
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [consent, setConsent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (loading) return;
    if (!name.trim() || !contact.trim() || !consent) {
      setError(t('lead.required'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/lead/franchise-radar', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, contact, brandSlug, consent, locale }),
      });
      const payload = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok || !payload.success) throw new Error(payload.error || 'failed');
      trackFranchiseRadar({ action: 'lead', brandSlug });
      setDone(true);
    } catch {
      setError(t('lead.error'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('lead.close')}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <h3 className="text-lg font-black text-slate-900">{t('lead.successTitle')}</h3>
            <p className="mt-2 text-sm text-slate-600">{t('lead.success')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 rounded-xl bg-[var(--dk-navy)] px-5 py-2.5 text-sm font-black text-white transition hover:opacity-90"
            >
              {t('lead.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="text-lg font-black text-slate-900">{t('lead.title')}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {t('lead.subtitle')}{' '}
              <span className="font-bold text-[var(--dk-navy)]">{brandName}</span>
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('lead.namePlaceholder')}
                className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
              />
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('lead.contactPlaceholder')}
                className="min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
              />
              <label className="flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--dk-navy)]"
                />
                <span>{t('lead.consent')}</span>
              </label>
            </div>

            {error ? (
              <p className="mt-2 text-xs font-semibold text-[var(--dk-red)]">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-4 text-sm font-black text-white transition hover:bg-rose-600 disabled:bg-slate-300"
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {t('lead.submit')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
