'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import QuestionnaireForm from './QuestionnaireForm';
import ResultCard from './ResultCard';

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
    title: 'Marka Kompası',
    subtitle: '5 sualda restoranınızın bazardakı yerini tapın',
    backToList: 'Bütün alətlər',
    whyTitle: 'Niyə bu vacibdir?',
    why: 'Konum (positioning) ucuz/lüks etiketlərdən ibarət deyil — kim üçün, hansı problem, niyə fərqli? Bu kompas 5 sualla cavab verir.',
    tier: 'ŞAGIRD',
    loading: 'Yüklənir...',
  },
  en: {
    title: 'Brand Compass',
    subtitle: 'Find your market position in 5 questions',
    backToList: 'All tools',
    whyTitle: 'Why is this important?',
    why: 'Positioning is not about cheap/luxury labels. It is about who, what problem, why different. This compass answers in 5 questions.',
    tier: 'STARTER',
    loading: 'Loading...',
  },
  tr: {
    title: 'Marka Pusulası',
    subtitle: '5 soruda pazardaki konumunuzu bulun',
    backToList: 'Tüm araçlar',
    whyTitle: 'Bu neden önemli?',
    why: 'Konumlandırma ucuz/lüks etiketlerinden ibaret değil — kime, hangi soruna, neden farklısınız?',
    tier: 'ÇIRAK',
    loading: 'Yükleniyor...',
  },
  ru: {
    title: 'Компас Бренда',
    subtitle: 'Найдите свою позицию за 5 вопросов',
    backToList: 'Все инструменты',
    whyTitle: 'Почему это важно?',
    why: 'Позиционирование — это не про дёшево/дорого. Это про кого, какую проблему, чем вы отличаетесь.',
    tier: 'УЧЕНИК',
    loading: 'Загрузка...',
  },
};

type ViewMode = 'loading' | 'form' | 'result';

export default function MarkaKompasiPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];
  const tierColors = TIER_COLORS.sagird;

  const [view, setView] = useState<ViewMode>('loading');
  const [result, setResult] = useState<unknown>(null);
  const [error, setError] = useState<string | null>(null);

  // History check on mount
  useEffect(() => {
    async function loadHistory() {
      try {
        const res = await fetch('/api/marketing-tools/marka-kompasi');
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
        <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5">
          <h2 className="mb-2 text-sm font-bold text-blue-900">Məlumat: {copy.whyTitle}</h2>
          <p className="text-sm leading-relaxed text-slate-800">{copy.why}</p>
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
        <QuestionnaireForm locale={locale} onResult={handleResult} onError={handleError} />
      )}

      {view === 'result' && result && (
        <ResultCard
          result={result as { icp: { who: string; context: string; painPoint: string }; valueProp: string; differentiators: string[]; tagline: string; useThisIn: string[] }}
          locale={locale}
          onRedo={handleRedo}
        />
      )}
    </div>
  );
}
