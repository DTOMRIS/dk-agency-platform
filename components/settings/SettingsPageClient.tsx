'use client';

import { FormEvent, useMemo, useState } from 'react';
import { type MemberSession } from '@/lib/member-access';

function getPasswordStrength(password: string) {
  if (password.length < 8) return { label: 'zəif', color: 'bg-red-500' };
  const hasMixed = /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);
  if (password.length > 12 && hasMixed) return { label: 'güclü', color: 'bg-emerald-500' };
  return { label: 'orta', color: 'bg-amber-500' };
}

export default function SettingsPageClient({
  session,
  logs,
}: {
  session: MemberSession;
  logs: Array<{ createdAt: string; ipAddress: string; userAgent: string; city: string; country: string; success: boolean }>;
}) {
  const [profile, setProfile] = useState({
    name: session.name,
    email: session.email,
    phone: '+994',
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const strength = useMemo(() => getPasswordStrength(passwordForm.newPassword), [passwordForm.newPassword]);

  const saveProfile = (event: FormEvent) => {
    event.preventDefault();
    setSavingProfile(true);
    setToast('');
    setTimeout(() => {
      setSavingProfile(false);
      setToast('Məlumatlar yadda saxlanıldı.');
      setTimeout(() => setToast(''), 2400);
    }, 350);
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setError('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Yeni şifrə eyni olmalıdır.');
      return;
    }

    setChangingPassword(true);
    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Mövcud şifrə yanlışdır.');
        return;
      }
      setToast(data.message || 'Şifrəniz dəyişdirildi.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setToast(''), 2400);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Hesab ayarları</h1>
          <p className="mt-2 text-sm text-slate-500">Profil məlumatları, şifrə yeniləmə və son giriş cəhdləri.</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <form onSubmit={saveProfile} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Hesab məlumatları</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Ad Soyad</label>
                <input
                  value={profile.name}
                  onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <input
                  value={profile.email}
                  readOnly
                  className="w-full rounded-2xl border border-slate-200 bg-slate-100 px-4 py-3 text-sm text-slate-500 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Telefon</label>
                <input
                  value={profile.phone}
                  onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={savingProfile}
              className="mt-6 rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {savingProfile ? 'Yadda saxlanır...' : 'Yadda saxla'}
            </button>
          </form>

          <form onSubmit={changePassword} className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Şifrə dəyiş</h2>
            <div className="mt-5 grid gap-4">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Mövcud şifrə</label>
                <input
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Yeni şifrə</label>
                <input
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <div className="mt-2 h-2 rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${strength.color}`}
                    style={{ width: strength.label === 'zəif' ? '33%' : strength.label === 'orta' ? '66%' : '100%' }}
                  />
                </div>
                <p className="mt-2 text-xs font-semibold text-slate-500">Şifrə gücü: {strength.label}</p>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Yeni şifrəni təsdiqlə</label>
                <input
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none"
                />
              </div>
              {error ? <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}
            </div>
            <button
              type="submit"
              disabled={changingPassword}
              className="mt-6 rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
            >
              {changingPassword ? 'Şifrə yenilənir...' : 'Şifrəni dəyiş'}
            </button>
          </form>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Sessiya Tarixi</h2>
          <div className="mt-5 overflow-x-auto">
            {logs.length ? (
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-400">
                    <th className="pb-3 font-black uppercase tracking-[0.18em]">Tarix/saat</th>
                    <th className="pb-3 font-black uppercase tracking-[0.18em]">IP</th>
                    <th className="pb-3 font-black uppercase tracking-[0.18em]">Cihaz</th>
                    <th className="pb-3 font-black uppercase tracking-[0.18em]">Lokasiya</th>
                    <th className="pb-3 font-black uppercase tracking-[0.18em]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={`${log.ipAddress}-${index}`} className="border-b border-slate-100 text-slate-600">
                      <td className="py-3">{new Date(log.createdAt).toLocaleString('az-AZ')}</td>
                      <td className="py-3">{log.ipAddress}</td>
                      <td className="py-3">{log.userAgent}</td>
                      <td className="py-3">
                        {log.city}, {log.country}
                      </td>
                      <td className="py-3">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
                            log.success ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}
                        >
                          {log.success ? 'Uğurlu' : 'Uğursuz'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                Hələ giriş jurnalı yoxdur.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
