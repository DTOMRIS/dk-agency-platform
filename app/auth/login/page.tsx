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

  return (
    <div className="min-h-screen bg-[#0e0f22] text-[#eaeaea] flex flex-col justify-center p-4 lg:p-8">
      <div className="mx-auto w-full max-w-5xl mb-4">
        <Link
          href={nextUrl}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          {copy.goBack}
        </Link>
      </div>

      <div className="flex items-center justify-center">
        <div className="grid w-full max-w-5xl overflow-hidden dk-glass-card md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-[var(--dk-gold)]/10 border border-[var(--dk-gold)]/35 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--dk-gold)]">
                {copy.badge}
              </div>
              <h1 className="text-3xl font-black text-white">{copy.title}</h1>
              <p className="mt-2 text-slate-400">{copy.subtitle}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-300">{copy.emailLabel}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    autoComplete="username"
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder={copy.emailPlaceholder}
                    className="w-full rounded-xl border border-[var(--dk-gold)]/20 bg-[#13142d]/60 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/25"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-semibold text-slate-300">{copy.passwordLabel}</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-[var(--dk-gold)]/20 bg-[#13142d]/60 py-3 pl-10 pr-4 text-white placeholder:text-slate-500 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/25"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex cursor-pointer items-center gap-2 select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/25 cursor-pointer"
                  />
                  <span className="text-sm text-slate-400">{copy.rememberMe}</span>
                </label>
                <Link href="/forgot-password" className="text-sm font-bold text-[var(--dk-gold)] transition hover:text-[var(--dk-gold-hover)]">
                  {copy.forgotPassword}
                </Link>
              </div>

              {error ? (
                <div className="flex items-center gap-2 rounded-xl border border-red-900/30 bg-red-950/40 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] py-3.5 font-bold text-white transition-all dk-hover-glow hover:bg-[var(--dk-red-strong)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogIn className="h-5 w-5" />
                {submitting ? copy.submitting : copy.submitBtn}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-between text-sm text-slate-400">
              <span>{copy.noAccount}</span>
              <Link
                href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
                className="font-bold text-[var(--dk-gold)] transition hover:text-[var(--dk-gold-hover)]"
              >
                {copy.signUp}
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              {copy.membershipInfo}{' '}
              <Link href="/uzvluk" className="font-bold text-slate-300 transition hover:text-[var(--dk-gold)]">
                /uzvluk
              </Link>
            </p>
          </div>

          <div className="bg-slate-950/40 border-t md:border-t-0 md:border-l border-[var(--dk-gold)]/15 p-8 text-white md:p-10 flex items-center">
            <div className="flex flex-col items-center justify-center gap-4 text-center w-full">
              <ShieldCheck className="h-12 w-12 text-[var(--dk-gold)]" />
              <h2 className="text-xl font-bold">{copy.ctaHeading}</h2>
              <p className="text-sm text-slate-400">{copy.ctaDesc}</p>
              <Link
                href={`/auth/register?next=${encodeURIComponent(nextUrl)}`}
                className="mt-2 inline-block rounded-full bg-[var(--dk-gold)]/20 border border-[var(--dk-gold)]/40 px-6 py-2.5 text-sm font-bold text-[var(--dk-gold)] transition-all dk-hover-glow hover:bg-[var(--dk-gold)]/30"
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
