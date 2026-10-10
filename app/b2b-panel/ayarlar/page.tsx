'use client';

import { useEffect, useState } from 'react';
import {
  Bell, Check, Globe, Key, Lock, Save, Shield,
} from 'lucide-react';

// TASK-0528: the toggles are the three real subscriptions in email_preferences (before: four switches that
// were saved nowhere). Account-security and listing-lead e-mails are transactional — always sent.
const NOTIFICATION_ITEMS = [
  { key: 'newsletter', label: 'Həftəlik bülleten', desc: 'Sektor nəbzi və həftənin əsas xəbərləri' },
  { key: 'blogDigest', label: 'Yeni məqalələr', desc: 'Bloqda yeni yazı çıxanda qısa xülasə' },
  { key: 'productUpdates', label: 'Platforma yenilikləri', desc: 'Yeni alətlər, kampaniyalar və tövsiyələr' },
] as const;
type NotificationKey = (typeof NOTIFICATION_ITEMS)[number]['key'];

export default function AyarlarPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [prefsLoaded, setPrefsLoaded] = useState(false);
  const [notifications, setNotifications] = useState<Record<NotificationKey, boolean>>({
    newsletter: false,
    blogDigest: false,
    productUpdates: false,
  });

  useEffect(() => {
    let cancelled = false;
    fetch('/api/member/email-preferences')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
      .then((data: { preferences?: Record<NotificationKey, boolean> }) => {
        if (!cancelled && data.preferences) setNotifications(data.preferences);
      })
      .catch(() => {
        if (!cancelled) setSaveError('Bildiriş ayarları yüklənmədi — səhifəni yeniləyin.');
      })
      .finally(() => {
        if (!cancelled) setPrefsLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordOk, setPasswordOk] = useState(false);

  const handleNotifChange = (key: NotificationKey) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const res = await fetch('/api/member/email-preferences', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(notifications),
      });
      if (!res.ok) throw new Error(String(res.status));
      setSaved(true);
    } catch {
      setSaved(false);
      setSaveError('Saxlanmadı — server cavab vermədi. Yenidən yoxlayın.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPass.length < 8) {
      setPasswordMsg('Şifrə ən az 8 simvol olmalıdır.');
      return;
    }
    if (passwordForm.newPass !== passwordForm.confirm) {
      setPasswordMsg('Şifrələr uyğun gəlmir.');
      return;
    }
    setPasswordMsg('');
    setPasswordOk(false);
    setSaving(true);
    // TASK-0526: real request (before: a 0.8 s wait, then «uğurla dəyişdirildi» — nothing was changed).
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwordForm.current, newPassword: passwordForm.newPass }),
      });
      const data = (await res.json().catch(() => ({}))) as { success?: boolean; error?: string; message?: string };
      if (res.ok && data.success) {
        setPasswordOk(true);
        setPasswordMsg(data.message ?? 'Şifrəniz dəyişdirildi.');
        setPasswordForm({ current: '', newPass: '', confirm: '' });
      } else {
        setPasswordMsg(data.error ?? 'Şifrə dəyişdirilmədi. Yenidən yoxlayın.');
      }
    } catch {
      setPasswordMsg('Şifrə dəyişdirilmədi — şəbəkə xətası.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Tənzimləmələr</h1>
        <p className="mt-1 text-sm text-slate-500">Hesab, bildirim və təhlükəsizlik ayarları.</p>
      </div>

      <div className="space-y-6">
        {/* Dil */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Globe size={14} className="inline mr-1" /> İnterfeys dili
          </h2>
          {/* TASK-0528: the portal has no language-prefixed URLs, so a switch here could not change anything. */}
          <p className="text-sm text-slate-600">
            Panel Azərbaycan dilindədir. Saytın rus, ingilis və türk versiyalarını yuxarıdakı dil menyusundan açın.
          </p>
        </div>

        {/* Bildirişlər */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Bell size={14} className="inline mr-1" /> Bildirim tənzimləmələri
          </h2>
          <div className="space-y-4">
            {NOTIFICATION_ITEMS.map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifChange(item.key)}
                  disabled={!prefsLoaded}
                  role="switch"
                  aria-checked={notifications[item.key]}
                  aria-label={item.label}
                  className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${
                    notifications[item.key] ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key] ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
            Hesab təhlükəsizliyi və elanınıza gələn müraciət e-poçtları həmişə göndərilir — onları söndürmək olmur.
          </p>
        </div>

        {/* Şifrə dəyişmə */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Lock size={14} className="inline mr-1" /> Şifrə dəyişdir
          </h2>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Hazırkı şifrə</label>
              <input type="password" value={passwordForm.current}
                onChange={(e) => setPasswordForm((p) => ({ ...p, current: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Yeni şifrə</label>
              <input type="password" value={passwordForm.newPass}
                onChange={(e) => setPasswordForm((p) => ({ ...p, newPass: e.target.value }))}
                placeholder="Min 8 simvol"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Yeni şifrə təkrar</label>
              <input type="password" value={passwordForm.confirm}
                onChange={(e) => setPasswordForm((p) => ({ ...p, confirm: e.target.value }))}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            {passwordMsg && (
              <p className={`text-xs ${passwordOk ? 'text-emerald-600' : 'text-red-600'}`}>
                {passwordMsg}
              </p>
            )}
            <button
              onClick={handlePasswordChange}
              disabled={!passwordForm.current || !passwordForm.newPass}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white hover:bg-slate-800 disabled:opacity-40"
            >
              <Key size={14} /> Şifrəni dəyişdir
            </button>
          </div>
        </div>

        {/* Təhlükəsizlik */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Shield size={14} className="inline mr-1" /> Hesab təhlükəsizliyi
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <p>Son giriş: <strong>Bu gün</strong></p>
            <p>Email təsdiqlənib: <strong className="text-emerald-600">Bəli</strong></p>
            <p>2FA: <span className="text-slate-400">Mövcud deyil (tezliklə)</span></p>
          </div>
        </div>

        {/* Saxla */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-dk-red-strong px-6 py-3 text-sm font-bold text-white hover:bg-dk-red/90 disabled:opacity-50"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saxlanılır...' : saved ? 'Saxlanıldı!' : 'Dəyişiklikləri saxla'}
          </button>
          {saveError && <p role="alert" className="mt-2 text-sm font-semibold text-red-700">{saveError}</p>}
        </div>
      </div>
    </div>
  );
}
