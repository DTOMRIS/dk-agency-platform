import type { ReactNode } from 'react';

// TASK-0523: same light surface as app/marketinq/layout.tsx — the dark app body made the navy
// tool titles («ROI Kalkulatoru», «Menyu Analitiği» …) near-invisible.
export default function LocaleMarketinqLayout({ children }: { children: ReactNode }) {
  return <div className="min-h-screen bg-slate-50">{children}</div>;
}
