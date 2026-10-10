'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { normalizeLocale, type Locale } from '@/i18n/config';
import AuthShell, { AUTH_BUTTON, AUTH_INPUT, AUTH_LABEL } from '@/components/auth/AuthShell';

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

  // TASK-0524: v2 auth frame (same as login / register).
  return (
    <AuthShell narrow title={copy.title} subtitle={copy.subtitle} backHref="/auth/login">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={AUTH_LABEL}>{copy.emailLabel}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={`${AUTH_INPUT} !pl-4`}
              placeholder={copy.emailPlaceholder}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className={AUTH_BUTTON}
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
              <a href={resetUrl} className="font-semibold text-dk-red hover:text-dk-red-strong">
                {copy.resetLinkText}
              </a>
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-sm text-slate-500">
          <Link href="/auth/login" className="font-semibold text-dk-red hover:text-dk-red-strong">
            {copy.backToLogin}
          </Link>
        </div>
    </AuthShell>
  );
}
