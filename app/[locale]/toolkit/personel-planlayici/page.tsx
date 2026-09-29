import type { Metadata } from 'next';
// TASK-0459: əvvəl kök səhifəni import edirdi, kök isə bunu re-export edir → sonsuz dövrə, 500
import PersonelPlanlayiciPage from '@/components/marketinq-ocagi/personel-planlayici/PersonelPlanlayiciPage';

export const metadata: Metadata = {
  title: 'Personel Planlayıcısı — DK Agency',
  description:
    'Restoran və kafe üçün vardiya bazında optimal personel sayı hesablayıcısı. Açılış / peak / axşam briqadası, əmək faizi ilə.',
};

export default function LocalizedPersonelPlanlayiciPage() {
  return <PersonelPlanlayiciPage />;
}
