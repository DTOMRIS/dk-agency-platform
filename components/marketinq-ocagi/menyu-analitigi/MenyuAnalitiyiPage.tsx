'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import MenyuAnalitiyiForm from './MenyuAnalitiyiForm';
import MenyuResultPanel from './MenyuResultPanel';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: {
    title: 'Menyu Analitigi',
    subtitle: 'BCG Matrisi ile menyu performansini analiz edin (Cornell metodu)',
    backToList: 'Butun aletler',
    whyTitle: 'Niye bu vacibdir?',
    why: 'Menyunun 20%-i satisin 80%-ni yaradir (Pareto qaydasi). Bu alet Boston BCG matrisi ile her yemeyi 4 kateqoriyaya bolur: STAR - yuksek satis + yuksek marja, PLOWHORSE - yuksek satis + asagi marja, PUZZLE - asagi satis + yuksek marja, DOG - asagi satis + asagi marja.',
    tier: 'SAGIRD',
    loading: 'Yuklenir...',
  },
  en: {
    title: 'Menu Analytics',
    subtitle: 'Analyze menu performance with BCG Matrix (Cornell method)',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: '20% of the menu creates 80% of sales. This tool separates items into STAR, PLOWHORSE, PUZZLE and DOG categories.',
    tier: 'STARTER',
    loading: 'Loading...',
  },
  tr: {
    title: 'Menu Analitigi',
    subtitle: 'BCG Matrisi ile menu performansini analiz edin',
    backToList: 'Tum araclar',
    whyTitle: 'Bu neden onemli?',
    why: 'Menunun %20si satisin %80ini yaratir. Bu arac urunleri STAR, PLOWHORSE, PUZZLE ve DOG kategorilerine ayirir.',
    tier: 'CIRAK',
    loading: 'Yukleniyor...',
  },
  ru: {
    title: 'Menu Analytics',
    subtitle: 'Analyze menu performance with BCG Matrix',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: '20% of the menu creates 80% of sales. This tool separates items into STAR, PLOWHORSE, PUZZLE and DOG categories.',
    tier: 'STARTER',
    loading: 'Loading...',
  },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function MenyuAnalitiyiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.sagird;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/menyu-analitigi')
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
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-2 text-sm font-bold text-[var(--dk-navy)]">{c.whyTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{c.why}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-400">{c.loading}</div>}
      {view === 'form' && <MenyuAnalitiyiForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <MenyuResultPanel result={result as Parameters<typeof MenyuResultPanel>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
