'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function VerifyEmailPageClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>(token ? 'idle' : 'error');
  const [message, setMessage] = useState(token ? '' : 'Link etibarsızdır.');

  useEffect(() => {
    if (!token) {
      return;
    }

    const run = async () => {
      setState('loading');
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (!response.ok) {
        setState('error');
        setMessage(data.error || 'Link etibarsızdır.');
        return;
      }
      setState('success');
      setMessage(data.message || 'Email ünvanınız təsdiqləndi!');
    };

    void run();
  }, [token]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900">Email təsdiqi</h1>
        <div
          className={`mt-6 rounded-xl p-4 text-sm ${
            state === 'success'
              ? 'border border-emerald-200 bg-emerald-50 text-emerald-700'
              : state === 'error'
                ? 'border border-red-200 bg-red-50 text-red-700'
                : 'border border-slate-200 bg-slate-50 text-slate-600'
          }`}
        >
          {state === 'loading' ? 'Email təsdiqlənir...' : message}
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/auth/login" className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white">
            Daxil ol
          </Link>
          <Link href="/auth/register" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">
            Qeydiyyata qayıt
          </Link>
        </div>
      </div>
    </div>
  );
}
