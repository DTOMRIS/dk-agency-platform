import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bloq indeksi 'use client'-dir və metadata ixrac edə bilmir — sitemap-da
 * priority 0.9 ilə dursa da kök layout-un başlığını miras alırdı (TASK-0433).
 * Mətn səhifənin öz PAGE_COPY.az başlıq/alt başlığıdır.
 *
 * Qeyd: `/blog/[slug]` öz `generateMetadata`-sını ixrac edir, ona görə yazı
 * səhifələri bu başlığı deyil, öz başlıqlarını göstərir.
 */
export const metadata: Metadata = {
  title: 'DK Agency Blog — HoReCa Analiz və Bələdçilər',
  description:
    'HoReCa sektorunda ekspert analizlər, addım-addım bələdçilər və sektor trendləri. Food cost, franchise, menyu mühəndisliyi və AQTA mövzularında yazılar.',
};

export default function BlogLayout({ children }: { children: ReactNode }) {
  return children;
}
