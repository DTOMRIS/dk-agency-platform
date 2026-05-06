'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  X,
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
}

const pageCopy: Record<
  Locale,
  {
    backLink: string;
    pageTitle: string;
    addBtn: string;
    feedbackUpdated: string;
    feedbackAdded: string;
    feedbackDeleted: (n: number) => string;
    feedbackError: string;
    bulkSelected: (n: number) => string;
    bulkDelete: string;
    addPlaceholder: string;
    colColor: string;
    colName: string;
    colOrder: string;
    deleteConfirm: (n: number) => string;
    footerNote: string;
  }
> = {
  az: {
    backLink: 'Fakturalar',
    pageTitle: 'Faktura Kateqoriyaları',
    addBtn: 'Yeni',
    feedbackUpdated: 'Kateqoriya yeniləndi',
    feedbackAdded: 'Kateqoriya əlavə edildi',
    feedbackDeleted: (n) => `${n} kateqoriya silindi`,
    feedbackError: 'Xəta baş verdi',
    bulkSelected: (n) => `${n} seçilib`,
    bulkDelete: 'Sil',
    addPlaceholder: 'Kateqoriya adı...',
    colColor: 'Rəng',
    colName: 'Ad',
    colOrder: 'Sıra',
    deleteConfirm: (n) => `${n} kateqoriya silinsin?`,
    footerNote: 'Kateqoriya silinərsə, aid məhsullar kateqoriyasız qalır.',
  },
  ru: {
    backLink: 'Счета',
    pageTitle: 'Категории счетов',
    addBtn: 'Новый',
    feedbackUpdated: 'Категория обновлена',
    feedbackAdded: 'Категория добавлена',
    feedbackDeleted: (n) => `${n} категорий удалено`,
    feedbackError: 'Произошла ошибка',
    bulkSelected: (n) => `${n} выбрано`,
    bulkDelete: 'Удалить',
    addPlaceholder: 'Название категории...',
    colColor: 'Цвет',
    colName: 'Название',
    colOrder: 'Порядок',
    deleteConfirm: (n) => `Удалить ${n} категорий?`,
    footerNote: 'При удалении категории связанные товары останутся без категории.',
  },
  en: {
    backLink: 'Invoices',
    pageTitle: 'Invoice Categories',
    addBtn: 'New',
    feedbackUpdated: 'Category updated',
    feedbackAdded: 'Category added',
    feedbackDeleted: (n) => `${n} category deleted`,
    feedbackError: 'An error occurred',
    bulkSelected: (n) => `${n} selected`,
    bulkDelete: 'Delete',
    addPlaceholder: 'Category name...',
    colColor: 'Color',
    colName: 'Name',
    colOrder: 'Order',
    deleteConfirm: (n) => `Delete ${n} category?`,
    footerNote: 'If a category is deleted, associated items will remain without a category.',
  },
  tr: {
    backLink: 'Faturalar',
    pageTitle: 'Fatura Kategorileri',
    addBtn: 'Yeni',
    feedbackUpdated: 'Kategori güncellendi',
    feedbackAdded: 'Kategori eklendi',
    feedbackDeleted: (n) => `${n} kategori silindi`,
    feedbackError: 'Bir hata oluştu',
    bulkSelected: (n) => `${n} seçildi`,
    bulkDelete: 'Sil',
    addPlaceholder: 'Kategori adı...',
    colColor: 'Renk',
    colName: 'Ad',
    colOrder: 'Sıra',
    deleteConfirm: (n) => `${n} kategori silinsin?`,
    footerNote: 'Kategori silinirse, ilgili ürünler kategorisiz kalır.',
  },
};

export default function FaturaKateqoriyalarPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editName, setEditName] = useState('');
  const [editColor, setEditColor] = useState('');
  const [adding, setAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState('#6B7280');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const res = await fetch('/api/invoice-categories');
        const data = await res.json();
        if (!cancelled && data.data) setCategories(data.data);
      } catch { /* fallback */ }
      if (!cancelled) setLoading(false);
    }
    void load();
    return () => { cancelled = true; };
  }, []);

  const showFeedback = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  };

  const startEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditColor(cat.color);
  };

  const saveEdit = async () => {
    if (!editingId || !editName.trim()) return;
    try {
      await fetch('/api/invoice-categories', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: editingId, name: editName.trim(), color: editColor }),
      });
      setCategories((prev) => prev.map((c) => c.id === editingId ? { ...c, name: editName.trim(), color: editColor } : c));
      showFeedback(copy.feedbackUpdated);
    } catch { showFeedback(copy.feedbackError); }
    setEditingId(null);
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    const slug = newName.trim().toLowerCase().replace(/[^a-zəüöığçş0-9]+/g, '-').replace(/^-|-$/g, '');
    try {
      const res = await fetch('/api/invoice-categories', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: newName.trim(), slug, color: newColor, sortOrder: categories.length + 1 }),
      });
      const data = await res.json();
      if (data.data) {
        setCategories((prev) => [...prev, data.data]);
        showFeedback(copy.feedbackAdded);
      }
    } catch { showFeedback(copy.feedbackError); }
    setNewName('');
    setNewColor('#6B7280');
    setAdding(false);
  };

  const handleDelete = async (ids: number[]) => {
    if (!confirm(copy.deleteConfirm(ids.length))) return;
    try {
      await fetch('/api/invoice-categories', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      setCategories((prev) => prev.filter((c) => !ids.includes(c.id)));
      setSelected(new Set());
      showFeedback(copy.feedbackDeleted(ids.length));
    } catch { showFeedback(copy.feedbackError); }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <Link href="/dashboard/faturalar" className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> {copy.backLink}
        </Link>
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">{copy.pageTitle}</h1>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-[#E11D48] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#BE123C] active:scale-[0.98]">
            <Plus className="h-4 w-4" /> {copy.addBtn}
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div>
      )}

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2.5">
          <span className="text-sm font-medium text-amber-800">{copy.bulkSelected(selected.size)}</span>
          <button onClick={() => handleDelete([...selected])} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
            <Trash2 className="h-3.5 w-3.5" /> {copy.bulkDelete}
          </button>
        </div>
      )}

      {/* Add row */}
      {adding && (
        <div className="mb-3 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 p-3">
          <input type="color" value={newColor} onChange={(e) => setNewColor(e.target.value)} className="h-9 w-9 cursor-pointer rounded-lg border-0" />
          <input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={copy.addPlaceholder} autoFocus className="h-9 flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-[#E11D48]" onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
          <button onClick={handleAdd} className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"><Check className="h-4 w-4" /></button>
          <button onClick={() => setAdding(false)} className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-4 w-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-5 w-5 animate-spin text-slate-400" /></div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-10 px-4 py-3">
                  <input type="checkbox" className="h-4 w-4 rounded border-slate-300"
                    checked={selected.size === categories.length && categories.length > 0}
                    onChange={() => setSelected(selected.size === categories.length ? new Set() : new Set(categories.map(c => c.id)))}
                  />
                </th>
                <th className="w-12 px-4 py-3 font-medium text-slate-500">{copy.colColor}</th>
                <th className="px-4 py-3 font-medium text-slate-500">{copy.colName}</th>
                <th className="w-16 px-4 py-3 font-medium text-slate-500 text-center">{copy.colOrder}</th>
                <th className="w-20 px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id} className={`border-b border-slate-50 hover:bg-slate-50 ${selected.has(cat.id) ? 'bg-amber-50/50' : ''}`}>
                  <td className="px-4 py-3">
                    <input type="checkbox" checked={selected.has(cat.id)} onChange={() => toggleSelect(cat.id)} className="h-4 w-4 rounded border-slate-300" />
                  </td>
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <input type="color" value={editColor} onChange={(e) => setEditColor(e.target.value)} className="h-7 w-7 cursor-pointer rounded border-0" />
                    ) : (
                      <div className="h-6 w-6 rounded-full" style={{ backgroundColor: cat.color }} />
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {editingId === cat.id ? (
                      <input value={editName} onChange={(e) => setEditName(e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E11D48]" onKeyDown={(e) => e.key === 'Enter' && saveEdit()} autoFocus />
                    ) : (
                      <span className="font-medium text-slate-900">{cat.name}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-slate-500">{cat.sortOrder}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {editingId === cat.id ? (
                        <>
                          <button onClick={saveEdit} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setEditingId(null)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"><X className="h-3.5 w-3.5" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600"><Pencil className="h-3.5 w-3.5" /></button>
                          <button onClick={() => handleDelete([cat.id])} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"><Trash2 className="h-3.5 w-3.5" /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="mt-3 text-xs text-slate-400">{copy.footerNote}</p>
    </div>
  );
}
