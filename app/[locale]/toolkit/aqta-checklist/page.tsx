import type { Metadata } from 'next';
import AqtaChecklistPage from '@/app/toolkit/aqta-checklist/page';

export const metadata: Metadata = {
  title: 'AQTA yoxlamasına hazırlıq',
  description:
    'AQTA yoxlamasından əvvəl mətbəxi yoxla: gigiyena, sənədlər, ərzaq saxlama, allergenlər və cərimə riski bir səhifədə.',
};

export default function LocalizedAqtaChecklistPage() {
  return <AqtaChecklistPage />;
}
