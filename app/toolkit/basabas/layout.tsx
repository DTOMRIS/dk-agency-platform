import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Başabaş Nöqtəsi Kalkulyatoru — Restoran",
  description:
    "Restoran başabaş nöqtəsini hesabla: sabit xərclər, dəyişən xərclər və gündəlik müştəri hədəfi. Pulsuz onlayn kalkulyator.",
};

export default function ToolkitBasabasLayout({ children }: { children: ReactNode }) {
  return children;
}
