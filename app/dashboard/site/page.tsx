'use client';

import { ChangeEvent, useState } from 'react';
import { adminPartners, adminSiteSettings } from '@/lib/data/adminContent';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';

type SiteTab = 'footer' | 'partners' | 'general';

export default function DashboardSitePage() {
  const [tab, setTab] = useState<SiteTab>('footer');
  const [settings, setSettings] = useState(adminSiteSettings);
  const [partners, setPartners] = useState(adminPartners);
  const [toast, setToast] = useState('');

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const onPartnerLogo = async (event: ChangeEvent<HTMLInputElement>, partnerId: string) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const validation = validateImage(file);
    if (!validation.valid) {
      notify(validation.error || 'Logo faylı qəbul olunmadı.');
      return;
    }
    const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, maxSizeKB: 250 });
    setPartners((prev) => prev.map((item) => (item.id === partnerId ? { ...item, logo: compressed.preview } : item)));
    notify(`Logo hazırlandı: ${compressed.reduction}`);
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Sayt İdarəsi</h1>
          <p className="mt-3 text-sm text-slate-500">Footer, tərəfdaşlar və ümumi SEO field-ləri burada mock CRUD ilə idarə olunur.</p>
        </div>

        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="flex flex-wrap gap-3">
          {[
            ['footer', 'Footer'],
            ['partners', 'Tərəfdaşlar'],
            ['general', 'Ümumi'],
          ].map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value as SiteTab)} className={`rounded-full px-5 py-3 text-sm font-bold ${tab === value ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'footer' ? (
          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            {[
              ['logoText', 'Logo mətni'],
              ['instagram', 'Instagram URL'],
              ['facebook', 'Facebook URL'],
              ['linkedin', 'LinkedIn URL'],
              ['twitter', 'Twitter/X URL'],
              ['youtube', 'YouTube URL'],
              ['phone', 'Telefon'],
              ['email', 'Email'],
              ['copyright', 'Copyright mətni'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                <input value={settings[key as keyof typeof settings] as string} onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Açıqlama</label>
              <textarea rows={4} value={settings.footerDescription} onChange={(e) => setSettings((prev) => ({ ...prev, footerDescription: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">Ünvan</label>
              <textarea rows={3} value={settings.address} onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => { console.log('site_footer_save', settings); notify('Footer saxlanıldı ✓'); }} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">Saxla</button>
            </div>
          </div>
        ) : null}

        {tab === 'partners' ? (
          <div className="space-y-4">
            <button type="button" onClick={() => setPartners((prev) => [...prev, { id: `p${Date.now()}`, name: '', logo: '', link: '' }])} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">Əlavə et +</button>
            {partners.map((partner) => (
              <div key={partner.id} className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[120px_1fr_auto]">
                <div className="flex h-24 items-center justify-center rounded-3xl bg-slate-50">
                  {partner.logo ? <img src={partner.logo} alt={partner.name || 'Logo'} className="h-16 w-16 rounded-2xl object-cover" /> : <span className="text-xs text-slate-400">Logo</span>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={partner.name} onChange={(e) => setPartners((prev) => prev.map((item) => (item.id === partner.id ? { ...item, name: e.target.value } : item)))} placeholder="Tərəfdaş adı" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                  <input value={partner.link} onChange={(e) => setPartners((prev) => prev.map((item) => (item.id === partner.id ? { ...item, link: e.target.value } : item)))} placeholder="Link" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">
                    Logo upload
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPartnerLogo(e, partner.id)} />
                  </label>
                </div>
                <button type="button" onClick={() => setPartners((prev) => prev.filter((item) => item.id !== partner.id))} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Sil</button>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'general' ? (
          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            {[
              ['siteName', 'Sayt adı'],
              ['seoTitle', 'SEO title'],
              ['favicon', 'Favicon URL'],
              ['ogImage', 'OG image URL'],
              ['gaId', 'Google Analytics ID'],
            ].map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                <input value={settings[key as keyof typeof settings] as string} onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">SEO description</label>
              <textarea rows={4} value={settings.seoDescription} onChange={(e) => setSettings((prev) => ({ ...prev, seoDescription: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => { console.log('site_general_save', settings); notify('Ümumi ayarlar saxlanıldı ✓'); }} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">Saxla</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
