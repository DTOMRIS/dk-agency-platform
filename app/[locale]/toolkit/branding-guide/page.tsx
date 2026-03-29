import type { Metadata } from 'next';
import BrandingGuidePage from '@/app/toolkit/branding-guide/page';

export const metadata: Metadata = {
  title: 'Markalaşma Bələdçisi',
  description:
    'Restoran üçün 12 maddəlik branding checklist, vizual kimliyin 7 elementi və sosial media strategiyası.',
};

export default function LocalizedBrandingGuidePage() {
  return <BrandingGuidePage />;
}
