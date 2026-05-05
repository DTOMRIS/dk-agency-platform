'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Building2, Mail, Phone, Sparkles, User } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

const registerCopy: Record<Locale, {
  goBack: string;
  badge: string;
  title: string;
  subtitle: string;
  nameLabel: string;
  namePlaceholder: string;
  emailLabel: string;
  emailPlaceholder: string;
  companyLabel: string;
  companyPlaceholder: string;
  phoneLabel: string;
  phonePlaceholder: string;
  passwordLabel: string;
  passwordPlaceholder: string;
  submitting: string;
  submitBtn: string;
  verificationNotice: string;
  goToLogin: string;
  alreadyHaveAccount: string;
  signIn: string;
  membershipPage: string;
  fallbackError: string;
  fallbackCreated: string;
  panel: {
    title: string;
    premiumTitle: string;
    premiumDesc: string;
    kazanTitle: string;
    kazanDesc: string;
    toolkitTitle: string;
    toolkitDesc: string;
    b2bTitle: string;
    b2bDesc: string;
  };
}> = {
  az: {
    goBack: 'Geri qayıt',
    badge: 'Member Signup',
    title: 'Üzv ol',
    subtitle: 'Pulsuz üzv ol, premium məqalələrə və KAZAN AI-a giriş əldə et.',
    nameLabel: 'Ad soyad',
    namePlaceholder: 'Adınız Soyadınız',
    emailLabel: 'E-mail',
    emailPlaceholder: 'email@example.com',
    companyLabel: 'Şirkət',
    companyPlaceholder: 'Restoran və ya şirkət adı',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+994 XX XXX XX XX',
    passwordLabel: 'Şifrə',
    passwordPlaceholder: 'minimum 8 simvol',
    submitting: 'Yaradılır...',
    submitBtn: 'Üzv ol və davam et',
    verificationNotice: 'Hesabınız yaradıldı! Email ünvanınıza təsdiq linki göndərildi.',
    goToLogin: 'Daxil ol səhifəsinə keç',
    alreadyHaveAccount: 'Artıq hesabın var?',
    signIn: 'Daxil ol',
    membershipPage: 'Üzvlük səhifəsi:',
    fallbackError: 'Qeydiyyat alınmadı.',
    fallbackCreated: 'Hesabınız yaradıldı!',
    panel: {
      title: 'Üzvlük nə verir?',
      premiumTitle: 'Premium məqalələrə tam giriş',
      premiumDesc: 'Ekspert analizlər, food cost hesablamaları və sektor trendlərini oxu.',
      kazanTitle: 'KAZAN AI ilə konsultasiya',
      kazanDesc: 'Food cost, P&L, AQTA və menyu suallarına AI dəstəyi al.',
      toolkitTitle: 'Toolkit və kalkulyatorlar',
      toolkitDesc: 'Başabaş, delivery komissiya, işçi saxlama və daha çox alət.',
      b2bTitle: 'B2B elan və networking',
      b2bDesc: 'Restoran devri, franchise, ortaq tapmaq — HoReCa B2B ekosistemi.',
    },
  },
  en: {
    goBack: 'Go back',
    badge: 'Member Signup',
    title: 'Sign up',
    subtitle: 'Join for free and gain access to premium articles and KAZAN AI.',
    nameLabel: 'Full name',
    namePlaceholder: 'Your Full Name',
    emailLabel: 'Email',
    emailPlaceholder: 'email@example.com',
    companyLabel: 'Company',
    companyPlaceholder: 'Restaurant or company name',
    phoneLabel: 'Phone',
    phonePlaceholder: '+994 XX XXX XX XX',
    passwordLabel: 'Password',
    passwordPlaceholder: 'minimum 8 characters',
    submitting: 'Creating...',
    submitBtn: 'Sign up and continue',
    verificationNotice: 'Account created! A verification link has been sent to your email.',
    goToLogin: 'Go to sign in',
    alreadyHaveAccount: 'Already have an account?',
    signIn: 'Sign in',
    membershipPage: 'Membership page:',
    fallbackError: 'Registration failed.',
    fallbackCreated: 'Account created!',
    panel: {
      title: 'What does membership offer?',
      premiumTitle: 'Full access to premium articles',
      premiumDesc: 'Expert analyses, food cost calculations, and sector trends.',
      kazanTitle: 'Consultation with KAZAN AI',
      kazanDesc: 'Get AI-powered support on food cost, P&L, AQTA, and menu questions.',
      toolkitTitle: 'Toolkit and calculators',
      toolkitDesc: 'Break-even, delivery commission, staff retention, and more tools.',
      b2bTitle: 'B2B listings and networking',
      b2bDesc: 'Restaurant transfers, franchise, finding partners — HoReCa B2B ecosystem.',
    },
  },
  tr: {
    goBack: 'Geri dön',
    badge: 'Member Signup',
    title: 'Üye ol',
    subtitle: 'Ücretsiz üye ol, premium içeriklere ve KAZAN AI\'a erişim kazan.',
    nameLabel: 'Ad soyad',
    namePlaceholder: 'Adınız Soyadınız',
    emailLabel: 'E-posta',
    emailPlaceholder: 'email@example.com',
    companyLabel: 'Şirket',
    companyPlaceholder: 'Restoran veya şirket adı',
    phoneLabel: 'Telefon',
    phonePlaceholder: '+994 XX XXX XX XX',
    passwordLabel: 'Şifre',
    passwordPlaceholder: 'minimum 8 karakter',
    submitting: 'Oluşturuluyor...',
    submitBtn: 'Üye ol ve devam et',
    verificationNotice: 'Hesabınız oluşturuldu! E-posta adresinize doğrulama bağlantısı gönderildi.',
    goToLogin: 'Giriş sayfasına git',
    alreadyHaveAccount: 'Zaten hesabınız var mı?',
    signIn: 'Giriş yap',
    membershipPage: 'Üyelik sayfası:',
    fallbackError: 'Kayıt başarısız.',
    fallbackCreated: 'Hesap oluşturuldu!',
    panel: {
      title: 'Üyelik ne sağlar?',
      premiumTitle: 'Premium içeriklere tam erişim',
      premiumDesc: 'Uzman analizler, food cost hesaplamaları ve sektör trendleri.',
      kazanTitle: 'KAZAN AI ile danışmanlık',
      kazanDesc: 'Food cost, P&L, AQTA ve menü sorularına AI desteği alın.',
      toolkitTitle: 'Toolkit ve hesaplayıcılar',
      toolkitDesc: 'Başabaş, teslimat komisyonu, personel tutma ve daha fazla araç.',
      b2bTitle: 'B2B ilanlar ve networking',
      b2bDesc: 'Restoran devri, franchise, ortak bulma — HoReCa B2B ekosistemi.',
    },
  },
  ru: {
    goBack: 'Назад',
    badge: 'Member Signup',
    title: 'Зарегистрироваться',
    subtitle: 'Зарегистрируйтесь бесплатно и получите доступ к премиум-материалам и KAZAN AI.',
    nameLabel: 'Имя и фамилия',
    namePlaceholder: 'Ваше Имя Фамилия',
    emailLabel: 'Электронная почта',
    emailPlaceholder: 'email@example.com',
    companyLabel: 'Компания',
    companyPlaceholder: 'Название ресторана или компании',
    phoneLabel: 'Телефон',
    phonePlaceholder: '+994 XX XXX XX XX',
    passwordLabel: 'Пароль',
    passwordPlaceholder: 'минимум 8 символов',
    submitting: 'Создаём...',
    submitBtn: 'Зарегистрироваться и продолжить',
    verificationNotice: 'Аккаунт создан! Ссылка для подтверждения отправлена на вашу почту.',
    goToLogin: 'Перейти к входу',
    alreadyHaveAccount: 'Уже есть аккаунт?',
    signIn: 'Войти',
    membershipPage: 'Страница членства:',
    fallbackError: 'Регистрация не выполнена.',
    fallbackCreated: 'Аккаунт создан!',
    panel: {
      title: 'Что даёт членство?',
      premiumTitle: 'Полный доступ к премиум-материалам',
      premiumDesc: 'Экспертные анализы, расчёты food cost и отраслевые тренды.',
      kazanTitle: 'Консультации с KAZAN AI',
      kazanDesc: 'AI-поддержка по вопросам food cost, P&L, AQTA и меню.',
      toolkitTitle: 'Toolkit и калькуляторы',
      toolkitDesc: 'Точка безубыточности, комиссия за доставку, удержание персонала и другие инструменты.',
      b2bTitle: 'B2B объявления и нетворкинг',
      b2bDesc: 'Передача ресторана, франшиза, поиск партнёров — B2B экосистема HoReCa.',
    },
  },
};

