import type { Metadata } from 'next';
import MenuMatrixPage from '@/app/toolkit/menu-matrix/page';

export const metadata: Metadata = {
  title: 'Menyu Matris Analizi (BCG)',
  description:
    'BCG matris analizi ilə menyu optimallaşdırması: Ulduz, At, Puzzle, İt kateqoriyaları.',
};

export default function LocalizedMenuMatrixPage() {
  return <MenuMatrixPage />;
}
