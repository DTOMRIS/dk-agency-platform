'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { ExternalLink, Languages, Save } from 'lucide-react';
import { defaultHeroContent } from '@/lib/data/adminContent';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    labelBadgeAz: string;
    labelBadgeTr: string;
    labelBadgeEn: string;
    btnTranslateToTr: string;
    btnTranslateToEn: string;
    labelTitleLine1Az: string;
    labelTitleHighlightAz: string;
    labelTitleLine2Az: string;
    labelStat1Value: string;
    labelStat1Label: string;
    labelStat2Value: string;
    labelStat2Label: string;
    labelStat3Value: string;
    labelStat3Label: string;
    labelCtaText: string;
    labelCtaLink: string;
    labelSubtitleAz: string;
    labelAhilikAz: string;
    btnSave: string;
    btnPreview: string;
    btnPublish: string;
    toastSaved: string;
    toastPublished: string;
  }
> = {
  az: {
    pageTitle: 'Hero Section Redaktoru',
    pageSubtitle: 'Ana səhifənin ilk ekranındakı bütün field-lər ayrıca idarə olunur.',
    labelBadgeAz: 'Badge text (AZ)',
    labelBadgeTr: 'Badge text (TR)',
    labelBadgeEn: 'Badge text (EN)',
    btnTranslateToTr: 'AZ-dən TR-ə tərcümə et',
    btnTranslateToEn: 'AZ-dən EN-ə tərcümə et',
    labelTitleLine1Az: 'Başlıq sətir 1 (AZ)',
    labelTitleHighlightAz: 'Başlıq highlight (AZ)',
    labelTitleLine2Az: 'Başlıq sətir 2 (AZ)',
    labelStat1Value: 'Stat 1 rəqəm',
    labelStat1Label: 'Stat 1 label',
    labelStat2Value: 'Stat 2 rəqəm',
    labelStat2Label: 'Stat 2 label',
    labelStat3Value: 'Stat 3 rəqəm',
    labelStat3Label: 'Stat 3 label',
    labelCtaText: 'CTA buton mətni',
    labelCtaLink: 'CTA link',
    labelSubtitleAz: 'Alt mətn (AZ)',
    labelAhilikAz: 'Ahilik mətn (AZ)',
    btnSave: 'Yadda saxla',
    btnPreview: 'Önizlə',
    btnPublish: 'Dərc et',
    toastSaved: 'Saxlanıldı ✓',
    toastPublished: 'Dərc edildi ✓',
  },
  ru: {
    pageTitle: 'Редактор Hero секции',
    pageSubtitle: 'Все поля первого экрана главной страницы управляются отдельно.',
    labelBadgeAz: 'Текст бейджа (AZ)',
    labelBadgeTr: 'Текст бейджа (TR)',
    labelBadgeEn: 'Текст бейджа (EN)',
    btnTranslateToTr: 'Перевести с AZ на TR',
    btnTranslateToEn: 'Перевести с AZ на EN',
    labelTitleLine1Az: 'Заголовок строка 1 (AZ)',
    labelTitleHighlightAz: 'Выделение заголовка (AZ)',
    labelTitleLine2Az: 'Заголовок строка 2 (AZ)',
    labelStat1Value: 'Статистика 1 значение',
    labelStat1Label: 'Статистика 1 метка',
    labelStat2Value: 'Статистика 2 значение',
    labelStat2Label: 'Статистика 2 метка',
    labelStat3Value: 'Статистика 3 значение',
    labelStat3Label: 'Статистика 3 метка',
    labelCtaText: 'Текст кнопки CTA',
    labelCtaLink: 'Ссылка CTA',
    labelSubtitleAz: 'Подзаголовок (AZ)',
    labelAhilikAz: 'Текст Ахилик (AZ)',
    btnSave: 'Сохранить',
    btnPreview: 'Предпросмотр',
    btnPublish: 'Опубликовать',
    toastSaved: 'Сохранено ✓',
    toastPublished: 'Опубликовано ✓',
  },
  en: {
    pageTitle: 'Hero Section Editor',
    pageSubtitle: 'All fields on the first screen of the homepage are managed separately.',
    labelBadgeAz: 'Badge text (AZ)',
    labelBadgeTr: 'Badge text (TR)',
    labelBadgeEn: 'Badge text (EN)',
    btnTranslateToTr: 'Translate AZ to TR',
    btnTranslateToEn: 'Translate AZ to EN',
    labelTitleLine1Az: 'Title line 1 (AZ)',
    labelTitleHighlightAz: 'Title highlight (AZ)',
    labelTitleLine2Az: 'Title line 2 (AZ)',
    labelStat1Value: 'Stat 1 value',
    labelStat1Label: 'Stat 1 label',
    labelStat2Value: 'Stat 2 value',
    labelStat2Label: 'Stat 2 label',
    labelStat3Value: 'Stat 3 value',
    labelStat3Label: 'Stat 3 label',
    labelCtaText: 'CTA button text',
    labelCtaLink: 'CTA link',
    labelSubtitleAz: 'Subtitle (AZ)',
    labelAhilikAz: 'Ahilik text (AZ)',
    btnSave: 'Save',
    btnPreview: 'Preview',
    btnPublish: 'Publish',
    toastSaved: 'Saved ✓',
    toastPublished: 'Published ✓',
  },
  tr: {
    pageTitle: 'Hero Bölümü Editörü',
    pageSubtitle: 'Ana sayfanın ilk ekranındaki tüm alanlar ayrı ayrı yönetilir.',
    labelBadgeAz: 'Rozet metni (AZ)',
    labelBadgeTr: 'Rozet metni (TR)',
    labelBadgeEn: 'Rozet metni (EN)',
    btnTranslateToTr: "AZ'dan TR'ye çevir",
    btnTranslateToEn: "AZ'dan EN'e çevir",
    labelTitleLine1Az: 'Başlık satır 1 (AZ)',
    labelTitleHighlightAz: 'Başlık vurgusu (AZ)',
    labelTitleLine2Az: 'Başlık satır 2 (AZ)',
    labelStat1Value: 'İstatistik 1 değeri',
    labelStat1Label: 'İstatistik 1 etiketi',
    labelStat2Value: 'İstatistik 2 değeri',
    labelStat2Label: 'İstatistik 2 etiketi',
    labelStat3Value: 'İstatistik 3 değeri',
    labelStat3Label: 'İstatistik 3 etiketi',
    labelCtaText: 'CTA buton metni',
    labelCtaLink: 'CTA bağlantısı',
    labelSubtitleAz: 'Alt başlık (AZ)',
    labelAhilikAz: 'Ahilik metni (AZ)',
    btnSave: 'Kaydet',
    btnPreview: 'Önizle',
    btnPublish: 'Yayınla',
    toastSaved: 'Kaydedildi ✓',
    toastPublished: 'Yayınlandı ✓',
  },
};

