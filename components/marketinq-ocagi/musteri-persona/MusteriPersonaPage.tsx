'use client';

import { useEffect, useState } from 'react';
import { useMessages } from 'next-intl';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import PersonaForm from './PersonaForm';
import PersonaResult from './PersonaResult';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

// TASK-0523: copy moved to messages/*.json → mqForms.musteriPersonaPage (was an in-file locale map).
type MusteriPersonaCopy = { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string };

type ViewMode = 'loading' | 'form' | 'result';

export default function MusteriPersonaPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = (useMessages() as unknown as { mqForms: { musteriPersonaPage: MusteriPersonaCopy } }).mqForms.musteriPersonaPage;
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/musteri-persona')
      .then((r) => r.json())
      .then((data) => { if (data.hasRun && data.lastResult) { setResult(data.lastResult); setView('result'); } else setView('form'); })
      .catch(() => setView('form'));
  }, []);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="musteri-persona" title={c.title} subtitle={c.subtitle} />

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

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-400">{c.loading}</div>}
      {view === 'form' && <PersonaForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <PersonaResult result={result as Parameters<typeof PersonaResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
