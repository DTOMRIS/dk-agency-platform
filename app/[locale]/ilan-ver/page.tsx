import type { Metadata } from 'next';
import IlanVerPage from '@/app/ilan-ver/page';

export const metadata: Metadata = {
  title: 'Elan ver',
  description: 'HoReCa üçün devir, franchise, obyekt və avadanlıq elanı göndər.',
};

export default function LocalizedIlanVerPage() {
  return <IlanVerPage />;
}
