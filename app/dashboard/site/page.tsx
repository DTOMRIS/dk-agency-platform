'use client';

import { ChangeEvent, useState } from 'react';
import { usePathname } from 'next/navigation';
import { adminPartners, adminSiteSettings } from '@/lib/data/adminContent';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
  tabFooter: string;
  tabPartners: string;
  tabGeneral: string;
  footerLogoText: string;
  footerInstagram: string;
  footerFacebook: string;
  footerLinkedin: string;
  footerTwitter: string;
  footerYoutube: string;
  footerPhone: string;
  footerEmail: string;
  footerCopyright: string;
  footerDescription: string;
  footerAddress: string;
  saveFooter: string;
  addPartner: string;
  partnerNamePlaceholder: string;
  partnerLinkPlaceholder: string;
  logoUpload: string;
  deletePartner: string;
  generalSiteName: string;
  generalSeoTitle: string;
  generalFavicon: string;
  generalOgImage: string;
  generalGaId: string;
  generalSeoDescription: string;
  saveGeneral: string;
  toastFooterSaved: string;
  toastGeneralSaved: string;
  logoNotAccepted: string;
}> = {
  az: {
    pageTitle: 'Sayt İdarəsi',
    pageSubtitle: 'Footer, tərəfdaşlar və ümumi SEO field-ləri burada mock CRUD ilə idarə olunur.',
    tabFooter: 'Footer',
    tabPartners: 'Tərəfdaşlar',
    tabGeneral: 'Ümumi',
    footerLogoText: 'Logo mətni',
    footerInstagram: 'Instagram URL',
    footerFacebook: 'Facebook URL',
    footerLinkedin: 'LinkedIn URL',
    footerTwitter: 'Twitter/X URL',
    footerYoutube: 'YouTube URL',
    footerPhone: 'Telefon',
    footerEmail: 'Email',
    footerCopyright: 'Copyright mətni',
    footerDescription: 'Açıqlama',
    footerAddress: 'Ünvan',
    saveFooter: 'Saxla',
    addPartner: 'Əlavə et +',
    partnerNamePlaceholder: 'Tərəfdaş adı',
    partnerLinkPlaceholder: 'Link',
    logoUpload: 'Logo upload',
    deletePartner: 'Sil',
    generalSiteName: 'Sayt adı',
    generalSeoTitle: 'SEO title',
    generalFavicon: 'Favicon URL',
    generalOgImage: 'OG image URL',
    generalGaId: 'Google Analytics ID',
    generalSeoDescription: 'SEO description',
    saveGeneral: 'Saxla',
    toastFooterSaved: 'Footer saxlanıldı ✓',
    toastGeneralSaved: 'Ümumi ayarlar saxlanıldı ✓',
    logoNotAccepted: 'Logo faylı qəbul olunmadı.',
  },
  ru: {
    pageTitle: 'Управление сайтом',
    pageSubtitle: 'Footer, партнёры и общие SEO-поля управляются здесь через mock CRUD.',
    tabFooter: 'Footer',
    tabPartners: 'Партнёры',
    tabGeneral: 'Общее',
    footerLogoText: 'Текст логотипа',
    footerInstagram: 'Instagram URL',
    footerFacebook: 'Facebook URL',
    footerLinkedin: 'LinkedIn URL',
    footerTwitter: 'Twitter/X URL',
    footerYoutube: 'YouTube URL',
    footerPhone: 'Телефон',
    footerEmail: 'Email',
    footerCopyright: 'Текст копирайта',
    footerDescription: 'Описание',
    footerAddress: 'Адрес',
    saveFooter: 'Сохранить',
    addPartner: 'Добавить +',
    partnerNamePlaceholder: 'Название партнёра',
    partnerLinkPlaceholder: 'Ссылка',
    logoUpload: 'Загрузить логотип',
    deletePartner: 'Удалить',
    generalSiteName: 'Название сайта',
    generalSeoTitle: 'SEO title',
    generalFavicon: 'Favicon URL',
    generalOgImage: 'OG image URL',
    generalGaId: 'Google Analytics ID',
    generalSeoDescription: 'SEO description',
    saveGeneral: 'Сохранить',
    toastFooterSaved: 'Footer сохранён ✓',
    toastGeneralSaved: 'Общие настройки сохранены ✓',
    logoNotAccepted: 'Файл логотипа не принят.',
  },
  en: {
    pageTitle: 'Site Management',
    pageSubtitle: 'Footer, partners and general SEO fields are managed here with mock CRUD.',
    tabFooter: 'Footer',
    tabPartners: 'Partners',
    tabGeneral: 'General',
    footerLogoText: 'Logo text',
    footerInstagram: 'Instagram URL',
    footerFacebook: 'Facebook URL',
    footerLinkedin: 'LinkedIn URL',
    footerTwitter: 'Twitter/X URL',
    footerYoutube: 'YouTube URL',
    footerPhone: 'Phone',
    footerEmail: 'Email',
    footerCopyright: 'Copyright text',
    footerDescription: 'Description',
    footerAddress: 'Address',
    saveFooter: 'Save',
    addPartner: 'Add +',
    partnerNamePlaceholder: 'Partner name',
    partnerLinkPlaceholder: 'Link',
    logoUpload: 'Logo upload',
    deletePartner: 'Delete',
    generalSiteName: 'Site name',
    generalSeoTitle: 'SEO title',
    generalFavicon: 'Favicon URL',
    generalOgImage: 'OG image URL',
    generalGaId: 'Google Analytics ID',
    generalSeoDescription: 'SEO description',
    saveGeneral: 'Save',
    toastFooterSaved: 'Footer saved ✓',
    toastGeneralSaved: 'General settings saved ✓',
    logoNotAccepted: 'Logo file not accepted.',
  },
  tr: {
    pageTitle: 'Site Yönetimi',
    pageSubtitle: 'Footer, ortaklar ve genel SEO alanları burada mock CRUD ile yönetilir.',
    tabFooter: 'Footer',
    tabPartners: 'Ortaklar',
    tabGeneral: 'Genel',
    footerLogoText: 'Logo metni',
    footerInstagram: 'Instagram URL',
    footerFacebook: 'Facebook URL',
    footerLinkedin: 'LinkedIn URL',
    footerTwitter: 'Twitter/X URL',
    footerYoutube: 'YouTube URL',
    footerPhone: 'Telefon',
    footerEmail: 'Email',
    footerCopyright: 'Telif hakkı metni',
    footerDescription: 'Açıklama',
    footerAddress: 'Adres',
    saveFooter: 'Kaydet',
    addPartner: 'Ekle +',
    partnerNamePlaceholder: 'Ortak adı',
    partnerLinkPlaceholder: 'Link',
    logoUpload: 'Logo yükle',
    deletePartner: 'Sil',
    generalSiteName: 'Site adı',
    generalSeoTitle: 'SEO title',
    generalFavicon: 'Favicon URL',
    generalOgImage: 'OG image URL',
    generalGaId: 'Google Analytics ID',
    generalSeoDescription: 'SEO description',
    saveGeneral: 'Kaydet',
    toastFooterSaved: 'Footer kaydedildi ✓',
    toastGeneralSaved: 'Genel ayarlar kaydedildi ✓',
    logoNotAccepted: 'Logo dosyası kabul edilmedi.',
  },
};

