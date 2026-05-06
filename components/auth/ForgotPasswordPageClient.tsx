'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { normalizeLocale, type Locale } from '@/i18n/config';

const forgotCopy: Record<Locale, {
  badge: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  submitting: string;
  submitBtn: string;
  demoLinkLabel: string;
  resetLinkText: string;
  backToLogin: string;
  fallbackError: string;
  fallbackSuccess: string;
}> = {
  az: {
    badge: 'Şifrəni sıfırla',
    title: 'Şifrəni sıfırla',
    subtitle: 'Qeydiyyatlı email ünvanınızı daxil edin',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    submitting: 'Göndərilir...',
    submitBtn: 'Sıfırlama linki göndər',
    demoLinkLabel: 'Demo link:',
    resetLinkText: 'Şifrəni yenilə',
    backToLogin: 'Daxil ol',
    fallbackError: 'Sorğu qəbul edilmədi.',
    fallbackSuccess: 'Sıfırlama linki email ünvanınıza göndərildi.',
  },
  en: {
    badge: 'Reset password',
    title: 'Reset password',
    subtitle: 'Enter the email address associated with your account',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    submitting: 'Sending...',
    submitBtn: 'Send reset link',
    demoLinkLabel: 'Demo link:',
    resetLinkText: 'Reset password',
    backToLogin: 'Sign in',
    fallbackError: 'Request not accepted.',
    fallbackSuccess: 'A reset link has been sent to your email address.',
  },
  tr: {
    badge: 'Şifreyi sıfırla',
    title: 'Şifreyi sıfırla',
    subtitle: 'Kayıtlı e-posta adresinizi girin',
    emailLabel: 'E-posta',
    emailPlaceholder: 'email@example.com',
    submitting: 'Gönderiliyor...',
    submitBtn: 'Sıfırlama bağlantısı gönder',
    demoLinkLabel: 'Demo bağlantı:',
    resetLinkText: 'Şifreyi yenile',
    backToLogin: 'Giriş yap',
    fallbackError: 'İstek kabul edilmedi.',
    fallbackSuccess: 'Sıfırlama bağlantısı e-posta adresinize gönderildi.',
  },
  ru: {
    badge: 'Сброс пароля',
    title: 'Сброс пароля',
    subtitle: 'Введите электронную почту, указанную при регистрации',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'email@example.com',
    submitting: 'Отправляем...',
    submitBtn: 'Отправить ссылку для сброса',
    demoLinkLabel: 'Демо-ссылка:',
    resetLinkText: 'Обновить пароль',
    backToLogin: 'Войти',
    fallbackError: 'Запрос не принят.',
    fallbackSuccess: 'Ссылка для сброса пароля отправлена на вашу почту.',
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'az';
  const pathSegment = window.location.pathname.split('/')[1];
  return normalizeLocale(pathSegment);
}

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');
  const [locale, setLocale] = useState<Locale>('az');

  useEffect(() => {
    setLocale(detectLocale());
  }, []);

  const copy = forgotCopy[locale];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setResetUrl('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, locale }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || copy.fallbackError);
        return;
      }

      setMessage(data.message || copy.fallbackSuccess);
      setResetUrl(data.resetUrl || '');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            {copy.badge}
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">{copy.title}</h1>
          <p className="mt-2 text-sm text-slate-600">{copy.subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">{copy.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder={copy.emailPlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? copy.submitting : copy.submitBtn}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {resetUrl ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            {copy.demoLinkLabel}
            <div className="mt-2">
              <a href={resetUrl} className="font-semibold text-red-600 hover:text-red-700">
                {copy.resetLinkText}
              </a>
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-sm text-slate-500">
          <Link href="/auth/login" className="font-semibold text-red-600 hover:text-red-700">
            {copy.backToLogin}
          </Link>
        </div>
      </div>
    </div>
  );
}
