import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import './globals.css';
import Header from '../components/layout/Header';
import { Footer, KazanAIBot } from '../components/layout/Footer';

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
  title: 'DK AGENCY | Hospitality Insights & Intelligence',
  description: 'The leading source for hospitality industry news, insights, and analysis in Azerbaijan.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="az" className={`${dmSans.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-white font-sans selection:bg-brand-red selection:text-white antialiased">
        <Header />
        <main>{children}</main>
        <Footer />
        <KazanAIBot />
      </body>
    </html>
  );
}
