import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import PnlPage from '@/app/[locale]/toolkit/pnl/page';
import azMessages from '@/messages/az.json';

export const metadata: Metadata = {
  title: 'Mənfəət və zərər hesabatı (P&L)',
  description:
    'Restoranın aylıq satışını və xərclərini yazın: xalis mənfəəti, ərzaq və işçi xərcini, icarənin payını görün.',
};

export default function PublicPnlPage() {
  return (
    <NextIntlClientProvider locale="az" messages={azMessages}>
      <PnlPage />
    </NextIntlClientProvider>
  );
}
