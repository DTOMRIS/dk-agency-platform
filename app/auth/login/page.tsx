'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { type MemberSession, writeMemberSession } from '@/lib/member-access';
import { normalizeLocale, type Locale } from '@/i18n/config';

const loginCopy: Record<Locale, {
  goBack: string;
  badge: string;
  title: string;
  subtitle: string;
  emailLabel: string;
  emailPlaceholder: string;
  passwordLabel: string;
  forgotPassword: string;
  submitting: string;
  submitBtn: string;
  noAccount: string;
  signUp: string;
  membershipInfo: string;
  ctaHeading: string;
  ctaDesc: string;
  ctaButton: string;
  fallbackError: string;
}> = {
  az: {
    goBack: 'Geri qayıt',
    badge: 'DK Members',
    title: 'Daxil ol',
    subtitle: 'Premium məqalələrə, KAZAN AI-a və hesab ayarlarınıza giriş üçün hesabınıza daxil olun.',
    emailLabel: 'E-mail',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Şifrə',
    forgotPassword: 'Şifrəni unutdum?',
    submitting: 'Yoxlanır...',
    submitBtn: 'Daxil ol və davam et',
    noAccount: 'Hesabın yoxdur?',
    signUp: 'Üzv ol',
    membershipInfo: 'Üzvlük modeli haqqında bax:',
    ctaHeading: 'DK Members',
    ctaDesc: 'Premium məqalələr, KAZAN AI, Toolkit və daha çoxuna giriş əldə edin.',
    ctaButton: 'Hesab yarat',
    fallbackError: 'Daxil olmaq alınmadı.',
  },
  en: {
    goBack: 'Go back',
    badge: 'DK Members',
    title: 'Sign in',
    subtitle: 'Sign in to your account to access premium articles, KAZAN AI, and account settings.',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Password',
    forgotPassword: 'Forgot password?',
    submitting: 'Verifying...',
    submitBtn: 'Sign in and continue',
    noAccount: "Don't have an account?",
    signUp: 'Sign up',
    membershipInfo: 'Learn about membership:',
    ctaHeading: 'DK Members',
    ctaDesc: 'Get access to premium articles, KAZAN AI, Toolkit and more.',
    ctaButton: 'Create account',
    fallbackError: 'Sign in failed.',
  },
  tr: {
    goBack: 'Geri dön',
    badge: 'DK Members',
    title: 'Giriş yap',
    subtitle: 'Premium içeriklere, KAZAN AI\'a ve hesap ayarlarına erişmek için giriş yapın.',
    emailLabel: 'E-posta',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Şifre',
    forgotPassword: 'Şifremi unuttum?',
    submitting: 'Doğrulanıyor...',
    submitBtn: 'Giriş yap ve devam et',
    noAccount: 'Hesabınız yok mu?',
    signUp: 'Üye ol',
    membershipInfo: 'Üyelik hakkında bilgi alın:',
    ctaHeading: 'DK Members',
    ctaDesc: 'Premium içeriklere, KAZAN AI, Toolkit ve daha fazlasına erişin.',
    ctaButton: 'Hesap oluştur',
    fallbackError: 'Giriş başarısız.',
  },
  ru: {
    goBack: 'Назад',
    badge: 'DK Members',
    title: 'Войти',
    subtitle: 'Войдите в свой аккаунт для доступа к премиум-материалам, KAZAN AI и настройкам.',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'email@example.com',
    passwordLabel: 'Пароль',
    forgotPassword: 'Забыли пароль?',
    submitting: 'Проверяем...',
    submitBtn: 'Войти и продолжить',
    noAccount: 'Нет аккаунта?',
    signUp: 'Зарегистрироваться',
    membershipInfo: 'Узнать о членстве:',
    ctaHeading: 'DK Members',
    ctaDesc: 'Получите доступ к премиум-материалам, KAZAN AI, Toolkit и многому другому.',
    ctaButton: 'Создать аккаунт',
    fallbackError: 'Не удалось войти.',
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'az';
  const pathSegment = window.location.pathname.split('/')[1];
  return normalizeLocale(pathSegment);
}

export default function LoginPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState('/haberler');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [locale, setLocale] = useState<Locale>('az');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get('next') || '/haberler');
    setLocale(detectLocale());
  }, []);

  const copy = loginCopy[locale];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error || copy.fallbackError);
        return;
      }

      const session: MemberSession = {
        email: data.user.email,
        name: data.user.name || '',
        loggedIn: true,
        plan: data.user.role === 'admin' ? 'admin' : 'member',
      };
      writeMemberSession(session);
      await fetch('/api/member/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      router.push(nextUrl);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="p-4">
        <Link
          href={nextUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.goBack}
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 pb-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                {copy.badge}
              </div>
              <h1 className="text-3xl font-black text-slate-900">{copy.title}</h1>
              <p className="mt-2 text-slate-600">{copy.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder={copy.emailPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div className="text-right">
                <Link href="/forgot-password" className="text-sm font-semibold text-red-600 hover:text-red-700">
                  {copy.forgotPassword}
                </Link>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                <LogIn className="h-5 w-5" />
                {submitting ? copy.submitting : copy.submitBtn}
              </button>
            </form>

            <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
              <span>{copy.noAccount}</span>
              <Link
                href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                {copy.signUp}
              </Link>
            </div>

            <p className="mt-3 text-sm text-slate-500">
              {copy.membershipInfo}{' '}
              <Link href="/uzvluk" className="font-semibold text-slate-900 hover:text-red-600">
                /uzvluk
              </Link>
            </p>
          </div>

          <div className="bg-slate-950 p-8 text-white md:p-10">
            <div className="flex flex-col items-center justify-center gap-4 text-center h-full">
              <ShieldCheck className="h-12 w-12 text-amber-400" />
              <h2 className="text-xl font-bold">{copy.ctaHeading}</h2>
              <p className="text-sm text-slate-400">{copy.ctaDesc}</p>
              <Link
                href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
                className="mt-2 inline-block rounded-full bg-amber-400/20 px-6 py-2 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/30"
              >
                {copy.ctaButton}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
