import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/**
 * Bu route-un kök mirror-u yalnız `default`-u re-export edir, ona görə səhifə
 * sitemap-da olsa da öz başlığı yox idi (TASK-0433). Mətn səhifənin öz
 * PAGE_COPY.az başlıq/alt başlığıdır.
 */
export const metadata: Metadata = {
  title: 'Marketinq Alətləri — HoReCa üçün AI Analiz',
  description:
    'HoReCa biznesiniz üçün AI dəstəkli analiz və planlaşdırma alətləri: kampaniya, müştəri seqmenti və məzmun planlaması.',
};

// TASK-0523: the app body is dark (app/globals.css); the tool pages draw navy titles straight on it,
// so «ROI Kalkulatoru», «Menyu Analitiği» … were near-invisible. A light surface for every tool page.
export default function MarketinqLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
