'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Pencil,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import {
  CITY_OPTIONS,
  DISTRICT_OPTIONS,
  LISTING_CATEGORIES,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import { getFieldsForType, type FieldConfig, type EquipmentItem } from '@/lib/data/listingFieldConfig';
import { getAllSectors } from '@/lib/data/listingSectors';
import { compressImage, generateThumbnail, validateImage } from '@/lib/utils/imageUtils';

type FormStep = 1 | 2 | 3 | 4 | 5;

const STEP_KEYS = ['category', 'info', 'details', 'photos', 'submit'] as const;

/** Map AZ option values (stored in DB) to i18n keys for display */
const OPTION_I18N_MAP: Record<string, string> = {
  'İcarə (kirayə)': 'fieldOptions.propertyRent',
  'Mülkiyyət (satış)': 'fieldOptions.propertyOwn',
  'İcarə + satınalma opsiyonu': 'fieldOptions.propertyRentBuy',
  'Yeni': 'fieldOptions.conditionNew',
  'İstifadə olunmuş - əla': 'fieldOptions.conditionExcellent',
  'İstifadə olunmuş - yaxşı': 'fieldOptions.conditionGood',
  'Təmirə ehtiyacı var': 'fieldOptions.conditionRepair',
};

interface SessionLike {
  email?: string;
  name?: string;
}

interface UploadedImageItem {
  id: string;
  file: File;
  original?: File;
  compressed?: File;
  preview: string;
  thumbnail: string;
  sizeReduction: string;
  reduction?: string;
}

interface FormState {
  type: ListingCategory | '';
  sector: string;
  title: string;
  description: string;
  price: string;
  currency: 'AZN';
  city: string;
  district: string;
  ownerName: string;
  phone: string;
  email: string;
  typeSpecificData: Record<string, string | number | boolean>;
}

const INITIAL_FORM = (session?: SessionLike): FormState => ({
  type: '',
  sector: '',
  title: '',
  description: '',
  price: '',
  currency: 'AZN',
  city: 'Bakı',
  district: '',
  ownerName: session?.name ?? '',
  phone: '',
  email: session?.email ?? '',
  typeSpecificData: {},
});

function normalizePhone(value: string) {
  const cleaned = value.replace(/[^\d+]/g, '');
  if (!cleaned) return '';
  if (cleaned.startsWith('+994')) return cleaned;
  if (cleaned.startsWith('994')) return `+${cleaned}`;
  return cleaned.startsWith('+') ? cleaned : `+994${cleaned}`;
}

