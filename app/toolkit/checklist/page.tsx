import type { Metadata } from 'next';
import ChecklistPage from '@/app/[locale]/toolkit/checklist/page';

export const metadata: Metadata = {
  title: 'Restoran Açılış Checklist',
  description:
    'Restoran açılışı üçün hüquqi, məkan, menyu, komanda və marketinq addımlarını yoxlayan checklist.',
};

export default function PublicChecklistPage() {
  return <ChecklistPage />;
}
