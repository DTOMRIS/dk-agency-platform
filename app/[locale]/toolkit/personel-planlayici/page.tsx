import type { Metadata } from 'next';
// TASK-0459: əvvəl kök səhifəni import edirdi, kök isə bunu re-export edir → sonsuz dövrə, 500
import PersonelPlanlayiciPage from '@/components/marketinq-ocagi/personel-planlayici/PersonelPlanlayiciPage';

export const metadata: Metadata = {
  title: 'İşçi planlayıcısı — DK Agency',
  description:
    'Restoran və kafe üçün: açılışda, ən sıx saatlarda və axşam növbəsində neçə işçi lazımdır və işçi xərci satışın neçə faizini tutur.',
};

export default function LocalizedPersonelPlanlayiciPage() {
  return <PersonelPlanlayiciPage />;
}
