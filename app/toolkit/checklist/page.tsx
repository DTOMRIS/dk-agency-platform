import type { Metadata } from 'next';
import ChecklistPage from '@/app/[locale]/toolkit/checklist/page';

export const metadata: Metadata = {
  title: 'Restoran açılışı: yoxlama siyahısı (checklist)',
  description:
    'Restoran açmazdan əvvəl görülməli 43 iş: sənədlər, məkan, mətbəx, menyu, işçilər, reklam və maliyyə. Pulsuz yoxlama siyahısı.',
};

export default function PublicChecklistPage() {
  return <ChecklistPage />;
}
