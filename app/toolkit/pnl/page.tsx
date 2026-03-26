import type { Metadata } from 'next';
import PnlPage from '@/app/[locale]/toolkit/pnl/page';

export const metadata: Metadata = {
  title: 'P&L Simulyatoru',
  description:
    'Restoran üçün food cost, prime cost, icarə və xalis mənfəəti göstərən P&L simulyatoru.',
};

export default function PublicPnlPage() {
  return <PnlPage />;
}
