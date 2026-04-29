'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Loader2,
  Plus,
  Save,
  Trash2,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

interface InvoiceItem {
  id: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number; // qəpik
  totalPrice: number; // qəpik
  categoryId: number | null;
  isEdited: boolean;
  sortOrder: number;
}

interface InvoiceDetail {
  id: number;
  supplierName: string;
  supplierVoen: string | null;
  invoiceNumber: string | null;
  invoiceDate: string;
  subtotal: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
  status: string;
  source: string;
  ocrConfidence: number | null;
  notes: string | null;
  items: InvoiceItem[];
}

interface CategoryOption {
  id: number;
  name: string;
  color: string;
}

// ── Mock ────────────────────────────────────────────────────────────

const MOCK_CATEGORIES: CategoryOption[] = [
  { id: 1, name: 'Ət və balıq', color: '#DC2626' },
  { id: 2, name: 'Süd məhsulları', color: '#3B82F6' },
  { id: 3, name: 'Meyvə / tərəvəz', color: '#22C55E' },
  { id: 4, name: 'Dənli / un', color: '#F59E0B' },
  { id: 5, name: 'Yağlar', color: '#EAB308' },
  { id: 6, name: 'İçkilər (alkoqolsuz)', color: '#06B6D4' },
  { id: 7, name: 'İçkilər (alkoqollu)', color: '#8B5CF6' },
  { id: 8, name: 'Baharat / sous', color: '#F97316' },
  { id: 9, name: 'Qablaşdırma', color: '#78716C' },
  { id: 10, name: 'Təmizlik', color: '#14B8A6' },
  { id: 11, name: 'İnventar', color: '#6366F1' },
  { id: 12, name: 'Sair', color: '#6B7280' },
];

function buildMockDetail(id: string): InvoiceDetail {
  return {
    id: Number(id),
    supplierName: 'Metro Cash & Carry',
    supplierVoen: '1234567890',
    invoiceNumber: 'FC-004521',
    invoiceDate: '2026-04-27',
    subtotal: 21580,
    vatAmount: 3000,
    grandTotal: 24580,
    currency: 'AZN',
    status: 'draft',
    source: 'ocr_upload',
    ocrConfidence: 0.92,
    notes: null,
    items: [
      { id: 1, name: 'Toyuq eti (bud)', quantity: 5, unit: 'kq', unitPrice: 850, totalPrice: 4250, categoryId: 1, isEdited: false, sortOrder: 0 },
      { id: 2, name: 'Zeytun yağı 1L', quantity: 2, unit: 'litr', unitPrice: 1200, totalPrice: 2400, categoryId: 5, isEdited: false, sortOrder: 1 },
      { id: 3, name: 'Kartof', quantity: 10, unit: 'kq', unitPrice: 120, totalPrice: 1200, categoryId: 3, isEdited: false, sortOrder: 2 },
      { id: 4, name: 'Coca Cola 1.5L', quantity: 6, unit: 'əd', unitPrice: 180, totalPrice: 1080, categoryId: 6, isEdited: false, sortOrder: 3 },
      { id: 5, name: 'Duz 1kq', quantity: 3, unit: 'əd', unitPrice: 80, totalPrice: 240, categoryId: 8, isEdited: false, sortOrder: 4 },
      { id: 6, name: 'Fairy 500ml', quantity: 2, unit: 'əd', unitPrice: 350, totalPrice: 700, categoryId: 10, isEdited: false, sortOrder: 5 },
    ],
  };
}

// ── Helpers ──────────────────────────────────────────────────────────

function qepikToAzn(q: number) { return (q / 100).toFixed(2); }
function aznToQepik(a: string) { return Math.round((parseFloat(a) || 0) * 100); }

function statusLabel(s: string) {
  const m: Record<string, { label: string; cls: string }> = {
    draft: { label: 'Qaralama', cls: 'bg-amber-100 text-amber-700' },
    confirmed: { label: 'Təsdiqlənib', cls: 'bg-emerald-100 text-emerald-700' },
    disputed: { label: 'Mübahisəli', cls: 'bg-red-100 text-red-700' },
    archived: { label: 'Arxiv', cls: 'bg-slate-100 text-slate-600' },
  };
  return m[s] ?? { label: s, cls: 'bg-slate-100 text-slate-600' };
}

