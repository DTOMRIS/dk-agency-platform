import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale, getMessages } from 'next-intl/server';
import './globals.css';
import PublicChrome from '@/components/layout/PublicChrome';
import { inter } from '@/components/home/v2/font';

// TASK-0533: one typeface site-wide — Inter (latin, latin-ext for ə/ğ/ş, cyrillic) as --font-sans; headings that
// used Playfair (--font-display) now use it too (globals.css). Was DM Sans + Playfair + Inter (−92 KB per page).
export const metadata: Metadata = {
  metadataBase: new URL('https://dkagency.com.tr'),
  alternates: { canonical: './' },
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
    <html lang={locale} className={inter.variable}>
      <body className="min-h-screen overflow-x-hidden bg-white font-sans selection:bg-dk-red-strong selection:text-white antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PublicChrome>{children}</PublicChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