type SiteTab = 'footer' | 'partners' | 'general';

export default function DashboardSitePage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

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
      notify(validation.error || copy.logoNotAccepted);
      return;
    }
    const compressed = await compressImage(file, { maxWidth: 600, maxHeight: 600, maxSizeKB: 250 });
    setPartners((prev) => prev.map((item) => (item.id === partnerId ? { ...item, logo: compressed.preview } : item)));
    notify(`Logo hazırlandı: ${compressed.reduction}`);
  };

  const footerFields: [string, string][] = [
    ['logoText', copy.footerLogoText],
    ['instagram', copy.footerInstagram],
    ['facebook', copy.footerFacebook],
    ['linkedin', copy.footerLinkedin],
    ['twitter', copy.footerTwitter],
    ['youtube', copy.footerYoutube],
    ['phone', copy.footerPhone],
    ['email', copy.footerEmail],
    ['copyright', copy.footerCopyright],
  ];

  const generalFields: [string, string][] = [
    ['siteName', copy.generalSiteName],
    ['seoTitle', copy.generalSeoTitle],
    ['favicon', copy.generalFavicon],
    ['ogImage', copy.generalOgImage],
    ['gaId', copy.generalGaId],
  ];

  const tabs: [SiteTab, string][] = [
    ['footer', copy.tabFooter],
    ['partners', copy.tabPartners],
    ['general', copy.tabGeneral],
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
          <p className="mt-3 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="flex flex-wrap gap-3">
          {tabs.map(([value, label]) => (
            <button key={value} type="button" onClick={() => setTab(value)} className={`rounded-full px-5 py-3 text-sm font-bold ${tab === value ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'}`}>
              {label}
            </button>
          ))}
        </div>

        {tab === 'footer' ? (
          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            {footerFields.map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                <input value={settings[key as keyof typeof settings] as string} onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">{copy.footerDescription}</label>
              <textarea rows={4} value={settings.footerDescription} onChange={(e) => setSettings((prev) => ({ ...prev, footerDescription: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">{copy.footerAddress}</label>
              <textarea rows={3} value={settings.address} onChange={(e) => setSettings((prev) => ({ ...prev, address: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => { notify(copy.toastFooterSaved); }} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">{copy.saveFooter}</button>
            </div>
          </div>
        ) : null}

        {tab === 'partners' ? (
          <div className="space-y-4">
            <button type="button" onClick={() => setPartners((prev) => [...prev, { id: `p${Date.now()}`, name: '', logo: '', link: '' }])} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">{copy.addPartner}</button>
            {partners.map((partner) => (
              <div key={partner.id} className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-[120px_1fr_auto]">
                <div className="flex h-24 items-center justify-center rounded-3xl bg-slate-50">
                  {partner.logo ? <img src={partner.logo} alt={partner.name || 'Logo'} className="h-16 w-16 rounded-2xl object-cover" /> : <span className="text-xs text-slate-400">Logo</span>}
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <input value={partner.name} onChange={(e) => setPartners((prev) => prev.map((item) => (item.id === partner.id ? { ...item, name: e.target.value } : item)))} placeholder={copy.partnerNamePlaceholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                  <input value={partner.link} onChange={(e) => setPartners((prev) => prev.map((item) => (item.id === partner.id ? { ...item, link: e.target.value } : item)))} placeholder={copy.partnerLinkPlaceholder} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                  <label className="inline-flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-3 text-sm font-semibold text-slate-600">
                    {copy.logoUpload}
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => void onPartnerLogo(e, partner.id)} />
                  </label>
                </div>
                <button type="button" onClick={() => setPartners((prev) => prev.filter((item) => item.id !== partner.id))} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">{copy.deletePartner}</button>
              </div>
            ))}
          </div>
        ) : null}

        {tab === 'general' ? (
          <div className="grid gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm md:grid-cols-2">
            {generalFields.map(([key, label]) => (
              <div key={key}>
                <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                <input value={settings[key as keyof typeof settings] as string} onChange={(e) => setSettings((prev) => ({ ...prev, [key]: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">{copy.generalSeoDescription}</label>
              <textarea rows={4} value={settings.seoDescription} onChange={(e) => setSettings((prev) => ({ ...prev, seoDescription: e.target.value }))} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            </div>
            <div className="md:col-span-2">
              <button type="button" onClick={() => { notify(copy.toastGeneralSaved); }} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">{copy.saveGeneral}</button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
