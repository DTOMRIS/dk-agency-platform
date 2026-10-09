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
  // TASK-0513: ana səhifə v2 mesajı (hero «Biz itkini tapırıq…»); başlıq ≤ ~60, açıqlama ≤ 155 simvol.
  az: {
    title: 'DK Agency — Biz itkini tapırıq, siz restoranı idarə edirsiniz',
    description:
      'Food cost, P&L, delivery komissiyası, OCAQ gündəlik nəzarət və KAZAN AI — restoran, kafe və otellər üçün. Pulsuz diaqnostika.',
  },
  ru: {
    title: 'DK Agency — Мы находим потери, вы управляете рестораном',
    description:
      'Food cost, P&L, комиссия доставки, ежедневный контроль OCAQ и KAZAN AI — для ресторанов, кафе и отелей. Бесплатная диагностика.',
  },
  en: {
    title: 'DK Agency — We find the leaks, you run the restaurant',
    description:
      'Food cost, P&L, delivery commission, OCAQ daily control and KAZAN AI — for restaurants, cafés and hotels. Free diagnostic.',
  },
  tr: {
    title: 'DK Agency — Biz kaybı buluruz, siz restoranı yönetirsiniz',
    description:
      'Food cost, P&L, paket servis komisyonu, OCAQ günlük kontrol ve KAZAN AI — restoran, kafe ve oteller için. Ücretsiz teşhis.',
  },
};

const OG_LOCALE = { az: 'az_AZ', ru: 'ru_RU', en: 'en_US', tr: 'tr_TR' } as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: rawLocale } = await params;
  const locale = normalizeLocale(rawLocale);

  const { title, description } = localeMetadata[locale];
  // TASK-0513: hər dil öz önizləmə şəklini alır (app/[locale]/opengraph-image.tsx). AZ prefikssizdir
  // və kök app/opengraph-image.tsx-dən gəlir.
  const ogImage = locale === 'az' ? '/opengraph-image' : `/${locale}/opengraph-image`;
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
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: 'summary_large_image', title, description, images: [ogImage] },
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
