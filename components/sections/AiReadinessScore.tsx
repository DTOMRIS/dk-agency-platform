'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ArrowRight, ArrowLeft, RotateCcw, Sparkles, Wrench } from 'lucide-react';
import {
  aiReadinessQuestions,
  AI_READINESS_MAX_SCORE,
  getSegment,
} from '@/lib/ai-readiness-score-config';

function ScoreCircle({ score, max }: { score: number; max: number }) {
  const pct = score / max;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color =
    pct >= 0.7 ? 'var(--dk-emerald, #10B981)' : pct >= 0.37 ? 'var(--dk-amber, #F59E0B)' : 'var(--dk-red, #E94560)';

  return (
    <svg width="140" height="140" viewBox="0 0 120 120" className="mx-auto">
      <circle cx="60" cy="60" r={r} fill="none" stroke="#E5E7EB" strokeWidth="8" />
      <circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
        className="transition-all duration-700"
      />
      <text x="60" y="55" textAnchor="middle" className="text-2xl font-black" fill="#1A1A2E">
        {score}
      </text>
      <text x="60" y="73" textAnchor="middle" className="text-xs" fill="#6B7280">
        / {max}
      </text>
    </svg>
  );
}

export default function AiReadinessScore() {
  const t = useTranslations('ai_readiness');
  const locale = useLocale();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = aiReadinessQuestions;
  const currentQ = questions[step];
  const isLastStep = step === questions.length - 1;
  const allAnswered = questions.every((q) => answers[q.id]);

  const totalScore = questions.reduce((sum, q) => {
    const selected = q.options.find((o) => o.id === answers[q.id]);
    return sum + (selected?.score ?? 0);
  }, 0);

  const segment = getSegment(totalScore);

  const handleSelect = (questionId: string, optionId: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  };

  const handleNext = () => {
    if (isLastStep) return;
    setStep((s) => s + 1);
  };

  const handleBack = () => {
    if (step === 0) return;
    setStep((s) => s - 1);
  };

  const handleRestart = () => {
    setAnswers({});
    setStep(0);
    setStarted(false);
  };

  const handleFinish = () => {
    setStep(questions.length);
  };

  // Intro state
  if (!started) {
    return (
      <section id="ai-readiness" className="border-t border-[var(--dk-warm-border,#E5E7EB)] bg-[var(--dk-paper,#FAFAF8)] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-4 inline-flex rounded-full bg-[var(--dk-red-light,#FFF0F3)] px-4 py-2 text-xs font-bold uppercase tracking-[0.15em] text-[var(--dk-red,#E94560)]">
            AI Readiness
          </div>
          <h2 className="font-heading text-3xl font-black tracking-tight text-[var(--dk-navy,#1A1A2E)] md:text-4xl">
            {t('section_title')}
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-[var(--dk-ink-soft,#6B7280)]">
            {t('section_description')}
          </p>
          <button
            onClick={() => setStarted(true)}
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red,#E94560)] px-8 py-3.5 font-bold text-white transition hover:opacity-90"
          >
            <Sparkles className="h-5 w-5" />
            {t('start_button')}
          </button>
        </div>
      </section>
    );
  }

  // Result state
  if (step >= questions.length) {
    const segKey = segment.translationKey.replace('ai_readiness.', '');
    return (
      <section id="ai-readiness" className="border-t border-[var(--dk-warm-border,#E5E7EB)] bg-[var(--dk-paper,#FAFAF8)] px-4 py-16 md:px-8 md:py-20">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
              {t('result.score_label')}
            </p>
            <ScoreCircle score={totalScore} max={AI_READINESS_MAX_SCORE} />

            <h3 className="mt-6 font-heading text-2xl font-black text-[var(--dk-navy,#1A1A2E)]">
              {t(`${segKey}.title`)}
            </h3>
            <p className="mt-2 text-[var(--dk-ink-soft,#6B7280)]">
              {t(`${segKey}.description`)}
            </p>

            <div className="mt-8">
              <p className="mb-4 text-sm font-bold uppercase tracking-wider text-slate-500">
                {t('result.recommended_tools_title')}
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {segment.recommendedTools.map((slug) => (
                  <Link
                    key={slug}
                    href={`/${locale}/toolkit/${slug}`}
                    className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-[var(--dk-navy,#1A1A2E)] transition hover:border-[var(--dk-red,#E94560)] hover:bg-[var(--dk-red-light,#FFF0F3)]"
                  >
                    <Wrench className="h-4 w-4 text-[var(--dk-red,#E94560)]" />
                    {slug}
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href={`/${locale}/kazan-ai?context=ai_readiness_result&segment=${segment.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--dk-red,#E94560)] px-6 py-3 font-bold text-white transition hover:opacity-90"
              >
                <Sparkles className="h-5 w-5" />
                {t('result.kazan_cta')}
              </Link>
              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                {t('result.restart')}
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // Question state
  const qKey = currentQ.translationKey.replace('ai_readiness.', '');
  const selectedOption = answers[currentQ.id];

  return (
    <section id="ai-readiness" className="border-t border-[var(--dk-warm-border,#E5E7EB)] bg-[var(--dk-paper,#FAFAF8)] px-4 py-16 md:px-8 md:py-20">
      <div className="mx-auto max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-sm text-slate-500">
            <span className="font-semibold">{step + 1} {t('navigation.question_of')}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full rounded-full bg-[var(--dk-red,#E94560)] transition-all duration-300"
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
          <h3 className="mb-6 text-lg font-bold text-[var(--dk-navy,#1A1A2E)] md:text-xl">
            {t(`${qKey}.label`)}
          </h3>

          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const optKey = opt.translationKey.replace('ai_readiness.', '');
              const isSelected = selectedOption === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => handleSelect(currentQ.id, opt.id)}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 px-5 py-4 text-left text-sm font-medium transition ${
                    isSelected
                      ? 'border-[var(--dk-red,#E94560)] bg-[var(--dk-red-light,#FFF0F3)] text-[var(--dk-navy,#1A1A2E)]'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition ${
                      isSelected ? 'border-[var(--dk-red,#E94560)] bg-[var(--dk-red,#E94560)]' : 'border-slate-300'
                    }`}
                  >
                    {isSelected && (
                      <span className="h-2 w-2 rounded-full bg-white" />
                    )}
                  </span>
                  {t(`${optKey}.label`)}
                </button>
              );
            })}
          </div>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={handleBack}
              disabled={step === 0}
              className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 transition hover:text-slate-900 disabled:invisible"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('navigation.back')}
            </button>

            {isLastStep ? (
              <button
                onClick={handleFinish}
                disabled={!selectedOption}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red,#E94560)] px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('result.score_label')}
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!selectedOption}
                className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-red,#E94560)] px-6 py-3 font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t('navigation.next')}
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