export default function CreateListingForm({ session }: { session?: SessionLike }) {
  const t = useTranslations('createListing');
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';

  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormState>(() => INITIAL_FORM(session));
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');

  const selectedCategory = useMemo(
    () => LISTING_CATEGORIES.find((item) => item.id === formData.type),
    [formData.type],
  );
  const dynamicFields = useMemo(
    () => (formData.type ? getFieldsForType(formData.type) : []),
    [formData.type],
  );
  const currentDistricts = useMemo(
    () => DISTRICT_OPTIONS.filter((item) => item.city === formData.city),
    [formData.city],
  );

  /** Resolve field label: use i18n key if available, fallback to field.label */
  const fieldLabel = (field: FieldConfig) => {
    try { return t(`fields.${field.key}`); } catch { return field.label; }
  };

  /** Resolve select option display: use i18n mapping if available */
  const optionLabel = (option: string) => {
    const key = OPTION_I18N_MAP[option];
    if (!key) return option;
    try { return t(key); } catch { return option; }
  };

  /** Category label from i18n */
  const catLabel = (id: string) => {
    try { return t(`categories.${id}.label`); } catch { return id; }
  };

  /** Category description from i18n */
  const catDesc = (id: string) => {
    try { return t(`categories.${id}.description`); } catch { return ''; }
  };

  const formatPreviewValue = (field: FieldConfig, value: string | number | boolean | undefined) => {
    if (value === undefined || value === null || value === '') {
      return <span className="italic text-slate-400">—</span>;
    }
    if (field.type === 'boolean') {
      return value ? `✅ ${t('yes')}` : `❌ ${t('no')}`;
    }
    return field.suffix ? `${value} ${field.suffix}` : String(value);
  };

  const pushToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 3200);
  };

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key as string];
      return next;
    });
  };

  const setDynamicField = (key: string, value: string | number | boolean) => {
    setFormData((prev) => ({
      ...prev,
      typeSpecificData: {
        ...prev.typeSpecificData,
        [key]: value,
      },
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`dynamic:${key}`];
      return next;
    });
  };

  const validateStep = (currentStep: FormStep) => {
    const nextErrors: Record<string, string> = {};

    if (currentStep === 1 && !formData.type) {
      nextErrors.type = t('errors.categoryRequired');
    }

    if (currentStep === 2) {
      if (!formData.title.trim()) nextErrors.title = t('errors.titleRequired');
      if (!formData.sector) nextErrors.sector = t('errors.sectorRequired');
      if (!formData.description.trim()) {
        nextErrors.description = t('errors.descriptionRequired');
      } else if (formData.description.trim().length < 50) {
        nextErrors.description = t('errors.descriptionMinLength');
      }
      if (!formData.price || Number(formData.price) < 1) nextErrors.price = t('errors.priceMin');
      if (!formData.city) nextErrors.city = t('errors.cityRequired');
      if (!formData.ownerName.trim()) nextErrors.ownerName = t('errors.nameRequired');
      if (!formData.phone.trim()) {
        nextErrors.phone = t('errors.phoneRequired');
      } else if (!/^\+994\d{9}$/.test(normalizePhone(formData.phone))) {
        nextErrors.phone = t('errors.phoneFormat');
      }
      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        nextErrors.email = t('errors.emailFormat');
      }
    }

    if (currentStep === 3) {
      for (const field of dynamicFields) {
        const value = formData.typeSpecificData[field.key];
        if (field.required && (value === undefined || value === null || value === '')) {
          nextErrors[`dynamic:${field.key}`] = t('errors.fieldRequired', { label: fieldLabel(field) });
        }
      }
    }

    if (currentStep === 4 && images.length < 1) {
      nextErrors.images = t('errors.minPhotos');
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleContinue = () => {
    if (!validateStep(step)) return;
    setStep((prev) => Math.min(5, prev + 1) as FormStep);
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1) as FormStep);

  const handleImages = async (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      pushToast(t('toast.maxPhotos'));
      return;
    }

    for (const file of files) {
      const validation = validateImage(file);
      if (!validation.valid) {
        pushToast(validation.error || t('toast.invalidImage'));
        continue;
      }

      const compressed = await compressImage(file);
      const thumbnail = await generateThumbnail(compressed.file);
      const item: UploadedImageItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        file: compressed.file,
        original: file,
        compressed: compressed.file,
        preview: compressed.preview,
        thumbnail,
        sizeReduction: compressed.sizeReduction,
        reduction: compressed.reduction,
      };

      setImages((prev) => [...prev, item]);
      pushToast(`${file.name}: ${compressed.sizeReduction} ✓`);
    }

    event.target.value = '';
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      const removed = prev[index];
      if (removed?.preview.startsWith('blob:')) URL.revokeObjectURL(removed.preview);
      const next = prev.filter((_, idx) => idx !== index);
      if (coverIndex >= next.length) setCoverIndex(Math.max(0, next.length - 1));
      return next;
    });
  };

  const moveImage = (from: number, to: number) => {
    if (to < 0 || to >= images.length) return;
    setImages((prev) => {
      const clone = [...prev];
      const [item] = clone.splice(from, 1);
      clone.splice(to, 0, item);
      return clone;
    });
    if (coverIndex === from) setCoverIndex(to);
  };

  const uploadImagesIfPossible = async (trackingCode: string) => {
    const hasPublicCloud = Boolean(process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME);
    if (!hasPublicCloud) {
      return [];
    }

    const uploaded = [];
    for (const image of images) {
      const body = new FormData();
      body.append('file', image.file);
      body.append('listingId', trackingCode);

      const response = await fetch('/api/upload', { method: 'POST', body });
      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        pushToast(payload.error || t('toast.uploadFailed'));
        return [];
      }

      uploaded.push(await response.json());
    }

    return uploaded;
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const trackingCode = `DK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    try {
      const uploadedImages = await uploadImagesIfPossible(trackingCode);
      const payload = {
        ...formData,
        trackingCode,
        equipment: equipment.filter(e => e.name.trim()),
        images:
          uploadedImages.length > 0
            ? uploadedImages.map((image: { url: string }) => ({ url: image.url }))
            : images.map((image) => ({ url: image.preview })),
      };
      const response = await fetch('/api/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        pushToast(t('toast.submitError'));
        return;
      }
      setSubmittedCode(trackingCode);
      pushToast(t('toast.submitSuccess'));
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    images.forEach((image) => {
      if (image.preview.startsWith('blob:')) URL.revokeObjectURL(image.preview);
    });
    setFormData(INITIAL_FORM(session));
    setImages([]);
    setCoverIndex(0);
    setErrors({});
    setStep(1);
    setSubmittedCode('');
  };

  if (submittedCode) {
    return (
      <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <div className="mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className="mt-5 font-display text-4xl font-black text-[var(--dk-navy)]">
            {t('successTitle')}
          </h1>
          <div className="mt-5 inline-flex items-center gap-3 rounded-full bg-slate-50 px-5 py-3 text-lg font-black text-[var(--dk-navy)]">
            {submittedCode}
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(submittedCode)}
              className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-slate-500">
            {t('successDesc')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/b2b-panel/ilanlarim"
              className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
            >
              {t('viewListings')}
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700"
            >
              {t('newListing')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 md:grid-cols-5">
          {STEP_KEYS.map((key, index) => {
            const stepNumber = (index + 1) as FormStep;
            const isDone = step > stepNumber;
            const isActive = step === stepNumber;

            return (
              <div key={key} className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-black ${
                    isDone
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-600'
                      : isActive
                        ? 'border-amber-300 bg-amber-50 text-[var(--dk-gold)]'
                        : 'border-slate-200 bg-slate-50 text-slate-400'
                  }`}
                >
                  {isDone ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <div className={isActive ? 'text-[var(--dk-navy)]' : 'text-slate-500'}>
                  <div className="text-xs font-black uppercase tracking-[0.18em]">{t('stepLabel', { number: stepNumber })}</div>
                  <div className="text-sm font-semibold">{t(`steps.${key}`)}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {toast ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      ) : null}

      {step === 1 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">{t('selectCategory')}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {t('selectCategoryDesc')}
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {LISTING_CATEGORIES.map((item) => {
              const selected = formData.type === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setField('type', item.id)}
                  className={`rounded-[28px] border bg-white p-5 text-left transition ${
                    selected
                      ? 'border-[var(--dk-gold)] shadow-lg shadow-amber-100'
                      : 'border-slate-200 hover:border-[var(--dk-gold)] hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`inline-flex rounded-2xl px-3 py-2 text-xs font-bold ${item.badgeClass}`}>
                      {catLabel(item.id)}
                    </span>
                    {selected ? (
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]">{catLabel(item.id)}</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">{catDesc(item.id)}</p>
                </button>
              );
            })}
          </div>
          {errors.type ? <p className="mt-4 text-sm font-semibold text-[var(--dk-red)]">{errors.type}</p> : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('titleLabel')} *</label>
              <input
                value={formData.title}
                onChange={(event) => setField('title', event.target.value)}
                placeholder={t('titlePlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              {errors.title ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.title}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('priceLabel')} *</label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white">
                <input
                  type="number"
                  min={1}
                  value={formData.price}
                  onChange={(event) => setField('price', event.target.value)}
                  className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm text-slate-900 outline-none"
                />
                <span className="px-4 text-sm font-bold text-slate-500">AZN</span>
              </div>
              {errors.price ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.price}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('descriptionLabel')} *</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(event) => setField('description', event.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                {errors.description ? (
                  <span className="font-semibold text-[var(--dk-red)]">{errors.description}</span>
                ) : (
                  <span className="text-slate-400">{t('minChars', { count: 50 })}</span>
                )}
                <span className="font-semibold text-slate-500">{t('charCount', { count: formData.description.length })}</span>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('cityLabel')} *</label>
              <select
                value={formData.city}
                onChange={(event) => setField('city', event.target.value)}
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
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('sectorLabel')} *</label>
              <select
                value={formData.sector}
                onChange={(event) => setField('sector', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              >
                <option value="">{t('selectPlaceholder')}</option>
                {getAllSectors(locale).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.sector ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.sector}</p> : null}
            </div>

            {formData.city === 'Bakı' ? (
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">{t('districtLabel')}</label>
                <select
                  value={formData.district}
                  onChange={(event) => setField('district', event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                >
                  <option value="">{t('selectPlaceholder')}</option>
                  {currentDistricts.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}

            <div className="md:col-span-2 pt-4">
              <div className="border-t border-slate-200 pt-5">
                <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{t('contactInfo')}</div>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('nameLabel')} *</label>
              <input
                value={formData.ownerName}
                onChange={(event) => setField('ownerName', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              {errors.ownerName ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.ownerName}</p> : null}
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('phoneLabel')} *</label>
              <input
                value={formData.phone}
                onChange={(event) => setField('phone', normalizePhone(event.target.value))}
                placeholder="+994 XX XXX XX XX"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              {errors.phone ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.phone}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-bold text-slate-700">{t('emailLabel')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setField('email', event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
              />
              {errors.email ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.email}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedCategory?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
              {t('selectedCategory', { name: selectedCategory ? catLabel(selectedCategory.id) : '' })}
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            {dynamicFields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  {fieldLabel(field)}
                  {field.required ? ' *' : ''}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={String(formData.typeSpecificData[field.key] ?? '')}
                    onChange={(event) => setDynamicField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                  />
                ) : field.type === 'boolean' ? (
                  <label className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={Boolean(formData.typeSpecificData[field.key])}
                      onChange={(event) => setDynamicField(field.key, event.target.checked)}
                      className="h-4 w-4 rounded border-slate-300 text-[var(--dk-red)]"
                    />
                    {fieldLabel(field)}
                  </label>
                ) : field.type === 'equipment-list' ? (
                  <div className="space-y-3 md:col-span-2">
                    {equipment.map((eq, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <input type="text" value={eq.name} placeholder={t('equipmentName')}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, name: e.target.value } : item))}
                          className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--dk-gold)]" />
                        <select value={eq.condition}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, condition: e.target.value as 'new' | 'used' } : item))}
                          className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none">
                          <option value="used">{t('equipmentUsed')}</option>
                          <option value="new">{t('equipmentNew')}</option>
                        </select>
                        <input type="number" min="1" value={eq.count ?? ''} placeholder={t('equipmentCount')}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, count: Number(e.target.value) || undefined } : item))}
                          className="w-20 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-[var(--dk-gold)]" />
                        <button type="button" onClick={() => setEquipment(prev => prev.filter((_, i) => i !== idx))}
                          className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button type="button"
                      onClick={() => setEquipment(prev => [...prev, { name: '', condition: 'used' }])}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--dk-gold)] hover:text-amber-600">
                      {t('addEquipment')}
                    </button>
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    value={String(formData.typeSpecificData[field.key] ?? '')}
                    onChange={(event) => setDynamicField(field.key, event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none focus:border-[var(--dk-gold)]"
                  >
                    <option value="">{t('selectPlaceholder')}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {optionLabel(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="flex items-center rounded-2xl border border-slate-200 bg-white">
                    <input
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={String(formData.typeSpecificData[field.key] ?? '')}
                      onChange={(event) =>
                        setDynamicField(
                          field.key,
                          field.type === 'number' ? Number(event.target.value) || '' : event.target.value,
                        )
                      }
                      placeholder={field.placeholder}
                      className="w-full rounded-2xl bg-transparent px-4 py-3 text-sm text-slate-900 outline-none"
                    />
                    {field.suffix ? <span className="px-4 text-sm font-bold text-slate-500">{field.suffix}</span> : null}
                  </div>
                )}
                {errors[`dynamic:${field.key}`] ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors[`dynamic:${field.key}`]}</p> : null}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">{t('photosTitle')}</h2>
          <p className="mt-2 text-sm leading-7 text-slate-500">
            {t('photosDesc')}
          </p>

          <label className="mt-6 flex cursor-pointer items-center justify-center gap-3 rounded-[28px] border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-sm font-semibold text-slate-600">
            <UploadCloud className="h-5 w-5 text-[var(--dk-gold)]" />
            {t('addPhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImages} />
          </label>

          <div className="mt-4 text-sm font-semibold text-slate-500">{t('photoCount', { count: images.length })}</div>
          {errors.images ? <p className="mt-2 text-sm font-semibold text-[var(--dk-red)]">{errors.images}</p> : null}

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {images.map((image, index) => (
              <div key={image.id} className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
                <div className="relative overflow-hidden rounded-2xl bg-slate-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt={image.file.name} className="aspect-[4/3] w-full object-cover" />
                </div>
                <div className="mt-3 text-sm font-semibold text-slate-700">{image.file.name}</div>
                <div className="mt-1 text-xs font-semibold text-emerald-600">{image.sizeReduction}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {coverIndex === index ? (
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-[var(--dk-gold)]">{t('coverPhoto')}</span>
                  ) : (
                    <button type="button" onClick={() => setCoverIndex(index)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600">
                      {t('setCover')}
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(index)} className="rounded-full border border-rose-200 px-3 py-1 text-xs font-bold text-[var(--dk-red)]">
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                    {t('delete')}
                  </button>
                </div>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={index === 0} onClick={() => moveImage(index, index - 1)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">
                    {t('moveUp')}
                  </button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, index + 1)} className="rounded-full border border-slate-200 px-3 py-1 text-xs font-bold text-slate-600 disabled:opacity-40">
                    {t('moveDown')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">{t('previewTitle')}</h2>
              <p className="mt-2 text-sm text-slate-500">{t('previewDesc')}</p>
            </div>
          </div>

          <div className="mt-6 overflow-hidden rounded-[28px] border border-slate-200 bg-white">
            {images[coverIndex] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[coverIndex].preview} alt={t('coverPhoto')} className="aspect-[16/8] w-full object-cover" />
              </>
            ) : null}
            <div className="p-6">
              <div className="mb-4 flex items-center justify-between gap-4">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedCategory?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {selectedCategory ? catLabel(selectedCategory.id) : t('categoryFallback')}
                </span>
                <button type="button" onClick={() => setStep(1)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]">
                  <Pencil className="h-4 w-4" />
                  {t('edit')}
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h3 className="font-display text-3xl font-black text-[var(--dk-navy)]">{formData.title}</h3>
                  <div className="mt-3 text-2xl font-black text-[var(--dk-gold)]">
                    {Number(formData.price || 0).toLocaleString('az-AZ')} {formData.currency}
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {formData.city}{formData.district ? `, ${formData.district}` : ''}
                    {formData.sector ? ` · ${getAllSectors(locale).find(s => s.value === formData.sector)?.label ?? formData.sector}` : ''}
                  </p>
                  <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">{formData.description}</div>
                  <button type="button" onClick={() => setStep(2)} className="mt-3 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]">
                    <Pencil className="h-4 w-4" />
                    {t('editMainInfo')}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{t('typeDetails')}</div>
                      <button type="button" onClick={() => setStep(3)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]">
                        <Pencil className="h-4 w-4" />
                        {t('edit')}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {dynamicFields.map((field) => (
                        <div key={field.key} className="rounded-2xl bg-white p-4 text-sm">
                          <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">{fieldLabel(field)}</div>
                          <div className="mt-2 font-semibold text-slate-700">{formatPreviewValue(field, formData.typeSpecificData[field.key])}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{t('photosTitle')}</div>
                      <button type="button" onClick={() => setStep(4)} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[var(--dk-red)]">
                        <Pencil className="h-4 w-4" />
                        {t('edit')}
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {images.map((image, index) => (
                        <div key={image.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.thumbnail} alt={image.file.name} className="aspect-square w-full object-cover" />
                          {coverIndex === index ? <div className="px-2 py-1 text-center text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--dk-gold)]">{t('vitrin')}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="text-sm font-black uppercase tracking-[0.18em] text-slate-400">{t('contact')}</div>
                    <div className="mt-3 space-y-2 text-sm text-slate-600">
                      <div><strong>{t('nameField')}:</strong> {formData.ownerName}</div>
                      <div><strong>{t('phoneField')}:</strong> {formData.phone}</div>
                      <div><strong>{t('emailField')}:</strong> {formData.email || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              <button type="button" onClick={handleSubmit} disabled={submitting} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dk-red)] px-6 py-4 text-sm font-bold text-white disabled:opacity-60">
                {submitting ? t('submitting') : t('submitButton')}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!submittedCode ? (
        <div className="flex items-center justify-between gap-4">
          <button type="button" onClick={handleBack} disabled={step === 1} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-40">
            {t('back')}
          </button>
          {step < 5 ? (
            <button type="button" onClick={handleContinue} className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white">
              {t('continue')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
