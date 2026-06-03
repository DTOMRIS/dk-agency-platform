'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { QUESTION_COUNT, QUESTION_SCORES, getVerdict, getWeakestIndex } from '@/lib/data/franchiseReadiness';
import LeadForm from './LeadForm';

const STORAGE_KEY = 'dk-franchise-readiness';

// SVG ring chart
function ScoreRing({ score }: { score: number }) {
  const r = 74;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * score / 100);
  return (
    <div className="relative mx-auto mb-4 h-44 w-44">
      <svg width="176" height="176" className="-rotate-90">
        <circle cx="88" cy="88" r={r} fill="none" stroke="#eee" strokeWidth="13" />
        <circle
          cx="88" cy="88" r={r} fill="none"
          stroke="url(#ring-grad)" strokeWidth="13" strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
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

export default function ReadinessQuiz() {
  const t = useTranslations('franchiseReadiness');
  const locale = useLocale();
  const [step, setStep] = useState(-1); // -1 = intro, 0..11 = questions, 12 = result
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(QUESTION_COUNT).fill(null));
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Resume from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.answers) && typeof parsed.step === 'number') {
          setAnswers(parsed.answers);
          setStep(parsed.step);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // Save progress
  useEffect(() => {
    if (step >= 0 && step < QUESTION_COUNT) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ answers, step }));
    }
    if (step === QUESTION_COUNT) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [step, answers]);

  const pick = useCallback((optIdx: number) => {
    setAnswers(prev => {
      const next = [...prev];
      next[step] = QUESTION_SCORES[optIdx];
      return next;
    });
  }, [step]);

  const avgScore = Math.round(
    answers.filter((a): a is number => a !== null).reduce((s, v) => s + v, 0) / QUESTION_COUNT
  );

  // AI report fetch
  const fetchAiReport = useCallback(async () => {
    setAiLoading(true);
    try {
      const categories = Array.from({ length: QUESTION_COUNT }, (_, i) => t(`questions.${i}.cat`));
      const scores: Record<string, number> = {};
      categories.forEach((cat, i) => { scores[cat] = answers[i] || 0; });

      const res = await fetch('/api/franchise/readiness-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scores, locale, avgScore }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReport(data.report || null);
      }
    } catch { /* silent */ }
    setAiLoading(false);
  }, [answers, locale, avgScore, t]);

  // Trigger AI on result
  useEffect(() => {
    if (step === QUESTION_COUNT && !aiReport) fetchAiReport();
  }, [step, aiReport, fetchAiReport]);

  const verdict = getVerdict(avgScore);
  const weakIdx = getWeakestIndex(answers.filter((a): a is number => a !== null));

  // ── INTRO ──
  if (step === -1) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <span className="mb-3 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 border border-amber-200">
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

  // ── QUESTIONS ──
  if (step >= 0 && step < QUESTION_COUNT) {
    const progress = (step / QUESTION_COUNT) * 100;
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-1 flex justify-between text-xs font-semibold text-slate-400">
          <span>{t('stepLabel', { current: step + 1, total: QUESTION_COUNT })}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="mb-6 h-2 overflow-hidden rounded-full bg-amber-50">
          <div className="h-full rounded-full bg-gradient-to-r from-[var(--dk-gold)] to-[var(--dk-red)] transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        <div className="mb-1 text-xs font-bold uppercase tracking-widest text-[var(--dk-red)]">
          {t(`questions.${step}.cat`)}
        </div>
        <h2 className="mb-5 font-display text-xl font-bold text-slate-900">{t(`questions.${step}.q`)}</h2>

        <div className="space-y-3">
          {QUESTION_SCORES.map((score, optIdx) => (
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
            <button onClick={() => setStep(s => s - 1)} className="rounded-full bg-slate-100 px-5 py-3 text-sm font-bold text-slate-700">
              ← {t('back')}
            </button>
          )}
          <button
            onClick={() => setStep(s => s + 1)}
            disabled={answers[step] === null}
            className="rounded-full bg-[var(--dk-gold)] px-6 py-3 text-sm font-bold text-[var(--dk-navy)] transition hover:bg-amber-400 disabled:opacity-40"
          >
            {step === QUESTION_COUNT - 1 ? t('seeResult') : t('next')}
          </button>
        </div>
      </div>
    );
  }

  // ── RESULTS ──
  const scoreData: Record<string, number> = {};
  for (let i = 0; i < QUESTION_COUNT; i++) {
    scoreData[t(`questions.${i}.cat`)] = answers[i] || 0;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
      <span className="mb-4 inline-block rounded-full bg-amber-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-amber-700 border border-amber-200">
        {t('resultBadge')}
      </span>

      <ScoreRing score={avgScore} />
      <h2 className="text-center font-display text-2xl font-extrabold text-slate-900">{t(`verdict.${verdict}.title`)}</h2>
      <p className="mb-6 text-center text-sm text-slate-500">{t(`verdict.${verdict}.sub`)}</p>

      {/* Per-criterion bars */}
      <div className="mb-6 space-y-2">
        {Array.from({ length: QUESTION_COUNT }, (_, i) => {
          const val = answers[i] || 0;
          const color = val >= 75 ? 'bg-[var(--dk-gold)]' : val >= 50 ? 'bg-amber-400' : 'bg-[var(--dk-red)]';
          return (
            <div key={i}>
              <div className="flex justify-between text-xs font-semibold">
                <span>{t(`questions.${i}.cat`)}</span>
                <span>{val}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${val}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Weakest area */}
      <div className="mb-6 rounded-xl bg-amber-50 border border-amber-200 p-4">
        <h3 className="mb-1 text-sm font-bold text-slate-900">
          {t('weakestLabel')}: {t(`questions.${weakIdx}.cat`)}
        </h3>
        <p className="text-sm text-slate-600">{t('weakestBody')}</p>
      </div>

      {/* AI Report */}
      {aiLoading && (
        <div className="mb-6 rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
          {t('aiLoading')}
        </div>
      )}
      {aiReport && (
        <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-5">
          <h3 className="mb-2 text-sm font-bold text-slate-900">{t('aiReportTitle')}</h3>
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{aiReport}</div>
        </div>
      )}

      {/* Lead Form */}
      <LeadForm toolSource="readiness_test" score={scoreData} />

      <p className="mt-6 text-center text-xs text-slate-400">{t('disclaimer')}</p>
    </div>
  );
}
