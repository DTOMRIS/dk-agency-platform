'use client';

import { useMessages } from 'next-intl';
import Link from 'next/link';
import { useState } from 'react';
import { Check, Copy } from 'lucide-react';
import type { Locale } from '@/i18n/config';

interface MarkaKompasiResult {
  icp: { who: string; context: string; painPoint: string };
  valueProp: string;
  differentiators: string[];
  tagline: string;
  useThisIn: string[];
}

// TASK-0523: copy moved to messages/*.json → mqForms.markaKompasiResult (was an in-file locale map).
type MarkaKompasiResultCopy = {
    title: string;
    sections: Record<string, string>;
    icp: Record<string, string>;
    copied: string;
    redo: string;
    next: string;
};

function CopyButton({ text, copiedLabel }: { text: string; copiedLabel: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1 rounded-lg border border-[#E4DCCD] px-2 py-1 text-xs font-medium text-slate-500 transition hover:border-[#0F172A] hover:text-[#0F172A]"
    >
      {copied ? <><Check size={12} /> {copiedLabel}</> : <><Copy size={12} /></>}
    </button>
  );
}

interface ResultCardProps {
  result: MarkaKompasiResult;
  locale: Locale;
  onRedo: () => void;
}

export default function ResultCard({ result, locale, onRedo }: ResultCardProps) {
  const copy = (useMessages() as unknown as { mqForms: { markaKompasiResult: MarkaKompasiResultCopy } }).mqForms.markaKompasiResult;

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-[#0F172A]">{copy.title}</h2>

      {/* Tagline */}
      <div className="rounded-2xl border border-[#F4B8C3] bg-[#F6F1E9] p-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-[#BE2F47]">
            {copy.sections.tagline}
          </span>
          <CopyButton text={result.tagline} copiedLabel={copy.copied} />
        </div>
        <p className="font-display text-lg font-bold text-[#0F172A]">
          &ldquo;{result.tagline}&rdquo;
        </p>
      </div>

      {/* ICP */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{copy.sections.icp}</h3>
        <div className="space-y-2 text-sm text-slate-600">
          <p><span className="font-semibold text-[#0F172A]">{copy.icp.who}</span> {result.icp.who}</p>
          <p><span className="font-semibold text-[#0F172A]">{copy.icp.context}</span> {result.icp.context}</p>
          <p><span className="font-semibold text-[#0F172A]">{copy.icp.painPoint}</span> {result.icp.painPoint}</p>
        </div>
      </div>

      {/* Value Prop */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{copy.sections.valueProp}</h3>
        <p className="text-sm leading-relaxed text-slate-600">{result.valueProp}</p>
      </div>

      {/* Differentiators */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{copy.sections.differentiators}</h3>
        <ol className="list-inside list-decimal space-y-2 text-sm text-slate-600">
          {result.differentiators.map((d, i) => (
            <li key={i}>{d}</li>
          ))}
        </ol>
      </div>

      {/* UseThisIn */}
      <div className="rounded-2xl border border-[#E4DCCD] bg-white p-6">
        <h3 className="mb-3 text-sm font-bold text-[#0F172A]">{copy.sections.useThisIn}</h3>
        <ul className="list-inside list-disc space-y-1.5 text-sm text-slate-600">
          {result.useThisIn.map((place, i) => (
            <li key={i}>{place}</li>
          ))}
        </ul>
      </div>

      {/* TASK-0524 (owner 10.10): the fixed «— Əhilik» saying was removed — it was presented as a
          tradition's quote without a source. */}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRedo}
          className="flex-1 rounded-xl border border-[#E4DCCD] px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[#0F172A] hover:text-[#0F172A]"
        >
          {copy.redo}
        </button>
        <Link
          href="/b2b-panel/marketinq-ocagi"
          className="flex flex-1 items-center justify-center rounded-xl bg-dk-red-strong px-4 py-3 text-sm font-semibold text-white transition hover:bg-dk-red-deep"
        >
          {copy.next}
        </Link>
      </div>
    </div>
  );
}
