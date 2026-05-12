'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import SezonForm from './SezonForm';
import SezonResult from './SezonResult';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: { title: 'Sezon Planlaması', subtitle: '12 aylıq kampaniya və event takvimi', backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?', why: 'Novruz nə edək? sualını 1 həftə qala düşünmək — gec olur. Bu alət AZ bayramları, dünya günləri və HoReCa mövsümləri nəzərə alaraq bütün ili planlayır.',
    tier: 'KALFA', loading: 'Yüklənir...' },
  en: { title: 'Season Planning', subtitle: '12-month campaign & event calendar', backToList: 'All tools',
    whyTitle: 'Why is this important?', why: 'Planning holidays 1 week ahead is too late. This tool plans the full year with AZ holidays, world days, and HoReCa seasons.',
    tier: 'PRO', loading: 'Loading...' },
  tr: { title: 'Sezon Planlaması', subtitle: '12 aylık kampanya ve etkinlik takvimi', backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?', why: 'Bayramları 1 hafta önceden planlamak geç kalır. Bu araç AZ bayramları ve HoReCa sezonlarını planlıyor.',
    tier: 'KALFA', loading: 'Yükleniyor...' },
  ru: { title: 'Сезонное Планирование', subtitle: '12-месячный календарь кампаний', backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?', why: 'Планировать праздники за неделю — слишком поздно. Инструмент планирует весь год с учётом праздников и сезонов.',
    tier: 'ПОДМАСТЕРЬЕ', loading: 'Загрузка...' },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function SezonPlanlamaPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/sezon-planlama')
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
      {view === 'form' && <SezonForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <SezonResult result={result as Parameters<typeof SezonResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
