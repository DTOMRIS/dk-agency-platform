import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import PnlPage from '@/app/[locale]/toolkit/pnl/page';
import azMessages from '@/messages/az.json';

export const metadata: Metadata = {
  title: 'P&L Simulator',
  description:
    'Restaurant P&L simulator for food cost, prime cost, rent, and net profit analysis.',
};

export default function PublicPnlSimulatorPage() {
  return (
    <NextIntlClientProvider locale="az" messages={azMessages}>
      <PnlPage />
    </NextIntlClientProvider>
  );
}
