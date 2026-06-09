'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'converted' | 'dismissed';
type LeadNote = { at: string; text: string };

const nextStatusMap: Record<LeadStatus, LeadStatus | null> = {
  new: 'contacted',
  contacted: 'qualified',
  qualified: 'converted',
  converted: null,
  dismissed: null,
};

function scoreColor(score: number): string {
  if (score >= 70) return 'bg-emerald-50 text-emerald-700';
  if (score >= 45) return 'bg-amber-50 text-amber-700';
  return 'bg-slate-100 text-slate-600';
}

export default function KazanLeadStatusActions({
  leadId,
  status,
  notes = [],
  leadScore = null,
  nextContactAt = null,
}: {
  leadId: string;
  status: LeadStatus;
  notes?: LeadNote[];
  leadScore?: number | null;
  nextContactAt?: string | null;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [reminder, setReminder] = useState(nextContactAt ? nextContactAt.slice(0, 10) : '');
  const t = useTranslations('kazanLeadActions');
  const nextStatus = nextStatusMap[status];

  async function patch(payload: Record<string, unknown>) {
    setLoading(true);
    try {
      await fetch('/api/kazan-ai/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: leadId, ...payload }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function saveNote() {
    const text = note.trim();
    if (!text && !reminder) return;
    await patch({
      ...(text ? { addNote: text } : {}),
      ...(reminder ? { nextContactAt: new Date(reminder).toISOString() } : {}),
    });
    setNote('');
  }

  return (
    <div className="space-y-2">
      {/* Score + next contact summary */}
      <div className="flex flex-wrap items-center gap-2 text-[11px]">
        {typeof leadScore === 'number' ? (
          <span className={`rounded-full px-2 py-0.5 font-black ${scoreColor(leadScore)}`}>
            🔥 {leadScore}/100
          </span>
        ) : null}
        {nextContactAt ? (
          <span className="rounded-full bg-indigo-50 px-2 py-0.5 font-bold text-indigo-700">
            📅 {new Date(nextContactAt).toLocaleDateString('az-AZ')}
          </span>
        ) : null}
      </div>

      {/* Status actions */}
      <div className="flex flex-wrap gap-2">
        {nextStatus ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void patch({ status: nextStatus })}
            className="rounded-full bg-[var(--dk-red)] px-3 py-2 text-xs font-bold text-white disabled:opacity-60"
          >
            {loading ? t('updating') : t('nextStatus', { status: nextStatus })}
          </button>
        ) : null}
        {status !== 'dismissed' ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void patch({ status: 'dismissed' })}
            className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 disabled:opacity-60"
          >
            {t('dismiss')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 hover:border-[var(--dk-gold)]"
        >
          {t('noteToggle')}
        </button>
      </div>

      {/* Notes panel */}
      {open ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          {notes.length > 0 ? (
            <ul className="mb-3 space-y-1.5">
              {notes.map((n, i) => (
                <li key={i} className="text-xs text-slate-700">
                  <span className="font-semibold text-slate-400">
                    {new Date(n.at).toLocaleString('az-AZ')}:
                  </span>{' '}
                  {n.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-xs text-slate-400">{t('noNotes')}</p>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={2}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-[var(--dk-gold)]"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-slate-700">{t('nextContact')}</label>
            <input
              type="date"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-900 outline-none focus:border-[var(--dk-gold)]"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveNote()}
              className="ml-auto rounded-full bg-[var(--dk-navy)] px-4 py-2 text-xs font-bold text-white disabled:opacity-60"
            >
              {loading ? t('updating') : t('saveNote')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