function detectLocale(): Locale {
  if (typeof window === 'undefined') return 'az';
  const pathSegment = window.location.pathname.split('/')[1];
  return normalizeLocale(pathSegment);
}

export default function RegisterPage() {
  const [nextUrl, setNextUrl] = useState('/haberler');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [locale, setLocale] = useState<Locale>('az');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get('next') || '/haberler');
    setLocale(detectLocale());
  }, []);

  const copy = registerCopy[locale];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          company: formData.company.trim(),
          phone: formData.phone.trim(),
          locale,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error || copy.fallbackError);
        return;
      }

      if (data?.verificationRequired) {
        setNotice(data?.message || copy.verificationNotice);
        return;
      }

      setNotice(data?.message || copy.fallbackCreated);
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
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1fr_0.95fr]">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                {copy.badge}
              </div>
              <h1 className="text-3xl font-black text-slate-900">{copy.title}</h1>
              <p className="mt-2 text-slate-600">{copy.subtitle}</p>
            </div>

            {notice ? (
              <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
                <p className="font-semibold">{notice}</p>
                <Link href="/auth/login" className="mt-2 inline-flex font-semibold text-emerald-800 underline">
                  {copy.goToLogin}
                </Link>
              </div>
            ) : null}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.nameLabel}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder={copy.namePlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

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
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.companyLabel}</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(event) => setFormData({ ...formData, company: event.target.value })}
                    placeholder={copy.companyPlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.phoneLabel}</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    placeholder={copy.phonePlaceholder}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">{copy.passwordLabel}</label>
                <input
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  placeholder={copy.passwordPlaceholder}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {error ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400"
              >
                <Sparkles className="h-5 w-5" />
                {submitting ? copy.submitting : copy.submitBtn}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              {copy.alreadyHaveAccount}{' '}
              <Link
                href={`/auth/login?next=${encodeURIComponent(nextUrl)}`}
                className="font-semibold text-red-600 hover:text-red-700"
              >
                {copy.signIn}
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-500">
              {copy.membershipPage}{' '}
              <Link href="/uzvluk" className="font-semibold text-slate-900 hover:text-red-600">
                /uzvluk
              </Link>
            </p>
          </div>

          <div className="bg-red-600 p-8 text-white md:p-10">
            <h2 className="text-2xl font-black">{copy.panel.title}</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{copy.panel.premiumTitle}</p>
                <p className="mt-1 text-red-100">{copy.panel.premiumDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{copy.panel.kazanTitle}</p>
                <p className="mt-1 text-red-100">{copy.panel.kazanDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{copy.panel.toolkitTitle}</p>
                <p className="mt-1 text-red-100">{copy.panel.toolkitDesc}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">{copy.panel.b2bTitle}</p>
                <p className="mt-1 text-red-100">{copy.panel.b2bDesc}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
