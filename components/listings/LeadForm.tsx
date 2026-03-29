'use client';

import { FormEvent, useState } from 'react';
import { CheckCircle2, Loader2, Send } from 'lucide-react';

interface LeadFormProps {
  trackingCode: string;
  title: string;
}

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 12);
  if (!digits) return '';
  if (digits.startsWith('994')) {
    const p1 = digits.slice(0, 3);
    const p2 = digits.slice(3, 5);
    const p3 = digits.slice(5, 8);
    const p4 = digits.slice(8, 10);
    const p5 = digits.slice(10, 12);
    return ['+' + p1, p2, p3, p4, p5].filter(Boolean).join(' ');
  }
  return '+' + digits;
}

export default function LeadForm({ trackingCode, title }: LeadFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    console.log('listing_lead_submit', { trackingCode, title, ...form });
    await new Promise((resolve) => setTimeout(resolve, 350));
    setSuccess('Müraciətiniz göndərildi!');
    setSubmitting(false);
    setForm({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setSuccess(''), 3200);
  };

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-display text-2xl font-black text-[var(--dk-navy)]">Maraqlanıram</h3>
        <p className="mt-1 text-sm text-slate-600">
          {trackingCode} nömrəli elan haqqında sualını bizə yaz.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Ad Soyad"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--dk-red)] focus:ring-4 focus:ring-rose-100"
        />
        <input
          required
          value={form.phone}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, phone: normalizePhone(event.target.value) }))
          }
          placeholder="+994 XX XXX XX XX"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--dk-red)] focus:ring-4 focus:ring-rose-100"
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder="E-mail (opsional)"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--dk-red)] focus:ring-4 focus:ring-rose-100"
        />
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          placeholder="Bu elan haqqında sualınız..."
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[var(--dk-red)] focus:ring-4 focus:ring-rose-100"
        />
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[var(--dk-red)] px-5 py-3.5 text-sm font-bold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Göndərilir...' : 'Maraqlanıram'}
        </button>
      </form>

      {success ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      ) : null}
    </div>
  );
}
