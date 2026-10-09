import type { Metadata } from 'next';
import BrandingGuidePage from '@/app/toolkit/branding-guide/page';

export const metadata: Metadata = {
  title: 'Markalaşma Bələdçisi',
  description:
    'Restoranın marka kartı (ad, marka sözü, qonaq, danışıq tərzi, rənglər), 12 addımlıq marka siyahısı və sosial şəbəkə planı.',
};

export default function LocalizedBrandingGuidePage() {
  return <BrandingGuidePage />;
}
