import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "AQTA yoxlamasına hazırlıq — restoran üçün yoxlama siyahısı",
  description:
    "AQTA yoxlamasından əvvəl mətbəxi yoxla: gigiyena, sənədlər, ərzaq saxlama, allergenlər və cərimə riski bir səhifədə. Azərbaycan restoranları üçün pulsuz.",
};

export default function ToolkitAqtaChecklistLayout({ children }: { children: ReactNode }) {
  return children;
}
