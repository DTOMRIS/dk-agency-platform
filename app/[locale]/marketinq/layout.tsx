import type { ReactNode } from 'react';
import { MarketinqFrame } from '@/components/marketinq-ocagi/MarketinqV2';

// TASK-0523/0524: the dark app body made the navy tool titles near-invisible; tools now sit on the
// v2 cream surface with Inter — the same frame as the B2B tool pages and /toolkit.
export default function LocaleMarketinqLayout({ children }: { children: ReactNode }) {
  return <MarketinqFrame>{children}</MarketinqFrame>;
}
