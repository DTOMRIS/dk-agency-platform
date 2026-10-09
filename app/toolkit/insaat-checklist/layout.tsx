import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "İnşaatdan açılışa: 62 maddəlik yoxlama siyahısı",
  description:
    "Restoranın tikintisindən açılışına qədər 62 iş: planlaşdırma, ön hazırlıq, kaba işlər, incə işlər, avadanlıq və açılış hazırlığı.",
};

export default function ToolkitInsaatChecklistLayout({ children }: { children: ReactNode }) {
  return children;
}
