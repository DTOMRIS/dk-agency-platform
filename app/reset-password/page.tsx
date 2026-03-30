import { Suspense } from 'react';
import ResetPasswordPageClient from '@/components/auth/ResetPasswordPageClient';

function ResetPasswordFallback() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900">Şifrəni yenilə</h1>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          Səhifə hazırlanır...
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<ResetPasswordFallback />}>
      <ResetPasswordPageClient />
    </Suspense>
  );
}
