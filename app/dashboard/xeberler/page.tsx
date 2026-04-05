'use client';

import { ChangeEvent, useEffect, useState } from 'react';
import { compressImage, validateImage } from '@/lib/utils/imageUtils';

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
  const [uploadingImage, setUploadingImage] = useState(false);
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

  async function handleEditorImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !editorDraft) return;

    setError(null);
    setToast(null);

    const validation = validateImage(file);
    if (!validation.valid) {
      setError(validation.error || 'Sekil secilemedi.');
      event.target.value = '';
      return;
    }

    setUploadingImage(true);
    try {
      const compressed = await compressImage(file, {
        maxWidth: 1400,
        maxHeight: 1400,
        maxSizeKB: 350,
        quality: 0.82,
      });

      const formData = new FormData();
      formData.append('file', compressed.file);
      formData.append('listingId', `news-${editorDraft.id}`);
      formData.append('folder', `dk-agency/news/${editorDraft.id}`);

      const response = await fetch('/api/upload?purpose=news-admin', {
        method: 'POST',
        body: formData,
      });
      const payload = (await response.json()) as { success?: boolean; error?: string; url?: string };

      if (!response.ok || !payload.url) {
        throw new Error(payload.error || `upload failed (${response.status})`);
      }

      setEditorDraft((prev) => (prev ? { ...prev, imageUrl: payload.url || '' } : prev));
      setToast(`Sekil yuklendi ve kicildildi: ${compressed.reduction}`);
    } catch (uploadError) {
      const message = uploadError instanceof Error ? uploadError.message : 'Sekil yuklenmedi';
      setError(message);
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
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
            <div className="max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-[32px] bg-white p-6 shadow-2xl lg:p-8">
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

              <div className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
                <div className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50 p-5">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Original basliq</div>
                    <div className="mt-2 text-lg font-bold leading-8 text-[var(--dk-navy)]">{editorDraft.title}</div>
                  </div>
                  <div className="rounded-3xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <div className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Original xulase</div>
                    <div className="mt-3 max-h-[360px] overflow-y-auto pr-2 text-[15px] leading-8 text-slate-700">
                      {editorDraft.summary || 'Xulase yoxdur.'}
                    </div>
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

                <div className="space-y-5 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-black uppercase tracking-[0.14em] text-slate-500">AZ basliq</label>
                      <span className="text-xs font-semibold text-slate-400">{editorDraft.titleAz.trim().length} simvol</span>
                    </div>
                    <input
                      value={editorDraft.titleAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, titleAz: event.target.value } : prev))
                      }
                      placeholder="Tercume olunmus basliq daxil edin"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] font-medium text-slate-900 outline-none transition focus:border-[var(--dk-gold)] focus:bg-white"
                    />
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <label className="block text-sm font-black uppercase tracking-[0.14em] text-slate-500">AZ xulase</label>
                      <span className="text-xs font-semibold text-slate-400">{editorDraft.summaryAz.trim().length} simvol</span>
                    </div>
                    <textarea
                      rows={12}
                      value={editorDraft.summaryAz}
                      onChange={(event) =>
                        setEditorDraft((prev) => (prev ? { ...prev, summaryAz: event.target.value } : prev))
                      }
                      placeholder="Xeberin qisa AZ xulasesini burada redakte edin"
                      className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-[15px] leading-8 text-slate-900 outline-none transition focus:border-[var(--dk-gold)] focus:bg-white"
                    />
                  </div>
                  <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black uppercase tracking-[0.14em] text-slate-500">Sekil</div>
                        <p className="mt-1 text-xs text-slate-500">
                          Sekil secilir, brauzerde kicildilir, sonra yuklenir. Belece hem oxunaqli qalir hem de yer tutmur.
                        </p>
                      </div>
                      <label className="inline-flex cursor-pointer rounded-full bg-[var(--dk-navy)] px-4 py-2 text-sm font-bold text-white">
                        {uploadingImage ? 'Yuklenir...' : 'Sekil elave et'}
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={(event) => void handleEditorImage(event)}
                          className="hidden"
                          disabled={uploadingImage}
                        />
                      </label>
                    </div>

                    {editorDraft.imageUrl ? (
                      <div className="mt-4 overflow-hidden rounded-3xl border border-slate-200 bg-white">
                        <img
                          src={editorDraft.imageUrl}
                          alt={editorDraft.titleAz || editorDraft.title}
                          className="h-48 w-full object-cover"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <p className="text-xs text-slate-500">Bu sekil public kartda ve detail sehifede gosterilecek.</p>
                          <button
                            type="button"
                            onClick={() => setEditorDraft((prev) => (prev ? { ...prev, imageUrl: '' } : prev))}
                            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
                          >
                            Sekli sil
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="mt-4 rounded-3xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center text-sm text-slate-500">
                        Hele sekil elave olunmayib. Kart daha guclu gorunsun deye burada cover sekil secmek yaxsidir.
                      </div>
                    )}
                  </div>

                  <div className="rounded-3xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    Kisaca redaktor qaydasi: basliq qisa ve aydin olsun, xulase 2-4 cumlelik qalsin, sekil varsa yemek ve ya brend vizuali kimi guclu kadr secilsin.
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
