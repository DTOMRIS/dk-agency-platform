'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, Lock, LogIn, Mail, ShieldCheck } from 'lucide-react';
import { type MemberSession, writeMemberSession } from '@/lib/member-access';

export default function LoginPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState('/haberler');
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setNextUrl(params.get('next') || '/haberler');
  }, []);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await fetch('/api/member/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          email: formData.email.trim(),
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.session) {
        setError(data?.error || 'Login alınmadı.');
        return;
      }

      writeMemberSession(data.session as MemberSession);
      void fetch('/api/member/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data.session),
      });

      router.push(nextUrl);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-red-50">
      <div className="p-4">
        <Link href={nextUrl} className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition-colors hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Geri qayıt
        </Link>
      </div>

      <div className="flex items-center justify-center px-4 pb-12">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1.05fr_0.95fr]">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                DK Members
              </div>
              <h1 className="text-3xl font-black text-slate-900">Daxil ol</h1>
              <p className="mt-2 text-slate-600">
                Premium məqalə, xəbər analizi və gələcək üzvlük qatlarına giriş üçün hesabına daxil ol.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                    placeholder="email@example.com"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Şifrə</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400">
                <LogIn className="h-5 w-5" />
                {submitting ? 'Yoxlanır...' : 'Daxil ol və davam et'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Hesabın yoxdur?{' '}
              <Link href={`/auth/register?next=${encodeURIComponent(nextUrl)}`} className="font-semibold text-red-600 hover:text-red-700">
                Üzv ol
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Üzvlük modeli haqqında bax:{' '}
              <Link href="/uzvluk" className="font-semibold text-slate-900 hover:text-red-600">
                /uzvluk
              </Link>
            </p>
          </div>

          <div className="bg-slate-950 p-8 text-white md:p-10">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-300">
              <ShieldCheck className="h-4 w-4" />
              Demo girişlər
            </div>

            <div className="space-y-4 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Member</p>
                <p className="mt-2 text-slate-300">member@dkagency.az</p>
                <p className="text-slate-400">member123</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Admin</p>
                <p className="mt-2 text-slate-300">admin@dkagency.az</p>
                <p className="text-slate-400">admin123</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">Founder test</p>
                <p className="mt-2 text-slate-300">dotomris@gmail.com</p>
                <p className="text-slate-400">123456</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
