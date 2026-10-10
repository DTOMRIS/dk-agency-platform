'use client';

// TASK-0523: one complaints page — single complaint triage (who fixes it, by when), a reply in
// 3 tones (no compensation unless the owner picks one), and a batch analysis of 3–30 complaints.
import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import ToolTabs from '../ToolTabs';
import ComplaintAnalysis from '@/components/marketinq/ComplaintAnalysis';
import SikayetAnalitiyiPage from '@/components/marketinq-ocagi/sikayet-analitigi/SikayetAnalitiyiPage';

export type SikayetTab = 'triage' | 'reply' | 'batch';

/** `replyTool` = the 3-tone reply page, passed in by the route (keeps this file free of its import). */
export default function SikayetHub({ initialTab = 'triage', backHref = '/b2b-panel/marketinq-ocagi', replyTool }: { initialTab?: SikayetTab; backHref?: string; replyTool: ReactNode }) {
  const t = useTranslations('marketinq.hubs.sikayet');
  return (
    <ToolTabs
      backHref={backHref}
      label={t('label')}
      initialTab={initialTab}
      tabs={[
        { key: 'triage', label: t('triage'), hint: t('triageHint'), content: <ComplaintAnalysis backHref={backHref} /> },
        { key: 'reply', label: t('reply'), hint: t('replyHint'), content: replyTool },
        { key: 'batch', label: t('batch'), hint: t('batchHint'), content: <SikayetAnalitiyiPage /> },
      ]}
    />
  );
}
