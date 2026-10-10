'use client';

// TASK-0523: one ROI page — channel comparison (roi-kalkulator) + ad campaign incl. reach and
// influencer fee (reklam-roi). Both count profit (revenue × share left), not revenue.
import { useTranslations } from 'next-intl';
import ToolTabs from '../ToolTabs';
import ROICalculatorV2 from '@/components/marketinq/ROICalculatorV2';
import ReklamRoiPage from '@/components/marketinq-ocagi/reklam-roi/ReklamRoiPage';

export type RoiTab = 'channels' | 'campaign';

export default function RoiHub({ initialTab = 'channels', backHref = '/b2b-panel/marketinq-ocagi' }: { initialTab?: RoiTab; backHref?: string }) {
  const t = useTranslations('marketinq.hubs.roi');
  return (
    <ToolTabs
      label={t('label')}
      initialTab={initialTab}
      tabs={[
        { key: 'channels', label: t('channels'), hint: t('channelsHint'), content: <ROICalculatorV2 backHref={backHref} /> },
        { key: 'campaign', label: t('campaign'), hint: t('campaignHint'), content: <ReklamRoiPage backHref={backHref} /> },
      ]}
    />
  );
}
