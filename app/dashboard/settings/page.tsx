'use client';

import { useTranslations } from 'next-intl';

export default function DashboardSettingsPage() {
  const t = useTranslations('dashboardSettings');

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{t('pageTitle')}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {t('pageSubtitle')}
        </p>
      </div>
    </div>
  );
}
