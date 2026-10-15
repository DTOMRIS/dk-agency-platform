'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { formatAzDate, formatAzDateTime } from '@/lib/i18n/format';

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
  return 'bg-[#EFE9DE] text-[#5B6474]';
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
      // fake-scan-ok: router.refresh() right after re-renders the lead from the server
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
          <span className="rounded-full bg-[#EFE9DE] px-2 py-0.5 font-bold text-[#0F172A]">
            📅 {formatAzDate(nextContactAt)}
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
            className="rounded-full bg-dk-red-strong px-3 py-2 text-xs font-bold text-white transition hover:bg-dk-red-deep disabled:opacity-60"
          >
            {loading ? t('updating') : t('nextStatus', { status: nextStatus })}
          </button>
        ) : null}
        {status !== 'dismissed' ? (
          <button
            type="button"
            disabled={loading}
            onClick={() => void patch({ status: 'dismissed' })}
            className="rounded-full border border-[#E4DCCD] bg-white px-3 py-2 text-xs font-bold text-[#334155] transition hover:border-[#0F172A] disabled:opacity-60"
          >
            {t('dismiss')}
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="rounded-full border border-[#E4DCCD] bg-white px-3 py-2 text-xs font-bold text-[#334155] transition hover:border-[#0F172A]"
        >
          {t('noteToggle')}
        </button>
      </div>

      {/* Notes panel */}
      {open ? (
        <div className="rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] p-3">
          {notes.length > 0 ? (
            <ul className="mb-3 space-y-1.5">
              {notes.map((n, i) => (
                <li key={i} className="text-xs text-[#334155]">
                  <span className="font-semibold text-[#5B6474]">
                    {formatAzDateTime(n.at)}:
                  </span>{' '}
                  {n.text}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mb-3 text-xs text-[#5B6474]">{t('noNotes')}</p>
          )}
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={t('notePlaceholder')}
            rows={2}
            className="w-full rounded-xl border border-[#E4DCCD] bg-white px-3 py-2 text-sm text-[#0F172A] outline-none placeholder:text-[#5B6474] focus:border-[#0F172A]"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <label className="text-xs font-semibold text-[#334155]">{t('nextContact')}</label>
            <input
              type="date"
              value={reminder}
              onChange={(e) => setReminder(e.target.value)}
              className="rounded-xl border border-[#E4DCCD] bg-white px-2 py-1.5 text-xs text-[#0F172A] outline-none focus:border-[#0F172A]"
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => void saveNote()}
              className="ml-auto rounded-full bg-[#0F172A] px-4 py-2 text-xs font-bold text-white transition hover:bg-[#1E293B] disabled:opacity-60"
            >
              {loading ? t('updating') : t('saveNote')}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
