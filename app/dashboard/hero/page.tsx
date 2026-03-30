'use client';

import { useState } from 'react';
import { ExternalLink, Languages, Save } from 'lucide-react';
import { defaultHeroContent } from '@/lib/data/adminContent';

export default function HeroAdminPage() {
  const [formData, setFormData] = useState(defaultHeroContent);
  const [toast, setToast] = useState('');

  const setField = (key: keyof typeof defaultHeroContent, value: string) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Hero Section Redaktoru</h1>
          <p className="mt-3 text-sm text-slate-500">Ana səhifənin ilk ekranındakı bütün field-lər ayrıca idarə olunur.</p>
        </div>

        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-5 md:grid-cols-2">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">Badge text (AZ)</label>
                <input value={formData.badgeAz} onChange={(e) => setField('badgeAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Badge text (TR)</label>
                <input value={formData.badgeTr} onChange={(e) => setField('badgeTr', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => console.log('translate_hero_badge_tr', formData.badgeAz)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Languages size={16} />
                  AZ-dən TR-ə tərcümə et
                </button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Badge text (EN)</label>
                <input value={formData.badgeEn} onChange={(e) => setField('badgeEn', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="flex items-end">
                <button type="button" onClick={() => console.log('translate_hero_badge_en', formData.badgeAz)} className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
                  <Languages size={16} />
                  AZ-dən EN-ə tərcümə et
                </button>
              </div>

              {[
                ['titleLine1Az', 'Başlıq sətir 1 (AZ)'],
                ['titleHighlightAz', 'Başlıq highlight (AZ)'],
                ['titleLine2Az', 'Başlıq sətir 2 (AZ)'],
                ['stat1Value', 'Stat 1 rəqəm'],
                ['stat1Label', 'Stat 1 label'],
                ['stat2Value', 'Stat 2 rəqəm'],
                ['stat2Label', 'Stat 2 label'],
                ['stat3Value', 'Stat 3 rəqəm'],
                ['stat3Label', 'Stat 3 label'],
                ['ctaText', 'CTA buton mətni'],
                ['ctaLink', 'CTA link'],
              ].map(([key, label]) => (
                <div key={key} className={key === 'titleLine2Az' ? 'md:col-span-2' : ''}>
                  <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                  <input value={formData[key as keyof typeof formData]} onChange={(e) => setField(key as keyof typeof formData, e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
                </div>
              ))}

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">Alt mətn (AZ)</label>
                <textarea rows={4} value={formData.subtitleAz} onChange={(e) => setField('subtitleAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">Ahilik mətn (AZ)</label>
                <textarea rows={4} value={formData.ahilikAz} onChange={(e) => setField('ahilikAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button type="button" onClick={() => { console.log('hero_save', formData); notify('Saxlanıldı ✓'); }} className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white">
                <Save size={16} />
                Yadda saxla
              </button>
              <button type="button" onClick={() => window.open('/', '_blank', 'noopener,noreferrer')} className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700">
                <ExternalLink size={16} />
                Önizlə
              </button>
              <button type="button" onClick={() => { console.log('hero_publish', formData); notify('Dərc edildi ✓'); }} className="rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700">
                Dərc et
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
