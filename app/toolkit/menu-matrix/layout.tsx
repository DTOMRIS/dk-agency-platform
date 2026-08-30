import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Menyu Matris Analizi (BCG) — Menyu Mühəndisliyi",
  description:
    "BCG matris analizi ilə menyu optimallaşdırması: Ulduz, At, Puzzle və İt kateqoriyaları üzrə qiymətləndirmə.",
};

export default function ToolkitMenuMatrixLayout({ children }: { children: ReactNode }) {
  return children;
}
