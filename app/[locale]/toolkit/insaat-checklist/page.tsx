import type { Metadata } from 'next';
import InsaatChecklistPage from '@/app/toolkit/insaat-checklist/page';

export const metadata: Metadata = {
  title: 'İnşaatdan Açılışa Checklist',
  description:
    'Restoran açılışı üçün 52 maddəlik interaktiv tikinti checklisti: 5 faza, büdcə, foto-video qeyd və progress izləmə.',
};

export default function LocalizedInsaatChecklistPage() {
  return <InsaatChecklistPage />;
}
