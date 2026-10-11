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
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_24px_60px_-28px_rgba(15,23,42,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('lead.close')}
          className="absolute right-4 top-4 rounded-full p-1.5 text-slate-400 transition hover:bg-[#F6F1E9] hover:text-[#0F172A]"
        >
          <X size={20} />
        </button>

        {done ? (
          <div className="py-6 text-center">
            <h3 className="text-[20px] font-black tracking-[-0.02em] text-[#0F172A]">{t('lead.successTitle')}</h3>
            <p className="mt-2 text-sm text-slate-600">{t('lead.success')}</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#0F172A] px-5 text-[14px] font-bold text-white transition hover:bg-[#1E293B]"
            >
              {t('lead.done')}
            </button>
          </div>
        ) : (
          <form onSubmit={submit}>
            <h3 className="text-[20px] font-black tracking-[-0.02em] text-[#0F172A]">{t('lead.title')}</h3>
            <p className="mt-1 text-sm text-slate-600">
              {t('lead.subtitle')}{' '}
              <span className="font-bold text-[#0F172A]">{brandName}</span>
            </p>

            <div className="mt-4 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('lead.namePlaceholder')}
                className="min-h-11 w-full rounded-xl border border-[#E4DCCD] bg-white px-3.5 text-[15px] text-[#0F172A] outline-none placeholder:text-slate-400 focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
              />
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder={t('lead.contactPlaceholder')}
                className="min-h-11 w-full rounded-xl border border-[#E4DCCD] bg-white px-3.5 text-[15px] text-[#0F172A] outline-none placeholder:text-slate-400 focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15"
              />
              <label className="flex items-start gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#D63B54]"
                />
                <span>{t('lead.consent')}</span>
              </label>
            </div>

            {error ? (
              <p className="mt-2 text-xs font-semibold text-[#BE2F47]">{error}</p>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dk-red-strong px-4 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep disabled:bg-slate-300"
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
