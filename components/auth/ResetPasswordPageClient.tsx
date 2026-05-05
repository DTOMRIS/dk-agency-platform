'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';

const resetCopy: Record<Locale, {
  title: string;
  invalidToken: string;
  newPasswordLabel: string;
  confirmPasswordLabel: string;
  submitting: string;
  submitBtn: string;
  backToLogin: string;
  requestNewLink: string;
  errorInvalidToken: string;
  errorMinLength: string;
  errorMismatch: string;
  fallbackError: string;
  fallbackSuccess: string;
}> = {
  az: {
    title: 'Yeni şifrə təyin edin',
    invalidToken: 'Etibarsız və ya müddəti bitmiş link.',
    newPasswordLabel: 'Yeni şifrə',
    confirmPasswordLabel: 'Yeni şifrəni təsdiqlə',
    submitting: 'Yenilənir...',
    submitBtn: 'Şifrəni yenilə',
    backToLogin: 'Daxil ol',
    requestNewLink: 'Yenidən link istə',
    errorInvalidToken: 'Link etibarsızdır və ya müddəti bitib. Yenidən cəhd edin.',
    errorMinLength: 'Yeni şifrə minimum 8 simvol olmalıdır.',
    errorMismatch: 'Şifrələr eyni olmalıdır.',
    fallbackError: 'Link etibarsızdır və ya müddəti bitib. Yenidən cəhd edin.',
    fallbackSuccess: 'Şifrəniz yeniləndi.',
  },
  en: {
    title: 'Set a new password',
    invalidToken: 'Invalid or expired link.',
    newPasswordLabel: 'New password',
    confirmPasswordLabel: 'Confirm new password',
    submitting: 'Updating...',
    submitBtn: 'Update password',
    backToLogin: 'Sign in',
    requestNewLink: 'Request a new link',
    errorInvalidToken: 'The link is invalid or has expired. Please try again.',
    errorMinLength: 'New password must be at least 8 characters.',
    errorMismatch: 'Passwords must match.',
    fallbackError: 'The link is invalid or has expired. Please try again.',
    fallbackSuccess: 'Your password has been updated.',
  },
  tr: {
    title: 'Yeni şifre belirleyin',
    invalidToken: 'Geçersiz veya süresi dolmuş bağlantı.',
    newPasswordLabel: 'Yeni şifre',
    confirmPasswordLabel: 'Yeni şifreyi onayla',
    submitting: 'Güncelleniyor...',
    submitBtn: 'Şifreyi güncelle',
    backToLogin: 'Giriş yap',
    requestNewLink: 'Yeni bağlantı talep et',
    errorInvalidToken: 'Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.',
    errorMinLength: 'Yeni şifre en az 8 karakter olmalıdır.',
    errorMismatch: 'Şifreler eşleşmelidir.',
    fallbackError: 'Bağlantı geçersiz veya süresi dolmuş. Lütfen tekrar deneyin.',
    fallbackSuccess: 'Şifreniz güncellendi.',
  },
  ru: {
    title: 'Задайте новый пароль',
    invalidToken: 'Недействительная или истёкшая ссылка.',
    newPasswordLabel: 'Новый пароль',
    confirmPasswordLabel: 'Подтвердите новый пароль',
    submitting: 'Обновляем...',
    submitBtn: 'Обновить пароль',
    backToLogin: 'Войти',
    requestNewLink: 'Запросить новую ссылку',
    errorInvalidToken: 'Ссылка недействительна или истекла. Попробуйте снова.',
    errorMinLength: 'Новый пароль должен содержать не менее 8 символов.',
    errorMismatch: 'Пароли должны совпадать.',
    fallbackError: 'Ссылка недействительна или истекла. Попробуйте снова.',
    fallbackSuccess: 'Ваш пароль обновлён.',
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'az';
  const pathSegment = window.location.pathname.split('/')[1];
  return normalizeLocale(pathSegment);
}

export default function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [locale, setLocale] = useState<Locale>('az');

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const copy = resetCopy[locale];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError(copy.errorInvalidToken);
      return;
    }
    if (password.length < 8) {
      setError(copy.errorMinLength);
      return;
    }
    if (password !== confirmPassword) {
      setError(copy.errorMismatch);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || copy.fallbackError);
        return;
      }
      setSuccess(data.message || copy.fallbackSuccess);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900">{copy.title}</h1>
        {!token ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {copy.invalidToken}
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{copy.newPasswordLabel}</label>
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">{copy.confirmPasswordLabel}</label>
              <input
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? copy.submitting : copy.submitBtn}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/auth/login" className="font-semibold text-red-600 hover:text-red-700">
            {copy.backToLogin}
          </Link>
          <Link href="/auth/forgot-password" className="font-semibold text-slate-600 hover:text-slate-900">
            {copy.requestNewLink}
          </Link>
        </div>
      </div>
    </div>
  );
}
