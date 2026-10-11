'use client';

import { startTransition, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import LeadForm from './LeadForm';
import RadarChart from './RadarChart';
import ToolResetControls from '@/components/toolkit/ToolResetControls';

/* v2 look (cream / ink / one red accent, rounded-[22px] cards) — shared by the franchise quizzes, the
   Franchbook wizard and the Toolkit hotel / OTA quizzes. Styling only; scoring is untouched. */
const CARD = 'rounded-[22px] border border-[#E4DCCD] bg-white p-6 sm:p-8';
const EYEBROW = 'inline-flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.14em] text-[#BE2F47]';
const H1 = 'text-[clamp(28px,4vw,44px)] font-black leading-[1.05] tracking-[-0.04em] text-[#0F172A]';
const H2 = 'text-[clamp(20px,2.4vw,26px)] font-black leading-tight tracking-[-0.03em] text-[#0F172A]';
const BTN_PRIMARY =
  'inline-flex min-h-11 items-center justify-center rounded-full bg-dk-red-strong px-6 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep disabled:cursor-not-allowed disabled:opacity-40';
const BTN_SECONDARY =
  'inline-flex min-h-11 items-center justify-center rounded-full border border-[#E4DCCD] bg-white px-5 text-[14px] font-bold text-[#0F172A] transition-colors hover:border-[#0F172A]';
const LETTER = 'my-6 rounded-2xl border-l-[3px] border-[#BE2F47] bg-[#FBF8F3] px-5 py-4 text-[14.5px] leading-6 text-slate-700';
const INPUT =
  'w-full rounded-xl border border-[#E4DCCD] bg-white px-4 py-3 text-[15px] text-[#0F172A] placeholder:text-slate-400 outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className={EYEBROW}>
      <span className="h-[7px] w-[7px] rounded-full bg-[#E94560]" aria-hidden="true" />
      {children}
    </span>
  );
}

function Progress({ label, progress }: { label: string; progress: number }) {
  return (
    <>
      <div className="mb-2 flex justify-between text-[12.5px] font-bold text-slate-600">
        <span>{label}</span>
        <span className="tabular-nums">{Math.round(progress)}%</span>
      </div>
      <div className="mb-6 h-2 overflow-hidden rounded-full bg-[#F3ECE1]">
        <div className="h-full rounded-full bg-dk-red-strong transition-all duration-300" style={{ width: `${progress}%` }} />
      </div>
    </>
  );
}

/** Minimal markdown→HTML for AI report output (trusted source, no user input). */
function renderMarkdown(md: string): string {
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/^[-*] (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    .replace(/\n{2,}/g, '</p><p>')
    .replace(/\n/g, '<br/>')
    .replace(/^/, '<p>').replace(/$/, '</p>')
    .replace(/<p><h([123])>/g, '<h$1>').replace(/<\/h([123])><\/p>/g, '</h$1>')
    .replace(/<p><ul>/g, '<ul>').replace(/<\/ul><\/p>/g, '</ul>')
    .replace(/<p><\/p>/g, '');
}

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
  /**
   * TASK-0517 (Toolkit quizzes): show the shared «Təmizlə / Geri al» controls while answering and
   * on the result. Default off — franchise quizzes are unchanged.
   */
  resetControls?: boolean;
  /**
   * Question index whose «weakest» result shows the Franchbook CTA. Default 5 (franchise readiness);
   * null = never (the Toolkit quizzes have no `franchbookCta` copy and no Franchbook link).
   */
  franchbookCtaIndex?: number | null;
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

function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) { startTransition(() => setValue(target)); return; }
    const start = performance.now();
    function tick(now: number) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      startTransition(() => setValue(Math.round(target * eased)));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, duration]);
  return value;
}

