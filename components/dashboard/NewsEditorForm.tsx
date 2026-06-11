'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';
import { slugifyAz } from '@/lib/utils/slugify-az';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { usePathname } from 'next/navigation';

const NEWS_CATEGORY_OPTIONS = [
  { value: 'operations', label: 'Əməliyyat' },
  { value: 'finance', label: 'Maliyyə' },
  { value: 'growth', label: 'Böyümə' },
  { value: 'market', label: 'Bazar' },
  { value: 'technology', label: 'Texnologiya' },
] as const;

const NEWS_STATUS_OPTIONS = [
  { value: 'fetched', label: 'Qaralama' },
  { value: 'translated', label: 'Tərcümə olunmuş' },
  { value: 'approved', label: 'Təsdiqlənmiş' },
  { value: 'rejected', label: 'Rədd edilmiş' },
] as const;

const AUTHOR_OPTIONS = ['Doğan Tomris', 'DK Agency', 'Qonaq Müəllif'] as const;

const NEWS_TYPE_OPTIONS = [
  { value: 'none', label: 'Heç biri' },
  { value: 'photo', label: 'Foto xəbər' },
  { value: 'video', label: 'Video xəbər' },
] as const;

export interface NewsDraft {
  slug: string;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  titleTr: string;
  summaryAz: string;
  summaryRu: string;
  summaryEn: string;
  summaryTr: string;
  contentAz: string;
  contentRu: string;
  contentEn: string;
  contentTr: string;
  category: 'operations' | 'finance' | 'growth' | 'market' | 'technology';
  author: string;
  publishedAt: string;
  status: 'fetched' | 'translated' | 'approved' | 'rejected';
  imageUrl: string;
  seoTitle: string;
  seoDescription: string;
  isEditorPick: boolean;
  isManset: boolean;
  isTop: boolean;
  isGundem: boolean;
  newsType: 'none' | 'photo' | 'video';
  telegramSend: boolean;
  logoOverlay: boolean;
  externalUrl: string;
  sourceId: number | null;
}

type LocaleTab = 'az' | 'ru' | 'en' | 'tr';
const LOCALE_TABS: Array<{ key: LocaleTab; label: string }> = [
  { key: 'az', label: 'AZ' },
  { key: 'ru', label: 'RU' },
  { key: 'en', label: 'EN' },
  { key: 'tr', label: 'TR' },
];

const COPY: Record<
  Locale,
  {
    pageTitle: string;
    slugLabel: string;
    categoryLabel: string;
    authorLabel: string;
    publishDateLabel: string;
    statusLabel: string;
    imageLabel: string;
    imageUpload: string;
    imageUploading: string;
    seoTitle: string;
    seoDescription: string;
    titleLabel: string;
    summaryLabel: string;
    contentLabel: string;
    fallbackNote: string;
    manset: string;
    top: string;
    gundem: string;
    newsType: string;
    telegram: string;
    logoOverlay: string;
    searchImageLib: string;
    editorPick: string;
    externalUrl: string;
    saveDraft: string;
    publish: string;
    preview: string;
    errorTitleAz: string;
    errorSlug: string;
    toastDraft: string;
    toastPublished: string;
    toastImageOk: (r: string) => string;
    toastImageFail: string;
    toastImageBad: string;
    toastImageUploading: string;
    autoSaveNote: string;
  }
