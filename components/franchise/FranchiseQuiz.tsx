'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import LeadForm from './LeadForm';

type ScoreQuizConfig = {
  variant?: 'score';
  namespace: string;
  questionCount: number;
  scoreOptions: readonly number[];
  storageKey: string;
  toolSource: 'readiness_test' | 'roi_calc' | 'buyer_checklist' | 'franchbook_gate' | 'academy' | 'consulting';
  aiReportPath: string | null;
  reportType?: 'FranchiseReadinessReport' | 'FranchiseBuyerReport';
  getVerdict: (avgScore: number) => string;
  getWeakestIndex: (scores: number[]) => number;
};

export type WizardField = {
  name: string;
  type: 'text' | 'textarea';
  required?: boolean;
  maxLength?: number;
};

export type WizardStep = {
  key: string;
  fields: WizardField[];
};

type WizardQuizConfig = {
  variant: 'wizard';
  namespace: string;
  storageKey: string;
  steps: WizardStep[];
  submitLabelKey?: string;
  onComplete: (values: Record<string, string>) => Promise<void> | void;
};

export type QuizConfig = ScoreQuizConfig | WizardQuizConfig;

function ScoreRing({ score }: { score: number }) {
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * score) / 100;

  return (
    <div className="relative mx-auto mb-4 h-44 w-44">
      <svg width="176" height="176" className="-rotate-90">
        <circle cx="88" cy="88" r={radius} fill="none" stroke="#eee" strokeWidth="13" />
        <circle
          cx="88"
          cy="88"
          r={radius}
          fill="none"
          stroke="url(#ring-grad)"
          strokeWidth="13"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#C5A022" />
            <stop offset="1" stopColor="#E94560" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center font-display text-5xl font-extrabold text-slate-900">
        {score}
      </div>
    </div>
  );
}

function fieldIsComplete(value: string | undefined, required: boolean | undefined) {
  return !required || Boolean(value?.trim());
}