function ScoreRing({ score }: { score: number }) {
  const displayScore = useCountUp(score);
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (circumference * displayScore) / 100;

  return (
    <div className="relative mx-auto mb-4 h-44 w-44">
      <svg width="176" height="176" className="-rotate-90">
        <circle cx="88" cy="88" r={radius} fill="none" stroke="#EFE9DE" strokeWidth="13" />
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
          className="transition-all duration-100"
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#F28A9B" />
            <stop offset="1" stopColor="#BE2F47" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-5xl font-black tracking-[-0.04em] text-[#0F172A] tabular-nums">
        {displayScore}
      </div>
    </div>
  );
}

function fieldIsComplete(value: string | undefined, field: WizardField) {
  if (!field.required) return true;
  const trimmed = value?.trim() || '';
  if (!trimmed) return false;
  const minLen = field.type === 'textarea' ? 10 : 2;
  return trimmed.length >= minLen;
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
      <div className={CARD}>
        <Eyebrow>{t('badge')}</Eyebrow>
        <h1 className={`mt-3 mb-3 ${H1}`}>{t('title')}</h1>
        <p className="mb-2 text-[16px] leading-7 text-slate-600">{t('subtitle')}</p>
        <div className={LETTER}>
          <p>{t('letter')}</p>
          <p className="mt-2 font-bold text-[#0F172A]">{t('letterSign')}</p>
        </div>
        <button type="button" onClick={() => setStep(0)} className={BTN_PRIMARY}>
          {t('startCta')}
        </button>
      </div>
    );
  }

  const current = config.steps[step];
  const progress = (step / config.steps.length) * 100;
  const canContinue = current.fields.every((field) => fieldIsComplete(values[field.name], field));

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
    <div className={CARD}>
      <Progress label={t('stepLabel', { current: step + 1, total: config.steps.length })} progress={progress} />

      <Eyebrow>{t(`steps.${current.key}.eyebrow`)}</Eyebrow>
      <h2 className={`mt-2 mb-5 ${H2}`}>{t(`steps.${current.key}.title`)}</h2>

      <div className="space-y-4">
        {current.fields.map((field) => {
          const inputClass = INPUT;
          const value = values[field.name] ?? '';
          return (
            <label key={field.name} className="block">
              <span className="mb-1.5 block text-[14px] font-bold text-[#0F172A]">
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

      <div className="mt-6 flex flex-wrap gap-3">
        {step > 0 && (
          <button type="button" onClick={() => setStep((currentStep) => currentStep - 1)} className={BTN_SECONDARY}>
            ← {t('back')}
          </button>
        )}
        <button
          onClick={() => {
            if (step === config.steps.length - 1) void submitWizard();
            else setStep((currentStep) => currentStep + 1);
          }}
          type="button"
          disabled={!canContinue || submitting}
          className={BTN_PRIMARY}
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
  // TASK-0538 (calc audit): answers score 25–100, so the worst possible average was shown as 25%. The ring, the
  // card and the bars show it rescaled to 0–100 ((x − min) / (max − min)); verdicts keep reading the raw average.
  const minOption = scoreOptions[0] ?? 0;
  const maxOption = scoreOptions[scoreOptions.length - 1] || 100;
  const displayScore = validAnswers.length > 0 ? rescaleToPercent(avgScore, minOption, maxOption) : 0;
  const weakIdx = config.getWeakestIndex(validAnswers);
  const franchbookIdx = config.franchbookCtaIndex === undefined ? 5 : config.franchbookCtaIndex;

  // TASK-0517: «Təmizlə» clears every answer and goes back to question 1; «Geri al» restores them.
  // Rendered at the same position in the question and result views so its status survives the switch.
  const resetControls = config.resetControls ? (
    <ToolResetControls<{ step: number; answers: (number | null)[]; aiReport: string | null }>
      className="mb-4"
      snapshot={() => ({ step, answers, aiReport })}
      restore={(saved) => {
        setAnswers(saved.answers);
        setAiReport(saved.aiReport);
        setStep(saved.step);
      }}
      onClear={() => {
        setAnswers(new Array<number | null>(questionCount).fill(null));
        setAiReport(null);
        setStep(0);
      }}
    />
  ) : null;

  if (step === -1) {
    return (
      <div className={CARD}>
        <Eyebrow>{t('badge')}</Eyebrow>
        <h1 className={`mt-3 mb-3 ${H1}`}>{t('title')}</h1>
        <p className="mb-2 text-[16px] leading-7 text-slate-600">{t('subtitle')}</p>
        <div className={LETTER}>
          <p>{t('letter')}</p>
          <p className="mt-2 font-bold text-[#0F172A]">{t('letterSign')}</p>
        </div>
        <button type="button" onClick={() => setStep(0)} className={BTN_PRIMARY}>
          {t('startCta')}
        </button>
      </div>
    );
  }

  if (step >= 0 && step < questionCount) {
    const progress = (step / questionCount) * 100;

    return (
      <>
      {resetControls}
      <div className={CARD} data-testid="tool-inputs">
        <Progress label={t('stepLabel', { current: step + 1, total: questionCount })} progress={progress} />

        <Eyebrow>{t(`questions.${step}.cat`)}</Eyebrow>
        <h2 className={`mt-2 mb-5 ${H2}`}>{t(`questions.${step}.q`)}</h2>

        <div className="space-y-3">
          {scoreOptions.map((score, optIdx) => (
            <button
              key={optIdx}
              type="button"
              aria-pressed={answers[step] === score}
              onClick={() => pick(optIdx)}
              className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left text-[15px] leading-6 transition ${
                answers[step] === score
                  ? 'border-[#0F172A] bg-[#FBF8F3] font-semibold text-[#0F172A] ring-1 ring-[#0F172A]'
                  : 'border-[#E4DCCD] bg-white text-slate-700 hover:border-[#0F172A] hover:text-[#0F172A]'
              }`}
            >
              <span
                className={`grid h-7 w-7 shrink-0 place-items-center rounded-full text-[12.5px] font-black ${
                  answers[step] === score ? 'bg-[#0F172A] text-white' : 'bg-[#F6F1E9] text-[#0F172A]'
                }`}
                aria-hidden="true"
              >
                {String.fromCharCode(65 + optIdx)}
              </span>
              {t(`questions.${step}.options.${optIdx}`)}
            </button>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((current) => current - 1)} className={BTN_SECONDARY}>
              ← {t('back')}
            </button>
          )}
          <button
            type="button"
            onClick={() => setStep((current) => current + 1)}
            disabled={answers[step] === null}
            className={BTN_PRIMARY}
          >
            {step === questionCount - 1 ? t('seeResult') : t('next')}
          </button>
        </div>
      </div>
      </>
    );
  }

  const scoreData: Record<string, number> = {};
  for (let i = 0; i < questionCount; i++) {
    scoreData[t(`questions.${i}.cat`)] = answers[i] ?? 0;
  }

  return (
    <>
    {resetControls}
    <div className={CARD}>
      <div className="mb-4">
        <Eyebrow>{t('resultBadge')}</Eyebrow>
      </div>
      <ScoreRing score={displayScore} />
      <h2 className={`text-center ${H2}`}>{t(`verdict.${verdict}.title`)}</h2>
      <p className="mx-auto mt-2 mb-6 max-w-xl text-center text-[14.5px] leading-6 text-slate-600">{t(`verdict.${verdict}.sub`)}</p>

      {/* Radar Chart */}
      <div className="mb-6">
        <RadarChart
          labels={Array.from({ length: questionCount }, (_, i) => t(`questions.${i}.cat`))}
          values={answers.map((a) => (a == null ? 0 : rescaleToPercent(a, minOption, maxOption)))}
          maxValue={100}
        />
      </div>

      {/* Share / Download */}
      <div className="mb-6 flex justify-center gap-3">
        <a
          href={`/api/franchise/result-card?type=${config.reportType === 'FranchiseBuyerReport' ? 'buyer' : 'readiness'}&score=${displayScore}&verdict=${encodeURIComponent(t(`verdict.${verdict}.title`))}&locale=${locale}`}
          download={`dk-franchise-${displayScore}.png`}
          className={`${BTN_SECONDARY} gap-2`}
        >
          {t('shareDownload')}
        </a>
      </div>

      <div className="mb-6 space-y-3 rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4 sm:p-5">
        {Array.from({ length: questionCount }, (_, i) => {
          const val = answers[i] ?? 0;
          const pct = answers[i] == null ? 0 : rescaleToPercent(val, minOption, maxOption);
          const color = val >= 75 ? 'bg-emerald-500' : val >= 50 ? 'bg-amber-400' : 'bg-dk-red-strong';

          return (
            <div key={i}>
              <div className="mb-1 flex justify-between gap-3 text-[13px] font-semibold text-[#0F172A]">
                <span>{t(`questions.${i}.cat`)}</span>
                <span className="tabular-nums">{answers[i] == null ? '—' : `${pct}%`}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#EFE9DE]">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mb-6 rounded-2xl border border-[#F4B8C3] bg-[#FDECEF] p-4 sm:p-5">
        <h3 className="mb-1 text-[15px] font-black text-[#0F172A]">
          {t('weakestLabel')}: {t(`questions.${weakIdx}.cat`)}
        </h3>
        <p className="text-[14px] leading-6 text-slate-700">{t('weakestBody')}</p>
      </div>

      {franchbookIdx !== null && weakIdx === franchbookIdx && (
        <Link
          href="/franchise/francbuk-generatoru"
          className="mb-6 block rounded-2xl bg-[#0F172A] p-4 text-[14.5px] font-bold text-white transition-colors hover:bg-[#1E293B] sm:p-5"
        >
          {t('franchbookCta')}
        </Link>
      )}

      {aiLoading && (
        <div className="mb-6 rounded-2xl bg-[#FBF8F3] p-4 text-center text-[14px] text-slate-600">
          {t('aiLoading')}
        </div>
      )}
      {aiReport && (
        <div className="mb-6 rounded-2xl border border-[#E4DCCD] bg-[#FBF8F3] p-5 sm:p-6">
          <h3 className="mb-2 text-[15px] font-black text-[#0F172A]">{t('aiReportTitle')}</h3>
          <div
            className="prose prose-sm prose-slate max-w-none text-sm leading-relaxed text-slate-700 [&_strong]:text-slate-900 [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-slate-900 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-slate-900 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-slate-900 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-1"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(aiReport) }}
          />
        </div>
      )}

      <LeadForm toolSource={toolSource} score={scoreData} />
      <p className="mt-6 text-center text-[12.5px] leading-5 text-slate-500">{t('disclaimer')}</p>
    </div>
    </>
  );
}

/** TASK-0538: (x − min) / (max − min) on a 0–100 scale. */
function rescaleToPercent(value: number, min: number, max: number): number {
  if (max <= min) return 0;
  return Math.round(Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100)));
}

export default function FranchiseQuiz({ config }: { config: QuizConfig }) {
  if (config.variant === 'wizard') return <WizardQuiz config={config} />;
  return <ScoreQuiz config={config} />;
}
