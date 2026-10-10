'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Lock, LogIn, Mail } from 'lucide-react';
import AuthShell, { AUTH_BUTTON, AUTH_INPUT, AUTH_LABEL, AUTH_LINK } from '@/components/auth/AuthShell';
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
  rememberMe: string;
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
    rememberMe: 'Yadda sakla',
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
    rememberMe: 'Remember me',
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
    rememberMe: 'Beni hatırla',
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
    rememberMe: 'Запомнить меня',
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
  const [rememberMe, setRememberMe] = useState(true);

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
          rememberMe,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.ok) {
        setError(data?.error || copy.fallbackError);
        return;
      }

      const isAdmin = data.user.role === 'admin';
      const session: MemberSession = {
        email: data.user.email,
        name: data.user.name || '',
        loggedIn: true,
        plan: isAdmin ? 'admin' : 'member',
      };
      writeMemberSession(session);
      // fake-scan-ok: display-name sync only — role/login come from the signed JWT (TASK-0457)
      await fetch('/api/member/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(session),
      });

      // Role-based redirect: admin → dashboard, member → b2b-panel
      const defaultRedirect = isAdmin ? '/dashboard' : '/b2b-panel';
      const target = nextUrl === '/haberler' ? defaultRedirect : nextUrl;
      router.push(target);
    } finally {
      setSubmitting(false);
    }
  };

  // TASK-0524: v2 auth frame (cream, Inter, spinning DK mark top-left) — same as register / forgot / reset.
  return (
    <AuthShell title={copy.title} subtitle={copy.subtitle} backHref={nextUrl}>
      <form onSubmit={handleSubmit} className="space-y-4" data-testid="login-form">
        <div>
          <label htmlFor="login-email" className={AUTH_LABEL}>{copy.emailLabel}</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="username"
              value={formData.email}
              onChange={(event) => setFormData({ ...formData, email: event.target.value })}
              placeholder={copy.emailPlaceholder}
              className={AUTH_INPUT}
            />
          </div>
        </div>

        <div>
          <label htmlFor="login-password" className={AUTH_LABEL}>{copy.passwordLabel}</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="login-password"
              type="password"
              required
              autoComplete="current-password"
              value={formData.password}
              onChange={(event) => setFormData({ ...formData, password: event.target.value })}
              placeholder="••••••••"
              className={AUTH_INPUT}
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 cursor-pointer rounded border-[#E4DCCD] accent-[#D63B54]"
            />
            <span className="text-sm text-slate-600">{copy.rememberMe}</span>
          </label>
          <Link href="/auth/forgot-password" className={`text-sm ${AUTH_LINK}`}>
            {copy.forgotPassword}
          </Link>
        </div>

        {error ? (
          <div role="alert" className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            {error}
          </div>
        ) : null}

        <button type="submit" disabled={submitting} className={AUTH_BUTTON}>
          <LogIn className="h-5 w-5" aria-hidden="true" />
          {submitting ? copy.submitting : copy.submitBtn}
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-[#EFE9DE] pt-5 text-sm text-slate-600">
        <span>{copy.noAccount}</span>
        <Link href={`/auth/register?next=${encodeURIComponent(nextUrl)}`} className={AUTH_LINK}>
          {copy.signUp}
        </Link>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        <Link href="/uzvluk" className={AUTH_LINK}>{copy.membershipInfo.replace(/:\s*$/, '')}</Link>
      </p>
    </AuthShell>
  );
}
