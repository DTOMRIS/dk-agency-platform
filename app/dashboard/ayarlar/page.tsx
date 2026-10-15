'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';

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

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    toastSaved: string;
    labelSiteName: string;
    labelSlogan: string;
    labelLogoUrl: string;
    labelFacebook: string;
    labelInstagram: string;
    labelLinkedin: string;
    labelYoutube: string;
    labelSeoTitle: string;
    labelSeoDesc: string;
    btnSaving: string;
    btnSave: string;
  }
> = {
  az: {
    pageTitle: 'Sayt ayarlari',
    pageSubtitle: '`site_settings` cedvelinden oxunur ve eyni API ile update olunur.',
    toastSaved: 'Ayarlar saxlanildi.',
    labelSiteName: 'Sayt adi',
    labelSlogan: 'Slogan',
    labelLogoUrl: 'Logo URL',
    labelFacebook: 'Facebook',
    labelInstagram: 'Instagram',
    labelLinkedin: 'LinkedIn',
    labelYoutube: 'YouTube',
    labelSeoTitle: 'SEO title',
    labelSeoDesc: 'SEO description',
    btnSaving: 'Saxlanilir...',
    btnSave: 'Saxla',
  },
  ru: {
    pageTitle: 'Настройки сайта',
    pageSubtitle: 'Читается из таблицы `site_settings` и обновляется через тот же API.',
    toastSaved: 'Настройки сохранены.',
    labelSiteName: 'Название сайта',
    labelSlogan: 'Слоган',
    labelLogoUrl: 'URL логотипа',
    labelFacebook: 'Facebook',
    labelInstagram: 'Instagram',
    labelLinkedin: 'LinkedIn',
    labelYoutube: 'YouTube',
    labelSeoTitle: 'SEO заголовок',
    labelSeoDesc: 'SEO описание',
    btnSaving: 'Сохранение...',
    btnSave: 'Сохранить',
  },
  en: {
    pageTitle: 'Site settings',
    pageSubtitle: 'Read from the `site_settings` table and updated via the same API.',
    toastSaved: 'Settings saved.',
    labelSiteName: 'Site name',
    labelSlogan: 'Slogan',
    labelLogoUrl: 'Logo URL',
    labelFacebook: 'Facebook',
    labelInstagram: 'Instagram',
    labelLinkedin: 'LinkedIn',
    labelYoutube: 'YouTube',
    labelSeoTitle: 'SEO title',
    labelSeoDesc: 'SEO description',
    btnSaving: 'Saving...',
    btnSave: 'Save',
  },
  tr: {
    pageTitle: 'Site ayarları',
    pageSubtitle: '`site_settings` tablosundan okunur ve aynı API ile güncellenir.',
    toastSaved: 'Ayarlar kaydedildi.',
    labelSiteName: 'Site adı',
    labelSlogan: 'Slogan',
    labelLogoUrl: 'Logo URL',
    labelFacebook: 'Facebook',
    labelInstagram: 'Instagram',
    labelLinkedin: 'LinkedIn',
    labelYoutube: 'YouTube',
    labelSeoTitle: 'SEO başlığı',
    labelSeoDesc: 'SEO açıklaması',
    btnSaving: 'Kaydediliyor...',
    btnSave: 'Kaydet',
  },
};

export default function AyarlarPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

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
      setToast(copy.toastSaved);
      setTimeout(() => setToast(''), 2200);
    } finally {
      setSaving(false);
    }
  }

  const setField = (key: keyof SiteSettingsForm, value: string) =>
    setSettings((prev) => ({ ...prev, [key]: value }));

  return (
    <div className="min-h-full bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] sm:text-4xl">{copy.pageTitle}</h1>
          <p className="mt-3 text-sm text-[#5B6474]">{copy.pageSubtitle}</p>
        </div>

        {toast ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
            {toast}
          </div>
        ) : null}

        <div className="grid gap-6 rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)] md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelSiteName}</label>
            <input
              value={settings.siteName}
              onChange={(e) => setField('siteName', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelSlogan}</label>
            <input
              value={settings.slogan}
              onChange={(e) => setField('slogan', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelLogoUrl}</label>
            <input
              value={settings.logoUrl}
              onChange={(e) => setField('logoUrl', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelFacebook}</label>
            <input
              value={settings.socialFacebook}
              onChange={(e) => setField('socialFacebook', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelInstagram}</label>
            <input
              value={settings.socialInstagram}
              onChange={(e) => setField('socialInstagram', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelLinkedin}</label>
            <input
              value={settings.socialLinkedin}
              onChange={(e) => setField('socialLinkedin', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelYoutube}</label>
            <input
              value={settings.socialYoutube}
              onChange={(e) => setField('socialYoutube', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelSeoTitle}</label>
            <input
              value={settings.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)}
              className="h-11 w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-bold text-[#334155]">{copy.labelSeoDesc}</label>
            <textarea
              rows={4}
              value={settings.seoDescription}
              onChange={(e) => setField('seoDescription', e.target.value)}
              className="w-full rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:bg-white"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            disabled={loading || saving}
            onClick={() => void saveSettings()}
            className="rounded-full bg-dk-red-strong px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-dk-red-deep disabled:opacity-60"
          >
            {saving ? copy.btnSaving : copy.btnSave}
          </button>
        </div>
      </div>
    </div>
  );
}
