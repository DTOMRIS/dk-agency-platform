import type { Metadata } from 'next';
import HaberlerPageClient from '@/components/editorial/HaberlerPageClient';

export const metadata: Metadata = {
  title: 'Xəbərlər | DK Agency',
  description: 'HoReCa sektoru üzrə gündəm, analiz və praktik məqalələr.',
  alternates: { canonical: '/haberler' },
  openGraph: {
    title: 'Xəbərlər | DK Agency',
    description: 'Sektor xəbərləri, analizlər və praktik istiqamətləndirici məzmunlar.',
    url: '/haberler',
    type: 'website',
  },
};

export default function HaberlerPage() {
  return <HaberlerPageClient />;
}