export default function HeroAdminPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [formData, setFormData] = useState(defaultHeroContent);
  const [toast, setToast] = useState('');

  const setField = (key: keyof typeof defaultHeroContent, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const fieldLabels: Array<[keyof typeof defaultHeroContent, string, boolean?]> = [
    ['titleLine1Az', copy.labelTitleLine1Az],
    ['titleHighlightAz', copy.labelTitleHighlightAz],
    ['titleLine2Az', copy.labelTitleLine2Az, true],
    ['stat1Value', copy.labelStat1Value],
    ['stat1Label', copy.labelStat1Label],
    ['stat2Value', copy.labelStat2Value],
    ['stat2Label', copy.labelStat2Label],
    ['stat3Value', copy.labelStat3Value],
    ['stat3Label', copy.labelStat3Label],
    ['ctaText', copy.labelCtaText],
    ['ctaLink', copy.labelCtaLink],
  ];

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">{copy.pageTitle}</h1>
          <p className="mt-3 text-sm text-slate-500">{copy.pageSubtitle}</p>
        </div>

        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">{copy.labelBadgeAz}</label>
                <input value={formData.badgeAz} onChange={(e) => setField('badgeAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{copy.labelBadgeTr}</label>
                <input value={formData.badgeTr} onChange={(e) => setField('badgeTr', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => undefined} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Languages size={16} />
                  {copy.btnTranslateToTr}
                </button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{copy.labelBadgeEn}</label>
                <input value={formData.badgeEn} onChange={(e) => setField('badgeEn', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => undefined} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Languages size={16} />
                  {copy.btnTranslateToEn}
                </button>
              </div>

              {fieldLabels.map(([key, label, fullWidth]) => (
                <div key={key} className={fullWidth ? 'md:col-span-2' : ''}>
                  <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                  <input value={formData[key as keyof typeof formData]} onChange={(e) => setField(key as keyof typeof formData, e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">{copy.labelSubtitleAz}</label>
                <textarea rows={4} value={formData.subtitleAz} onChange={(e) => setField('subtitleAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">{copy.labelAhilikAz}</label>
                <textarea rows={4} value={formData.ahilikAz} onChange={(e) => setField('ahilikAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => { notify(copy.toastSaved); }} className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">
                <Save size={16} />
                {copy.btnSave}
              </button>
              <button type="button" onClick={() => window.open('/', '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700">
                <ExternalLink size={16} />
                {copy.btnPreview}
              </button>
              <button type="button" onClick={() => { notify(copy.toastPublished); }} className="rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700">
                {copy.btnPublish}
              </button>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-slate-50 p-6">
            <span className="rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">{formData.badgeAz}</span>
            <h2 className="mt-5 font-display text-5xl font-black text-[var(--dk-navy)]">
              {formData.titleLine1Az} <span className="text-[var(--dk-gold)]">{formData.titleHighlightAz}</span>
              <br />
              {formData.titleLine2Az}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">{formData.subtitleAz}</p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                [formData.stat1Value, formData.stat1Label],
                [formData.stat2Value, formData.stat2Label],
                [formData.stat3Value, formData.stat3Label],
              ].map(([value, label]) => (
                <div key={`${value}-${label}`} className="rounded-3xl bg-white p-5">
                  <div className="text-3xl font-black text-[var(--dk-navy)]">{value}</div>
                  <div className="mt-2 text-sm text-slate-500">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
