'use client';

import { useEffect, useState } from 'react';
import { formatAzDateTime } from '@/lib/i18n/format';

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
    <div className="min-h-screen bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
          <h1 className="text-[32px] font-bold tracking-tight text-[#0F172A] sm:text-[38px]">RSS mənbələri</h1>
          <p className="mt-3 text-sm text-[#5B6474]">
            `news_sources` cədvəli üzrə mənbənin statusu və son yoxlama vaxtı.
          </p>
        </div>

        <div className="grid gap-4">
          {sources.map((source) => (
            <div
              key={source.id}
              className="grid gap-4 rounded-[22px] border border-[#E4DCCD] bg-white p-5 min-w-0 md:grid-cols-2 2xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1.4fr)_120px_140px_180px_auto]"
            >
              <div>
                <div className="text-sm font-bold text-[#0F172A]">{source.name}</div>
                <div className="mt-1 text-xs text-[#5B6474]">{source.url}</div>
              </div>
              <div className="truncate rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#334155]">
                {source.rssUrl}
              </div>
              <div className="rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#334155]">
                {source.language}
              </div>
              <div className="rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#334155]">
                {source.category}
              </div>
              <div className="rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] px-4 py-3 text-sm text-[#334155]">
                {source.lastFetchedAt
                  ? formatAzDateTime(source.lastFetchedAt)
                  : 'Hələ yoxlanmayıb'}
              </div>
              <label className="inline-flex items-center gap-3 rounded-2xl bg-[#FBF8F3] px-4 py-3 text-sm font-semibold text-[#334155]">
                <input
                  type="checkbox"
                  checked={source.isActive}
                  className="h-4 w-4 accent-[#0F172A]"
                  onChange={(e) => void toggleSource(source.id, e.target.checked)}
                />
                Aktiv
              </label>
            </div>
          ))}
        </div>

        {!loading && sources.length === 0 ? (
          <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 text-sm text-[#5B6474] shadow-sm">
            Source tapilmadi.
          </div>
        ) : null}
      </div>
    </div>
  );
}
