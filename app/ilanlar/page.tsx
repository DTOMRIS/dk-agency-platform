import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingsShowcasePage from '@/components/listings/ListingsShowcasePage';

export const metadata: Metadata = {
  title: 'HoReCa Elanları',
  description:
    'Restoran devri, franchise, ortaq axtarışı, obyekt icarəsi və HORECA ekipman elanları bir vitrində.',
};

export default function IlanlarPage() {
  return (
    <Suspense fallback={null}>
      <ListingsShowcasePage />
    </Suspense>
  );
}
