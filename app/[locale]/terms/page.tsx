'use client';

import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, { title: string; body: string }> = {
  az: {
    title: 'İstifadə Şərtləri',
    body: 'Bu səhifə istifadə şərtləri üçün saxlayıcı məzmundur.',
  },
  ru: {
    title: 'Условия использования',
    body: 'Эта страница является заполнителем для условий использования.',
  },
  en: {
    title: 'Terms of Use',
    body: 'This page is a placeholder for the terms of use.',
  },
  tr: {
    title: 'Kullanım Koşulları',
    body: 'Bu sayfa kullanım koşulları için yer tutucudur.',
  },
};

export default function TermsPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  return (
    <div className="min-h-[70vh] px-4 py-16 bg-slate-50">
      <div className="max-w-3xl mx-auto rounded-2xl border border-slate-200 bg-white p-8">
        <h1 className="text-3xl font-bold text-slate-900">{copy.title}</h1>
        <p className="mt-4 text-slate-600">{copy.body}</p>
      </div>
    </div>
  );
}
