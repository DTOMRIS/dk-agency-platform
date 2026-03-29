import type { Metadata } from 'next';
import AqtaChecklistPage from '@/app/toolkit/aqta-checklist/page';

export const metadata: Metadata = {
  title: 'AQTA Hazırlıq Checklist',
  description:
    'AQTA yoxlaması üçün interaktiv checklist: gigiyena, sənədləşdirmə, allergen və cərimə riskləri bir səhifədə.',
};

export default function LocalizedAqtaChecklistPage() {
  return <AqtaChecklistPage />;
}
