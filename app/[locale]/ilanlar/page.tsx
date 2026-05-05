import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingsShowcasePage from '@/components/listings/ListingsShowcasePage';
import { getAlternates } from '@/lib/seo/alternates';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: 'HoReCa Elanları',
    description: 'Restoran devri, franchise, ortaq axtarışı, obyekt icarəsi və HORECA ekipman elanları bir vitrində.',
    alternates: getAlternates(locale, '/ilanlar'),
  };
}

export default function LocalizedIlanlarPage() {
  return (
    <Suspense fallback={null}>
      <ListingsShowcasePage />
    </Suspense>
  );
}
