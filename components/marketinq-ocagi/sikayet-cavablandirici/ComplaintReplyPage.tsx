'use client';

import { useMessages } from 'next-intl';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import SikayetForm from './SikayetForm';
import ComplaintReplyResults from './ComplaintReplyResults';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

// TASK-0523: copy moved to messages/*.json → mqForms.complaintReplyPage (was an in-file locale map).
type ComplaintReplyPageCopy = {
  title: string;
  subtitle: string;
  backToList: string;
  whyTitle: string;
  why: string;
  tier: string;
  errors: Record<string, string>;
};

type ViewMode = 'form' | 'result';

export default function ComplaintReplyPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = (useMessages() as unknown as { mqForms: { complaintReplyPage: ComplaintReplyPageCopy } }).mqForms.complaintReplyPage;
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('form');
  const [result, setResult] = useState<{ formal: string; friendly: string; short: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  function handleResult(data: { formal: string; friendly: string; short: string }) {
    setResult(data);
    setError(null);
    setView('result');
  }

  function handleError(errKey: string) {
    setError(c.errors[errKey] || c.errors['unknown']);
  }

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="sikayet-cavablandirici" title={c.title} subtitle={c.subtitle} />

      {view === 'form' && (
        <ToolInfoBox title={c.whyTitle} variant="info">
          <p>{c.why}</p>
        </ToolInfoBox>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'form' && (
        <SikayetForm locale={locale} onResult={handleResult} onError={handleError} />
      )}

      {view === 'result' && result && (
        <ComplaintReplyResults
          responses={result}
          locale={locale}
          onRegenerate={() => { setView('form'); setError(null); }}
        />
      )}
    </div>
  );
}