> = {
  az: {
    pageTitle: 'Yeni Xəbər',
    slugLabel: 'Slug',
    categoryLabel: 'Kateqoriya',
    authorLabel: 'Müəllif',
    publishDateLabel: 'Nəşr tarixi',
    statusLabel: 'Status',
    imageLabel: 'Örtük şəkli',
    imageUpload: 'Şəkil yüklə',
    imageUploading: 'Yüklənir...',
    seoTitle: 'SEO başlıq',
    seoDescription: 'SEO açıqlama',
    titleLabel: 'Başlıq',
    summaryLabel: 'Xülasə',
    contentLabel: 'Məzmun',
    fallbackNote: 'Boşdursa AZ göstərilir',
    manset: 'Xəbər manşet olsun?',
    top: 'Xəbər top olsun?',
    gundem: 'Xəbər gündəm olsun?',
    newsType: 'Xəbərin tipi?',
    telegram: 'Telegram kanalına göndərilsin?',
    logoOverlay: 'Şəkilin üzərinə loqo vurulsun?',
    searchImageLib: 'Bazadan şəkil axtar',
    editorPick: 'Editor pick',
    externalUrl: 'Mənbə linki (əgər varsa)',
    saveDraft: 'Qaralama olaraq saxla',
    publish: 'Təsdiqlə və dərc et',
    preview: 'Önizlə',
    errorTitleAz: 'AZ başlıq vacibdir.',
    errorSlug: 'Slug vacibdir.',
    toastDraft: 'Qaralama saxlanıldı.',
    toastPublished: 'Xəbər dərc edildi.',
    toastImageOk: (r) => `Şəkil yükləndi: ${r}`,
    toastImageFail: 'Şəkil serverə yüklənmədi. Yenidən cəhd edin.',
    toastImageBad: 'Şəkil qəbul olunmadı.',
    toastImageUploading: 'Şəkil hələ yüklənir, gözləyin.',
    autoSaveNote: 'Qaralama hər 30 saniyədə avtomatik saxlanılır.',
  },
  ru: {
    pageTitle: 'Новая новость',
    slugLabel: 'Slug',
    categoryLabel: 'Категория',
    authorLabel: 'Автор',
    publishDateLabel: 'Дата публикации',
    statusLabel: 'Статус',
    imageLabel: 'Обложка',
    imageUpload: 'Загрузить изображение',
    imageUploading: 'Загружается...',
    seoTitle: 'SEO заголовок',
    seoDescription: 'SEO описание',
    titleLabel: 'Заголовок',
    summaryLabel: 'Краткое описание',
    contentLabel: 'Содержание',
    fallbackNote: 'Если пусто — показывается AZ',
    manset: 'Сделать главной новостью?',
    top: 'Поставить в топ?',
    gundem: 'В тренды?',
    newsType: 'Тип новости?',
    telegram: 'Отправить в Telegram-канал?',
    logoOverlay: 'Добавить логотип на изображение?',
    searchImageLib: 'Найти изображение в базе',
    editorPick: 'Выбор редактора',
    externalUrl: 'Ссылка на источник (если есть)',
    saveDraft: 'Сохранить как черновик',
    publish: 'Одобрить и опубликовать',
    preview: 'Предпросмотр',
    errorTitleAz: 'Заголовок AZ обязателен.',
    errorSlug: 'Slug обязателен.',
    toastDraft: 'Черновик сохранён.',
    toastPublished: 'Новость опубликована.',
    toastImageOk: (r) => `Изображение загружено: ${r}`,
    toastImageFail: 'Изображение не загружено. Попробуйте ещё раз.',
    toastImageBad: 'Изображение не принято.',
    toastImageUploading: 'Изображение ещё загружается, подождите.',
    autoSaveNote: 'Черновик автоматически сохраняется каждые 30 секунд.',
  },
  en: {
    pageTitle: 'New Article',
    slugLabel: 'Slug',
    categoryLabel: 'Category',
    authorLabel: 'Author',
    publishDateLabel: 'Publish date',
    statusLabel: 'Status',
    imageLabel: 'Cover image',
    imageUpload: 'Upload image',
    imageUploading: 'Uploading...',
    seoTitle: 'SEO title',
    seoDescription: 'SEO description',
    titleLabel: 'Title',
    summaryLabel: 'Summary',
    contentLabel: 'Content',
    fallbackNote: 'Falls back to AZ if empty',
    manset: 'Make headline?',
    top: 'Put in top?',
    gundem: 'Mark as trending?',
    newsType: 'News type?',
    telegram: 'Send to Telegram channel?',
    logoOverlay: 'Add logo overlay on image?',
    searchImageLib: 'Search image from library',
    editorPick: 'Editor pick',
    externalUrl: 'Source URL (if any)',
    saveDraft: 'Save as draft',
    publish: 'Approve & publish',
    preview: 'Preview',
    errorTitleAz: 'AZ title is required.',
    errorSlug: 'Slug is required.',
    toastDraft: 'Draft saved.',
    toastPublished: 'Article published.',
    toastImageOk: (r) => `Image uploaded: ${r}`,
    toastImageFail: 'Image upload failed. Please try again.',
    toastImageBad: 'Image not accepted.',
    toastImageUploading: 'Image is still uploading, please wait.',
    autoSaveNote: 'Draft auto-saves every 30 seconds.',
  },
  tr: {
    pageTitle: 'Yeni Haber',
    slugLabel: 'Slug',
    categoryLabel: 'Kategori',
    authorLabel: 'Yazar',
    publishDateLabel: 'Yayın tarihi',
    statusLabel: 'Durum',
    imageLabel: 'Kapak görseli',
    imageUpload: 'Görsel yükle',
    imageUploading: 'Yükleniyor...',
    seoTitle: 'SEO başlık',
    seoDescription: 'SEO açıklama',
    titleLabel: 'Başlık',
    summaryLabel: 'Özet',
    contentLabel: 'İçerik',
    fallbackNote: 'Boşsa AZ gösterilir',
    manset: 'Manşet haber olsun mu?',
    top: 'Üst habere eklensin mi?',
    gundem: 'Gündem olsun mu?',
    newsType: 'Haber tipi?',
    telegram: "Telegram kanalına gönderilsin mi?",
    logoOverlay: 'Görselin üzerine logo vurulsun mu?',
    searchImageLib: 'Kütüphaneden görsel ara',
    editorPick: 'Editör seçimi',
    externalUrl: 'Kaynak linki (varsa)',
    saveDraft: 'Taslak olarak kaydet',
    publish: 'Onayla ve yayınla',
    preview: 'Önizle',
    errorTitleAz: 'AZ başlık zorunludur.',
    errorSlug: 'Slug zorunludur.',
    toastDraft: 'Taslak kaydedildi.',
    toastPublished: 'Haber yayınlandı.',
    toastImageOk: (r) => `Görsel yüklendi: ${r}`,
    toastImageFail: 'Görsel yüklenemedi. Tekrar deneyin.',
    toastImageBad: 'Görsel kabul edilmedi.',
    toastImageUploading: 'Görsel hâlâ yükleniyor, bekleyin.',
    autoSaveNote: 'Taslak her 30 saniyede otomatik kaydedilir.',
  },
};

