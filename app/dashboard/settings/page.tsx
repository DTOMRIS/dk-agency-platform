'use client';

import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
}> = {
  az: {
    pageTitle: 'Parametrlər',
    pageSubtitle: 'Bu bölmə növbəti sprintdə sistem parametrləri, webhook açarları və inteqrasiya ayarları üçün genişlənəcək.',
  },
  ru: {
    pageTitle: 'Параметры',
    pageSubtitle: 'Этот раздел будет расширен в следующем спринте для системных параметров, ключей webhook и настроек интеграции.',
  },
  en: {
    pageTitle: 'Settings',
    pageSubtitle: 'This section will be expanded in the next sprint for system parameters, webhook keys, and integration settings.',
  },
  tr: {
    pageTitle: 'Parametreler',
    pageSubtitle: 'Bu bölüm bir sonraki sprintte sistem parametreleri, webhook anahtarları ve entegrasyon ayarları için genişletilecek.',
  },
};

export default function DashboardSettingsPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-4xl rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
        <p className="mt-3 text-sm text-slate-500">
          {copy.pageSubtitle}
        </p>
      </div>
    </div>
  );
}
