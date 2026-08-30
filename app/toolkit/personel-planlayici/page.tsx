import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Personel Planlayıcısı — Restoran Vardiya Hesablaması",
  description:
    "Restoran və kafe üçün vardiya bazında optimal personel sayı: açılış, peak və axşam briqadası, əmək faizi ilə.",
};

export { default } from '@/app/[locale]/toolkit/personel-planlayici/page';
