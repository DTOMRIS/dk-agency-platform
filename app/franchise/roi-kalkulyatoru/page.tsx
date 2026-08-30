import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Franchise ROI Kalkulyatoru — İnvestisiyaya Dəyərmi?",
  description:
    "Franchise investisiyasının ROI-sini və geri-qaytarma müddətini hesabla. Sağlam franchise hədəfi: illik ROI ≥ %20, geri-qaytarma ≤ 36 ay.",
};

export { default } from '@/app/[locale]/franchise/roi-kalkulyatoru/page';
