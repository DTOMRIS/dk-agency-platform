'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';

interface SektorLeadCaptureProps {
  namespace: string;
  headingKey: string;
  bodyKey: string;
  buttonKey: string;
  toolSource: string;
}

export default function SektorLeadCapture({
  namespace,
  headingKey,
  bodyKey,
  buttonKey,
  toolSource,
}: SektorLeadCaptureProps) {
  const t = useTranslations(namespace);
  const locale = useLocale();
  const [name, setName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [kvkk, setKvkk] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!kvkk) return;
    setStatus('loading');
    setErrorMsg('');

    try {
      const res = await fetch('/api/lead/ota-guide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          contact: email.trim() || whatsapp.trim(),
          whatsapp: whatsapp.trim(),
          toolSource,
          consentKvkk: true,
          consentVersion: '2026-06-05',
          locale,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Xəta baş verdi');
      }
      setStatus('success');
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Xəta baş verdi');
      setStatus('error');
    }
  }

  if (status === 'success') {
    return (
      <section id="lead-capture" className="bg-[#1A1A2E] py-16 sm:py-20">
        <div className="mx-auto max-w-xl px-4 text-center">
          <div className="rounded-2xl border border-[#C5A022]/30 bg-white/5 p-10">
            <div className="mb-4 text-4xl">✅</div>
            <h3 className="font-display text-2xl font-black text-white">Təşəkkürlər!</h3>
            <p className="mt-4 text-slate-300">
              WhatsApp və ya email vasitəsilə 24 saat içində əlaqə saxlayacağıq.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="lead-capture" className="bg-[#1A1A2E] py-16 sm:py-20">
      <div className="mx-auto max-w-xl px-4 sm:px-6">
        <div className="rounded-2xl border border-[#C5A022]/30 bg-white/5 p-8 sm:p-10">
          <h2 className="mb-2 text-center font-display text-2xl font-black text-white sm:text-3xl">
            {t(headingKey)}
          </h2>
          <p className="mb-8 text-center text-sm text-slate-300">{t(bodyKey)}</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Adınız"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C5A022]/50"
            />
            <input
              type="tel"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp (+994 XX XXX XX XX)"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C5A022]/50"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#C5A022]/50"
            />

            <label className="flex items-start gap-3 text-xs text-slate-400">
              <input
                type="checkbox"
                checked={kvkk}
                onChange={(e) => setKvkk(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/5"
              />
              <span>
                Şəxsi məlumatlarımın emal edilməsinə razıyam (KVKK).
              </span>
            </label>

            {status === 'error' && (
              <p className="text-sm text-red-400">{errorMsg}</p>
            )}

            <button
              type="submit"
              disabled={!kvkk || status === 'loading'}
              className="w-full rounded-xl bg-[var(--dk-red)] py-3.5 text-sm font-bold text-white shadow-lg shadow-[var(--dk-red)]/20 transition hover:brightness-110 disabled:opacity-50"
            >
              {status === 'loading' ? '...' : t(buttonKey)}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
