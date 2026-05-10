'use client';

import type { Locale } from '@/i18n/config';

interface KSTScores {
  quality: number;
  service: number;
  cleanliness: number;
  overall: number;
}

interface TopIssue {
  category: 'quality' | 'service' | 'cleanliness';
  questionId: string;
  score: number;
  rootCause: string;
  weekFixStep: string;
}

interface ActionWeek {
  title: string;
  steps: string[];
}

interface KSTResult {
  scores: KSTScores;
  industryBenchmark: KSTScores;
  topIssues: TopIssue[];
  actionPlan: { week1: ActionWeek; week2: ActionWeek; week3to4: ActionWeek };
  ahilikQuote: string;
  encouragement: string;
}

const resultCopy: Record<Locale, {
  title: string;
  benchmark: string;
  cats: Record<string, string>;
  vs: string;
  issuesTitle: string;
  fixStep: string;
  planTitle: string;
  weeks: Record<string, string>;
  redo: string;
  next: string;
}> = {
  az: {
    title: 'Sənin KST Skorun',
    benchmark: 'Sənaye norması: {v}%',
    cats: { quality: 'Keyfiyyət', service: 'Servis', cleanliness: 'Təmizlik' },
    vs: 'norma vs',
    issuesTitle: '3 Kritik Problem',
    fixStep: '1 həftəlik həll',
    planTitle: '30 Günlük Yol Xəritəsi',
    weeks: { week1: '1-ci həftə', week2: '2-ci həftə', week3to4: '3-4-cü həftə' },
    redo: 'Yenidən Doldur',
    next: 'Növbəti Alət',
  },
  en: {
    title: 'Your KST Score',
    benchmark: 'Industry norm: {v}%',
    cats: { quality: 'Quality', service: 'Service', cleanliness: 'Cleanliness' },
    vs: 'vs norm',
    issuesTitle: '3 Critical Issues',
    fixStep: '1-week fix',
    planTitle: '30-Day Roadmap',
    weeks: { week1: 'Week 1', week2: 'Week 2', week3to4: 'Weeks 3-4' },
    redo: 'Redo',
    next: 'Next Tool',
  },
  tr: {
    title: 'KST Puanınız',
    benchmark: 'Sektör normu: {v}%',
    cats: { quality: 'Kalite', service: 'Servis', cleanliness: 'Temizlik' },
    vs: 'norma vs',
    issuesTitle: '3 Kritik Sorun',
    fixStep: '1 haftalık çözüm',
    planTitle: '30 Günlük Yol Haritası',
    weeks: { week1: '1. hafta', week2: '2. hafta', week3to4: '3-4. hafta' },
    redo: 'Tekrar Doldur',
    next: 'Sonraki Araç',
  },
  ru: {
    title: 'Ваш KST Балл',
    benchmark: 'Норма отрасли: {v}%',
    cats: { quality: 'Качество', service: 'Сервис', cleanliness: 'Чистота' },
    vs: 'от нормы',
    issuesTitle: '3 Критические проблемы',
    fixStep: 'Решение за 1 неделю',
    planTitle: '30-дневная дорожная карта',
    weeks: { week1: '1-я неделя', week2: '2-я неделя', week3to4: '3-4-я недели' },
    redo: 'Заново',
    next: 'Следующий',
  },
};

function ScoreRing({ value, label, diff, locale }: { value: number; label: string; diff: number; locale: Locale }) {
  const copy = resultCopy[locale];
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
      <p className="mb-1 text-xs font-semibold text-slate-500">{label}</p>
      <p className="text-3xl font-bold text-[var(--dk-navy)]">{value}%</p>
      <p className={`mt-1 text-xs font-semibold ${diff >= 0 ? 'text-green-600' : 'text-amber-600'}`}>
        {diff >= 0 ? '+' : ''}{diff} {copy.vs}
      </p>
    </div>
  );
}

interface Props {
  result: KSTResult;
  locale: Locale;
  onRedo: () => void;
}

export default function KSTResultCard({ result, locale, onRedo }: Props) {
  const copy = resultCopy[locale];

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="rounded-2xl border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-6 text-center">
        <p className="text-sm font-bold uppercase tracking-wider text-[var(--dk-gold)]">{copy.title}</p>
        <p className="mt-2 text-6xl font-bold text-[var(--dk-navy)]">{result.scores.overall}%</p>
        <p className="mt-2 text-xs text-slate-500">
          {copy.benchmark.replace('{v}', String(result.industryBenchmark.overall))}
        </p>
      </div>

      {/* 3 category scores */}
      <div className="grid grid-cols-3 gap-3">
        {(['quality', 'service', 'cleanliness'] as const).map((cat) => (
          <ScoreRing
            key={cat}
            value={result.scores[cat]}
            label={copy.cats[cat]}
            diff={result.scores[cat] - result.industryBenchmark[cat]}
            locale={locale}
          />
        ))}
      </div>

      {/* Top 3 issues */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{copy.issuesTitle}</h3>
        <div className="space-y-4">
          {result.topIssues.map((issue, i) => (
            <div key={i} className="border-l-4 border-amber-400 py-2 pl-4">
              <p className="text-xs text-slate-500">
                {copy.cats[issue.category]} · {issue.questionId} · {issue.score}/5
              </p>
              <p className="mt-1 text-sm font-semibold text-[var(--dk-navy)]">{issue.rootCause}</p>
              <p className="mt-1 text-sm text-slate-600">
                <span className="font-semibold">{copy.fixStep}:</span> {issue.weekFixStep}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 30-day action plan */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{copy.planTitle}</h3>
        <div className="space-y-5">
          {(['week1', 'week2', 'week3to4'] as const).map((week) => (
            <div key={week}>
              <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-[var(--dk-gold)]">
                {copy.weeks[week]} — {result.actionPlan[week].title}
              </h4>
              <ul className="space-y-1.5 text-sm text-slate-600">
                {result.actionPlan[week].steps.map((step, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-1 shrink-0 text-slate-400">•</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Ahilik + encouragement */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
        <p className="text-sm italic text-slate-500">&ldquo;{result.ahilikQuote}&rdquo;</p>
        <p className="mt-1 text-xs text-slate-400">— Əhilik ənənəsi</p>
        <p className="mt-4 text-sm font-medium text-[var(--dk-navy)]">{result.encouragement}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={onRedo}
          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]"
        >
          {copy.redo}
        </button>
        <a
          href="/dashboard/marketinq-ocagi"
          className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90"
        >
          {copy.next}
        </a>
      </div>
    </div>
  );
}
