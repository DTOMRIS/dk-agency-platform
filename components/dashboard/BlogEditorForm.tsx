'use client';

import { ChangeEvent, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';

const AUTHOR_OPTIONS = ['Doğan Tomris', 'DK Agency', 'Qonaq Müəllif'] as const;
const CATEGORY_OPTIONS = ['Maliyyə', 'Əməliyyat', 'Kadr', 'Hüquqi', 'Satış', 'Marketinq'] as const;
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
  category: string;
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
  featuredImage?: string;
  guruBoxes: Array<{
    guru: string;
    quote: string;
    book: string;
  }>;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/ə/g, 'e')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/ğ/g, 'g')
    .replace(/ı/g, 'i')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const EMPTY_DRAFT: BlogDraft = {
  slug: '',
  titleAz: '',
  titleTr: '',
  titleEn: '',
  category: 'Maliyyə',
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
  featuredImage: '',
  guruBoxes: [],
};

export default function BlogEditorForm({ initialPost }: { initialPost?: BlogDraft }) {
  const router = useRouter();
  const [post, setPost] = useState<BlogDraft>(initialPost ?? EMPTY_DRAFT);
  const [imagePreview, setImagePreview] = useState(initialPost?.featuredImage || '');
  const [toast, setToast] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ titleAz?: string; slug?: string; contentAz?: string }>({});

  const [seoTitleCount, seoDescriptionCount, doganNoteCount] = useMemo(
    () => [post.seoTitle.length, post.seoDescription.length, post.doganNote.length],
    [post],
  );

  const setField = (key: keyof BlogDraft, value: string | number | boolean) =>
    setPost((prev) => ({ ...prev, [key]: value }));

  const setGuruBoxField = (index: number, key: 'guru' | 'quote' | 'book', value: string) =>
    setPost((prev) => ({
      ...prev,
      guruBoxes: prev.guruBoxes.map((item, idx) => (idx === index ? { ...item, [key]: value } : item)),
    }));

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(''), 2200);
  };

  const translateField = (field: 'title' | 'content', locale: 'tr' | 'en') => {
    console.log('blog_translate', { field, locale, source: field === 'title' ? post.titleAz : post.contentAz });
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

    const compressed = await compressImage(file, { maxWidth: 1200, maxHeight: 1200, maxSizeKB: 500 });
    setImagePreview(compressed.preview);
    setField('featuredImage', compressed.preview);
    showToast(`Şəkil hazırlandı: ${compressed.reduction}`);
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

    setSubmitting(true);
    const payload = {
      ...post,
      status: nextStatus,
      featuredImage: imagePreview || post.featuredImage || '',
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
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Başlıq (AZ)</label>
            <input
              value={post.titleAz}
              onChange={(e) => {
                const title = e.target.value;
                setField('titleAz', title);
                if (!initialPost) setField('slug', slugify(title));
              }}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            {errors.titleAz ? <p className="mt-2 text-xs text-red-600">{errors.titleAz}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={post.titleTr}
              onChange={(e) => setField('titleTr', e.target.value)}
              placeholder="Başlıq (TR)"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            <button type="button" onClick={() => translateField('title', 'tr')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Tərcümə
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <input
              value={post.titleEn}
              onChange={(e) => setField('titleEn', e.target.value)}
              placeholder="Başlıq (EN)"
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            <button type="button" onClick={() => translateField('title', 'en')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Tərcümə
            </button>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Slug</label>
            <input
              value={post.slug}
              onChange={(e) => setField('slug', e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
            />
            {errors.slug ? <p className="mt-2 text-xs text-red-600">{errors.slug}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Kateqoriya</label>
              <select value={post.category} onChange={(e) => setField('category', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
                {CATEGORY_OPTIONS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">Müəllif</label>
              <select value={post.author} onChange={(e) => setField('author', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none">
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
            <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-slate-300 px-4 py-6 text-sm font-semibold text-slate-600">
              Şəkil yüklə
              <input type="file" accept="image/*" className="hidden" onChange={(e) => void handleImage(e)} />
            </label>
            {imagePreview ? <img src={imagePreview} alt="Preview" className="mt-4 h-52 w-full rounded-3xl object-cover" /> : null}
          </div>
        </div>

        <div className="space-y-4 rounded-[28px] bg-slate-50 p-5">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">SEO title ({seoTitleCount}/60)</label>
            <input maxLength={60} value={post.seoTitle} onChange={(e) => setField('seoTitle', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">SEO description ({seoDescriptionCount}/160)</label>
            <textarea maxLength={160} rows={4} value={post.seoDescription} onChange={(e) => setField('seoDescription', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Doğan notu ({doganNoteCount}/200)</label>
            <textarea maxLength={200} rows={4} value={post.doganNote} onChange={(e) => setField('doganNote', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
          </div>

          <label className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={post.paywall} onChange={(e) => setField('paywall', e.target.checked)} />
            30%-dən sonra paywall tətbiq et
          </label>

          <div className="space-y-2">
            <div className="text-sm font-bold text-slate-700">Status</div>
            {STATUS_OPTIONS.map((item) => (
              <label key={item.value} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 text-sm text-slate-700">
                <input type="radio" checked={post.status === item.value} onChange={() => setField('status', item.value)} />
                {item.label}
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">Məzmun (AZ)</label>
            <textarea rows={12} value={post.contentAz} onChange={(e) => setField('contentAz', e.target.value)} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            {errors.contentAz ? <p className="mt-2 text-xs text-red-600">{errors.contentAz}</p> : null}
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <textarea rows={8} value={post.contentTr} onChange={(e) => setField('contentTr', e.target.value)} placeholder="Məzmun (TR)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <button type="button" onClick={() => translateField('content', 'tr')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Tərcümə
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <textarea rows={8} value={post.contentEn} onChange={(e) => setField('contentEn', e.target.value)} placeholder="Məzmun (EN)" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
            <button type="button" onClick={() => translateField('content', 'en')} className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
              Tərcümə
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-display text-2xl font-black text-[var(--dk-navy)]">Guru kutuları</h2>
          <button
            type="button"
            onClick={() =>
              post.guruBoxes.length < 5 &&
              setPost((prev) => ({ ...prev, guruBoxes: [...prev.guruBoxes, { guru: '', quote: '', book: '' }] }))
            }
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
          >
            Guru kutusu əlavə et +
          </button>
        </div>

        <div className="mt-5 grid gap-4">
          {post.guruBoxes.map((box, index) => (
            <div key={`${box.guru}-${index}`} className="grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input value={box.guru} onChange={(e) => setGuruBoxField(index, 'guru', e.target.value)} placeholder="Guru adı" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={box.quote} onChange={(e) => setGuruBoxField(index, 'quote', e.target.value)} placeholder="Sitat" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={box.book} onChange={(e) => setGuruBoxField(index, 'book', e.target.value)} placeholder="Kitab adı" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <button type="button" onClick={() => setPost((prev) => ({ ...prev, guruBoxes: prev.guruBoxes.filter((_, idx) => idx !== index) }))} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700">
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={() => void submitPost('draft')} disabled={submitting} className="rounded-full border border-slate-200 px-6 py-3 text-sm font-bold text-slate-700 disabled:opacity-60">
          Qaralama olaraq saxla
        </button>
        <button type="button" onClick={() => void submitPost('published')} disabled={submitting} className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white disabled:opacity-60">
          Dərc et
        </button>
        <button type="button" onClick={() => window.open(`/blog/${post.slug || ''}`, '_blank')} className="rounded-full border border-amber-200 bg-amber-50 px-6 py-3 text-sm font-bold text-amber-700">
          Önizlə
        </button>
      </div>
    </div>
  );
}
