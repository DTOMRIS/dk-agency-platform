'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, GripHorizontal, ImagePlus, UploadCloud } from 'lucide-react';
import {
  CITY_OPTIONS,
  DISTRICT_OPTIONS,
  LISTING_CATEGORIES,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import { getFieldsForType } from '@/lib/data/listingFieldConfig';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';

type Step = 1 | 2 | 3 | 4 | 5 | 6;

interface UploadItem {
  id: string;
  name: string;
  preview: string;
}

const STEPS = ['Kateqoriya', 'Əsas məlumatlar', 'Əlavə sahələr', 'Şəkillər', 'Önizlə', 'Hazır'] as const;

function nextTrackingCode() {
  const next = String(MOCK_LISTINGS.length + 1).padStart(4, '0');
  return `DK-2026-${next}`;
}

function moveItem<T>(items: T[], from: number, to: number) {
  const clone = [...items];
  const [item] = clone.splice(from, 1);
  clone.splice(to, 0, item);
  return clone;
}

function nextStep(step: Step): Step {
  return (step >= 6 ? 6 : (step + 1)) as Step;
}

function previousStep(step: Step): Step {
  return (step <= 1 ? 1 : (step - 1)) as Step;
}

export default function ListingSubmissionPage() {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<ListingCategory | null>(null);
  const [submittedCode, setSubmittedCode] = useState('');
  const [uploads, setUploads] = useState<UploadItem[]>([]);
  const [coverId, setCoverId] = useState('');
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({
    title: '',
    description: '',
    price: '',
    currency: 'AZN',
    city: 'Bakı',
    district: '',
    ownerName: '',
    phone: '',
    email: '',
  });

  const selectedCategory = useMemo(
    () => LISTING_CATEGORIES.find((item) => item.id === category),
    [category],
  );
  const typeFields = useMemo(() => (category ? getFieldsForType(category) : []), [category]);
  const currentDistricts = useMemo(
    () => DISTRICT_OPTIONS.filter((item) => item.city === formData.city),
    [formData.city],
  );

  const handleNext = () => setStep((prev) => nextStep(prev));
  const handleBack = () => setStep((prev) => previousStep(prev));

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    const nextUploads = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      name: file.name,
      preview: URL.createObjectURL(file),
    }));

    setUploads((prev) => {
      const merged = [...prev, ...nextUploads];
      if (!coverId && merged[0]) setCoverId(merged[0].id);
      return merged;
    });
  };

  const handleSubmit = () => {
    const trackingCode = nextTrackingCode();
    const payload = {
      trackingCode,
      category,
      formData,
      uploads: uploads.map((item) => item.name),
      coverId,
    };

    console.log('listing_submit', payload);
    setSubmittedCode(trackingCode);
    setStep(6);
  };

  const renderDynamicField = (field: ReturnType<typeof getFieldsForType>[number]) => {
    const value = formData[field.key];

    if (field.type === 'textarea') {
      return (
        <textarea
          rows={4}
          value={String(value ?? '')}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, [field.key]: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
        />
      );
    }

    if (field.type === 'boolean') {
      return (
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={Boolean(value)}
            onChange={(event) =>
              setFormData((prev) => ({ ...prev, [field.key]: event.target.checked }))
            }
            className="h-4 w-4 rounded border-slate-300 text-[var(--dk-red)]"
          />
          {field.label}
        </label>
      );
    }

    if (field.type === 'select') {
      return (
        <select
          value={String(value ?? '')}
          onChange={(event) =>
            setFormData((prev) => ({ ...prev, [field.key]: event.target.value }))
          }
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
        >
          <option value="">Seç</option>
          {field.options?.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type === 'number' ? 'number' : 'text'}
        value={String(value ?? '')}
        onChange={(event) =>
          setFormData((prev) => ({
            ...prev,
            [field.key]: field.type === 'number' ? Number(event.target.value) || '' : event.target.value,
          }))
        }
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
      />
    );
  };

  return (
    <div className="min-h-screen bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <span className="inline-flex rounded-full bg-[var(--dk-red)] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-white">
                Elan ver
              </span>
              <h1 className="mt-4 font-display text-4xl font-black text-[var(--dk-navy)]">
                HoReCa elanını göndər
              </h1>
            </div>
            <div className="text-sm font-semibold text-slate-500">Addım {Math.min(step, 5)}/5</div>
          </div>

          <div className="h-2 rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-[var(--dk-gold)] transition-all"
              style={{ width: `${(Math.min(step, 5) / 5) * 100}%` }}
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-semibold text-slate-400 sm:grid-cols-5">
            {STEPS.slice(0, 5).map((label, index) => (
              <div key={label} className={step >= index + 1 ? 'text-[var(--dk-navy)]' : ''}>
                {label}
              </div>
            ))}
          </div>
        </div>

        {step === 1 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {LISTING_CATEGORIES.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => {
                  setCategory(item.id);
                  setStep(2);
                }}
                className="rounded-[28px] border border-slate-200 bg-white p-6 text-left shadow-sm transition hover:-translate-y-1 hover:border-[var(--dk-gold)] hover:shadow-lg"
              >
                <div className={`inline-flex rounded-2xl px-3 py-2 text-xs font-bold ${item.badgeClass}`}>
                  {item.label}
                </div>
                <h2 className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm leading-7 text-slate-500">{item.description}</p>
              </button>
            ))}
          </div>
        ) : null}

        {step === 2 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Başlıq</label>
                <input
                  value={String(formData.title ?? '')}
                  onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Qiymət</label>
                <input
                  type="number"
                  value={String(formData.price ?? '')}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, price: Number(event.target.value) || '' }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-bold text-slate-700">Təsvir</label>
                <textarea
                  rows={5}
                  value={String(formData.description ?? '')}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, description: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Şəhər</label>
                <select
                  value={String(formData.city)}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, city: event.target.value, district: '' }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                >
                  {CITY_OPTIONS.filter((item) => item.value !== 'all').map((item) => (
                    <option key={item.value} value={item.label}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Rayon</label>
                <select
                  value={String(formData.district ?? '')}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, district: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                >
                  <option value="">Seç</option>
                  {currentDistricts.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Ad</label>
                <input
                  value={String(formData.ownerName ?? '')}
                  onChange={(event) =>
                    setFormData((prev) => ({ ...prev, ownerName: event.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Telefon</label>
                <input
                  value={String(formData.phone ?? '')}
                  onChange={(event) => setFormData((prev) => ({ ...prev, phone: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">Email</label>
                <input
                  type="email"
                  value={String(formData.email ?? '')}
                  onChange={(event) => setFormData((prev) => ({ ...prev, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                />
              </div>
            </div>
          </div>
        ) : null}

        {step === 3 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {typeFields.map((field) => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    {field.label}
                    {field.required ? ' *' : ''}
                  </label>
                  {renderDynamicField(field)}
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {step === 4 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <label className="flex cursor-pointer items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm font-semibold text-slate-600">
              <UploadCloud className="h-5 w-5 text-[var(--dk-gold)]" />
              Şəkil əlavə et
              <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {uploads.map((item, index) => (
                <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-slate-100">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.preview} alt={item.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="mt-3 truncate text-sm font-semibold text-slate-700">{item.name}</div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600">
                      <input
                        type="radio"
                        checked={coverId === item.id}
                        onChange={() => setCoverId(item.id)}
                      />
                      Vitrin şəkli
                    </label>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => setUploads((prev) => moveItem(prev, index, index - 1))}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                      >
                        ←
                      </button>
                      <button
                        type="button"
                        disabled={index === uploads.length - 1}
                        onClick={() => setUploads((prev) => moveItem(prev, index, index + 1))}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 disabled:opacity-40"
                      >
                        →
                      </button>
                    </div>
                  </div>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs text-slate-400">
                    <GripHorizontal className="h-3.5 w-3.5" />
                    Sıranı dəyiş
                  </div>
                </div>
              ))}

              {!uploads.length ? (
                <div className="rounded-[24px] border border-dashed border-slate-300 bg-slate-50 p-6 text-sm text-slate-500">
                  Hələ şəkil əlavə edilməyib.
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

        {step === 5 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Önizlə</h2>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <div>
                    <strong>Kateqoriya:</strong> {selectedCategory?.label}
                  </div>
                  <div>
                    <strong>Başlıq:</strong> {String(formData.title || '—')}
                  </div>
                  <div>
                    <strong>Şəhər:</strong> {String(formData.city || '—')}
                    {formData.district ? `, ${String(formData.district)}` : ''}
                  </div>
                  <div>
                    <strong>Qiymət:</strong> {String(formData.price || '—')} AZN
                  </div>
                  <div>
                    <strong>Əlaqə:</strong> {String(formData.ownerName || '—')} •{' '}
                    {String(formData.phone || '—')}
                  </div>
                  <div className="rounded-2xl bg-slate-50 p-4">{String(formData.description || '—')}</div>
                </div>
              </div>

              <div>
                <h3 className="font-display text-xl font-black text-[var(--dk-navy)]">Əlavə sahələr</h3>
                <div className="mt-4 grid gap-3">
                  {typeFields.map((field) => (
                    <div key={field.key} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm">
                      <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">
                        {field.label}
                      </div>
                      <div className="mt-2 font-semibold text-slate-700">
                        {typeof formData[field.key] === 'boolean'
                          ? formData[field.key]
                            ? '✅'
                            : '❌'
                          : String(formData[field.key] || '—')}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  Yüklənən şəkil sayı: {uploads.length}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {step === 6 ? (
          <div className="rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              Elanınız göndərildi!
            </div>
            <h2 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)]">
              {submittedCode}
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-500">
              Komitəmiz 24 saat ərzində incələyəcək. Tracking code-u kopyalayın və elan statusunu
              izləyin.
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => navigator.clipboard?.writeText(submittedCode)}
                className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700"
              >
                Tracking code-u kopyala
              </button>
              <Link
                href="/b2b-panel/ilanlarim"
                className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white"
              >
                Elanlarıma bax
              </Link>
            </div>
          </div>
        ) : null}

        {step < 6 ? (
          <div className="mt-8 flex items-center justify-between">
            <button
              type="button"
              onClick={step === 1 ? undefined : handleBack}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-40"
              disabled={step === 1}
            >
              <ArrowLeft className="h-4 w-4" />
              Geri
            </button>

            {step < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white"
              >
                Növbəti
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white"
              >
                Elanı göndər
                <ImagePlus className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
