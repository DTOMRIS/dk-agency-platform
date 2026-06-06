import type { Metadata } from 'next';
import PersonelPlanlayiciPage from '@/app/toolkit/personel-planlayici/page';

export const metadata: Metadata = {
  title: 'Personel Planlayıcısı — DK Agency',
  description:
    'Restoran və kafe üçün vardiya bazında optimal personel sayı hesablayıcısı. Açılış / peak / axşam briqadası, əmək faizi ilə.',
};

export default function LocalizedPersonelPlanlayiciPage() {
  return <PersonelPlanlayiciPage />;
}
