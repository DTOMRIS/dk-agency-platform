import type { Metadata } from 'next';
// TASK-0459: əvvəl kök səhifəni import edirdi, kök isə bunu re-export edir → sonsuz dövrə, 500
import MetbexIstasyonPage from '@/components/marketinq-ocagi/metbex-istasyon/MetbexIstasyonPage';

export const metadata: Metadata = {
  title: 'Mətbəx stansiyaları — DK Agency',
  description:
    'Fast food mətbəxi üçün: menyudakı yemək sayına və gündəlik sifarişə görə neçə stansiya, neçə işçi lazımdır və işçi xərci satışın neçə faizini tutur.',
};

export default function LocalizedMetbexIstasyonPage() {
  return <MetbexIstasyonPage />;
}
