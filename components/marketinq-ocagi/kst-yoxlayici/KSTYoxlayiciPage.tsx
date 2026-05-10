'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import KSTQuestionnaireForm from './KSTQuestionnaireForm';
import KSTResultCard from './KSTResultCard';

const pageCopy: Record<Locale, {
  title: string;
  subtitle: string;
  backToList: string;
  whyTitle: string;
  why: string;
  tier: string;
  loading: string;
}> = {
  az: {
    title: 'KST Yoxlayıcı',
    subtitle: 'Keyfiyyət, Servis, Təmizlik öz-özünə audit',
    backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?',
    why: 'KST mükəmməlliyi bütün marketinq səylərinin təməlidir. Servis yavaş, məkan kirli, yemək keyfiyyətsizdirsə — heç bir reklam dönüşüm yaratmır. Bu alət 30 sualla 3 sahəni ölçür.',
    tier: 'ŞAGIRD',
    loading: 'Yüklənir...',
  },
  en: {
    title: 'QSC Checker',
    subtitle: 'Quality, Service, Cleanliness self-audit',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: 'QSC excellence is the foundation of all marketing efforts. If service is slow, the place is dirty, or food quality is poor — no ad will convert.',
    tier: 'STARTER',
    loading: 'Loading...',
  },
  tr: {
    title: 'KST Denetçisi',
    subtitle: 'Kalite, Servis, Temizlik öz denetimi',
    backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?',
    why: 'KST mükemmelliği tüm pazarlama çabalarının temelidir. Servis yavaş, mekan kirli, yemek kalitesizse — hiçbir reklam dönüşüm yaratmaz.',
    tier: 'ÇIRAK',
    loading: 'Yükleniyor...',
  },
  ru: {
    title: 'KST Аудитор',
    subtitle: 'Самопроверка Качества, Сервиса, Чистоты',
    backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?',
    why: 'Совершенство KST — основа всех маркетинговых усилий. Если сервис медленный, место грязное или еда некачественная — никакая реклама не сработает.',
    tier: 'УЧЕНИК',
    loading: 'Загрузка...',
  },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function KSTYoxlayiciPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];
  const tierColors = TIER_COLORS.sagird;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/marketing-tools/kst-yoxlayici');
        const data = await res.json();
        if (data.hasRun && data.lastResult) {
          setResult(data.lastResult);
          setView('result');
        } else {
          setView('form');
        }
      } catch {
        setView('form');
      }
    }
    void loadHistory();
  }, []);

  function handleResult(data: unknown) {
    setResult(data);
    setError(null);
    setView('result');
  }

  function handleError(msg: string) {
    setError(msg);
  }

  function handleRedo() {
    setView('form');
    setError(null);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-8">
      <Link
        href="/dashboard/marketinq-ocagi"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-[var(--dk-navy)]"
      >
        <ArrowLeft size={16} />
        {copy.backToList}
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{copy.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{copy.subtitle}</p>
        </div>
        <span className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${tierColors.bg} ${tierColors.text} ${tierColors.border}`}>
          {copy.tier}
        </span>
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

      {view === 'loading' && (
        <div className="py-12 text-center text-sm text-slate-400">{copy.loading}</div>
      )}

      {view === 'form' && (
        <KSTQuestionnaireForm locale={locale} onResult={handleResult} onError={handleError} />
      )}

      {view === 'result' && result && (
        <KSTResultCard
          result={result as Parameters<typeof KSTResultCard>[0]['result']}
          locale={locale}
          onRedo={handleRedo}
        />
      )}
    </div>
  );
}
