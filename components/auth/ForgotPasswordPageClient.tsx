'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPageClient() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [resetUrl, setResetUrl] = useState('');

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');
    setResetUrl('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessage(data.error || 'Sorğu qəbul edilmədi.');
        return;
      }

      setMessage(data.message || 'Sıfırlama linki email ünvanınıza göndərildi.');
      setResetUrl(data.resetUrl || '');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50 px-4 py-16">
      <div className="mx-auto max-w-xl rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl">
        <div className="mb-6 text-center">
          <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
            Şifrəni sıfırla
          </div>
          <h1 className="mt-4 text-3xl font-black text-slate-900">Şifrəni sıfırla</h1>
          <p className="mt-2 text-sm text-slate-600">Qeydiyyatlı email ünvanınızı daxil edin</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-700">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
              placeholder="email@example.com"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? 'Göndərilir...' : 'Sıfırlama linki göndər'}
          </button>
        </form>

        {message ? (
          <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700">
            {message}
          </div>
        ) : null}

        {resetUrl ? (
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            Demo link:
            <div className="mt-2">
              <a href={resetUrl} className="font-semibold text-red-600 hover:text-red-700">
                Şifrəni yenilə
              </a>
            </div>
          </div>
        ) : null}

        <div className="mt-6 text-sm text-slate-500">
          <Link href="/auth/login" className="font-semibold text-red-600 hover:text-red-700">
            Daxil ol
          </Link>
        </div>
      </div>
    </div>
  );
}
