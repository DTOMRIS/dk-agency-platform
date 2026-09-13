import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Toolkit indeks səhifəsi sitemap-dadır, amma öz başlığı yox idi — kök
 * layout-un başlığını miras alırdı (TASK-0433). Mətn `toolkit` mesaj
 * namespace-indəki başlıq/alt başlıqdır.
 */
export const metadata: Metadata = {
  title: 'DK Agency Toolkit — HoReCa üçün Pulsuz Alətlər',
  description:
    'Restoranını idarə etmək üçün pulsuz alətlər. Food cost, P&L, başabaş, menyu matrisi və açılış checklisti — hamısı bir yerdə.',
};

export default function ToolkitLayout({ children }: { children: ReactNode }) {
  return children;
}
