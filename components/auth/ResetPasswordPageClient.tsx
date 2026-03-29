'use client';

import { FormEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ResetPasswordPageClient() {
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!token) {
      setError('Link etibarsızdır və ya müddəti bitib. Yenidən cəhd edin.');
      return;
    }
    if (password.length < 8) {
      setError('Yeni şifrə minimum 8 simvol olmalıdır.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Şifrələr eyni olmalıdır.');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Link etibarsızdır və ya müddəti bitib. Yenidən cəhd edin.');
        return;
      }
      setSuccess(data.message || 'Şifrəniz yeniləndi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <h1 className="text-3xl font-black text-slate-900">Yeni şifrə təyin edin</h1>
        {!token ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Etibarsız və ya müddəti bitmiş link.
          </div>
        ) : null}
        {success ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {success}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Yeni şifrə</label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">Yeni şifrəni təsdiqlə</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              />
            </div>
            {error ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
            ) : null}
            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
            >
              {submitting ? 'Yenilənir...' : 'Şifrəni yenilə'}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <Link href="/auth/login" className="font-semibold text-red-600 hover:text-red-700">
            Daxil ol
          </Link>
          <Link href="/auth/forgot-password" className="font-semibold text-slate-600 hover:text-slate-900">
            Yenidən link istə
          </Link>
        </div>
      </div>
    </div>
  );
}
