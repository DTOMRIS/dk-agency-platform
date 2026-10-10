'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import { TIER_COLORS } from '@/lib/marketing-tools-config';
import KSTQuestionnaireForm from './KSTQuestionnaireForm';
import KSTResultCard from './KSTResultCard';
import { ToolInfoBox } from '@/components/marketing-tools/ToolInfoBox';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

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
    why: 'KST mükəmməlliyi bütün marketinq səylərinin təməlidir. Servis yavaş, məkan kirli, yemək keyfiyyətsizdirsə — heç bir reklam dönüşüm yaratmır. Bu alət 35 sualla 4 sahəni ölçür: keyfiyyət, servis, təmizlik və komanda.',
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
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="kst-yoxlayici" title={copy.title} subtitle={copy.subtitle} />

      {view !== 'result' && (
        <ToolInfoBox title={copy.whyTitle} variant="info">
          <p>{copy.why}</p>
        </ToolInfoBox>
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
