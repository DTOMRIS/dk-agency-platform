import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Zərərsiz nöqtə (başa-baş) kalkulyatoru — Restoran",
  description:
    "Restoran zərərə düşməmək üçün ayda ən azı nə qədər satmalıdır: sabit və dəyişən xərclər, gündəlik müştəri hədəfi. Pulsuz onlayn alət.",
};

export default function ToolkitBasabasLayout({ children }: { children: ReactNode }) {
  return children;
}
