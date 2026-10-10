'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { normalizeLocale, withLocale } from '@/i18n/config';
import AuthShell from '@/components/auth/AuthShell';

/** Email verification result page. Pattern A (verifyEmail) — TASK-0472. */
export default function VerifyEmailPageClient() {
  const t = useTranslations('verifyEmail');
  const locale = normalizeLocale(useLocale());
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'idle' : 'error');

  // TASK-0530: the real check is /api/auth/confirm (users + email_verification_tokens in the DB — the
  // link in the e-mail goes there too). This page used to POST to /api/auth/verify-email, which checked an
  // in-memory mock store, so a real token always showed «invalid». A token here now goes to the real route.
  useEffect(() => {
    if (!token) return;
    const id = window.requestAnimationFrame(() => {
      setState('loading');
      window.location.replace(`/api/auth/confirm?token=${encodeURIComponent(token)}`);
    });
    return () => window.cancelAnimationFrame(id);
  }, [token]);

  const message =
    state === 'loading' || state === 'idle' ? t('verifying') : state === 'success' ? t('success') : t('invalid');

  // TASK-0524: v2 auth frame (same as login / register).
  return (
    <AuthShell narrow title={t('title')}>
        <div
          role={state === 'error' ? 'alert' : 'status'}
          className={`mt-6 rounded-xl p-4 text-sm ${
            state === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
              : state === 'error'
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-slate-200 bg-slate-50 text-slate-700'
          }`}
        >
          {message}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href={withLocale(locale, '/auth/login')} className="rounded-full bg-dk-red-strong px-5 py-3 text-sm font-bold text-white">
            {t('login')}
          </Link>
          <Link href={withLocale(locale, '/auth/register')} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
            {t('backToRegister')}
          </Link>
        </div>
    </AuthShell>
  );
}
