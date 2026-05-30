'use client';

import { useState } from 'react';
import {
  Bell, Check, Globe, Key, Lock, Mail, Save, Shield, User,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'az', label: 'Azərbaycanca' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
];

export default function AyarlarPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [language, setLanguage] = useState('az');
  const [notifications, setNotifications] = useState({
    email: true,
    listings: true,
    marketing: false,
    weekly: true,
  });
  const [passwordForm, setPasswordForm] = useState({
    current: '',
    newPass: '',
    confirm: '',
  });
  const [passwordMsg, setPasswordMsg] = useState('');

  const handleNotifChange = (key: string) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600));
    setSaving(false);
    setSaved(true);
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
    setSaving(true);
    // TODO: POST /api/auth action=password-change
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setPasswordMsg('Şifrə uğurla dəyişdirildi.');
    setPasswordForm({ current: '', newPass: '', confirm: '' });
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
          <select
            value={language}
            onChange={(e) => { setLanguage(e.target.value); setSaved(false); }}
            className="w-full sm:w-64 px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
          >
            {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
          </select>
        </div>

        {/* Bildirişlər */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Bell size={14} className="inline mr-1" /> Bildirim tənzimləmələri
          </h2>
          <div className="space-y-4">
            {[
              { key: 'email', label: 'Email bildirişləri', desc: 'Hesab yenilikləri və təhlükəsizlik xəbərləri' },
              { key: 'listings', label: 'Elan bildirişləri', desc: 'Elanınıza maraq göstərildiyi zaman' },
              { key: 'marketing', label: 'Marketinq emailləri', desc: 'Yeniliklər, kampaniyalar və tövsiyələr' },
              { key: 'weekly', label: 'Həftəlik xülasə', desc: 'Sektor nəbzi və platform yenilikləri' },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-700">{item.label}</p>
                  <p className="text-xs text-slate-500">{item.desc}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotifChange(item.key)}
                  className={`relative w-12 h-7 rounded-full transition-colors ${
                    notifications[item.key as keyof typeof notifications] ? 'bg-emerald-500' : 'bg-slate-300'
                  }`}
                >
                  <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${
                    notifications[item.key as keyof typeof notifications] ? 'translate-x-5' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
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
              <p className={`text-xs ${passwordMsg.includes('uğurla') ? 'text-emerald-600' : 'text-red-600'}`}>
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
            className="flex items-center gap-2 rounded-xl bg-dk-red px-6 py-3 text-sm font-bold text-white hover:bg-dk-red/90 disabled:opacity-50"
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saving ? 'Saxlanılır...' : saved ? 'Saxlanıldı!' : 'Dəyişiklikləri saxla'}
          </button>
        </div>
      </div>
    </div>
  );
}
