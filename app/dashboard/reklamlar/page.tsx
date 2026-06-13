'use client';

import { useEffect, useState } from 'react';

const FORMATS = ['image', 'gif', 'video'] as const;
const PLACEMENTS = [
  'home-mid',
  'news-sidebar',
  'news-inline',
  'blog-sidebar',
  'blog-inline',
] as const;

interface AdRow {
  id: number;
  title: string;
  format: string;
  mediaUrl: string;
  targetUrl: string;
  placement: string;
  advertiser: string | null;
  isActive: boolean;
  impressions: number;
  clicks: number;
}

const EMPTY_FORM = {
  title: '',
  format: 'image' as (typeof FORMATS)[number],
  mediaUrl: '',
  targetUrl: '',
  placement: 'home-mid' as (typeof PLACEMENTS)[number],
  advertiser: '',
  altText: '',
  isActive: false,
};

export default function ReklamlarPage() {
  const [items, setItems] = useState<AdRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ads');
      const data = await res.json().catch(() => null);
      if (res.ok && data?.data) setItems(data.data as AdRow[]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async () => {
    setSaving(true);
    setMsg('');
    try {
      const res = await fetch('/api/admin/ads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setMsg((data as { error?: string } | null)?.error || 'Reklam yaradılmadı.');
        return;
      }
      setForm({ ...EMPTY_FORM });
      setMsg('Reklam əlavə olundu.');
      await load();
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ad: AdRow) => {
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    await load();
  };

  const remove = async (ad: AdRow) => {
    if (!window.confirm(`"${ad.title}" reklamını silmək istəyirsiniz?`)) return;
    await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="space-y-8 p-6 text-slate-900">
      <div>
        <h1 className="font-display text-3xl font-bold text-slate-900">Reklamlar</h1>
        <p className="mt-1 text-sm text-slate-600">
          Banner reklamları idarə et. Şəkil/GIF/video Cloudinary URL-i ilə əlavə olunur.
        </p>
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Yeni reklam</h2>
        {msg ? (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700">
            {msg}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-700">Başlıq (daxili)</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-700">Reklamçı</span>
            <input
              value={form.advertiser}
              onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-700">Format</span>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value as typeof form.format })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-bold text-slate-700">Yerləşmə (slot)</span>
            <select
              value={form.placement}
              onChange={(e) =>
                setForm({ ...form, placement: e.target.value as typeof form.placement })
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-bold text-slate-700">
              Media URL (Cloudinary)
            </span>
            <input
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-bold text-slate-700">Hədəf URL (klik)</span>
            <input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-sm font-bold text-slate-700">Alt mətn</span>
            <input
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-slate-900 outline-none"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded"
            />
            Dərhal aktiv olsun
          </label>
        </div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={saving || !form.title || !form.mediaUrl || !form.targetUrl}
          className="mt-5 min-h-[44px] rounded-full bg-[#E94560] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {saving ? 'Saxlanılır...' : 'Reklam əlavə et'}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold text-slate-900">Mövcud reklamlar</h2>
        {loading ? (
          <p className="text-sm text-slate-500">Yüklənir...</p>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500">Hələ reklam yoxdur.</p>
        ) : (
          <div className="space-y-3">
            {items.map((ad) => (
              <div
                key={ad.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{ad.title}</span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-600">
                      {ad.format}
                    </span>
                    <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                      {ad.placement}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    {ad.advertiser || '—'} · {ad.impressions} göstərim · {ad.clicks} klik
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(ad)}
                    className={`rounded-full px-4 py-2 text-xs font-bold ${
                      ad.isActive
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {ad.isActive ? 'Aktiv' : 'Deaktiv'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(ad)}
                    className="rounded-full border border-red-200 px-4 py-2 text-xs font-bold text-red-600"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
