import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Çatdırılma komissiyası kalkulyatoru — Wolt, Bolt Food, Yango",
  description:
    "Wolt, Bolt Food, Yango və öz kuryeriniz üçün komissiya, ərzaq xərci və bir sifarişdən sizə qalan pulu hesablayın.",
};

export default function ToolkitDeliveryCalcLayout({ children }: { children: ReactNode }) {
  return children;
}
