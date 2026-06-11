'use client';

import { ChangeEvent, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';
import { slugifyAz } from '@/lib/utils/slugify-az';

const AUTHOR_OPTIONS = ['Doğan Tomris', 'DK Agency', 'Qonaq Müəllif'] as const;
const CATEGORY_OPTIONS = ['Maliyyə', 'Əməliyyat', 'Kadr', 'Hüquqi', 'Satış', 'Marketinq'] as const;
const STAGE_OPTIONS = ['', 'Başla', 'Böyüt', 'Devir'] as const;
const STATUS_OPTIONS = [
  { value: 'draft', label: 'Qaralama' },
  { value: 'published', label: 'Dərc edilmiş' },
  { value: 'archived', label: 'Arxivlənmiş' },
] as const;

export interface BlogDraft {
  slug: string;
  titleAz: string;
  titleTr: string;
  titleEn: string;
  titleRu: string;
  category: string;
  stage: string;
  author: string;
  readTime: number;
  status: 'draft' | 'published' | 'archived';
  paywall: boolean;
  publishDate: string;
  seoTitle: string;
  seoDescription: string;
  doganNote: string;
  contentAz: string;
  contentTr: string;
  contentEn: string;
  contentRu: string;
  featuredImage?: string;
  guruBoxes: Array<{
    guru: string;
    quote: string;
    book: string;
  }>;
}

type LocaleTab = 'az' | 'ru' | 'en' | 'tr';
const LOCALE_TABS: Array<{ key: LocaleTab; label: string }> = [
  { key: 'az', label: 'AZ' },
  { key: 'ru', label: 'RU' },
  { key: 'en', label: 'EN' },
  { key: 'tr', label: 'TR' },
];

function titleKey(locale: LocaleTab): keyof BlogDraft {
  return `title${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof BlogDraft;
}
function contentKey(locale: LocaleTab): keyof BlogDraft {
  return `content${locale.charAt(0).toUpperCase() + locale.slice(1)}` as keyof BlogDraft;
}


const EMPTY_DRAFT: BlogDraft = {
  slug: '',
  titleAz: '',
  titleTr: '',
  titleEn: '',
  titleRu: '',
  category: 'Maliyyə',
  stage: '',
  author: 'DK Agency',
  readTime: 8,
  status: 'draft',
  paywall: false,
  publishDate: new Date().toISOString().slice(0, 10),
  seoTitle: '',
  seoDescription: '',
  doganNote: '',
  contentAz: '',
  contentTr: '',
  contentEn: '',
  contentRu: '',
  featuredImage: '',
  guruBoxes: [],
};

const LOCAL_STORAGE_KEY = 'dk-blog-editor-draft';

export default function BlogEditorForm({ initialPost }: { initialPost?: BlogDraft }) {
  const router = useRouter();
  const draftRestoredRef = useRef(false);

  const [post, setPost] = useState<BlogDraft>(() => {
    if (initialPost) return initialPost;
    if (typeof window === 'undefined') return EMPTY_DRAFT;
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        draftRestoredRef.current = true;
        return { ...EMPTY_DRAFT, ...JSON.parse(saved) };
      }
    } catch { /* ignore */ }
    return EMPTY_DRAFT;
  });

  const [imagePreview, setImagePreview] = useState(initialPost?.featuredImage || post.featuredImage || '');
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [errors, setErrors] = useState<{ titleAz?: string; slug?: string; contentAz?: string }>({});

  const [activeLocale, setActiveLocale] = useState<LocaleTab>('az');

  // Draft restored notification
  useEffect(() => {
    if (draftRestoredRef.current) {
      setToast('📝 Qaralama bərpa edildi');
      draftRestoredRef.current = false;
    }
  }, []);

  // Auto-save to localStorage (debounce 1s, only new posts)
  useEffect(() => {
    if (initialPost) return;
    const timer = setTimeout(() => {
      try { localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(post)); } catch { /* ignore */ }
    }, 1000);
    return () => clearTimeout(timer);
  }, [post, initialPost]);

  const clearLocalDraft = () => {
    try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch { /* ignore */ }
    setPost(EMPTY_DRAFT);
    setImagePreview('');
    setToast('Qaralama təmizləndi');
  };

  const [seoTitleCount, seoDescriptionCount, doganNoteCount] = useMemo(
    () => [post.seoTitle.length, post.seoDescription.length, post.doganNote.length],
    [post]
  );

  const setField = (key: keyof BlogDraft, value: string | number | boolean) =>
    setPost((prev) => ({ ...prev, [key]: value }));

  const setGuruBoxField = (index: number, key: 'guru' | 'quote' | 'book', value: string) =>
    setPost((prev) => ({
      ...prev,
      guruBoxes: prev.guruBoxes.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      ),
    }));

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const [translating, setTranslating] = useState(false);
  const [translateMsg, setTranslateMsg] = useState('');

  const translateNow = async () => {
    const slug = initialPost?.slug;
    if (!slug || translating) return;
    setTranslating(true);
    setTranslateMsg('');
    try {
      const res = await fetch('/api/blog/translate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as {
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
        `RU ${mark(l.ru)} · EN ${mark(l.en)} · TR ${mark(l.tr)}${data.ok ? '' : ' — bəziləri alınmadı, yenidən cəhd et'}`
      );
      router.refresh();
    } catch {
      setTranslateMsg('Tərcümə xidməti əlçatmadı — yenidən cəhd et');
    } finally {
      setTranslating(false);
    }
  };

  const translateField = (_field: 'title' | 'content', _locale: 'tr' | 'en') => {
    showToast('Tərcümə sorğusu qeyd olundu.');
  };

  const handleImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validation = validateImage(file);
    if (!validation.valid) {
      showToast(validation.error || 'Şəkil qəbul olunmadı.');
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        maxSizeKB: 500,
      });
      // Instant local preview while the Cloudinary upload runs.
      setImagePreview(compressed.preview);

      // Persist the file to Cloudinary and store the durable https URL — NOT
      // the in-memory blob: URL, which dies on reload and never reaches the DB.
      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('folder', 'dk-agency/blog');

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = (await res.json().catch(() => null)) as {
        success?: boolean;
        url?: string;
        error?: string;
      } | null;

      if (!res.ok || !data?.success || !data?.url) {
        setImagePreview('');
        setField('featuredImage', '');
        showToast(data?.error || 'Şəkil serverə yüklənmədi. Yenidən cəhd edin.');
        return;
      }

      setImagePreview(data.url);
      setField('featuredImage', data.url);
      showToast(`Şəkil yükləndi: ${compressed.reduction}`);
    } catch {
      setImagePreview('');
      setField('featuredImage', '');
      showToast('Şəkil yüklənərkən xəta baş verdi.');
    } finally {
      setUploadingImage(false);
    }
  };

  const validateForm = () => {
    const nextErrors: typeof errors = {};
    if (!post.titleAz.trim()) nextErrors.titleAz = 'AZ başlıq vacibdir.';
    if (!post.slug.trim()) nextErrors.slug = 'Slug vacibdir.';
    if (!post.contentAz.trim()) nextErrors.contentAz = 'AZ məzmun vacibdir.';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const submitPost = async (nextStatus: BlogDraft['status']) => {
    if (!validateForm()) return;
    if (uploadingImage) {
      showToast('Şəkil hələ yüklənir, gözləyin.');
      return;
    }

    // Only ever persist a durable URL. A blob:/data: value means the upload
    // did not finish — drop it rather than save a broken cover image.
    const durableImage = post.featuredImage || '';
    const safeImage =
      durableImage.startsWith('blob:') || durableImage.startsWith('data:') ? '' : durableImage;

    const cleanSlug = slugifyAz(post.slug);
    const payload = {
      ...post,
      slug: cleanSlug,
      status: nextStatus,
      featuredImage: safeImage,
    };

    try {
      const response = await fetch(initialPost ? `/api/blog/${initialPost.slug}` : '/api/blog', {
        method: initialPost ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        showToast(data?.error || 'Yazı saxlanmadı.');
        return;
      }

      try { localStorage.removeItem(LOCAL_STORAGE_KEY); } catch { /* ignore */ }
      showToast(nextStatus === 'published' ? 'Yazı dərc edildi.' : 'Qaralama saxlanıldı.');
      router.push('/dashboard/blog');
      router.refresh();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {toast}
        </div>
      ) : null}

      <div className="grid gap-6 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm xl:grid-cols-[1.15fr_0.85fr]">
        <div className="grid gap-4">
          <div className="flex gap-1 rounded-2xl bg-slate-100 p-1">
            {LOCALE_TABS.map((tab) => {
              const hasContent = Boolean((post[titleKey(tab.key)] as string)?.trim());
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
                  {hasContent && tab.key !== 'az' ? (
                    <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-emerald-400" />
                  ) : null}
                  {!hasContent && tab.key !== 'az' ? (
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
              disabled={!initialPost || translating}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[var(--dk-navy)] px-4 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {translating ? '⏳ Tərcümə olunur…' : '🌐 Avtomatik tərcümə (RU/EN/TR)'}
            </button>
            {!initialPost ? (
              <span className="text-xs text-slate-500">Əvvəlcə yazını yadda saxla</span>
            ) : null}
            {translateMsg ? (
              <span className="text-xs font-semibold text-slate-700">{translateMsg}</span>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Başlıq ({activeLocale.toUpperCase()})
              {activeLocale !== 'az' ? (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Boşdursa AZ göstərilir
                </span>
              ) : null}
            </label>
            <input
              value={post[titleKey(activeLocale)] as string}
              onChange={(e) => {
                const title = e.target.value;
                setField(titleKey(activeLocale), title);
                if (!initialPost && activeLocale === 'az') setField('slug', slugifyAz(title));
              }}
              placeholder={activeLocale !== 'az' ? `${activeLocale.toUpperCase()} tərcümə...` : ''}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            {activeLocale === 'az' && errors.titleAz ? (
              <p className="mt-2 text-xs text-red-600">{errors.titleAz}</p>
            ) : null}
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Slug</label>
            <input
              value={post.slug}
              onChange={(e) => setField('slug', e.target.value)}
              onBlur={() => setField('slug', slugifyAz(post.slug))}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            {errors.slug ? <p className="mt-2 text-xs text-red-600">{errors.slug}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Kateqoriya</label>
              <select
                value={post.category}
                onChange={(e) => setField('category', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Mərhələ (Stage)</label>
              <select
                value={post.stage}
                onChange={(e) => setField('stage', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                {STAGE_OPTIONS.map((item) => (
                  <option key={item} value={item}>
                    {item || '— Seçilməyib —'}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Müəllif</label>
              <select
                value={post.author}
                onChange={(e) => setField('author', e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              >
                {AUTHOR_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Oxu müddəti</label>
              <div className="flex items-center rounded-2xl border border-slate-200 bg-white px-4 py-3">
                <input
                  type="number"
                  min={1}
                  value={post.readTime}
                  onChange={(e) => setField('readTime', Number(e.target.value))}
                  className="w-full bg-transparent text-slate-900 outline-none"
                />
                <span className="text-sm text-slate-400">dəq</span>
              </div>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Önə çıxan şəkil</label>
            <label
              className={`flex items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm font-semibold text-slate-600 ${
                uploadingImage ? 'cursor-wait opacity-60' : 'cursor-pointer'
              }`}
            >
              {uploadingImage ? '⏳ Şəkil yüklənir…' : 'Şəkil yüklə'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                disabled={uploadingImage}
                onChange={(e) => void handleImage(e)}
              />
            </label>
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="mt-4 h-52 w-full rounded-3xl object-cover"
              />
            ) : null}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] bg-slate-50 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              SEO title ({seoTitleCount}/60)
            </label>
            <input
              maxLength={60}
              value={post.seoTitle}
              onChange={(e) => setField('seoTitle', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              SEO description ({seoDescriptionCount}/160)
            </label>
            <textarea
              maxLength={160}
              rows={4}
              value={post.seoDescription}
              onChange={(e) => setField('seoDescription', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Doğan notu ({doganNoteCount}/200)
            </label>
            <textarea
              maxLength={200}
              rows={4}
              value={post.doganNote}
              onChange={(e) => setField('doganNote', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={post.paywall}
              onChange={(e) => setField('paywall', e.target.checked)}
            />
            30%-dən sonra paywall tətbiq et
          </label>

          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Status</div>
            {STATUS_OPTIONS.map((item) => (
              <label
                key={item.value}
                className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700"
              >
                <input
                  type="radio"
                  checked={post.status === item.value}
                  onChange={() => setField('status', item.value)}
                />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-bold text-slate-700">
              Məzmun ({activeLocale.toUpperCase()})
              {activeLocale !== 'az' ? (
                <span className="ml-2 text-xs font-normal text-slate-400">
                  Boşdursa AZ göstərilir
                </span>
              ) : null}
            </label>
            {activeLocale !== 'az' ? (
              <button
                type="button"
                onClick={() => translateField('content', activeLocale as 'tr' | 'en')}
                className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600"
              >
                AZ-dan tərcümə et
              </button>
            ) : null}
          </div>

          {/* Markdown toolbar + Toolkit insert */}
          <div className="flex flex-wrap items-center gap-1 rounded-t-2xl border border-b-0 border-slate-200 bg-slate-50 px-3 py-2">
            {[
              { label: 'B', md: '**', tip: 'Bold' },
              { label: 'I', md: '*', tip: 'İtalik' },
              { label: 'H2', md: '## ', tip: 'Başlıq' },
              { label: 'H3', md: '### ', tip: 'Alt başlıq' },
              { label: '•', md: '- ', tip: 'Siyahı' },
              { label: '1.', md: '1. ', tip: 'Nömrəli siyahı' },
              { label: '❝', md: '> ', tip: 'Sitat' },
            ].map((btn) => (
              <button
                key={btn.label}
                type="button"
                title={btn.tip}
                className="rounded-lg px-2.5 py-1 text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors"
                onClick={() => {
                  const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                  if (!ta) return;
                  const { selectionStart: s, selectionEnd: e } = ta;
                  const val = ta.value;
                  const sel = val.slice(s, e);
                  const isWrap = btn.md.length <= 2;
                  const insert = isWrap ? `${btn.md}${sel || btn.tip}${btn.md}` : `${btn.md}${sel || btn.tip}`;
                  const next = val.slice(0, s) + insert + val.slice(e);
                  setField(contentKey(activeLocale), next);
                  setTimeout(() => { ta.focus(); ta.selectionStart = s + btn.md.length; ta.selectionEnd = s + btn.md.length + (sel || btn.tip).length; }, 0);
                }}
              >
                {btn.label}
              </button>
            ))}

            <span className="mx-1 h-5 w-px bg-slate-300" />

            {/* Callout insert */}
            <select
              className="rounded-lg border-0 bg-transparent px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-200 cursor-pointer"
              value=""
              onChange={(ev) => {
                const key = ev.target.value;
                if (!key) return;
                const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                if (!ta) return;
                const { selectionStart: s } = ta;
                const val = ta.value;
                const insert = `\n### ${key}\n\nMəzmun buraya...\n\n`;
                setField(contentKey(activeLocale), val.slice(0, s) + insert + val.slice(s));
                ev.target.value = '';
              }}
            >
              <option value="">📦 Callout əlavə et</option>
              <option value="Guru kutusu">🎓 Guru kutusu</option>
              <option value="Faydalı məlumat">ℹ️ Faydalı məlumat</option>
              <option value="Praktik tətbiq">🔧 Praktik tətbiq</option>
              <option value="Vacib qeyd">⚠️ Vacib qeyd</option>
              <option value="Hüquqi risk">🚨 Hüquqi risk</option>
              <option value="Doğan notu">📋 Doğan notu</option>
              <option value="Faydalı alət">🔗 Faydalı alət</option>
            </select>

            <span className="mx-1 h-5 w-px bg-slate-300" />

            {/* Toolkit link insert */}
            <select
              className="rounded-lg border-0 bg-transparent px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 cursor-pointer"
              value=""
              onChange={(ev) => {
                const val = ev.target.value;
                if (!val) return;
                const [path, name] = val.split('|');
                const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                if (!ta) return;
                const { selectionStart: s } = ta;
                const content = ta.value;
                const insert = `\n> 🔧 **Faydalı alət:** [${name} →](${path}) | [DK Agency ilə əlaqə →](/elaqe)\n`;
                setField(contentKey(activeLocale), content.slice(0, s) + insert + content.slice(s));
                ev.target.value = '';
              }}
            >
              <option value="">🔗 Toolkit link əlavə et</option>
              <option value="/toolkit/food-cost|Food Cost Kalkulyatoru">💰 Food Cost</option>
              <option value="/toolkit/pnl|P&L Simulyatoru">📊 P&L Simulyator</option>
              <option value="/toolkit/pnl-simulator|P&L Simulator">📈 P&L Simulator</option>
              <option value="/toolkit/menu-matrix|Menyu Matrisi">🍽️ Menyu Matrisi</option>
              <option value="/toolkit/staff-retention|İşçi Saxlama aləti">👥 İşçi Saxlama</option>
              <option value="/toolkit/basabas|Başabaş Kalkulyatoru">⚖️ Başabaş</option>
              <option value="/toolkit/checklist|Açılış Checklisti">✅ Açılış Checklisti</option>
              <option value="/toolkit/aqta-checklist|AQTA Hazırlıq">🏥 AQTA Checklist</option>
              <option value="/toolkit/delivery-calc|Delivery Kalkulyatoru">🚚 Delivery Calc</option>
              <option value="/toolkit/branding-guide|Markalaşma bələdçisi">🎨 Markalaşma</option>
              <option value="/toolkit/insaat-checklist|İnşaat Checklisti">🏗️ İnşaat Checklist</option>
              <option value="/toolkit/personel-planlayici|Personal Planlayıcı">📋 Personal Plan</option>
              <option value="/toolkit/metbex-istasyon|Mətbəx İstasyon">🍳 Mətbəx İstasyon</option>
              <option value="/toolkit/otel-hazirlig-testi|Otel Hazırlıq Testi">🏨 Otel Test</option>
              <option value="/toolkit/ota-hazirlig-testi|OTA Hazırlıq Testi">🌐 OTA Test</option>
              <option value="/toolkit/qonaq-evi-roi-kalkulyatoru|Qonaq Evi ROI">🏠 Qonaq Evi ROI</option>
              <option value="/toolkit/whatsapp-template-paketi|WhatsApp Şablon Paketi">💬 WhatsApp Şablon</option>
            </select>

            <span className="mx-1 h-5 w-px bg-slate-300" />

            {/* Image grid insert */}
            <select
              className="rounded-lg border-0 bg-transparent px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50 cursor-pointer"
              value=""
              onChange={(ev) => {
                const cols = ev.target.value;
                if (!cols) return;
                const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                if (!ta) return;
                const { selectionStart: s } = ta;
                const val = ta.value;
                const placeholder = Array.from({ length: Number(cols) }, (_, i) => `https://res.cloudinary.com/.../image${i + 1}.webp`).join('\n');
                const insert = `\n:::images{cols=${cols}}\n${placeholder}\n:::\n`;
                setField(contentKey(activeLocale), val.slice(0, s) + insert + val.slice(s));
                ev.target.value = '';
              }}
            >
              <option value="">🖼️ Şəkil düzəni</option>
              <option value="1">1 sütun (tam en)</option>
              <option value="2">2 sütun (yan-yana)</option>
              <option value="3">3 sütun</option>
              <option value="4">4 sütun</option>
            </select>

            {/* Gallery insert */}
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
              onClick={() => {
                const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                if (!ta) return;
                const { selectionStart: s } = ta;
                const val = ta.value;
                const insert = `\n:::gallery\nhttps://res.cloudinary.com/.../photo1.webp\nhttps://res.cloudinary.com/.../photo2.webp\nhttps://res.cloudinary.com/.../photo3.webp\n:::\n`;
                setField(contentKey(activeLocale), val.slice(0, s) + insert + val.slice(s));
              }}
            >
              🖼️ Qalereya
            </button>

            {/* Video insert */}
            <button
              type="button"
              className="rounded-lg px-2 py-1 text-xs font-semibold text-violet-700 hover:bg-violet-50"
              onClick={() => {
                const ta = document.getElementById('blog-content-textarea') as HTMLTextAreaElement | null;
                if (!ta) return;
                const { selectionStart: s } = ta;
                const val = ta.value;
                const insert = `\n:::video{src="https://youtube.com/watch?v=VIDEO_ID"}\n`;
                setField(contentKey(activeLocale), val.slice(0, s) + insert + val.slice(s));
              }}
            >
              🎞️ Video
            </button>
          </div>

          <textarea
            id="blog-content-textarea"
            rows={activeLocale === 'az' ? 16 : 10}
            value={post[contentKey(activeLocale)] as string}
            onChange={(e) => setField(contentKey(activeLocale), e.target.value)}
            placeholder={
              activeLocale !== 'az' ? `${activeLocale.toUpperCase()} məzmun tərcüməsi...` : ''
            }
            className="w-full rounded-b-2xl border border-t-0 border-slate-200 bg-white px-4 py-3 font-mono text-sm text-slate-900 outline-none"
          />
          {activeLocale === 'az' && errors.contentAz ? (
            <p className="mt-2 text-xs text-red-600">{errors.contentAz}</p>
          ) : null}

          {activeLocale !== 'az' && post.contentAz ? (
            <details className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <summary className="cursor-pointer text-xs font-bold text-slate-500">
                AZ mənbə məzmunu (referans)
              </summary>
              <pre className="mt-3 max-h-48 overflow-y-auto whitespace-pre-wrap text-xs leading-6 text-slate-600">
                {post.contentAz.slice(0, 500)}
                {post.contentAz.length > 500 ? '...' : ''}
              </pre>
            </details>
          ) : null}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Guru kutuları</h2>
          <button
            type="button"
            onClick={() =>
              post.guruBoxes.length < 5 &&
              setPost((prev) => ({
                ...prev,
                guruBoxes: [...prev.guruBoxes, { guru: '', quote: '', book: '' }],
              }))
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Guru kutusu əlavə et +
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {post.guruBoxes.map((box, index) => (
            <div
              key={`${box.guru}-${index}`}
              className="grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-[1fr_1fr_1fr_auto]"
            >
              <input
                value={box.guru}
                onChange={(e) => setGuruBoxField(index, 'guru', e.target.value)}
                placeholder="Guru adı"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
              <input
                value={box.quote}
                onChange={(e) => setGuruBoxField(index, 'quote', e.target.value)}
                placeholder="Sitat"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
              <input
                value={box.book}
                onChange={(e) => setGuruBoxField(index, 'book', e.target.value)}
                placeholder="Kitab adı"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  setPost((prev) => ({
                    ...prev,
                    guruBoxes: prev.guruBoxes.filter((_, idx) => idx !== index),
                  }))
                }
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => void submitPost('draft')}
          disabled={submitting || uploadingImage}
          className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
        >
          Qaralama olaraq saxla
        </button>
        <button
          type="button"
          onClick={() => void submitPost('published')}
          disabled={submitting || uploadingImage}
          className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60"
        >
          Dərc et
        </button>
        <button
          type="button"
          onClick={() => window.open(`/blog/${post.slug || ''}`, '_blank')}
          className="rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700"
        >
          Önizlə
        </button>
      </div>
    </div>
  );
}
