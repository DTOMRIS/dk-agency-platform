'use client';

import { useState } from 'react';
import { adminToolkitCards } from '@/lib/data/adminContent';

export default function DashboardToolkitPage() {
  const [items, setItems] = useState(adminToolkitCards);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toast, setToast] = useState('');

  const moveItem = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= items.length) return;
    setItems((prev) => {
      const clone = [...prev];
      const [item] = clone.splice(index, 1);
      clone.splice(nextIndex, 0, item);
      return clone;
    });
  };

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <h1 className="font-display text-4xl font-black text-[var(--dk-navy)]">Toolkit İdarəsi</h1>
          <p className="mt-3 text-sm text-slate-500">Başla və Böyüt qruplarındakı bütün alətlər burada ayrıca redaktə olunur.</p>
        </div>

        {toast ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">{toast}</div> : null}

        <div className="grid gap-4">
          {items.map((item, index) => (
            <div key={item.id} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">{item.icon}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item.category}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setItems((prev) => prev.map((entry) => (entry.id === item.id ? { ...entry, active: !entry.active } : entry)))
                      }
                      className={`rounded-full px-3 py-1 text-xs font-bold ${item.active ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {item.active ? 'Aktiv' : 'Deaktiv'}
                    </button>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-black text-[var(--dk-navy)]">{item.titleAz}</h2>
                  <p className="mt-2 text-sm text-slate-500">{item.descriptionAz}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button type="button" onClick={() => moveItem(index, -1)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Yuxarı</button>
                  <button type="button" onClick={() => moveItem(index, 1)} className="rounded-full border border-slate-200 px-4 py-2 text-xs font-bold text-slate-700">Aşağı</button>
                  <button type="button" onClick={() => setEditingId(editingId === item.id ? null : item.id)} className="rounded-full bg-[var(--dk-red)] px-4 py-2 text-xs font-bold text-white">Düzəlt</button>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="mt-5 grid gap-4 rounded-3xl bg-slate-50 p-5 md:grid-cols-2">
                  {[
                    ['titleAz', 'Başlıq (AZ)'],
                    ['titleTr', 'Başlıq (TR)'],
                    ['titleEn', 'Başlıq (EN)'],
                    ['descriptionAz', 'Açıqlama (AZ)'],
                    ['descriptionTr', 'Açıqlama (TR)'],
                    ['descriptionEn', 'Açıqlama (EN)'],
                    ['icon', 'İkon'],
                    ['category', 'Kateqoriya'],
                    ['href', 'Link'],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="mb-2 block text-sm font-bold text-slate-700">{label}</label>
                      <input
                        value={(item as Record<string, string | boolean>)[key] as string}
                        onChange={(e) =>
                          setItems((prev) =>
                            prev.map((entry) => (entry.id === item.id ? { ...entry, [key]: e.target.value } : entry)),
                          )
                        }
                        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none"
                      />
                    </div>
                  ))}
                  <div className="md:col-span-2">
                    <button
                      type="button"
                      onClick={() => {
                        console.log('toolkit_save', item);
                        setToast('Saxlanıldı ✓');
                        window.setTimeout(() => setToast(''), 2200);
                      }}
                      className="rounded-full bg-[var(--dk-red)] px-6 py-3 text-sm font-bold text-white"
                    >
                      Saxla
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
