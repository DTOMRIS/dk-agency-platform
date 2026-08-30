import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Delivery Komissiya Kalkulyatoru — Wolt, Bolt Food, Yango",
  description:
    "Wolt, Bolt Food, Yango və öz delivery modeli üçün komissiya, food cost və aylıq netto nəticəni hesabla.",
};

export default function ToolkitDeliveryCalcLayout({ children }: { children: ReactNode }) {
  return children;
}
