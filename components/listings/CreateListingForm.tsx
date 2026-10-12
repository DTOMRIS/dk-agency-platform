'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import {
  AlertCircle,
  ArrowRight,
  Check,
  CheckCircle2,
  Copy,
  Eye,
  Film,
  Pencil,
  Star,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react';
import {
  CITY_OPTIONS,
  DISTRICT_OPTIONS,
  LISTING_CATEGORIES,
  type ListingCategory,
} from '@/lib/data/listingCategories';
import {
  getFieldsForType,
  getLocationFieldsForSector,
  getWarningsForConcepts,
  type FieldConfig,
  type EquipmentItem,
} from '@/lib/data/listingFieldConfig';
import { getConceptsForSector, getConceptLabel, type ConceptKey } from '@/lib/data/listingConcepts';
import { getAllSectors } from '@/lib/data/listingSectors';
import { compressImage, generateThumbnail, validateImage } from '@/lib/utils/imageUtils';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { CREATE_LISTING_TONES, type CreateListingTone } from '@/components/listings/create-listing-tones';

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

const LOCATION_OPTION_I18N_MAP: Record<string, string> = {
  Tam: 'fieldOptions.full',
  'Qismən': 'fieldOptions.partial',
  Yoxdur: 'fieldOptions.none',
  AVM: 'fieldOptions.mall',
  'Küçə': 'fieldOptions.street',
  'Qarışıq': 'fieldOptions.mixed',
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

/** Valid YouTube/Instagram embed URL pattern */
function parseVideoUrl(url: string): { type: 'youtube' | 'instagram'; embedUrl: string } | null {
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]{11})/);
  if (ytMatch) return { type: 'youtube', embedUrl: `https://www.youtube.com/embed/${ytMatch[1]}` };
  const igMatch = url.match(/instagram\.com\/(?:p|reel)\/([\w-]+)/);
  if (igMatch) return { type: 'instagram', embedUrl: `https://www.instagram.com/p/${igMatch[1]}/embed` };
  return null;
}

interface AdminOptions {
  initialStatus: string;
  isFeatured: boolean;
  isShowcase: boolean;
  adminNote: string;
  videoUrl: string;
}

