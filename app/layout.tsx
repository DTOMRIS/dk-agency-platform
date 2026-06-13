import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import PublicChrome from '@/components/layout/PublicChrome';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600', '700', '800'],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-display',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://dkagency.com.tr'),
  title: 'DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması',
  description:
    'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
  openGraph: {
    type: 'website',
    siteName: 'DK Agency',
    locale: 'az_AZ',
    url: 'https://dkagency.com.tr',
    title: 'DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması',
    description:
      'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması',
    description:
      'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages({ locale });

  return (
    <html lang={locale} className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen overflow-x-hidden bg-white font-sans selection:bg-brand-red selection:text-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PublicChrome>{children}</PublicChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
