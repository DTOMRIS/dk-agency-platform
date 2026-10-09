import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "İşçi saxlama kalkulyatoru — işdən çıxan işçinin restorana xərci",
  description:
    "İşçi dəyişmə faizini, bir işçinin yerini doldurmağın xərcini və işdən çıxan işçilərə görə ildə itən pulu hesablayın.",
};

export default function ToolkitStaffRetentionLayout({ children }: { children: ReactNode }) {
  return children;
}