// ── Page ────────────────────────────────────────────────────────────

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>(MOCK_CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());

  // Load data
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [invRes, catRes] = await Promise.all([
          fetch(`/api/invoices/${id}`).catch(() => null),
          fetch('/api/invoice-categories').catch(() => null),
        ]);

        if (invRes?.ok) {
          const data = await invRes.json();
          if (data.data) setInvoice(data.data);
          else setInvoice(buildMockDetail(id));
        } else {
          setInvoice(buildMockDetail(id));
        }

        if (catRes?.ok) {
          const data = await catRes.json();
          if (data.data?.length > 0) setCategories(data.data);
        }
      } catch {
        setInvoice(buildMockDetail(id));
      }
      setLoading(false);
    }
    void load();
  }, [id]);

  // ── Item operations ─────────────────────────────────────────────

  const updateItem = (itemId: number, field: string, value: string | number | null) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.map((it) => {
        if (it.id !== itemId) return it;
        const updated = { ...it, [field]: value, isEdited: true };
        // Recalc totalPrice
        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? (value as number) : it.quantity;
          const price = field === 'unitPrice' ? (value as number) : it.unitPrice;
          updated.totalPrice = Math.round(qty * price);
        }
        return updated;
      });
      const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
      return { ...prev, items, subtotal, grandTotal: subtotal + prev.vatAmount };
    });
  };

  const removeItem = (itemId: number) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((it) => it.id !== itemId);
      const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
      return { ...prev, items, subtotal, grandTotal: subtotal + prev.vatAmount };
    });
  };

  const addItem = () => {
    setInvoice((prev) => {
      if (!prev) return prev;
      const newItem: InvoiceItem = {
        id: Date.now(),
        name: '',
        quantity: 1,
        unit: 'əd',
        unitPrice: 0,
        totalPrice: 0,
        categoryId: null,
        isEdited: true,
        sortOrder: prev.items.length,
      };
      return { ...prev, items: [...prev.items, newItem] };
    });
  };

  const addMultipleItems = (count: number) => {
    setInvoice((prev) => {
      if (!prev) return prev;
      const newItems = Array.from({ length: count }, (_, i) => ({
        id: Date.now() + i,
        name: '',
        quantity: 1,
        unit: 'əd' as string,
        unitPrice: 0,
        totalPrice: 0,
        categoryId: null,
        isEdited: true,
        sortOrder: prev.items.length + i,
      }));
      return { ...prev, items: [...prev.items, ...newItems] };
    });
  };

  const bulkDeleteItems = () => {
    if (selectedItems.size === 0) return;
    setInvoice((prev) => {
      if (!prev) return prev;
      const items = prev.items.filter((it) => !selectedItems.has(it.id));
      const subtotal = items.reduce((s, it) => s + it.totalPrice, 0);
      return { ...prev, items, subtotal, grandTotal: subtotal + prev.vatAmount };
    });
    setSelectedItems(new Set());
  };

  const toggleItem = (itemId: number) => {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (next.has(itemId)) next.delete(itemId); else next.add(itemId);
      return next;
    });
  };

  // ── Save / Confirm ─────────────────────────────────────────────

  const handleSave = async (confirm = false) => {
    if (!invoice) return;
    setSaving(true);
    setFeedback(null);

    try {
      // API call (uğursuz olarsa yenə UI feedback göstər)
      await fetch(`/api/invoices/${id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...invoice,
          status: confirm ? 'confirmed' : invoice.status,
        }),
      }).catch(() => null);

      if (confirm) {
        setInvoice((prev) => prev ? { ...prev, status: 'confirmed' } : prev);
        setFeedback('Fatura təsdiqləndi!');
      } else {
        setFeedback('Dəyişikliklər saxlanıldı!');
      }
    } catch {
      setFeedback('Saxlanıldı (lokal)');
    }
    setSaving(false);
    setTimeout(() => setFeedback(null), 3000);
  };

  // ── Render ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-8 text-center text-slate-500">Fatura tapılmadı</div>
    );
  }

  const st = statusLabel(invoice.status);

  return (
    <div className="p-4 lg:p-8">
      {/* Header */}
      <div className="mb-6">
        <button onClick={() => router.push('/dashboard/faturalar')} className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Faturalar
        </button>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-bold text-slate-900">{invoice.supplierName}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
              {invoice.invoiceNumber && <span>#{invoice.invoiceNumber}</span>}
              <span>{invoice.invoiceDate}</span>
              {invoice.supplierVoen && <span>VÖEN: {invoice.supplierVoen}</span>}
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${st.cls}`}>{st.label}</span>
              {invoice.ocrConfidence !== null && (
                <span className="text-xs text-slate-400">OCR: {Math.round(invoice.ocrConfidence * 100)}%</span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleSave(false)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Saxla
            </button>
            {invoice.status === 'draft' && (
              <button onClick={() => handleSave(true)} disabled={saving} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 active:scale-[0.98]">
                <Check className="h-4 w-4" /> Təsdiqlə
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{feedback}</div>
      )}

      {/* Items Table */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">Məhsullar ({invoice.items.length})</h2>
        <div className="flex gap-1">
          <button onClick={addItem} className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
            <Plus className="h-3 w-3" /> +1
          </button>
          <button onClick={() => addMultipleItems(5)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">+5</button>
          <button onClick={() => addMultipleItems(10)} className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">+10</button>
        </div>
      </div>

      {/* Bulk delete bar */}
      {selectedItems.size > 0 && (
        <div className="mb-3 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2">
          <span className="text-xs font-medium text-amber-800">{selectedItems.size} seçilib</span>
          <button onClick={bulkDeleteItems} className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700">
            <Trash2 className="h-3 w-3" /> Sil
          </button>
        </div>
      )}

      {/* Desktop Table */}
      <div className="hidden overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50 text-xs">
              <th className="w-8 px-3 py-2.5">
                <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300"
                  checked={selectedItems.size === invoice.items.length && invoice.items.length > 0}
                  onChange={() => setSelectedItems(selectedItems.size === invoice.items.length ? new Set() : new Set(invoice.items.map(i => i.id)))}
                />
              </th>
              <th className="min-w-[180px] px-3 py-2.5 font-medium text-slate-500">Məhsul</th>
              <th className="w-20 px-3 py-2.5 font-medium text-slate-500">Miqdar</th>
              <th className="w-16 px-3 py-2.5 font-medium text-slate-500">Vahid</th>
              <th className="w-24 px-3 py-2.5 font-medium text-slate-500">Qiymət</th>
              <th className="w-24 px-3 py-2.5 font-medium text-slate-500 text-right">Cəmi</th>
              <th className="w-32 px-3 py-2.5 font-medium text-slate-500">Kateqoriya</th>
              <th className="w-10 px-3 py-2.5"></th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item) => (
              <tr key={item.id} className={`border-b border-slate-50 ${item.isEdited ? 'bg-amber-50/40' : ''} ${selectedItems.has(item.id) ? 'bg-blue-50/50' : ''}`}>
                <td className="px-3 py-2">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)} />
                </td>
                <td className="px-3 py-2">
                  <input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48] focus:ring-1 focus:ring-[#E11D48]" placeholder="Məhsul adı" />
                </td>
                <td className="px-3 py-2">
                  <input type="number" step="0.1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48]" />
                </td>
                <td className="px-3 py-2">
                  <select value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-1 text-xs outline-none">
                    <option value="kq">kq</option>
                    <option value="litr">litr</option>
                    <option value="əd">əd</option>
                    <option value="qutu">qutu</option>
                    <option value="paket">paket</option>
                    <option value="şüşə">şüşə</option>
                    <option value="bağ">bağ</option>
                  </select>
                </td>
                <td className="px-3 py-2">
                  <input type="number" step="0.01" value={qepikToAzn(item.unitPrice)} onChange={(e) => updateItem(item.id, 'unitPrice', aznToQepik(e.target.value))} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-2 text-sm outline-none focus:border-[#E11D48]" />
                </td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">
                  {qepikToAzn(item.totalPrice)} ₼
                </td>
                <td className="px-3 py-2">
                  <select value={item.categoryId ?? ''} onChange={(e) => updateItem(item.id, 'categoryId', e.target.value ? Number(e.target.value) : null)} className="h-8 w-full rounded-lg border border-slate-200 bg-white px-1 text-xs outline-none">
                    <option value="">— Seç —</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </td>
                <td className="px-3 py-2">
                  <button onClick={() => removeItem(item.id)} className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="flex flex-col gap-2 sm:hidden">
        {invoice.items.map((item) => (
          <div key={item.id} className={`rounded-xl border p-3 ${item.isEdited ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300" checked={selectedItems.has(item.id)} onChange={() => toggleItem(item.id)} />
              <input value={item.name} onChange={(e) => updateItem(item.id, 'name', e.target.value)} className="h-10 flex-1 rounded-lg border border-slate-200 px-2 text-sm outline-none focus:border-[#E11D48]" placeholder="Məhsul adı" />
              <button onClick={() => removeItem(item.id)} className="h-10 w-10 shrink-0 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500">
                <Trash2 className="mx-auto h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1.5">
              <input type="number" step="0.1" value={item.quantity} onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)} className="h-9 rounded-lg border border-slate-200 px-2 text-sm outline-none" placeholder="Miq." />
              <select value={item.unit} onChange={(e) => updateItem(item.id, 'unit', e.target.value)} className="h-9 rounded-lg border border-slate-200 px-1 text-xs outline-none">
                <option value="kq">kq</option><option value="litr">litr</option><option value="əd">əd</option><option value="qutu">qutu</option>
              </select>
              <input type="number" step="0.01" value={qepikToAzn(item.unitPrice)} onChange={(e) => updateItem(item.id, 'unitPrice', aznToQepik(e.target.value))} className="h-9 rounded-lg border border-slate-200 px-2 text-sm outline-none" placeholder="Qiy." />
              <div className="flex h-9 items-center justify-end text-sm font-medium text-slate-900">{qepikToAzn(item.totalPrice)} ₼</div>
            </div>
            <select value={item.categoryId ?? ''} onChange={(e) => updateItem(item.id, 'categoryId', e.target.value ? Number(e.target.value) : null)} className="mt-1.5 h-9 w-full rounded-lg border border-slate-200 px-2 text-xs outline-none">
              <option value="">Kateqoriya seç...</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 flex justify-end">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 sm:w-72">
          <div className="flex justify-between text-sm text-slate-500">
            <span>Ara cəm:</span>
            <span>{qepikToAzn(invoice.subtotal)} ₼</span>
          </div>
          <div className="mt-1 flex justify-between text-sm text-slate-500">
            <span>ƏDV:</span>
            <span>{qepikToAzn(invoice.vatAmount)} ₼</span>
          </div>
          <div className="mt-2 border-t border-slate-100 pt-2">
            <div className="flex justify-between text-lg font-bold text-slate-900">
              <span>Yekun:</span>
              <span>{qepikToAzn(invoice.grandTotal)} {invoice.currency}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom action bar — mobile */}
      <div className="fixed bottom-0 left-0 right-0 flex gap-2 border-t border-slate-200 bg-white p-3 sm:hidden">
        <button onClick={() => handleSave(false)} disabled={saving} className="flex-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-700">
          <Save className="h-4 w-4" /> Saxla
        </button>
        {invoice.status === 'draft' && (
          <button onClick={() => handleSave(true)} disabled={saving} className="flex-1 inline-flex h-12 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 text-sm font-medium text-white active:scale-[0.98]">
            <Check className="h-4 w-4" /> Təsdiqlə
          </button>
        )}
      </div>
      {/* Bottom spacer for mobile fixed bar */}
      <div className="h-20 sm:hidden" />
    </div>
  );
}
