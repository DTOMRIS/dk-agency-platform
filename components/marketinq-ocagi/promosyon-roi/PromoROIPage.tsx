'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import PromoROIForm from './PromoROIForm';
import PromoROIResult from './PromoROIResult';

const pageCopy: Record<Locale, { title: string; subtitle: string; backToList: string; whyTitle: string; why: string; tier: string; loading: string }> = {
  az: { title: 'Promosyon ROI', subtitle: 'Baz Həftə vs Promo Həftə — real ROI hesabla', backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?', why: 'Endirimsiz də gələcək müştərilərin əlavə endirimi sənin marjını yeyir. Bu alət TC, Gross Margin və SOI ilə real incrementil satışı ölçür.',
    tier: 'KALFA', loading: 'Yüklənir...' },
  en: { title: 'Promo ROI', subtitle: 'Base Week vs Promo Week — real ROI calculation', backToList: 'All tools',
    whyTitle: 'Why is this important?', why: 'Discounts may bring existing customers at lower margin. This tool measures incremental sales with TC, Gross Margin and SOI.',
    tier: 'PRO', loading: 'Loading...' },
  tr: { title: 'Promosyon ROI', subtitle: 'Baz Hafta vs Promo Hafta — gerçek ROI', backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?', why: 'İndirimler mevcut müşterilere düşük marjla hizmet verebilir. Bu araç TC, Brüt Marj ve SOI ile artımlı satışı ölçer.',
    tier: 'KALFA', loading: 'Yükleniyor...' },
  ru: { title: 'ROI Промоакций', subtitle: 'Базовая vs Промо неделя — реальный ROI', backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?', why: 'Скидки могут привлечь существующих клиентов с меньшей маржой. Этот инструмент измеряет прирост с TC, Маржой и SOI.',
    tier: 'ПОДМАСТЕРЬЕ', loading: 'Загрузка...' },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function PromoROIPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];
  const tierColors = TIER_COLORS.kalfa;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/marketing-tools/promosyon-roi')
      .then((r) => r.json())
      .then((data) => {
        if (data.hasRun && data.lastResult) { setResult(data.lastResult); setView('result'); }
        else setView('form');
      })
      .catch(() => setView('form'));
  }, []);

  return (
    <div className="mx-auto max-w-3xl px-6 py-8">
      <Link href="/dashboard/marketinq-ocagi" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />{copy.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>{copy.tier}</span>
      </div>

      {view !== 'result' && (
        <div className="mb-8 rounded-2xl border border-slate-200 bg-slate-50 p-5">
          <h2 className="mb-2 text-sm font-bold text-[var(--dk-navy)]">{copy.whyTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-600">{copy.why}</p>
        </div>
      )}

      {error && (
        <div className="mb-6 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {view === 'loading' && <div className="py-12 text-center text-sm text-slate-400">{copy.loading}</div>}
      {view === 'form' && <PromoROIForm locale={locale} onResult={(d) => { setResult(d); setError(null); setView('result'); }} onError={setError} />}
      {view === 'result' && result && <PromoROIResult result={result as Parameters<typeof PromoROIResult>[0]['result']} locale={locale} onRedo={() => { setView('form'); setError(null); }} />}
    </div>
  );
}
