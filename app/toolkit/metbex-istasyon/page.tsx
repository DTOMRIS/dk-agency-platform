import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mətbəx İstasyon Kalkulyatoru — QSR Planlama",
  description:
    "Fast food və QSR mətbəxlər üçün menyu SKU sayına görə istasyon planlaması, kadrolar və əmək faizi hesablaması.",
};

export { default } from '@/app/[locale]/toolkit/metbex-istasyon/page';
