'use client';

import { useEffect, useState } from 'react';

type FilterStatus = 'all' | 'fetched' | 'translated' | 'approved' | 'rejected';

interface AdminNewsRow {
  id: number;
  sourceName: string | null;
  title: string;
  titleAz: string | null;
  category: string;
  status: FilterStatus;
  isEditorPick: boolean;
  publishedAt: string;
}

export default function DashboardXeberlerPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [items, setItems] = useState<AdminNewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function loadNews(nextFilter: FilterStatus) {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (nextFilter !== 'all') params.set('status', nextFilter);
      const requestUrl = `/api/news/admin?${params.toString()}`;
      console.log('[dashboard/xeberler] loadNews', {
        filter: nextFilter,
        sentStatusParam: params.get('status'),
        requestUrl,
      });

      const response = await fetch(requestUrl);
      const payload = (await response.json()) as { data?: AdminNewsRow[]; error?: string; total?: number; source?: string };

      console.log('[dashboard/xeberler] response', {
        filter: nextFilter,
        ok: response.ok,
        status: response.status,
        total: payload.total,
        source: payload.source,
        received: payload.data?.length || 0,
        error: payload.error,
      });

      if (!response.ok) {
        throw new Error(payload.error || `load failed (${response.status})`);
      }

      setItems(payload.data || []);
      if (!payload.data?.length) {
        console.log('[dashboard/xeberler] empty-result', {
          filter: nextFilter,
          payload,
        });
      }
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Xeberler yuklenmedi';
      console.error('[dashboard/xeberler] load failed', {
        filter: nextFilter,
        error: message,
      });
      setError(message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadNews(filter);
  }, [filter]);

  async function updateItem(id: number, body: { status?: FilterStatus; isEditorPick?: boolean }) {
    const response = await fetch(`/api/news/admin/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.ok) {
      await loadNews(filter);
    }
  }

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Xeberler idaresi</h1>
          <p className="mt-3 text-sm text-slate-500">
            Review paneli artik `news_articles` ve `news_sources` cedvellerinden qidalanir.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            ['all', 'Hamisi'],
            ['fetched', 'Fetched'],
            ['translated', 'Translated'],
            ['approved', 'Approved'],
            ['rejected', 'Rejected'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value as FilterStatus)}
              className={`rounded-full px-5 py-3 text-sm font-bold ${
                filter === value ? 'bg-[var(--dk-red)] text-white' : 'border border-slate-200 text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700">
            Xeber listesi yuklenmedi: {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-400">
              <tr>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Original</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">AZ tercume</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Menbe</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Status</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Tarix</th>
                <th className="px-5 py-4 font-black uppercase tracking-[0.18em]">Emeliyyat</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-slate-100 align-top">
                  <td className="px-5 py-4 font-semibold text-[var(--dk-navy)]">
                    <div>{item.title}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.category}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{item.titleAz || 'Tercume gozleyir'}</td>
                  <td className="px-5 py-4 text-slate-600">{item.sourceName || 'Menbe yoxdu'}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        item.status === 'approved'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'rejected'
                            ? 'bg-rose-50 text-rose-700'
                            : item.status === 'translated'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.status}
                    </span>
                    {item.isEditorPick ? (
                      <div className="mt-2 text-[11px] font-bold text-[var(--dk-gold)]">Editor pick</div>
                    ) : null}
                  </td>
                  <td className="px-5 py-4 text-slate-500">
                    {new Date(item.publishedAt).toLocaleDateString('az-AZ')}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { status: 'approved' })}
                        className="rounded-full bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700"
                      >
                        Tesdiqle
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { status: 'rejected', isEditorPick: false })}
                        className="rounded-full bg-rose-50 px-3 py-2 text-xs font-bold text-rose-700"
                      >
                        Redd et
                      </button>
                      <button
                        type="button"
                        onClick={() => void updateItem(item.id, { isEditorPick: !item.isEditorPick })}
                        className="rounded-full bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                      >
                        Editor Pick
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && items.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-slate-500">Bu filtre gore xeber tapilmadi.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
