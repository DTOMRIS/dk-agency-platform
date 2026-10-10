'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import SikayetForm from './SikayetForm';
import SikayetResult from './SikayetResult';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: {
    title: 'Sikayet Analitigi',
    subtitle: 'Her sikayet arxasinda 26 sessiz musteri var. Kok sebebi tap.',
    backToList: 'Butun aletler',
    whyTitle: 'Niye bu vacibdir?',
    why: 'Her sikayet arxasinda 26 sessiz narazi musteri var. AI pattern-leri tapir, kok sebebi gosterir ve hell plani teklif edir.',
    tier: 'KALFA',
    loading: 'Yuklenir...',
  },
  en: {
    title: 'Complaint Analytics',
    subtitle: 'Behind every complaint are 26 silent customers. Find the root cause.',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: 'For every complaint, 26 unhappy customers stay silent. AI finds patterns, root causes, and action plans.',
    tier: 'PRO',
    loading: 'Loading...',
  },
  tr: {
    title: 'Sikayet Analitigi',
    subtitle: 'Her sikayetin arkasinda 26 sessiz musteri var. Kok nedeni bul.',
    backToList: 'Tum araclar',
    whyTitle: 'Bu neden onemli?',
    why: 'Her sikayetin arkasinda 26 sessiz mutsuz musteri var. AI kaliplari bulur, kok nedeni gosterir.',
    tier: 'KALFA',
    loading: 'Yukleniyor...',
  },
  ru: {
    title: 'Complaint Analytics',
    subtitle: 'Behind every complaint are 26 silent customers. Find the root cause.',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: 'For every complaint, 26 unhappy customers stay silent. AI finds patterns, root causes, and action plans.',
    tier: 'PRO',
    loading: 'Loading...',
  },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function SikayetAnalitiyiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
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
