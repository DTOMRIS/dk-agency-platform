import { redirect } from 'next/navigation';
import { normalizeLocale, withLocalePrefix } from '@/i18n/config';

// TASK-0523 (owner 2026-10-09): the P&L simulator merged into the free P&L (/toolkit/pnl) —
// break-even, «what if» and the USTA AI comment now live there. Old links keep working.
type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PLSimulatorPage({ params }: Props) {
  const { locale } = await params;
  redirect(withLocalePrefix(normalizeLocale(locale), '/toolkit/pnl'));
}
