import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un page.tsx-i 'use client'-dir və metadata ixrac edə bilmir.
 * Başlıq/təsvir prefiksiz AZ ünvanı üçün buradan verilir.
 */
export const metadata: Metadata = {
  title: "Restoran Markalaşma Bələdçisi",
  description:
    "Restoran üçün 12 maddəlik branding checklist, vizual kimliyin 7 elementi və sosial media strategiyası.",
};

export default function ToolkitBrandingGuideLayout({ children }: { children: ReactNode }) {
  return children;
}
