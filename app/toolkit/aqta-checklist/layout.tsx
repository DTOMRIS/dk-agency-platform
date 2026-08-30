import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "AQTA Hazırlıq Checklist — Restoran Yoxlaması",
  description:
    "AQTA yoxlaması üçün interaktiv checklist: gigiyena, sənədləşdirmə, allergen və cərimə riskləri bir səhifədə. Azərbaycan restoranları üçün pulsuz.",
};

export default function ToolkitAqtaChecklistLayout({ children }: { children: ReactNode }) {
  return children;
}
