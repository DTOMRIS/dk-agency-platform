'use client';

import { FormEvent, useState } from 'react';
import { AlertCircle, CheckCircle2, Loader2, Send } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { LEAD_FORM_TONES, type ListingTone } from '@/components/listings/listing-tones';

interface LeadFormProps {
  trackingCode: string;
  title: string;
  /** `v2` on the public listing pages; `panel` (default) keeps the member-panel look. */
  tone?: ListingTone;
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

export default function LeadForm({ trackingCode, title, tone = 'panel' }: LeadFormProps) {
  const t = useTranslations('listingsV2.lead');
  const ui = LEAD_FORM_TONES[tone];
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');
  const [failed, setFailed] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    const response = await fetch(`/api/listings/${encodeURIComponent(trackingCode)}/leads`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    }).catch(() => null);
    setSubmitting(false);
    // TASK-0538: «sent» was shown even when the request failed — the visitor thought the lead went through.
    // On failure the form keeps what was typed so it can be sent again.
    if (!response?.ok) {
      setFailed(true);
      return;
    }
    setFailed(false);
    // Email notification is handled server-side in /api/listings/[id]/leads POST
    setSuccess(t('sent'));
    setForm({ name: '', phone: '', email: '', message: '' });
    setTimeout(() => setSuccess(''), 3200);
  };

  return (
    <div className={ui.card}>
      <div className="mb-4">
        <h3 className={ui.title}>{t('title')}</h3>
        <p className={ui.body}>{t('body', { code: trackingCode })}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          required
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder={t('name')}
          className={ui.input}
        />
        <input
          required
          value={form.phone}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, phone: normalizePhone(event.target.value) }))
          }
          placeholder="+994 XX XXX XX XX"
          className={ui.input}
        />
        <input
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          placeholder={t('email')}
          className={ui.input}
        />
        <textarea
          rows={4}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          placeholder={t('message')}
          className={ui.input}
        />
        <button
          type="submit"
          disabled={submitting}
          className={ui.submit}
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? t('sending') : t('submit')}
        </button>
      </form>

      {success ? (
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      ) : null}
      {failed ? (
        <div role="alert" className="mt-3 inline-flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-xs font-semibold text-red-700">
          <AlertCircle className="h-4 w-4" />
          {t('failed')}
        </div>
      ) : null}
    </div>
  );
}
