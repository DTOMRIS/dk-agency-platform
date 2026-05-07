import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
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
  description: 'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const messages = await getMessages();

  return (
    <html lang="az" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans selection:bg-brand-red selection:text-white antialiased">
        <NextIntlClientProvider messages={messages}>
          <PublicChrome>{children}</PublicChrome>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
