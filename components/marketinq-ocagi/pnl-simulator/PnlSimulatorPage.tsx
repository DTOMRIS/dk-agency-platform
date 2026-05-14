'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import PnlForm from './PnlForm';
import PnlResult from './PnlResult';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: { title: 'P&L Simulator', subtitle: 'Aylıq gəlir-xərc modelləşdirməsi + AI yorum', backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?', why: 'P&L-i ayda 1 dəfə hazırlayan restoran rəqiblərinin çoxundan öndədir. Bu alət hesablama + AI yorum verir — food cost, labor, rent benchmark-larla müqayisə.',
    tier: 'KALFA', loading: 'Yüklənir...' },
  en: { title: 'P&L Simulator', subtitle: 'Monthly P&L modeling + AI commentary', backToList: 'All tools',
    whyTitle: 'Why is this important?', why: 'Restaurants with monthly P&L outperform competitors. This tool calculates + AI commentary with industry benchmarks.',
    tier: 'PRO', loading: 'Loading...' },
  tr: { title: 'P&L Simülatörü', subtitle: 'Aylık gelir-gider modeli + AI yorum', backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?', why: 'Aylık P&L hazırlayan restoran rakiplerinin önündedir. Bu araç hesaplama + AI yorum sağlar.',
    tier: 'KALFA', loading: 'Yükleniyor...' },
  ru: { title: 'P&L Симулятор', subtitle: 'Ежемесячное моделирование + AI комментарий', backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?', why: 'Рестораны с ежемесячным P&L опережают конкурентов. Расчёт + AI комментарий с отраслевыми бенчмарками.',
    tier: 'ПОДМАСТЕРЬЕ', loading: 'Загрузка...' },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function PnlSimulatorPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/pnl-simulator')
      .then((r) => r.json())
      .then((data) => { if (data.hasRun && data.lastResult) { setResult(data.lastResult); setView('result'); } else setView('form'); })
      .catch(() => setView('form'));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/dashboard/marketinq-ocagi" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />{c.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{c.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>{c.tier}</span>
      </div>

      {view !== 'result' && (
        <ToolInfoBox title="Niyə bu vacibdir?" variant="info">
          <p>P&L-i ayda 1 dəfə hazırlayan restoran rəqiblərinin çoxundan öndədir. Bu alət hesablama + AI yorum verir — food cost, labor, rent benchmark-larla müqayisə.</p>
        </ToolInfoBox>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-400">{c.loading}</div>}
      {view === 'form' && <PnlForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <PnlResult result={result as Parameters<typeof PnlResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
