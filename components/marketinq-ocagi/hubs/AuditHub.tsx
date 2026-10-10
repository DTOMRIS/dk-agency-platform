'use client';

// TASK-0523: one «restaurant check» page — the guest-side K·S·T self-check (kst-yoxlayici) and the
// six business areas self-audit (restoran-audit).
import { useTranslations } from 'next-intl';
import ToolTabs from '../ToolTabs';
import KSTYoxlayiciPage from '@/components/marketinq-ocagi/kst-yoxlayici/KSTYoxlayiciPage';
import RestoranAuditPage from '@/components/marketinq-ocagi/restoran-audit/RestoranAuditPage';

export type AuditTab = 'guest' | 'business';

export default function AuditHub({ initialTab = 'guest', backHref = '/b2b-panel/marketinq-ocagi' }: { initialTab?: AuditTab; backHref?: string }) {
  const t = useTranslations('marketinq.hubs.audit');
  return (
    <ToolTabs
      backHref={backHref}
      label={t('label')}
      initialTab={initialTab}
      tabs={[
        { key: 'guest', label: t('guest'), hint: t('guestHint'), content: <KSTYoxlayiciPage /> },
        { key: 'business', label: t('business'), hint: t('businessHint'), content: <RestoranAuditPage backHref={backHref} /> },
      ]}
    />
  );
}
