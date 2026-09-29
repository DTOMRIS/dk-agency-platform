import type { Metadata } from 'next';
// TASK-0459: əvvəl kök səhifəni import edirdi, kök isə bunu re-export edir → sonsuz dövrə, 500
import MetbexIstasyonPage from '@/components/marketinq-ocagi/metbex-istasyon/MetbexIstasyonPage';

export const metadata: Metadata = {
  title: 'Mətbəx İstasyon Kalkulyatoru — DK Agency',
  description:
    'Fast food və QSR mətbəxlər üçün menyu SKU sayına görə istasyon planlaması, kadrolar və əmək faizi.',
};

export default function LocalizedMetbexIstasyonPage() {
  return <MetbexIstasyonPage />;
}