function WizardQuiz({ config }: { config: WizardQuizConfig }) {
  const t = useTranslations(config.namespace);
  const [initialProgress] = useState(() => {
    if (typeof window === 'undefined') return { step: -1, values: {} as Record<string, string> };
    try {
      const saved = window.localStorage.getItem(config.storageKey);
      if (!saved) return { step: -1, values: {} as Record<string, string> };
      const parsed = JSON.parse(saved) as { step?: number; values?: Record<string, string> };
      return {
        step: typeof parsed.step === 'number' ? parsed.step : -1,
        values: parsed.values && typeof parsed.values === 'object' ? parsed.values : {},
      };
    } catch {
      return { step: -1, values: {} as Record<string, string> };
    }
  });
  const [step, setStep] = useState(initialProgress.step);
  const [values, setValues] = useState<Record<string, string>>(initialProgress.values);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (step >= 0 && step < config.steps.length) {
      localStorage.setItem(config.storageKey, JSON.stringify({ step, values }));
    }
  }, [config.steps.length, config.storageKey, step, values]);

  if (step === -1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
          {t('badge')}
        </span>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-slate-900">{t('title')}</h1>
        <p className="mb-2 text-base text-slate-500">{t('subtitle')}</p>
        <div className="my-6 border-l-[3px] border-[var(--dk-gold)] pl-5 text-sm text-slate-600">
          <p>{t('letter')}</p>
          <p className="mt-2 font-display font-bold text-slate-900">{t('letterSign')}</p>
        </div>
        <button
          onClick={() => setStep(0)}
          className="rounded-full bg-[var(--dk-gold)] px-7 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400"
        >
          {t('startCta')}
        </button>
      </div>
    );
  }

  const current = config.steps[step];
  const progress = (step / config.steps.length) * 100;
  const canContinue = current.fields.every((field) => fieldIsComplete(values[field.name], field.required));

  async function submitWizard() {
    setSubmitting(true);
    try {
      await config.onComplete(values);
      localStorage.removeItem(config.storageKey);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
        <span>{t('stepLabel', { current: step + 1, total: config.steps.length })}</span>
        <span>{Math.round(progress)}%</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-amber-50">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--dk-gold)] to-[var(--dk-red)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--dk-red)]">
        {t(`steps.${current.key}.eyebrow`)}
      </div>
      <h2 className="mb-5 font-display text-xl font-bold text-slate-900">{t(`steps.${current.key}.title`)}</h2>

      <div className="space-y-4">
        {current.fields.map((field) => {
          const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-[var(--dk-gold)] focus:outline-none';
          const value = values[field.name] ?? '';
          return (
            <label key={field.name} className="block">
              <span className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-500">
                {t(`fields.${field.name}.label`)}
              </span>
              {field.type === 'textarea' ? (
                <textarea
                  value={value}
                  maxLength={field.maxLength}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  rows={5}
                  className={inputClass}
                  placeholder={t(`fields.${field.name}.placeholder`)}
                />
              ) : (
                <input
                  value={value}
                  maxLength={field.maxLength}
                  onChange={(event) => setValues((prev) => ({ ...prev, [field.name]: event.target.value }))}
                  className={inputClass}
                  placeholder={t(`fields.${field.name}.placeholder`)}
                />
              )}
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex gap-3">
        {step > 0 && (
          <button
            onClick={() => setStep((currentStep) => currentStep - 1)}
            className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
          >
            {'<'} {t('back')}
          </button>
        )}
        <button
          onClick={() => {
            if (step === config.steps.length - 1) void submitWizard();
            else setStep((currentStep) => currentStep + 1);
          }}
          disabled={!canContinue || submitting}
          className="rounded-full bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400 disabled:opacity-40"
        >
          {submitting ? t('submitting') : step === config.steps.length - 1 ? t(config.submitLabelKey || 'submit') : t('next')}
        </button>
      </div>
    </div>
  );
}

function ScoreQuiz({ config }: { config: ScoreQuizConfig }) {
  const t = useTranslations(config.namespace);
  const locale = useLocale();
  const { questionCount, scoreOptions, storageKey, toolSource, aiReportPath } = config;

  const [initialProgress] = useState(() => {
    const fallback = { step: -1, answers: new Array<number | null>(questionCount).fill(null) };
    if (typeof window === 'undefined') return fallback;
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (!saved) return fallback;

      const parsed = JSON.parse(saved) as { step?: number; answers?: unknown };
      if (!Array.isArray(parsed.answers) || typeof parsed.step !== 'number') return fallback;
      return {
        step: parsed.step,
        answers: parsed.answers.slice(0, questionCount) as (number | null)[],
      };
    } catch {
      return fallback;
    }
  });
  const [step, setStep] = useState(initialProgress.step);
  const [answers, setAnswers] = useState<(number | null)[]>(initialProgress.answers);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (step >= 0 && step < questionCount) {
      localStorage.setItem(storageKey, JSON.stringify({ answers, step }));
    }
    if (step === questionCount) {
      localStorage.removeItem(storageKey);
    }
  }, [answers, questionCount, step, storageKey]);

  const pick = useCallback((optIdx: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[step] = scoreOptions[optIdx];
      return next;
    });
  }, [scoreOptions, step]);

  const validAnswers = answers.filter((answer): answer is number => answer !== null);
  const avgScore = validAnswers.length > 0
    ? Math.round(validAnswers.reduce((sum, value) => sum + value, 0) / questionCount)
    : 0;

  const fetchAiReport = useCallback(async () => {
    if (!aiReportPath) return;

    setAiLoading(true);
    try {
      const scores: Record<string, number> = {};
      for (let i = 0; i < questionCount; i++) {
        scores[t(`questions.${i}.cat`)] = answers[i] ?? 0;
      }

      const response = await fetch(aiReportPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scores,
          locale,
          avgScore,
          taskType: config.reportType,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiReport(data.report || null);
      }
    } catch {
      // AI is an enhancement; the quiz result remains usable without it.
    }
    setAiLoading(false);
  }, [aiReportPath, answers, avgScore, config.reportType, locale, questionCount, t]);

  useEffect(() => {
    if (step === questionCount && !aiReport && aiReportPath) {
      const timer = window.setTimeout(() => {
        void fetchAiReport();
      }, 0);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [aiReport, aiReportPath, fetchAiReport, questionCount, step]);

  const verdict = config.getVerdict(avgScore);
  const weakIdx = config.getWeakestIndex(validAnswers);

  if (step === -1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
          {t('badge')}
        </span>
        <h1 className="mb-3 font-display text-3xl font-extrabold text-slate-900">{t('title')}</h1>
        <p className="mb-2 text-base text-slate-500">{t('subtitle')}</p>
        <div className="my-6 border-l-[3px] border-[var(--dk-gold)] pl-5 text-sm text-slate-600">
          <p>{t('letter')}</p>
          <p className="mt-2 font-display font-bold text-slate-900">{t('letterSign')}</p>
        </div>
        <button
          onClick={() => setStep(0)}
          className="rounded-full bg-[var(--dk-gold)] px-7 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400"
        >
          {t('startCta')}
        </button>
      </div>
    );
  }

  if (step >= 0 && step < questionCount) {
    const progress = (step / questionCount) * 100;

    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
          <span>{t('stepLabel', { current: step + 1, total: questionCount })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-amber-50">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[var(--dk-gold)] to-[var(--dk-red)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--dk-red)]">
          {t(`questions.${step}.cat`)}
        </div>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">{t(`questions.${step}.q`)}</h2>

        <div className="space-y-3">
          {scoreOptions.map((score, optIdx) => (
            <button
              key={optIdx}
              onClick={() => pick(optIdx)}
              className={`block w-full rounded-xl border p-4 text-left text-sm transition ${
                answers[step] === score
                  ? 'border-[var(--dk-navy)] bg-amber-50 font-semibold'
                  : 'border-slate-200 hover:border-[var(--dk-gold)]'
              }`}
            >
              <span className="mr-2 font-bold text-slate-900">{String.fromCharCode(65 + optIdx)}.</span>
              {t(`questions.${step}.options.${optIdx}`)}
            </button>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep((current) => current - 1)}
              className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700"
            >
              {'<'} {t('back')}
            </button>
          )}
          <button
            onClick={() => setStep((current) => current + 1)}
            disabled={answers[step] === null}
            className="rounded-full bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400 disabled:opacity-40"
          >
            {step === questionCount - 1 ? t('seeResult') : t('next')}
          </button>
        </div>
      </div>
    );
  }

  const scoreData: Record<string, number> = {};
  for (let i = 0; i < questionCount; i++) {
    scoreData[t(`questions.${i}.cat`)] = answers[i] ?? 0;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <span className="mb-4 inline-block rounded-full border border-amber-200 bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700">
        {t('resultBadge')}
      </span>
      <ScoreRing score={avgScore} />
      <h2 className="text-center font-display text-2xl font-extrabold text-slate-900">{t(`verdict.${verdict}.title`)}</h2>
      <p className="mb-6 text-center text-sm text-slate-500">{t(`verdict.${verdict}.sub`)}</p>

      <div className="mb-6 space-y-2">
        {Array.from({ length: questionCount }, (_, i) => {
          const val = answers[i] ?? 0;
          const maxScore = scoreOptions[scoreOptions.length - 1] || 100;
          const pct = Math.max(0, Math.min(100, (val / maxScore) * 100));
          const color = pct >= 75 ? 'bg-[var(--dk-gold)]' : pct >= 50 ? 'bg-amber-400' : 'bg-[var(--dk-red)]';

          return (
            <div key={i}>
              <div className="flex justify-between text-xs font-semibold">
                <span>{t(`questions.${i}.cat`)}</span>
                <span>{val}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
        <h3 className="mb-1 text-sm font-bold text-slate-900">
          {t('weakestLabel')}: {t(`questions.${weakIdx}.cat`)}
        </h3>
        <p className="text-sm text-slate-600">{t('weakestBody')}</p>
      </div>

      {weakIdx === 5 && (
        <Link
          href="/franchise/francbuk-generatoru"
          className="mb-6 block rounded-xl border border-[var(--dk-gold)] bg-amber-50 p-4 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-100"
        >
          {t('franchbookCta')}
        </Link>
      )}

      {aiLoading && (
        <div className="mb-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
          {t('aiLoading')}
        </div>
      )}
      {aiReport && (
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-900">{t('aiReportTitle')}</h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{aiReport}</div>
        </div>
      )}

      <LeadForm toolSource={toolSource} score={scoreData} />
      <p className="mt-6 text-center text-xs text-slate-400">{t('disclaimer')}</p>
    </div>
  );
}

export default function FranchiseQuiz({ config }: { config: QuizConfig }) {
  if (config.variant === 'wizard') return <WizardQuiz config={config} />;
  return <ScoreQuiz config={config} />;
}
