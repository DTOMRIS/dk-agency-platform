import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "İşçi Saxlama Kalkulyatoru — Restoran Kadr İtkisi",
  description:
    "İşçi turnover faizini, bir işçi dəyişmə xərcini və illik kadr itkisini Azərbaycan restoran reallığına uyğun hesabla.",
};

export default function ToolkitStaffRetentionLayout({ children }: { children: ReactNode }) {
  return children;
}