const LOCAL_STORAGE_KEY = 'dk-news-editor-draft';


const EMPTY_DRAFT: NewsDraft = {
  slug: '',
  titleAz: '',
  titleRu: '',
  titleEn: '',
  titleTr: '',
  summaryAz: '',
  summaryRu: '',
  summaryEn: '',
  summaryTr: '',
  contentAz: '',
  contentRu: '',
  contentEn: '',
  contentTr: '',
  category: 'market',
  author: 'DK Agency',
  publishedAt: new Date().toISOString().slice(0, 10),
  status: 'fetched',
  imageUrl: '',
  seoTitle: '',
  seoDescription: '',
  isEditorPick: false,
  isManset: false,
  isTop: false,
  isGundem: false,
  newsType: 'none',
  telegramSend: false,
  logoOverlay: false,
  externalUrl: '',
  sourceId: null,
};

export default function NewsEditorForm({ initialDraft }: { initialDraft?: NewsDraft }) {
  const router = useRouter();
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = COPY[locale];

  const [draft, setDraft] = useState<NewsDraft>(() => {
    if (initialDraft) return initialDraft;
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) return JSON.parse(saved) as NewsDraft;
      } catch {
        // ignore
      }
    }
    return EMPTY_DRAFT;
  });

  const [imagePreview, setImagePreview] = useState(initialDraft?.imageUrl || draft.imageUrl || '');
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ titleAz?: string; slug?: string }>({});
  const [activeLocale, setActiveLocale] = useState<LocaleTab>('az');
  const [translating, setTranslating] = useState(false);
  const [translateMsg, setTranslateMsg] = useState('');
  const [savedSlug, setSavedSlug] = useState<string | null>(initialDraft?.slug || null);
  const [savedId, setSavedId] = useState<number | null>(null);
  const autoSaveRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const translateNow = async () => {
    const slug = savedSlug;
    if (!slug || translating) return;
    setTranslating(true);
    setTranslateMsg('');
    try {
      const res = await fetch('/api/news/admin/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        langs?: Record<string, string>;
        error?: string;
      };
      if (!res.ok || data.error) {
        setTranslateMsg(`Tərcümə alınmadı: ${data.error || res.status}`);
        return;
      }
      const l = data.langs || {};
      const mark = (s?: string) => (s === 'done' ? '✓' : s === 'failed' ? '✗' : '—');
      setTranslateMsg(
        `RU ${mark(l.ru)} · EN ${mark(l.en)} · TR ${mark(l.tr)}${data.ok ? '' : ' — bəziləri alınmadı, yenidən cəhd et'}`,
      );
      router.refresh();
    } catch {
      setTranslateMsg('Tərcümə xidməti əlçatmadı — yenidən cəhd et');
    } finally {
      setTranslating(false);
    }
  };

  const seoTitleCount = useMemo(() => draft.seoTitle.length, [draft.seoTitle]);
  const seoDescCount = useMemo(() => draft.seoDescription.length, [draft.seoDescription]);

  const setField = <K extends keyof NewsDraft>(key: K, value: NewsDraft[K]) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const setStringField = (key: keyof NewsDraft, value: string) =>
    setDraft((prev) => ({ ...prev, [key]: value }));

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2400);
  };

  useEffect(() => {
    if (initialDraft) return;
    if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    autoSaveRef.current = setTimeout(() => {
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(draft));
      } catch {
        // ignore
      }
    }, 30_000);
    return () => {
      if (autoSaveRef.current) clearTimeout(autoSaveRef.current);
    };
  }, [draft, initialDraft]);

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      showToast(copy.toastImageBad);
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        maxSizeKB: 400,
      });
      setImagePreview(compressed.preview);

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('folder', 'dk-agency/news');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        url?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.success || !data?.url) {
        setImagePreview('');
        setField('imageUrl', '');
        showToast(data?.error || copy.toastImageFail);
        return;
      }

      setImagePreview(data.url);
      setField('imageUrl', data.url);
      showToast(copy.toastImageOk(compressed.reduction));
    } catch {
      setImagePreview('');
      setField('imageUrl', '');
      showToast(copy.toastImageFail);
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const nextErrors: typeof errors = {};
    if (!draft.titleAz.trim()) nextErrors.titleAz = copy.errorTitleAz;
    if (!draft.slug.trim()) nextErrors.slug = copy.errorSlug;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitDraft = async (nextStatus: NewsDraft['status']) => {
    if (!validateForm()) return;
    if (uploadingImage) {
      showToast(copy.toastImageUploading);
      return;
    }

    const durableImage = draft.imageUrl || '';
    const safeImage =
      durableImage.startsWith('blob:') || durableImage.startsWith('data:') ? '' : durableImage;

    setSubmitting(true);

    const payload = {
      ...draft,
      status: nextStatus,
      imageUrl: safeImage,
      publishedAt: draft.publishedAt ? new Date(draft.publishedAt).toISOString() : new Date().toISOString(),
    };

    try {
      // If article was already created (savedId exists), PATCH instead of POST
      // This prevents UNIQUE slug collision → 500 → silent content loss
      const isUpdate = !!savedId;
      const url = isUpdate ? `/api/news/admin/${savedId}` : '/api/news/admin';
      const method = isUpdate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast((data as { error?: string } | null)?.error || 'Xəbər saxlanmadı.');
        return;
      }

      // Warn if saved to mock (DB not connected — data will be lost)
      const responseSource = (data as { source?: string } | null)?.source;
      if (responseSource === 'mock') {
        showToast('⚠️ DİQQƏT: Verilənlər bazası əlçatmazdır. Xəbər müvəqqəti saxlanıb, lakin itə bilər!');
        return;
      }

      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // ignore
      }

      // Capture saved id+slug so subsequent saves use PATCH
      const savedRow = (data as { data?: { id?: number; slug?: string } } | null)?.data;
      if (savedRow?.id) {
        setSavedId(savedRow.id);
      }
      if (savedRow?.slug) {
        setSavedSlug(savedRow.slug);
        if (savedRow.slug !== draft.slug) {
          setStringField('slug', savedRow.slug);
        }
      }

      showToast(nextStatus === 'approved' ? copy.toastPublished : copy.toastDraft);

      // Published goes to list (final). Drafts stay on page for translation.
      if (nextStatus === 'approved') {
        router.push('/dashboard/xeberler');
        router.refresh();
      } else {
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  };

  function titleKey(loc: LocaleTab): keyof NewsDraft {
    const map: Record<LocaleTab, keyof NewsDraft> = {
      az: 'titleAz',
      ru: 'titleRu',
      en: 'titleEn',
      tr: 'titleTr',
    };
    return map[loc];
  }

  function summaryKey(loc: LocaleTab): keyof NewsDraft {
    const map: Record<LocaleTab, keyof NewsDraft> = {
      az: 'summaryAz',
      ru: 'summaryRu',
      en: 'summaryEn',
      tr: 'summaryTr',
    };
    return map[loc];
  }

  function contentKey(loc: LocaleTab): keyof NewsDraft {
    const map: Record<LocaleTab, keyof NewsDraft> = {
      az: 'contentAz',
      ru: 'contentRu',
      en: 'contentEn',
      tr: 'contentTr',
    };
    return map[loc];
  }

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      ) : null}

      <div className="rounded-2xl border border-amber-100 bg-amber-50 px-4 py-2.5 text-xs text-amber-700">
        {copy.autoSaveNote}
      </div>

      <div className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
            {LOCALE_TABS.map((tab) => {
              const hasTitle = Boolean((draft[titleKey(tab.key)] as string)?.trim());
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveLocale(tab.key)}
                  className={`relative flex-1 rounded-xl px-4 py-2.5 text-sm font-bold transition ${
                    activeLocale === tab.key
                      ? 'bg-white text-[var(--dk-navy)] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                  {hasTitle && tab.key !== 'az' ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  ) : null}
                  {!hasTitle && tab.key !== 'az' ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-slate-300" />
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => void translateNow()}
              disabled={!savedSlug || translating}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--dk-navy)] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {translating ? '⏳ Tərcümə olunur…' : '🌐 Avtomatik tərcümə (RU/EN/TR)'}
            </button>
            {!savedSlug ? (
              <span className="text-xs text-slate-500">Əvvəlcə yadda saxla, sonra tərcümə et</span>
            ) : null}
            {translateMsg ? (
              <span className="text-xs font-semibold text-slate-700">{translateMsg}</span>
            ) : null}
          </div>

          {/* TODO B-step: AI title suggest button */}

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              {copy.titleLabel} ({activeLocale.toUpperCase()})
              {activeLocale !== 'az' ? (
                <span className="ml-2 text-xs font-normal text-slate-400">{copy.fallbackNote}</span>
              ) : null}
            </label>
            <input
              value={draft[titleKey(activeLocale)] as string}
              onChange={(e) => {
                const title = e.target.value;
                setStringField(titleKey(activeLocale), title);
                if (!initialDraft && activeLocale === 'az') setField('slug', slugifyAz(title));
              }}
              placeholder={activeLocale !== 'az' ? `${activeLocale.toUpperCase()} başlıq...` : ''}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            {activeLocale === 'az' && errors.titleAz ? (
              <p className="mt-2 text-xs text-red-600">{errors.titleAz}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">{copy.slugLabel}</label>
            <input
              value={draft.slug}
              onChange={(e) => setField('slug', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none"
            />
            {errors.slug ? <p className="mt-2 text-xs text-red-600">{errors.slug}</p> : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              {copy.summaryLabel} ({activeLocale.toUpperCase()})
              {activeLocale !== 'az' ? (
                <span className="ml-2 text-xs font-normal text-slate-400">{copy.fallbackNote}</span>
              ) : null}
            </label>
            <textarea
              rows={3}
              value={draft[summaryKey(activeLocale)] as string}
              onChange={(e) => setStringField(summaryKey(activeLocale), e.target.value)}
              placeholder={activeLocale !== 'az' ? `${activeLocale.toUpperCase()} xülasə...` : ''}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {copy.categoryLabel}
              </label>
              <select
                value={draft.category}
                onChange={(e) => setField('category', e.target.value as NewsDraft['category'])}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                {NEWS_CATEGORY_OPTIONS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {copy.authorLabel}
              </label>
              <select
                value={draft.author}
                onChange={(e) => setField('author', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                {AUTHOR_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                {copy.publishDateLabel}
              </label>
              <input
                type="date"
                value={draft.publishedAt}
                onChange={(e) => setField('publishedAt', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">{copy.imageLabel}</label>
            <label
              className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm font-semibold text-slate-600 ${
                uploadingImage ? 'cursor-wait opacity-60' : 'cursor-pointer hover:border-slate-400'
              }`}
            >
              {uploadingImage ? copy.imageUploading : copy.imageUpload}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => void handleImage(e)}
              />
            </label>
            <button
              type="button"
              onClick={() => showToast('Şəkil axtarışı tezliklə aktiv olacaq.')}
              className="mt-2 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              {copy.searchImageLib}
            </button>
            {imagePreview ? (
              <div className="mt-4 relative">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="h-52 w-full rounded-3xl object-cover"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImagePreview('');
                    setField('imageUrl', '');
                  }}
                  className="absolute right-3 top-3 rounded-full bg-white/90 px-3 py-1.5 text-xs font-bold text-slate-600 shadow"
                >
                  Sil
                </button>
              </div>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">{copy.externalUrl}</label>
            <input
              type="url"
              value={draft.externalUrl}
              onChange={(e) => setField('externalUrl', e.target.value)}
              placeholder="https://..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] bg-slate-50 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              {copy.seoTitle} ({seoTitleCount}/70)
            </label>
            <input
              maxLength={70}
              value={draft.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              {copy.seoDescription} ({seoDescCount}/160)
            </label>
            <textarea
              maxLength={160}
              rows={3}
              value={draft.seoDescription}
              onChange={(e) => setField('seoDescription', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">{copy.statusLabel}</div>
            {NEWS_STATUS_OPTIONS.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  checked={draft.status === item.value}
                  onChange={() => setField('status', item.value)}
                />
                {item.label}
              </label>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3">
            <div className="text-xs font-black uppercase tracking-[0.16em] text-slate-400">
              Xüsusi parametrlər
            </div>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isManset}
                onChange={(e) => setField('isManset', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.manset}
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isTop}
                onChange={(e) => setField('isTop', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.top}
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isGundem}
                onChange={(e) => setField('isGundem', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.gundem}
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.isEditorPick}
                onChange={(e) => setField('isEditorPick', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.editorPick}
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.telegramSend}
                onChange={(e) => setField('telegramSend', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.telegram}
            </label>

            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 text-sm font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={draft.logoOverlay}
                onChange={(e) => setField('logoOverlay', e.target.checked)}
                className="h-4 w-4 rounded"
              />
              {copy.logoOverlay}
            </label>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">{copy.newsType}</label>
              <div className="flex gap-3 flex-wrap">
                {NEWS_TYPE_OPTIONS.map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-sm text-slate-700">
                    <input
                      type="radio"
                      name="newsType"
                      checked={draft.newsType === item.value}
                      onChange={() => setField('newsType', item.value)}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <label className="mb-2 block text-sm font-bold text-slate-700">
          {copy.contentLabel} ({activeLocale.toUpperCase()})
          {activeLocale !== 'az' ? (
            <span className="ml-2 text-xs font-normal text-slate-400">{copy.fallbackNote}</span>
          ) : null}
        </label>

        {/* TODO B-step: AI content translate button (line ~430) */}

        <textarea
          rows={activeLocale === 'az' ? 14 : 10}
          value={draft[contentKey(activeLocale)] as string}
          onChange={(e) => setStringField(contentKey(activeLocale), e.target.value)}
          placeholder={activeLocale !== 'az' ? `${activeLocale.toUpperCase()} məzmun...` : ''}
          className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
        />

        {activeLocale !== 'az' && draft.contentAz ? (
          <details className="mt-3 rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <summary className="cursor-pointer text-xs font-bold text-slate-500">
              AZ mənbə məzmunu (referans)
            </summary>
            <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
              {draft.contentAz.slice(0, 600)}
              {draft.contentAz.length > 600 ? '...' : ''}
            </pre>
          </details>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submitDraft('fetched')}
          disabled={submitting || uploadingImage}
          className="min-h-[44px] rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
        >
          {copy.saveDraft}
        </button>
        <button
          type="button"
          onClick={() => void submitDraft('approved')}
          disabled={submitting || uploadingImage}
          className="min-h-[44px] rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          {copy.publish}
        </button>
        <button
          type="button"
          onClick={() => window.open(`/haberler/${draft.slug || ''}?preview=true`, '_blank')}
          className="min-h-[44px] rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700"
        >
          {copy.preview}
        </button>
      </div>
    </div>
  );
}
