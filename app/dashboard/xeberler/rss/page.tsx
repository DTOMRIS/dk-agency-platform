'use client';

import { useState } from 'react';
import { defaultNewsSources } from '@/lib/data/newsSources';

export default function DashboardXeberlerRssPage() {
  const [sources, setSources] = useState(defaultNewsSources);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex items-center justify-between gap-4 rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">RSS Mənbələri</h1>
            <p className="mt-3 text-sm text-slate-500">n8n workflow qoşulanda bu siyahıdan avtomatik feed çəkiləcək.</p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => console.log('rss_fetch_now')} className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">İndi çək</button>
            <button type="button" onClick={() => setSources((prev) => [...prev, { name: '', url: '', rssUrl: '', language: 'en', category: 'market', isActive: true }])} className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white">Yeni mənbə əlavə et</button>
          </div>
        </div>

        <div className="grid gap-4">
          {sources.map((source, index) => (
            <div key={`${source.name}-${index}`} className="grid gap-4 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-2 xl:grid-cols-[1fr_1fr_160px_160px_120px]">
              <input value={source.name} onChange={(e) => setSources((prev) => prev.map((item, idx) => (idx === index ? { ...item, name: e.target.value } : item)))} placeholder="Mənbə adı" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={source.rssUrl} onChange={(e) => setSources((prev) => prev.map((item, idx) => (idx === index ? { ...item, rssUrl: e.target.value } : item)))} placeholder="RSS URL" className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={source.language} onChange={(e) => setSources((prev) => prev.map((item, idx) => (idx === index ? { ...item, language: e.target.value as 'en' | 'tr' | 'az' } : item)))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <input value={source.category} onChange={(e) => setSources((prev) => prev.map((item, idx) => (idx === index ? { ...item, category: e.target.value as typeof source.category } : item)))} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none" />
              <label className="inline-flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={source.isActive} onChange={(e) => setSources((prev) => prev.map((item, idx) => (idx === index ? { ...item, isActive: e.target.checked } : item)))} />
                Aktiv
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
