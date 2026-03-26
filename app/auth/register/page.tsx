'use client';

import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Building2, Mail, Phone, Sparkles, User } from 'lucide-react';
import { type MemberSession, writeMemberSession } from '@/lib/member-access';

export default function RegisterPage() {
  const router = useRouter();
  const [nextUrl, setNextUrl] = useState('/haberler');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    password: '',
  });

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
          action: 'register',
          email: formData.email.trim(),
          password: formData.password,
          name: formData.name.trim(),
          company: formData.company.trim(),
          phone: formData.phone.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.session) {
        setError(data?.error || 'Qeydiyyat alınmadı.');
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
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl md:grid-cols-[1fr_0.95fr]">
          <div className="p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex rounded-full bg-red-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.2em] text-red-600">
                Member Signup
              </div>
              <h1 className="text-3xl font-black text-slate-900">Üzv ol</h1>
              <p className="mt-2 text-slate-600">
                Bu axında qeydiyyatdan sonra birbaşa əvvəlki yazıya qayıdırsan. Supabase env varsa real signup işləyir, yoxdursa local member fallback açılır.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Ad soyad</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                    placeholder="Adınız Soyadınız"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

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
                <label className="mb-1 block text-sm font-medium text-slate-700">Şirkət</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(event) => setFormData({ ...formData, company: event.target.value })}
                    placeholder="Restoran və ya şirkət adı"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Telefon</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                    placeholder="+994 XX XXX XX XX"
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Şifrə</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={formData.password}
                  onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                  placeholder="minimum 6 simvol"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-100"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button type="submit" disabled={submitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3.5 font-bold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-400">
                <Sparkles className="h-5 w-5" />
                {submitting ? 'Yaradılır...' : 'Üzv ol və davam et'}
              </button>
            </form>

            <p className="mt-6 text-sm text-slate-500">
              Artıq hesabın var?{' '}
              <Link href={`/auth/login?next=${encodeURIComponent(nextUrl)}`} className="font-semibold text-red-600 hover:text-red-700">
                Daxil ol
              </Link>
            </p>

            <p className="mt-3 text-sm text-slate-500">
              Üzvlük səhifəsi:{' '}
              <Link href="/uzvluk" className="font-semibold text-slate-900 hover:text-red-600">
                /uzvluk
              </Link>
            </p>
          </div>

          <div className="bg-red-600 p-8 text-white md:p-10">
            <h2 className="text-2xl font-black">Nə açılır?</h2>
            <div className="mt-6 space-y-4 text-sm">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Tam məqalə girişi</p>
                <p className="mt-1 text-red-100">Premium xəbər və longform blog detail-ları server guard ilə qorunur.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Supabase-ready auth</p>
                <p className="mt-1 text-red-100">Env veriləndə login/register birbaşa Supabase Auth-a keçir.</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="font-semibold">Sales layer</p>
                <p className="mt-1 text-red-100">KAZAN AI, toolkit və konsultasiya CTA-ları üzvlük axınına bağlanacaq.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
