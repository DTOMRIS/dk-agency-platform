'use client';

import { useEffect, useState } from 'react';

interface SiteSettingsForm {
  siteName: string;
  slogan: string;
  logoUrl: string;
  socialFacebook: string;
  socialInstagram: string;
  socialLinkedin: string;
  socialYoutube: string;
  seoTitle: string;
  seoDescription: string;
}

const EMPTY_SETTINGS: SiteSettingsForm = {
  siteName: '',
  slogan: '',
  logoUrl: '',
  socialFacebook: '',
  socialInstagram: '',
  socialLinkedin: '',
  socialYoutube: '',
  seoTitle: '',
  seoDescription: '',
};

export default function AyarlarPage() {
  const [settings, setSettings] = useState<SiteSettingsForm>(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadSettings() {
      setLoading(true);
      try {
        const response = await fetch('/api/settings');
        if (!response.ok) throw new Error('load failed');
        const payload = (await response.json()) as { data?: SiteSettingsForm };
        if (!cancelled && payload.data) setSettings(payload.data);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void loadSettings();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveSettings() {
    setSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('save failed');
      setToast('Ayarlar saxlanildi.');
      setTimeout(() => setToast(''), 2200);
    } finally {
      setSaving(false);
    }
  }

  const setField = (key: keyof SiteSettingsForm, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Sayt ayarlari</h1>
          <p className="mt-3 text-sm text-slate-500">
            `site_settings` cedvelinden oxunur ve eyni API ile update olunur.
          </p>
        </div>

        {toast ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {toast}
          </div>
        ) : null}

        <div className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Sayt adi</label>
            <input
              value={settings.siteName}
              onChange={(e) => setField('siteName', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Slogan</label>
            <input
              value={settings.slogan}
              onChange={(e) => setField('slogan', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">Logo URL</label>
            <input
              value={settings.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Facebook</label>
            <input
              value={settings.socialFacebook}
              onChange={(e) => setField('socialFacebook', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Instagram</label>
            <input
              value={settings.socialInstagram}
              onChange={(e) => setField('socialInstagram', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">LinkedIn</label>
            <input
              value={settings.socialLinkedin}
              onChange={(e) => setField('socialLinkedin', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">YouTube</label>
            <input
              value={settings.socialYoutube}
              onChange={(e) => setField('socialYoutube', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">SEO title</label>
            <input
              value={settings.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-slate-700">SEO description</label>
            <textarea
              rows={4}
              value={settings.seoDescription}
              onChange={(e) => setField('seoDescription', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void saveSettings()}
            className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
          >
            {saving ? 'Saxlanilir...' : 'Saxla'}
          </button>
        </div>
      </div>
    </div>
  );
}