export default function CreateListingForm({
  session,
  isAdmin = false,
  tone = 'panel',
}: {
  session?: SessionLike;
  isAdmin?: boolean;
  /** `v2` on the public /ilan-ver; the member/admin panels keep `panel` (their current look). */
  tone?: CreateListingTone;
}) {
  const t = useTranslations('createListing');
  const c = CREATE_LISTING_TONES[tone];
  const locale = useLocale() as 'az' | 'en' | 'ru' | 'tr';

  const [step, setStep] = useState<FormStep>(1);
  const [formData, setFormData] = useState<FormState>(() => INITIAL_FORM(session));
  const [images, setImages] = useState<UploadedImageItem[]>([]);
  const [coverIndex, setCoverIndex] = useState(0);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [selectedConcepts, setSelectedConcepts] = useState<ConceptKey[]>([]);
  const [locationData, setLocationData] = useState<Record<string, string | number | boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedCode, setSubmittedCode] = useState('');
  const [selectedForDelete, setSelectedForDelete] = useState<Set<string>>(new Set());
  const [adminOpts, setAdminOpts] = useState<AdminOptions>({
    initialStatus: 'showcase_ready',
    isFeatured: false,
    isShowcase: true,
    adminNote: '',
    videoUrl: '',
  });

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
  const availableConcepts = useMemo(
    () => getConceptsForSector(formData.sector),
    [formData.sector],
  );
  const locationFields = useMemo(
    () => getLocationFieldsForSector(formData.sector),
    [formData.sector],
  );
  const conceptWarnings = useMemo(
    () => getWarningsForConcepts(selectedConcepts, locationData, locale),
    [selectedConcepts, locationData, locale],
  );

  /** Resolve field label: use i18n key if available, fallback to field.label */
  const fieldLabel = (field: FieldConfig) => {
    try { return t(`fields.${field.key}`); } catch { return field.label; }
  };

  /** Resolve select option display: use i18n mapping if available */
  const optionLabel = (option: string) => {
    const key = OPTION_I18N_MAP[option] ?? LOCATION_OPTION_I18N_MAP[option];
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
      return <span className={c.emptyValue}>—</span>;
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
    if (key === 'sector') {
      setSelectedConcepts([]);
      setLocationData({});
    }
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

  const toggleConcept = (key: ConceptKey) => {
    setSelectedConcepts((prev) => {
      if (prev.includes(key)) return prev.filter((item) => item !== key);
      if (prev.length >= 3) return prev;
      return [...prev, key];
    });
  };

  const setLocationField = (key: string, value: string | number | boolean) => {
    setLocationData((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[`location:${key}`];
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
      for (const field of locationFields) {
        const value = locationData[field.key];
        if (field.required && (value === undefined || value === null || value === '')) {
          nextErrors[`location:${field.key}`] = t('errors.fieldRequired', { label: fieldLabel(field) });
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

  const toggleDeleteSelection = (id: string) => {
    setSelectedForDelete((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDeleteImages = () => {
    if (selectedForDelete.size === 0) return;
    setImages((prev) => {
      const kept = prev.filter((img) => !selectedForDelete.has(img.id));
      prev.filter((img) => selectedForDelete.has(img.id)).forEach((img) => {
        if (img.preview.startsWith('blob:')) URL.revokeObjectURL(img.preview);
      });
      if (coverIndex >= kept.length) setCoverIndex(Math.max(0, kept.length - 1));
      return kept;
    });
    setSelectedForDelete(new Set());
    pushToast(t('photosDeleted', { count: selectedForDelete.size }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const trackingCode = `DK-${new Date().getFullYear()}-${String(Math.floor(1000 + Math.random() * 9000))}`;

    try {
      const uploadedImages = await uploadImagesIfPossible(trackingCode);
      const conceptPayload = selectedConcepts.length > 0 ? selectedConcepts : undefined;
      const locationPayload = Object.keys(locationData).length > 0 ? locationData : undefined;
      const videoEmbed = adminOpts.videoUrl ? parseVideoUrl(adminOpts.videoUrl) : null;
      const payload: Record<string, unknown> = {
        ...formData,
        trackingCode,
        equipment: equipment.filter(e => e.name.trim()),
        concepts: conceptPayload,
        locationDetails: locationPayload,
        typeSpecificData: {
          ...formData.typeSpecificData,
          ...(conceptPayload ? { concepts: conceptPayload } : {}),
          ...(locationPayload ? { locationDetails: locationPayload } : {}),
          ...(videoEmbed ? { videoUrl: adminOpts.videoUrl, videoEmbed: videoEmbed.embedUrl, videoType: videoEmbed.type } : {}),
        },
        images:
          uploadedImages.length > 0
            ? uploadedImages.map((image: { url: string }) => ({ url: image.url }))
            : images.map((image) => ({ url: image.preview })),
      };
      if (isAdmin) {
        payload.initialStatus = adminOpts.initialStatus;
        payload.isFeatured = adminOpts.isFeatured;
        payload.isShowcase = adminOpts.isShowcase;
        if (adminOpts.adminNote.trim()) {
          payload.adminNote = adminOpts.adminNote.trim();
        }
      }
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
    setSelectedConcepts([]);
    setLocationData({});
    setStep(1);
    setSubmittedCode('');
  };

  if (submittedCode) {
    return (
      <div className={c.successCard}>
        <div className="text-center">
          <div className={c.successIcon}>
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h1 className={c.successTitle}>
            {t('successTitle')}
          </h1>
          <div className={c.codePill}>
            {submittedCode}
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(submittedCode)}
              aria-label={t('copyCode')}
              className={c.copyButton}
            >
              <Copy className="h-4 w-4" />
            </button>
          </div>
          <p className={c.body}>
            {t('successDesc')}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href={isAdmin ? '/dashboard/ilanlar' : '/b2b-panel/ilanlarim'}
              className={c.primaryPill}
            >
              {isAdmin ? t('admin.manageLink') : t('viewListings')}
            </Link>
            <button
              type="button"
              onClick={resetForm}
              className={c.ghostPill}
            >
              {t('newListing')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={c.stack}>
      <div className={c.stepCard}>
        <div className={c.stepList}>
          {STEP_KEYS.map((key, index) => {
            const stepNumber = (index + 1) as FormStep;
            const isDone = step > stepNumber;
            const isActive = step === stepNumber;

            return (
              <div key={key} className={c.stepItem} aria-current={isActive ? 'step' : undefined}>
                <div className={`${c.stepDot} ${isDone ? c.stepDone : isActive ? c.stepActive : c.stepIdle}`}>
                  {isDone ? <Check className="h-5 w-5" /> : stepNumber}
                </div>
                <div className={isActive ? c.stepTextActive : c.stepTextIdle}>
                  <div className={c.stepKicker}>{t('stepLabel', { number: stepNumber })}</div>
                  <div className={c.stepName}>{t(`steps.${key}`)}</div>
                </div>
              </div>
            );
          })}
        </div>
        {tone === 'v2' ? (
          // Mobile: the step names are hidden in the dots row, so the current one is named here, with a progress bar.
          <div className="mt-3 md:hidden">
            <div className="flex items-baseline justify-between gap-3 text-sm">
              <span className="min-w-0 truncate font-bold text-[#0F172A]">{t(`steps.${STEP_KEYS[step - 1]}`)}</span>
              <span className="shrink-0 text-xs font-bold tabular-nums text-[#5B6474]">{t('stepOf', { number: step, total: STEP_KEYS.length })}</span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#EFE9DE]">
              <div className="h-full rounded-full bg-dk-red-strong transition-all" style={{ width: `${(step / STEP_KEYS.length) * 100}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      {toast ? (
        <div className={c.toast}>
          {toast}
        </div>
      ) : null}

      {step === 1 ? (
        <div className={c.card}>
          <h2 className={c.h2}>{t('selectCategory')}</h2>
          <p className={c.lead}>
            {t('selectCategoryDesc')}
          </p>
          <div className={c.catGrid}>
            {LISTING_CATEGORIES.map((item) => {
              const selected = formData.type === item.id;
              return (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => setField('type', item.id)}
                  aria-pressed={selected}
                  className={`${c.catCard} ${selected ? c.catSelected : c.catIdle}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className={`${c.catBadge} ${item.badgeClass}`}>
                      {catLabel(item.id)}
                    </span>
                    {selected ? (
                      <span className={c.catCheck}>
                        <Check className="h-4 w-4" />
                      </span>
                    ) : null}
                  </div>
                  <h3 className={c.catTitle}>{catLabel(item.id)}</h3>
                  <p className={c.catDesc}>{catDesc(item.id)}</p>
                </button>
              );
            })}
          </div>
          {errors.type ? <p className={c.errorLg}>{errors.type}</p> : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className={c.card}>
          <div className={c.fieldGrid}>
            <div>
              <label className={c.label}>{t('titleLabel')} *</label>
              <input
                value={formData.title}
                onChange={(event) => setField('title', event.target.value)}
                placeholder={t('titlePlaceholder')}
                className={c.input}
              />
              {errors.title ? <p className={c.error}>{errors.title}</p> : null}
            </div>

            <div>
              <label className={c.label}>{t('priceLabel')} *</label>
              <div className={c.affixWrap}>
                <input
                  type="number"
                  min={1}
                  value={formData.price}
                  onChange={(event) => setField('price', event.target.value)}
                  className={c.affixInput}
                />
                <span className={c.suffix}>AZN</span>
              </div>
              {errors.price ? <p className={c.error}>{errors.price}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className={c.label}>{t('descriptionLabel')} *</label>
              <textarea
                rows={5}
                value={formData.description}
                onChange={(event) => setField('description', event.target.value)}
                placeholder={t('descriptionPlaceholder')}
                className={c.textarea}
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                {errors.description ? (
                  <span className={c.errorInline}>{errors.description}</span>
                ) : (
                  <span className={c.hint}>{t('minChars', { count: 50 })}</span>
                )}
                <span className={c.counter}>{t('charCount', { count: formData.description.length })}</span>
              </div>
            </div>

            <div>
              <label className={c.label}>{t('cityLabel')} *</label>
              <select
                value={formData.city}
                onChange={(event) => setField('city', event.target.value)}
                className={c.input}
              >
                {CITY_OPTIONS.filter((item) => item.value !== 'all').map((item) => (
                  <option key={item.value} value={item.label}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className={c.label}>{t('sectorLabel')} *</label>
              <select
                value={formData.sector}
                onChange={(event) => setField('sector', event.target.value)}
                className={c.input}
              >
                <option value="">{t('selectPlaceholder')}</option>
                {getAllSectors(locale).map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
              {errors.sector ? <p className={c.error}>{errors.sector}</p> : null}
            </div>

            {formData.city === 'Bakı' ? (
              <div>
                <label className={c.label}>{t('districtLabel')}</label>
                <select
                  value={formData.district}
                  onChange={(event) => setField('district', event.target.value)}
                  className={c.input}
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
              <div className={c.sectionRule}>
                <div className={c.sectionLabel}>{t('contactInfo')}</div>
              </div>
            </div>

            <div>
              <label className={c.label}>{t('nameLabel')} *</label>
              <input
                value={formData.ownerName}
                onChange={(event) => setField('ownerName', event.target.value)}
                className={c.input}
              />
              {errors.ownerName ? <p className={c.error}>{errors.ownerName}</p> : null}
            </div>

            <div>
              <label className={c.label}>{t('phoneLabel')} *</label>
              <input
                value={formData.phone}
                onChange={(event) => setField('phone', normalizePhone(event.target.value))}
                placeholder="+994 XX XXX XX XX"
                className={c.input}
              />
              {errors.phone ? <p className={c.error}>{errors.phone}</p> : null}
            </div>

            <div className="md:col-span-2">
              <label className={c.label}>{t('emailLabel')}</label>
              <input
                type="email"
                value={formData.email}
                onChange={(event) => setField('email', event.target.value)}
                className={c.input}
              />
              {errors.email ? <p className={c.error}>{errors.email}</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className={c.card}>
          <div className="mb-5 flex items-center gap-3">
            <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedCategory?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
              {t('selectedCategory', { name: selectedCategory ? catLabel(selectedCategory.id) : '' })}
            </span>
          </div>
          <div className={c.fieldGrid}>
            {dynamicFields.map((field) => (
              <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                <label className={c.label}>
                  {fieldLabel(field)}
                  {field.required ? ' *' : ''}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={4}
                    value={String(formData.typeSpecificData[field.key] ?? '')}
                    onChange={(event) => setDynamicField(field.key, event.target.value)}
                    placeholder={field.placeholder}
                    className={c.textarea}
                  />
                ) : field.type === 'boolean' ? (
                  <label className={c.checkRow}>
                    <input
                      type="checkbox"
                      checked={Boolean(formData.typeSpecificData[field.key])}
                      onChange={(event) => setDynamicField(field.key, event.target.checked)}
                      className={c.checkbox}
                    />
                    {fieldLabel(field)}
                  </label>
                ) : field.type === 'equipment-list' ? (
                  <div className="space-y-3 md:col-span-2">
                    {equipment.map((eq, idx) => (
                      <div key={idx} className={c.eqRow}>
                        <input type="text" value={eq.name} placeholder={t('equipmentName')}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, name: e.target.value } : item))}
                          className={c.eqName} />
                        <select value={eq.condition}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, condition: e.target.value as 'new' | 'used' } : item))}
                          className={c.eqSelect}>
                          <option value="used">{t('equipmentUsed')}</option>
                          <option value="new">{t('equipmentNew')}</option>
                        </select>
                        <input type="number" min="1" value={eq.count ?? ''} placeholder={t('equipmentCount')}
                          onChange={(e) => setEquipment(prev => prev.map((item, i) => i === idx ? { ...item, count: Number(e.target.value) || undefined } : item))}
                          className={c.eqCount} />
                        <button type="button" onClick={() => setEquipment(prev => prev.filter((_, i) => i !== idx))}
                          aria-label={t('delete')}
                          className={c.eqRemove}><Trash2 size={16} /></button>
                      </div>
                    ))}
                    <button type="button"
                      onClick={() => setEquipment(prev => [...prev, { name: '', condition: 'used' }])}
                      className={c.addLink}>
                      {t('addEquipment')}
                    </button>
                  </div>
                ) : field.type === 'select' ? (
                  <select
                    value={String(formData.typeSpecificData[field.key] ?? '')}
                    onChange={(event) => setDynamicField(field.key, event.target.value)}
                    className={c.input}
                  >
                    <option value="">{t('selectPlaceholder')}</option>
                    {field.options?.map((option) => (
                      <option key={option} value={option}>
                        {optionLabel(option)}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className={c.affixWrap}>
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
                      className={c.affixInput}
                    />
                    {field.suffix ? <span className={c.suffix}>{field.suffix}</span> : null}
                  </div>
                )}
                {errors[`dynamic:${field.key}`] ? <p className={c.error}>{errors[`dynamic:${field.key}`]}</p> : null}
              </div>
            ))}

            {availableConcepts.length > 0 ? (
              <div className={`md:col-span-2 ${c.sectionRule}`}>
                <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className={c.sectionLabel}>{t('conceptTitle')}</div>
                    <p className={c.sectionHelp}>{t('conceptHelp')}</p>
                  </div>
                  <span className={c.countChip}>
                    {t('conceptCount', { count: selectedConcepts.length })}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableConcepts.map((concept) => {
                    const selected = selectedConcepts.includes(concept);
                    const disabled = !selected && selectedConcepts.length >= 3;
                    return (
                      <button
                        key={concept}
                        type="button"
                        disabled={disabled}
                        onClick={() => toggleConcept(concept)}
                        aria-pressed={selected}
                        className={`${c.chip} ${selected ? c.chipOn : disabled ? c.chipDisabled : c.chipIdle}`}
                      >
                        {getConceptLabel(concept, locale)}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {locationFields.length > 0 ? (
              <div className={`md:col-span-2 ${c.sectionRule}`}>
                <div className="mb-4">
                  <div className={c.sectionLabel}>{t('locationDetailsTitle')}</div>
                  <p className={c.sectionHelp}>{t('locationDetailsHelp')}</p>
                </div>
                <div className={c.fieldGrid}>
                  {locationFields.map((field) => (
                    <div key={field.key}>
                      <label className={c.label}>
                        {fieldLabel(field)}
                        {field.required ? ' *' : ''}
                      </label>
                      {field.type === 'boolean' ? (
                        <label className={c.checkRow}>
                          <input
                            type="checkbox"
                            checked={Boolean(locationData[field.key])}
                            onChange={(event) => setLocationField(field.key, event.target.checked)}
                            className={c.checkbox}
                          />
                          {fieldLabel(field)}
                        </label>
                      ) : field.type === 'select' ? (
                        <select
                          value={String(locationData[field.key] ?? '')}
                          onChange={(event) => setLocationField(field.key, event.target.value)}
                          className={c.input}
                        >
                          <option value="">{t('selectPlaceholder')}</option>
                          {field.options?.map((option) => (
                            <option key={option} value={option}>
                              {optionLabel(option)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className={c.affixWrap}>
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            value={String(locationData[field.key] ?? '')}
                            onChange={(event) =>
                              setLocationField(
                                field.key,
                                field.type === 'number' ? Number(event.target.value) || '' : event.target.value,
                              )
                            }
                            placeholder={field.placeholder}
                            className={c.affixInput}
                          />
                          {field.suffix ? <span className={c.suffix}>{field.suffix}</span> : null}
                        </div>
                      )}
                      {errors[`location:${field.key}`] ? <p className={c.error}>{errors[`location:${field.key}`]}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}

            {conceptWarnings.length > 0 ? (
              <div className="md:col-span-2 space-y-2">
                {conceptWarnings.map((warning) => (
                  <div key={warning} className={c.warning}>
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                    {warning}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {step === 4 ? (
        <div className={c.card}>
          <h2 className={c.h2}>{t('photosTitle')}</h2>
          <p className={c.leadLoose}>
            {t('photosDesc')}
          </p>

          <label className={c.dropzone}>
            <UploadCloud className={c.dropIcon} />
            {t('addPhoto')}
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleImages} />
          </label>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <div className={c.photoCount}>{t('photoCount', { count: images.length })}</div>
            {selectedForDelete.size > 0 && (
              <button
                type="button"
                onClick={bulkDeleteImages}
                className={c.bulkDelete}
              >
                <Trash2 className="h-3.5 w-3.5" />
                {t('deleteSelected', { count: selectedForDelete.size })}
              </button>
            )}
          </div>
          {errors.images ? <p className={c.error}>{errors.images}</p> : null}

          <div className={c.imgGrid}>
            {images.map((image, index) => (
              <div key={image.id} className={`${c.imgCard} ${selectedForDelete.has(image.id) ? c.imgCardSelected : c.imgCardIdle}`}>
                <div className={c.imgFrame}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.preview} alt={image.file.name} className="aspect-[4/3] w-full object-cover" />
                  <label className="absolute left-3 top-3 flex h-6 w-6 cursor-pointer items-center justify-center rounded-lg bg-white/90 shadow">
                    <input
                      type="checkbox"
                      checked={selectedForDelete.has(image.id)}
                      onChange={() => toggleDeleteSelection(image.id)}
                      className="h-4 w-4 rounded border-slate-300 text-rose-500"
                    />
                  </label>
                </div>
                <div className={c.imgName}>{image.file.name}</div>
                <div className={c.imgSaving}>{image.sizeReduction}</div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {coverIndex === index ? (
                    <span className={c.coverBadge}>{t('coverPhoto')}</span>
                  ) : (
                    <button type="button" onClick={() => setCoverIndex(index)} className={c.miniButton}>
                      {t('setCover')}
                    </button>
                  )}
                  <button type="button" onClick={() => removeImage(index)} className={c.miniDanger}>
                    <Trash2 className="mr-1 inline h-3.5 w-3.5" />
                    {t('delete')}
                  </button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" disabled={index === 0} onClick={() => moveImage(index, index - 1)} className={`${c.miniButton} disabled:opacity-40`}>
                    {t('moveUp')}
                  </button>
                  <button type="button" disabled={index === images.length - 1} onClick={() => moveImage(index, index + 1)} className={`${c.miniButton} disabled:opacity-40`}>
                    {t('moveDown')}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Video embed — YouTube / Instagram link */}
          <div className={c.videoBlock}>
            <div className={c.videoLabel}>
              <Film className="h-4 w-4" />
              {t('video.label')}
            </div>
            <div className="mt-3 flex gap-3">
              <input
                type="url"
                value={adminOpts.videoUrl}
                onChange={(e) => setAdminOpts((prev) => ({ ...prev, videoUrl: e.target.value }))}
                placeholder={t('video.placeholder')}
                className={c.videoInput}
              />
              {adminOpts.videoUrl && (
                <button type="button" onClick={() => setAdminOpts((prev) => ({ ...prev, videoUrl: '' }))} aria-label={t('video.clear')} className={c.videoClear}>
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {adminOpts.videoUrl && parseVideoUrl(adminOpts.videoUrl) && (
              <div className={c.videoFrame}>
                <iframe
                  src={parseVideoUrl(adminOpts.videoUrl)!.embedUrl}
                  className="aspect-video w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title={t('video.previewTitle')}
                />
              </div>
            )}
            {adminOpts.videoUrl && !parseVideoUrl(adminOpts.videoUrl) && (
              <p className={c.error}>
                {t('video.invalid')}
              </p>
            )}
          </div>
        </div>
      ) : null}

      {step === 5 ? (
        <div className={c.card}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className={c.h2}>{t('previewTitle')}</h2>
              <p className={c.lead}>{t('previewDesc')}</p>
            </div>
          </div>

          <div className={c.previewShell}>
            {images[coverIndex] ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={images[coverIndex].preview} alt={t('coverPhoto')} className="aspect-[16/8] w-full object-cover" />
              </>
            ) : null}
            <div className="p-4 sm:p-6">
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${selectedCategory?.badgeClass ?? 'bg-slate-100 text-slate-700'}`}>
                  {selectedCategory ? catLabel(selectedCategory.id) : t('categoryFallback')}
                </span>
                <button type="button" onClick={() => setStep(1)} className={c.editLink}>
                  <Pencil className="h-4 w-4" />
                  {t('edit')}
                </button>
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
                <div>
                  <h3 className={c.previewTitle}>{formData.title}</h3>
                  <div className={c.previewPrice}>
                    {Number(formData.price || 0).toLocaleString(AZ_NUMBER_LOCALE)} {formData.currency}
                  </div>
                  <p className={c.previewMeta}>
                    {formData.city}{formData.district ? `, ${formData.district}` : ''}
                    {formData.sector ? ` · ${getAllSectors(locale).find(s => s.value === formData.sector)?.label ?? formData.sector}` : ''}
                  </p>
                  <div className={c.previewDesc}>{formData.description}</div>
                  <button type="button" onClick={() => setStep(2)} className={`mt-3 ${c.editLink}`}>
                    <Pencil className="h-4 w-4" />
                    {t('editMainInfo')}
                  </button>
                </div>

                <div className="space-y-4">
                  <div className={c.box}>
                    <div className="flex items-center justify-between">
                      <div className={c.sectionLabel}>{t('typeDetails')}</div>
                      <button type="button" onClick={() => setStep(3)} className={c.editLink}>
                        <Pencil className="h-4 w-4" />
                        {t('edit')}
                      </button>
                    </div>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      {dynamicFields.map((field) => (
                        <div key={field.key} className={c.tile}>
                          <div className={c.tileLabel}>{fieldLabel(field)}</div>
                          <div className={c.tileValue}>{formatPreviewValue(field, formData.typeSpecificData[field.key])}</div>
                        </div>
                      ))}
                      {selectedConcepts.length > 0 ? (
                        <div className={`${c.tile} sm:col-span-2`}>
                          <div className={c.tileLabel}>{t('conceptTitle')}</div>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {selectedConcepts.map((concept) => (
                              <span key={concept} className={c.conceptTag}>
                                {getConceptLabel(concept, locale)}
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : null}
                      {locationFields
                        .filter((field) => locationData[field.key] !== undefined && locationData[field.key] !== '')
                        .map((field) => (
                          <div key={field.key} className={c.tile}>
                            <div className={c.tileLabel}>{fieldLabel(field)}</div>
                            <div className={c.tileValue}>{formatPreviewValue(field, locationData[field.key])}</div>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div className={c.box}>
                    <div className="flex items-center justify-between">
                      <div className={c.sectionLabel}>{t('photosTitle')}</div>
                      <button type="button" onClick={() => setStep(4)} className={c.editLink}>
                        <Pencil className="h-4 w-4" />
                        {t('edit')}
                      </button>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
                      {images.map((image, index) => (
                        <div key={image.id} className={c.thumb}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={image.thumbnail} alt={image.file.name} className="aspect-square w-full object-cover" />
                          {coverIndex === index ? <div className={c.thumbCover}>{t('vitrin')}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={c.box}>
                    <div className={c.sectionLabel}>{t('contact')}</div>
                    <div className={c.contactList}>
                      <div><strong>{t('nameField')}:</strong> {formData.ownerName}</div>
                      <div><strong>{t('phoneField')}:</strong> {formData.phone}</div>
                      <div><strong>{t('emailField')}:</strong> {formData.email || '—'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Admin controls */}
              {isAdmin && (
                <div className={c.adminBox}>
                  <div className={c.adminTitle}>
                    <Star className="h-4 w-4" />
                    {t('admin.title')}
                  </div>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className={c.label}>{t('admin.initialStatus')}</label>
                      <select
                        value={adminOpts.initialStatus}
                        onChange={(e) => setAdminOpts((prev) => ({ ...prev, initialStatus: e.target.value }))}
                        className={c.select}
                      >
                        <option value="submitted">{t('admin.statusSubmitted')}</option>
                        <option value="committee_review">{t('admin.statusCommittee')}</option>
                        <option value="showcase_ready">{t('admin.statusShowcase')}</option>
                      </select>
                    </div>
                    <div className="flex flex-col gap-3">
                      <label className={c.adminCheck}>
                        <input
                          type="checkbox"
                          checked={adminOpts.isShowcase}
                          onChange={(e) => setAdminOpts((prev) => ({ ...prev, isShowcase: e.target.checked }))}
                          className={c.checkbox}
                        />
                        <Eye className="h-4 w-4 text-slate-400" />
                        {t('admin.showOnShowcase')}
                      </label>
                      <label className={c.adminCheck}>
                        <input
                          type="checkbox"
                          checked={adminOpts.isFeatured}
                          onChange={(e) => setAdminOpts((prev) => ({ ...prev, isFeatured: e.target.checked }))}
                          className={c.checkbox}
                        />
                        <Star className="h-4 w-4 text-slate-400" />
                        {t('admin.featured')}
                      </label>
                    </div>
                  </div>
                  <div className="mt-4">
                    <label className={c.label}>{t('admin.note')}</label>
                    <textarea
                      value={adminOpts.adminNote}
                      onChange={(e) => setAdminOpts((prev) => ({ ...prev, adminNote: e.target.value }))}
                      rows={3}
                      placeholder={t('admin.notePlaceholder')}
                      className={c.textarea}
                    />
                  </div>
                </div>
              )}

              <button type="button" onClick={handleSubmit} disabled={submitting} className={c.submit}>
                {submitting ? t('submitting') : (isAdmin ? t('admin.submit') : t('submitButton'))}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {!submittedCode ? (
        <div className="flex items-center justify-between gap-3">
          <button type="button" onClick={handleBack} disabled={step === 1} className={c.navBack}>
            {t('back')}
          </button>
          {step < 5 ? (
            <button type="button" onClick={handleContinue} className={c.navNext}>
              {t('continue')}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
