'use client';

import { useMessages } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { AlertTriangle, Copy, Check, Clock, Zap, Calendar } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface Category { name: string; count: number; percentage: number; examples: string[]; rootCause: string; fixAction: string }
interface Pattern { pattern: string; frequency: string; impact: string }
interface Action { priority: 'immediate' | 'this-week' | 'this-month'; action: string; expectedResult: string }
interface Template { forCategory: string; template: string }

interface SikayetResultData {
  summary: { totalComplaints: number; topCategory: string; sentimentScore: number; urgencyLevel: string };
  categories: Category[];
  patterns: Pattern[];
  actionPlan: Action[];
  responseTemplates: Template[];
  ahilikQuote: string;
}

// TASK-0523: copy moved to messages/*.json → mqForms.sikayetResult (was an in-file locale map).
type SikayetResultCopy = {
  summaryTitle: string; total: string; topCat: string; sentiment: string; urgency: string;
  urgencyLevels: Record<string, string>; catsTitle: string; rootCause: string; fix: string;
  patternsTitle: string; freq: string; impact: string;
  planTitle: string; priorities: Record<string, string>; expected: string;
  templatesTitle: string; copyBtn: string; copied: string;
  redo: string; next: string;
};

const urgencyColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700', medium: 'bg-yellow-100 text-yellow-700',
  high: 'bg-orange-100 text-orange-700', critical: 'bg-red-100 text-red-700',
};

const priorityIcons = { immediate: Zap, 'this-week': Clock, 'this-month': Calendar };

function CopyBtn({ text, label, copiedLabel }: { text: string; label: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button type="button" onClick={async () => { await navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
      className="inline-flex items-center gap-1 rounded-lg border border-[#E4DCCD] px-2 py-1 text-[10px] font-medium text-slate-500 transition hover:border-[#0F172A]">
      {copied ? <><Check size={10} />{copiedLabel}</> : <><Copy size={10} />{label}</>}
    </button>
  );
}

interface Props { result: SikayetResultData; locale: Locale; onRedo: () => void }

export default function SikayetResult({ result, locale, onRedo }: Props) {
  const t = (useMessages() as unknown as { mqForms: { sikayetResult: SikayetResultCopy } }).mqForms.sikayetResult;
  const { summary, categories, patterns, actionPlan, responseTemplates } = result;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-600">{t.total}</p>
          <p className="mt-1 text-2xl font-bold text-[#0F172A]">{summary.totalComplaints}</p>
        </div>
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-600">{t.topCat}</p>
          <p className="mt-1 text-sm font-bold text-[#0F172A]">{summary.topCategory}</p>
        </div>
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-600">{t.sentiment}</p>
          <p className={`mt-1 text-2xl font-bold ${summary.sentimentScore > 60 ? 'text-green-600' : summary.sentimentScore > 30 ? 'text-amber-600' : 'text-red-600'}`}>{summary.sentimentScore}</p>
        </div>
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 text-center">
          <p className="text-[10px] font-semibold uppercase text-slate-600">{t.urgency}</p>
          <span className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-bold ${urgencyColors[summary.urgencyLevel] ?? ''}`}>
            {t.urgencyLevels[summary.urgencyLevel] ?? summary.urgencyLevel}
          </span>
        </div>
      </div>

      {/* Categories */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.catsTitle}</h3>
        <div className="space-y-4">
          {categories.map((cat, i) => (
            <div key={i} className="border-l-4 border-amber-400 py-2 pl-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#0F172A]">{cat.name}</span>
                <span className="text-xs text-slate-500">{cat.count} ({cat.percentage}%)</span>
              </div>
              <p className="mt-1 text-xs text-slate-500"><span className="font-semibold">{t.rootCause}:</span> {cat.rootCause}</p>
              <p className="mt-1 text-xs text-slate-600"><span className="font-semibold">{t.fix}:</span> {cat.fixAction}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Patterns */}
      {patterns.length > 0 && (
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.patternsTitle}</h3>
          <div className="space-y-3">
            {patterns.map((p, i) => (
              <div key={i} className="rounded-lg bg-[#FBF8F3] px-4 py-3">
                <p className="text-sm font-semibold text-[#0F172A]">{p.pattern}</p>
                <p className="mt-1 text-xs text-slate-500">{t.freq}: {p.frequency} · {t.impact}: {p.impact}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Plan */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.planTitle}</h3>
        <div className="space-y-3">
          {actionPlan.map((a, i) => {
            const Icon = priorityIcons[a.priority] ?? Clock;
            return (
              <div key={i} className="flex gap-3 rounded-lg border border-[#EFE9DE] px-4 py-3">
                <Icon size={16} className="mt-0.5 shrink-0 text-[#BE2F47]" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#BE2F47]">{t.priorities[a.priority]}</span>
                  </div>
                  <p className="mt-1 text-sm text-[#0F172A]">{a.action}</p>
                  <p className="mt-1 text-xs text-slate-500">{t.expected}: {a.expectedResult}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Response Templates */}
      {responseTemplates.length > 0 && (
        <div className="rounded-2xl border border-[#E4DCCD] bg-white p-5">
          <h3 className="mb-4 text-sm font-bold text-[#0F172A]">{t.templatesTitle}</h3>
          <div className="space-y-3">
            {responseTemplates.map((tmpl, i) => (
              <div key={i} className="rounded-lg border border-[#EFE9DE] px-4 py-3">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500">{tmpl.forCategory}</span>
                  <CopyBtn text={tmpl.template} label={t.copyBtn} copiedLabel={t.copied} />
                </div>
                <p className="text-sm text-slate-600">{tmpl.template}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ahilik */}
      {/* TASK-0523: no more AI-written «Ahilik» quotes; older saved runs still show theirs. */}
      {result.ahilikQuote && <p className="text-center text-xs italic text-slate-600">&ldquo;{result.ahilikQuote}&rdquo; — Əhilik</p>}

      {/* Actions */}
      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-[#E4DCCD] px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A]">{t.redo}</button>
        <Link href="/b2b-panel/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-dk-red-strong px-4 py-3 text-sm font-semibold text-white transition hover:bg-dk-red-deep">{t.next}</Link>
      </div>
    </div>
  );
}
