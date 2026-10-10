'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeLocale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import SikayetForm from './SikayetForm';
import SikayetResult from './SikayetResult';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

// TASK-0534 (copy audit 10.10): texts live in messages → marketinq.complaintPage (the «26 silent customers»
// figure had no source; AZ/TR had no diacritics; RU was English).
type ViewMode = 'loading' | 'form' | 'result';

export default function SikayetAnalitiyiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const tc = useTranslations('marketinq.complaintPage');
  const c = {
    title: tc('title'),
    subtitle: tc('subtitle'),
    backToList: tc('backToList'),
    whyTitle: tc('whyTitle'),
    why: tc('why'),
    tier: tc('tier'),
    loading: tc('loading'),
  };
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/sikayet-analitigi')
      .then((r) => r.json())
      .then((data) => { if (data.hasRun && data.lastResult) { setResult(data.lastResult); setView('result'); } else setView('form'); })
      .catch(() => setView('form'));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="sikayet-analitigi" title={c.title} subtitle={c.subtitle} />

      {view !== 'result' && (
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

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-600">{c.loading}</div>}
      {view === 'form' && <SikayetForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <SikayetResult result={result as Parameters<typeof SikayetResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
