'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Wrench, BookOpen } from 'lucide-react';
import { normalizeLocale, withLocale } from '@/i18n/config';

interface ComingSoonProps {
  title: string;
  description: string;
  category?: string;
}

/**
 * "Coming soon" placeholder page. Pattern A (comingSoon) — TASK-0472.
 * The notify form subscribes to the real newsletter API (it used to only fake a success message).
 */
export default function ComingSoon({ title, description, category }: ComingSoonProps) {
  const t = useTranslations('comingSoon');
  const locale = normalizeLocale(useLocale());
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || status === 'loading') return;
    setStatus('loading');
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), source: 'homepage_newsletter' }),
      });
      if (!res.ok) throw new Error('subscribe_failed');
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[var(--dk-paper)] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full text-center">
        <div className="w-16 h-16 bg-[color-mix(in srgb, var(--dk-gold) 22%, white)] rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Wrench size={32} className="text-[color-mix(in srgb, var(--dk-gold) 78%, black)]" aria-hidden="true" />
        </div>

        {category && (
          <span className="text-[10px] font-bold text-brand-red uppercase tracking-[0.3em] mb-4 block">
            {category}
          </span>
        )}

        <h1 className="text-3xl font-display font-bold text-[var(--dk-navy)] mb-4">{title}</h1>
        <p className="text-slate-700 text-base leading-relaxed mb-10">{description}</p>

        {status !== 'success' ? (
          <form onSubmit={handleSubmit} className="mb-10">
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                aria-label={t('emailLabel')}
                autoComplete="email"
                className="min-w-0 flex-1 bg-white border-[1.5px] border-[var(--dk-border-soft)] rounded-xl px-4 py-3.5 text-sm text-slate-900 focus:outline-none focus:border-[var(--dk-gold)] transition-colors"
                required
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-[var(--dk-gold)] text-white rounded-xl px-6 py-3.5 text-sm font-bold hover:bg-[color-mix(in srgb, var(--dk-gold) 92%, black)] transition-colors whitespace-nowrap disabled:opacity-60"
              >
                {status === 'loading' ? '...' : t('notifyCta')}
              </button>
            </div>
            {status === 'error' && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{t('error')}</p>}
          </form>
        ) : (
          <div className="bg-[color-mix(in srgb, var(--dk-success) 12%, white)] border border-[color-mix(in srgb, var(--dk-success) 28%, white)] rounded-xl p-4 mb-10">
            <p role="status" className="text-[color-mix(in srgb, var(--dk-success) 76%, black)] font-medium text-sm">{t('success')}</p>
          </div>
        )}

        <div className="border-t border-[var(--dk-border-soft)] pt-8 mb-8">
          <p className="text-sm text-slate-700 mb-4">{t('meanwhile')}</p>
          <div className="flex gap-3 justify-center">
            <Link
              href={withLocale(locale, '/blog')}
              className="flex items-center gap-2 bg-white border border-[var(--dk-border-soft)] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[var(--dk-gold)] transition-colors"
            >
              <BookOpen size={16} aria-hidden="true" /> {t('blog')}
            </Link>
            <Link
              href={withLocale(locale, '/toolkit')}
              className="flex items-center gap-2 bg-white border border-[var(--dk-border-soft)] rounded-xl px-5 py-3 text-sm font-semibold text-slate-700 hover:border-[var(--dk-gold)] transition-colors"
            >
              <Wrench size={16} aria-hidden="true" /> {t('toolkit')}
            </Link>
          </div>
        </div>

        <Link href={withLocale(locale, '/')} className="text-sm text-slate-700 hover:text-[var(--dk-gold)] transition-colors inline-flex items-center gap-2">
          <ArrowLeft size={14} aria-hidden="true" /> {t('backHome')}
        </Link>
      </div>
    </div>
  );
}
