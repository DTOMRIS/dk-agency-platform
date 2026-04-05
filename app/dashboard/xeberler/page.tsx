'use client';

import { useEffect, useState } from 'react';

type FilterStatus = 'all' | 'fetched' | 'translated' | 'approved' | 'rejected';

interface AdminNewsRow {
  id: number;
  sourceName: string | null;
  externalUrl: string | null;
  slug: string | null;
  title: string;
  summary: string | null;
  titleAz: string | null;
  summaryAz: string | null;
  category: string;
  imageUrl: string | null;
  author: string | null;
  status: FilterStatus;
  isEditorPick: boolean;
  publishedAt: string;
}

interface EditorDraft {
  id: number;
  title: string;
  summary: string | null;
  titleAz: string;
  summaryAz: string;
  imageUrl: string;
  externalUrl: string | null;
  status: FilterStatus;
}

export default function DashboardXeberlerPage() {
  const [filter, setFilter] = useState<FilterStatus>('all');
  const [items, setItems] = useState<AdminNewsRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [savingEditor, setSavingEditor] = useState(false);
  const [editorDraft, setEditorDraft] = useState<EditorDraft | null>(null);

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
    setError(null);
    setToast(null);
    try {
      console.log('[dashboard/xeberler] updateItem', { id, body });
      const response = await fetch(`/api/news/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; source?: string };

      console.log('[dashboard/xeberler] updateItem response', {
        id,
        ok: response.ok,
        status: response.status,
        payload,
      });

      if (!response.ok) {
        throw new Error(payload.error || `update failed (${response.status})`);
      }

      setToast('Xeber yenilendi.');
      await loadNews(filter);
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'Xeber yenilenmedi';
      console.error('[dashboard/xeberler] update failed', { id, body, error: message });
      setError(message);
    }
  }

  function openEditor(item: AdminNewsRow) {
    setError(null);
    setToast(null);
    setEditorDraft({
      id: item.id,
      title: item.title,
      summary: item.summary,
      titleAz: item.titleAz || '',
      summaryAz: item.summaryAz || '',
      imageUrl: item.imageUrl || '',
      externalUrl: item.externalUrl,
      status: item.status,
    });
  }

  async function saveEditor(nextStatus?: FilterStatus) {
    if (!editorDraft) return;

    setSavingEditor(true);
    setError(null);
    setToast(null);
    try {
      const payload = {
        titleAz: editorDraft.titleAz.trim(),
        summaryAz: editorDraft.summaryAz.trim(),
        imageUrl: editorDraft.imageUrl.trim() || null,
        status: nextStatus || (editorDraft.status === 'fetched' ? 'translated' : editorDraft.status),
      };

      const response = await fetch(`/api/news/admin/${editorDraft.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const body = (await response.json()) as { success?: boolean; error?: string };
      if (!response.ok) {
        throw new Error(body.error || `save failed (${response.status})`);
      }

      setToast(nextStatus === 'approved' ? 'Xeber duzelisden sonra tesdiqlendi.' : 'Xeber duzelisi saxlanildi.');
      setEditorDraft(null);
      await loadNews(filter);
    } catch (saveError) {
      const message = saveError instanceof Error ? saveError.message : 'Duzelis saxlanilmadi';
      setError(message);
    } finally {
      setSavingEditor(false);
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

        {toast ? (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-700">
            {toast}
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
                        onClick={() => openEditor(item)}
                        className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                      >
                        Duzelis et
                      </button>
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

        {editorDraft ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 px-4 py-8">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-3xl font-black text-[var(--dk-navy)]">Xeber redaktoru</h2>
                  <p className="mt-2 text-sm text-slate-500">
                    Orijinal mezmundan AZ versiya hazirla, sekil elave et, sonra translated ve ya approved et.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditorDraft(null)}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-bold text-slate-600"
                >
                  Bagla
                </button>
              </div>

              <div className="mt-6 grid gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Original basliq</div>
                    <div className="mt-2 text-base font-bold text-[var(--dk-navy)]">{editorDraft.title}</div>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Original xulase</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{editorDraft.summary || 'Xulase yoxdur.'}</p>
                  </div>
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Orijinal menbe</div>
                    {editorDraft.externalUrl ? (
                      <a
                        href={editorDraft.externalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex text-sm font-bold text-[var(--dk-red)] underline"
                      >
                        Menbeye kec
                      </a>
                    ) : (
                      <p className="mt-2 text-sm text-slate-500">Link yoxdur.</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditorDraft((prev) =>
                        prev
                          ? {
                              ...prev,
                              titleAz: prev.titleAz || prev.title,
                              summaryAz: prev.summaryAz || prev.summary || '',
                            }
                          : prev,
                      )
                    }
                    className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700"
                  >
                    Originaldan draft yarat
                  </button>
                </div>

                <div className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">AZ basliq</label>
                    <input
                      value={editorDraft.titleAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, titleAz: event.target.value } : prev))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--dk-gold)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">AZ xulase</label>
                    <textarea
                      rows={10}
                      value={editorDraft.summaryAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, summaryAz: event.target.value } : prev))
                      }
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm leading-7 outline-none focus:border-[var(--dk-gold)]"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">Sekil URL</label>
                    <input
                      value={editorDraft.imageUrl}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, imageUrl: event.target.value } : prev))
                      }
                      placeholder="https://..."
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[var(--dk-gold)]"
                    />
                    <p className="mt-2 text-xs text-slate-400">Public kartda ve detail sehifede bu sekil gosterilecek.</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  disabled={savingEditor}
                  onClick={() => void saveEditor('translated')}
                  className="rounded-full border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 disabled:opacity-60"
                >
                  {savingEditor ? 'Saxlanilir...' : 'Translated kimi saxla'}
                </button>
                <button
                  type="button"
                  disabled={savingEditor || !editorDraft.titleAz.trim() || !editorDraft.summaryAz.trim()}
                  onClick={() => void saveEditor('approved')}
                  className="rounded-full bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white disabled:opacity-60"
                >
                  {savingEditor ? 'Tesdiqlenir...' : 'Yayina hazirla ve tesdiqle'}
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
