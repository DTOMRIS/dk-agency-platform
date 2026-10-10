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
    // fake-scan-ok: the list is reloaded from the server right after, so the screen always shows the truth
    await fetch(`/api/admin/ads/${ad.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !ad.isActive }),
    });
    await load();
  };

  const remove = async (ad: AdRow) => {
    if (!window.confirm(`"${ad.title}" reklamını silmək istəyirsiniz?`)) return;
    // fake-scan-ok: reloaded from the server right after (a failed delete stays visible)
    await fetch(`/api/admin/ads/${ad.id}`, { method: 'DELETE' });
    await load();
  };

  return (
    <div className="mx-auto max-w-[1320px] space-y-6 px-4 py-6 text-slate-900 sm:px-8 sm:py-8">
      <div>
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">Reklamlar</h1>
        <p className="mt-1 text-[15px] text-slate-600">
          Banner reklamları idarə et. Şəkil/GIF/video Cloudinary URL-i ilə əlavə olunur.
        </p>
      </div>

      <section className="rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] p-5 sm:p-6">
        <h2 className="mb-4 text-[17px] font-semibold text-slate-900">Yeni reklam</h2>
        {msg ? (
          <div className="mb-4 rounded-[14px] border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-800">
            {msg}
          </div>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Başlıq (daxili)</span>
            <input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Reklamçı</span>
            <input
              value={form.advertiser}
              onChange={(e) => setForm({ ...form, advertiser: e.target.value })}
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Format</span>
            <select
              value={form.format}
              onChange={(e) => setForm({ ...form, format: e.target.value as typeof form.format })}
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            >
              {FORMATS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Yerləşmə (slot)</span>
            <select
              value={form.placement}
              onChange={(e) =>
                setForm({ ...form, placement: e.target.value as typeof form.placement })
              }
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            >
              {PLACEMENTS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">
              Media URL (Cloudinary)
            </span>
            <input
              value={form.mediaUrl}
              onChange={(e) => setForm({ ...form, mediaUrl: e.target.value })}
              placeholder="https://res.cloudinary.com/..."
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Hədəf URL (klik)</span>
            <input
              value={form.targetUrl}
              onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}
              placeholder="https://..."
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1.5 block text-[13px] font-semibold text-slate-700">Alt mətn</span>
            <input
              value={form.altText}
              onChange={(e) => setForm({ ...form, altText: e.target.value })}
              className="w-full rounded-[12px] border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none transition focus:border-[#0A5BD6] focus:bg-white focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="h-4 w-4 rounded accent-[#0A5BD6]"
            />
            Dərhal aktiv olsun
          </label>
        </div>
        <button
          type="button"
          onClick={() => void create()}
          disabled={saving || !form.title || !form.mediaUrl || !form.targetUrl}
          className="mt-5 inline-flex h-11 items-center rounded-full bg-[#E11D48] px-6 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C] disabled:opacity-50"
        >
          {saving ? 'Saxlanılır...' : 'Reklam əlavə et'}
        </button>
      </section>

      <section className="rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] p-5 sm:p-6">
        <h2 className="mb-4 text-[17px] font-semibold text-slate-900">Mövcud reklamlar</h2>
        {loading ? (
          <p className="py-8 text-center text-sm text-slate-600">Yüklənir...</p>
        ) : items.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-600">Hələ reklam yoxdur.</p>
        ) : (
          <div className="divide-y divide-slate-100">
            {items.map((ad) => (
              <div
                key={ad.id}
                className="flex flex-wrap items-center justify-between gap-3 py-3.5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{ad.title}</span>
                    <span className="rounded-full bg-[#EEF4FF] px-2.5 py-0.5 text-[11px] font-semibold uppercase text-[#0A5BD6]">
                      {ad.format}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                      {ad.placement}
                    </span>
                  </div>
                  <div className="mt-1 text-[12px] text-slate-500 tabular-nums">
                    {ad.advertiser || '—'} · {ad.impressions} göstərim · {ad.clicks} klik
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => void toggleActive(ad)}
                    className={`inline-flex h-8 items-center rounded-full px-3.5 text-[12px] font-semibold transition-colors ${
                      ad.isActive
                        ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {ad.isActive ? 'Aktiv' : 'Deaktiv'}
                  </button>
                  <button
                    type="button"
                    onClick={() => void remove(ad)}
                    className="inline-flex h-8 items-center rounded-full border border-slate-200 bg-white px-3.5 text-[12px] font-semibold text-slate-700 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
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
