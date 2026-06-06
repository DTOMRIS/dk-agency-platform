import type { Metadata } from 'next';
import MetbexIstasyonPage from '@/app/toolkit/metbex-istasyon/page';

export const metadata: Metadata = {
  title: 'Mətbəx İstasyon Kalkulyatoru — DK Agency',
  description:
    'Fast food və QSR mətbəxlər üçün menyu SKU sayına görə istasyon planlaması, kadrolar və əmək faizi.',
};

export default function LocalizedMetbexIstasyonPage() {
  return <MetbexIstasyonPage />;
}
