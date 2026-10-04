import { Suspense } from 'react';
import { getTranslations } from 'next-intl/server';
import VerifyEmailPageClient from '@/components/auth/VerifyEmailPageClient';

async function VerifyEmailFallback() {
  const t = await getTranslations('verifyEmail');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900">{t('title')}</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {t('preparing')}
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailPageClient />
    </Suspense>
  );
}
