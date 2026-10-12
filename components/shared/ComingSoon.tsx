'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Wrench, BookOpen } from 'lucide-react';
import { normalizeLocale, withLocale } from '@/i18n/config';
import home from '@/components/home/v2/homeV2.module.css';
import s from '@/components/inner/inner.module.css';
import { BackLink } from '@/components/inner/InnerParts';

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
    <div className={`${s.page} flex min-h-[calc(100vh-4rem)] items-center justify-center py-16`}>
      <div className={home.wrap}>
        <div className="mx-auto w-full max-w-md rounded-[22px] border border-[#E4DCCD] bg-white p-8 text-center">
          <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FDECEF]">
            <Wrench size={32} className="text-[#BE2F47]" aria-hidden="true" />
          </div>

          {category && (
            <span className="mb-4 block text-[10px] font-bold uppercase tracking-[0.3em] text-[#BE2F47]">
              {category}
            </span>
          )}

          <h1 className="mb-4 text-3xl font-black tracking-[-0.035em] text-[#0F172A]">{title}</h1>
          <p className="mb-10 text-base leading-relaxed text-[#5B6474]">{description}</p>

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
                  className="min-w-0 flex-1 rounded-full border border-[#E4DCCD] bg-white px-4 py-3.5 text-sm text-[#0F172A] transition-colors focus:border-[#0F172A] focus:outline-none"
                  required
                />
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="whitespace-nowrap rounded-full bg-dk-red-strong px-6 py-3.5 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep disabled:opacity-60"
                >
                  {status === 'loading' ? '...' : t('notifyCta')}
                </button>
              </div>
              {status === 'error' && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{t('error')}</p>}
            </form>
          ) : (
            <div className="mb-10 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
              <p role="status" className="text-sm font-medium text-emerald-800">{t('success')}</p>
            </div>
          )}

          <div className="mb-8 border-t border-[#EFE9DE] pt-8">
            <p className="mb-4 text-sm text-[#5B6474]">{t('meanwhile')}</p>
            <div className="flex justify-center gap-3">
              <Link
                href={withLocale(locale, '/blog')}
                className="flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#0F172A]"
              >
                <BookOpen size={16} aria-hidden="true" /> {t('blog')}
              </Link>
              <Link
                href={withLocale(locale, '/toolkit')}
                className="flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-5 py-3 text-sm font-semibold text-[#0F172A] transition-colors hover:border-[#0F172A]"
              >
                <Wrench size={16} aria-hidden="true" /> {t('toolkit')}
              </Link>
            </div>
          </div>

          <BackLink href={withLocale(locale, '/')} label={t('backHome')} />
        </div>
      </div>
    </div>
  );
}
