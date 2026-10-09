import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Restoran Markalaşma Bələdçisi",
  description:
    "Restoranın marka kartı (ad, marka sözü, qonaq, danışıq tərzi, rənglər), 12 addımlıq marka siyahısı və sosial şəbəkə planı.",
};

export default function ToolkitBrandingGuideLayout({ children }: { children: ReactNode }) {
  return children;
}
