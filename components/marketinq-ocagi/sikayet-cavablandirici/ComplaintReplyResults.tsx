'use client';

import { useMessages } from 'next-intl';
import { useState } from 'react';
import { Copy, Check, RefreshCw } from 'lucide-react';
import type { Locale } from '@/i18n/config';

// TASK-0523: copy moved to messages/*.json → mqForms.complaintReplyResults (was an in-file locale map).
type ComplaintReplyResultsCopy = {
  tones: { formal: string; friendly: string; short: string };
  copyBtn: string;
  copied: string;
  regenerate: string;
};

const TONE_COLORS: Record<string, { bg: string; border: string; badge: string }> = {
  formal: { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-700' },
  friendly: { bg: 'bg-emerald-50', border: 'border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
  short: { bg: 'bg-amber-50', border: 'border-amber-200', badge: 'bg-amber-100 text-amber-700' },
};

interface ComplaintReplyResultsProps {
  responses: { formal: string; friendly: string; short: string };
  locale: Locale;
  onRegenerate: () => void;
}

export default function ComplaintReplyResults({ responses, locale, onRegenerate }: ComplaintReplyResultsProps) {
  const c = (useMessages() as unknown as { mqForms: { complaintReplyResults: ComplaintReplyResultsCopy } }).mqForms.complaintReplyResults;
  const [copiedTone, setCopiedTone] = useState<string | null>(null);

  async function handleCopy(tone: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTone(tone);
      setTimeout(() => setCopiedTone(null), 2000);
    } catch { /* clipboard not available */ }
  }

  const tones = [
    { key: 'formal', text: responses.formal },
    { key: 'friendly', text: responses.friendly },
    { key: 'short', text: responses.short },
  ] as const;

  return (
    <div className="space-y-4">
      {tones.map(({ key, text }) => {
        const colors = TONE_COLORS[key];
        const isCopied = copiedTone === key;

        return (
          <div key={key} className={`rounded-2xl border ${colors.border} ${colors.bg} p-5`}>
            <div className="mb-3 flex items-center justify-between">
              <span className={`rounded-full px-3 py-1 text-xs font-bold ${colors.badge}`}>
                {c.tones[key as keyof typeof c.tones]}
              </span>
              <button
                onClick={() => handleCopy(key, text)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4DCCD] bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:shadow-sm"
              >
                {isCopied ? (
                  <><Check size={14} className="text-emerald-500" />{c.copied}</>
                ) : (
                  <><Copy size={14} />{c.copyBtn}</>
                )}
              </button>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{text}</p>
          </div>
        );
      })}

      <button
        onClick={onRegenerate}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#E4DCCD] bg-white px-6 py-3 text-sm font-medium text-slate-600 transition hover:border-[#0F172A] hover:shadow-sm"
      >
        <RefreshCw size={16} />
        {c.regenerate}
      </button>
    </div>
  );
}
