import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "İnşaatdan Açılışa Checklist — 52 Maddə",
  description:
    "52 maddəlik restoran açılış checklist-i: ön hazırlıq, kaba işlər, incə işlər, avadanlıq və açılış sprinti.",
};

export default function ToolkitInsaatChecklistLayout({ children }: { children: ReactNode }) {
  return children;
}
