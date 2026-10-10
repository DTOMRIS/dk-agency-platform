import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Françayz ROI Kalkulyatoru — İnvestisiyaya Dəyərmi?",
  description:
    "Françayz investisiyasının ROI-sini və geri-qaytarma müddətini hesabla. Sağlam françayz hədəfi: geri-qaytarma ≤ 36 ay (illik ROI ≈ %33).",
};

export { default } from '@/app/[locale]/franchise/roi-kalkulyatoru/page';
