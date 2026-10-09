import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Menyu matrisi — hansı yeməyi qorumalı, hansını çıxarmalı",
  description:
    "Hər yeməyin satış sayını və porsiyadan qalan qazancını yazın: alət hansını qorumaq, hansının qiymətini düzəltmək, hansını tanıtmaq və hansını çıxarmaq lazım olduğunu göstərir.",
};

export default function ToolkitMenuMatrixLayout({ children }: { children: ReactNode }) {
  return children;
}
