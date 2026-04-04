'use client';

import { useEffect, useState } from 'react';

interface NewsSourceRow {
  id: number;
  name: string;
  url: string;
  rssUrl: string;
  language: 'en' | 'tr' | 'az';
  category: 'operations' | 'finance' | 'growth' | 'market' | 'technology';
  isActive: boolean;
  lastFetchedAt: string | null;
}

export default function DashboardXeberlerRssPage() {
  const [sources, setSources] = useState<NewsSourceRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadSources() {
    setLoading(true);
    try {
      const response = await fetch('/api/news/admin?resource=sources');
      if (!response.ok) throw new Error('load failed');
      const payload = (await response.json()) as { data?: NewsSourceRow[] };
      setSources(payload.data || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadSources();
  }, []);

  async function toggleSource(id: number, isActive: boolean) {
    const response = await fetch(`/api/news/sources/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive }),
    });

    if (response.ok) {
      setSources((prev) => prev.map((item) => (item.id === id ? { ...item, isActive } : item)));
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">RSS menbeleri</h1>
          <p className="mt-3 text-sm text-slate-500">
            `news_sources` cedveli uzerinden source statusu ve son fetch vaxti idare olunur.
          </p>
        </div>

        <div className="grid gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_160px_160px_200px_120px]"
            >
              <div>
                <div className="text-sm font-bold text-[var(--dk-navy)]">{source.name}</div>
                <div className="mt-1 text-xs text-slate-500">{source.url}</div>
              </div>
              <div className="truncate rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {source.rssUrl}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {source.language}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {source.category}
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                {source.lastFetchedAt
                  ? new Date(source.lastFetchedAt).toLocaleString('az-AZ')
                  : 'Hele fetch edilmeyib'}
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input
                  type="checkbox"
                  checked={source.isActive}
                  onChange={(e) => void toggleSource(source.id, e.target.checked)}
                />
                Aktiv
              </label>
            </div>
          ))}
        </div>

        {!loading && sources.length === 0 ? (
          <div className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Source tapilmadi.
          </div>
        ) : null}
      </div>
    </div>
  );
}
