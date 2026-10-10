import type { ReactNode } from 'react';
import { MarketinqFrame } from '@/components/marketinq-ocagi/MarketinqV2';

// TASK-0524: every Marketinq tool page on the v2 cream surface with Inter (same tokens as /toolkit).
export default function MarketinqToolLayout({ children }: { children: ReactNode }) {
  return <MarketinqFrame>{children}</MarketinqFrame>;
}
