import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, normalizeLocale, withLocale } from '@/i18n/config';
import { routing } from '@/i18n/routing';

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const localeMetadata: Record<'az' | 'ru' | 'en' | 'tr', { title: string; description: string }> = {
  az: {
    title: 'DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması',
    description: 'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
  },
  ru: {
    title: 'DK Agency | Первая AI-платформа для HoReCa в Азербайджане',
    description: 'Бесплатные инструменты, экспертный блог, продажа ресторанов и франшизы для HoReCa-сектора Азербайджана.',
  },
  en: {
    title: "DK Agency | Azerbaijan's First AI-Powered HoReCa Platform",
    description: 'Free tools, expert blog, restaurant transfers and franchise support for Azerbaijan HoReCa operators.',
  },
  tr: {
    title: "DK Agency | Azerbaycan'ın İlk AI Destekli HoReCa Platformu",
    description: "Azerbaycan HoReCa sektörü için ücretsiz araçlar, uzman blog, restoran devri ve franchise desteği.",
  },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  return {
    title: localeMetadata[locale].title,
    description: localeMetadata[locale].description,
    alternates: {
      canonical: withLocale(locale, '/'),
      languages: {
        'az-AZ': '/',
        'ru-RU': '/ru',
        'en-US': '/en',
        'tr-TR': '/tr',
      },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale) || !routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
