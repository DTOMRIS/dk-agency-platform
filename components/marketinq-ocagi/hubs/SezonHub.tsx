'use client';

// TASK-0523: one season page — 12-month sales forecast (sezon-analitikasi) + campaign calendar (sezon-planlama).
import { useTranslations } from 'next-intl';
import ToolTabs from '../ToolTabs';
import SezonAnalitikasiPage from '@/components/marketinq-ocagi/sezon-analitikasi/SezonAnalitikasiPage';
import SezonPlanlamaPage from '@/components/marketinq-ocagi/sezon-planlama/SezonPlanlamaPage';

export type SezonTab = 'forecast' | 'calendar';

export default function SezonHub({ initialTab = 'forecast', backHref = '/b2b-panel/marketinq-ocagi' }: { initialTab?: SezonTab; backHref?: string }) {
  const t = useTranslations('marketinq.hubs.sezon');
  return (
    <ToolTabs
      backHref={backHref}
      label={t('label')}
      initialTab={initialTab}
      tabs={[
        { key: 'forecast', label: t('forecast'), hint: t('forecastHint'), content: <SezonAnalitikasiPage backHref={backHref} /> },
        { key: 'calendar', label: t('calendar'), hint: t('calendarHint'), content: <SezonPlanlamaPage /> },
      ]}
    />
  );
}
