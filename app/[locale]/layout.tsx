import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { defaultLocale, isLocale, normalizeLocale, withLocale } from '@/i18n/config';
import { routing } from '@/i18n/routing';
import YandexMetricaInit from '@/components/YandexMetricaInit';
// PublicChrome is in root layout — [locale] only provides locale-scoped messages

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const localeMetadata: Record<'az' | 'ru' | 'en' | 'tr', { title: string; description: string }> = {
  az: {
    // TASK-0510: tanıtım prototipindəki tövsiyə — KAZAN AI və Toolkit link önizləməsində önə çıxsın.
    title: 'DK Agency | HoReCa İdarəetmə, KAZAN AI & Biznes Ekosistemi',
    description:
      '40 illik təcrübə, KAZAN AI asistanı, 18+ interaktiv maliyyə aləti, ekspert bloq və sektor xəbərləri — Azərbaycan HoReCa sektoru üçün.',
  },
  ru: {
    title: 'DK Agency | Управление HoReCa, KAZAN AI и бизнес-экосистема',
    description:
      '40 лет опыта, AI-ассистент KAZAN, 18+ интерактивных финансовых инструментов, экспертный блог и новости отрасли — для HoReCa Азербайджана.',
  },
  en: {
    title: 'DK Agency | HoReCa Management, KAZAN AI & Business Ecosystem',
    description:
      '40 years of experience, the KAZAN AI assistant, 18+ interactive finance tools, an expert blog and industry news — for Azerbaijan HoReCa.',
  },
  tr: {
    title: 'DK Agency | HoReCa Yönetimi, KAZAN AI ve İş Ekosistemi',
    description:
      '40 yıllık deneyim, KAZAN AI asistanı, 18+ interaktif finans aracı, uzman blog ve sektör haberleri — Azerbaycan HoReCa sektörü için.',
  },
};

const OG_LOCALE = { az: 'az_AZ', ru: 'ru_RU', en: 'en_US', tr: 'tr_TR' } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const { title, description } = localeMetadata[locale];
  return {
    title,
    description,
    // TASK-0510: link önizləməsi (WhatsApp/Telegram) dilə uyğun mətn göstərsin. Root layout
    // (qorunan fayl) dəyişdirilmədi; şəkil app/opengraph-image.tsx-dən gəlir.
    openGraph: {
      type: 'website',
      siteName: 'DK Agency',
      locale: OG_LOCALE[locale],
      title,
      description,
      // openGraph burada verildikdə kök app/opengraph-image.tsx bu seqmentdə düşür — açıq yazılır.
      images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: ['/opengraph-image'] },
    // `getAlternates(locale, '/')` burada HARDCODE '/' idi — yəni /ru/toolkit
    // kimi ALT səhifələr də canonical olaraq /ru göstərirdi, yəni özlərini
    // ana səhifənin dublikatı elan edirdilər və indeksdən düşürdülər.
    // Layout generateMetadata-da cari pathname mövcud deyil, ona görə nisbi
    // './' işlədilir — Next onu hər səhifənin öz ünvanına görə həll edir.
    // Tam hreflang dəsti yolu bilən səhifələrdə (blog/[slug], ilanlar,
    // franchise/radar) getAlternates ilə verilir.
    alternates: { canonical: './' },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!isLocale(locale) || !routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
      <YandexMetricaInit />
    </NextIntlClientProvider>
  );
}
