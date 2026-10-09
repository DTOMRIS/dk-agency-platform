import type { Metadata } from 'next';
import MenuMatrixPage from '@/app/toolkit/menu-matrix/page';

export const metadata: Metadata = {
  title: 'Menyu matrisi — hansı yeməyi qorumalı, hansını çıxarmalı',
  description:
    'Hər yeməyin satış sayını və porsiyadan qalan qazancını yazın: alət hansını qorumaq, hansının qiymətini düzəltmək, hansını tanıtmaq və hansını çıxarmaq lazım olduğunu göstərir.',
};

export default function LocalizedMenuMatrixPage() {
  return <MenuMatrixPage />;
}
