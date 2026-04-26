import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '../components/layout/Header';
import { Footer, KazanAIBot } from '../components/layout/Footer';
import CookiesBanner from '../components/ui/CookiesBanner';
import YandexMetrica from '../components/analytics/YandexMetrica';

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
  metadataBase: new URL('https://dkagency.az'),
  title: 'DK Agency | Azərbaycanın İlk AI-Dəstəkli HoReCa Platforması',
  description: 'Pulsuz toolkit, ekspert blog, restoran devri və franchise — Azərbaycan HoReCa sektoru üçün.',
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
  },
  alternates: {
    canonical: 'https://dkagency.az',
  },
  openGraph: {
    title: 'DK Agency | HoReCa Platforması',
    description: 'Azərbaycanın ilk AI-Dəstəkli HoReCa Platforması',
    url: 'https://dkagency.az',
    siteName: 'DK Agency',
    locale: 'az_AZ',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'DK Agency',
    url: 'https://dkagency.com.tr',
    logo: 'https://dkagency.com.tr/logo.png',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+994502566279',
      contactType: 'customer service',
      email: 'info@dkagency.com.tr',
      availableLanguage: ['Azerbaijani', 'Turkish', 'English']
    },
    sameAs: [
      'https://t.me/dkagency'
    ]
  };

  return (
    <html lang="az" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans selection:bg-brand-red selection:text-white antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <YandexMetrica />
        <Header />
        <main>{children}</main>
        <Footer />
        <KazanAIBot />
        <CookiesBanner />
      </body>
    </html>
  );
}
