import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingsShowcasePage from '@/components/listings/ListingsShowcasePage';
import { getAlternates } from '@/lib/seo/alternates';
import { normalizeLocale } from '@/i18n/config';

const metaCopy = {
  az: {
    title: 'HoReCa Elanları',
    description: 'Restoran devri, franchise, ortaq axtarışı, obyekt icarəsi və HORECA ekipman elanları bir vitrində.',
  },
  ru: {
    title: 'Объявления HoReCa',
    description: 'Передача ресторана, франшиза, поиск партнёра, аренда объекта и оборудование HORECA — всё в одном месте.',
  },
  en: {
    title: 'HoReCa Listings',
    description: 'Restaurant transfers, franchises, partnership searches, venue rentals, and HORECA equipment listings in one showcase.',
  },
  tr: {
    title: 'HoReCa İlanları',
    description: 'Restoran devri, franchise, ortak arayışı, mekan kiralama ve HORECA ekipman ilanları tek bir vitirinde.',
  },
} as const;

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const normalized = normalizeLocale(locale);
  const m = metaCopy[normalized];
  return {
    title: m.title,
    description: m.description,
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
