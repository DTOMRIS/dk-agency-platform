/**
 * @file AiReadinessScore.tsx
 * @purpose Homepage AI readiness test — intro → questions → score + recommended tools + KAZAN CTA.
 * @pattern A (useTranslations) — ai_readiness (+ homeV2.ai for the v2 intro labels)
 * @task TASK-0512 (2026-10-08: restyled to the v2 cream/ink design; logic and tracking unchanged)
 */

'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { useLocale } from 'next-intl';
import { ArrowRight, ArrowLeft, RotateCcw, Sparkles, Wrench } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/yandex-metrica';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import {
  aiReadinessQuestions,
  AI_READINESS_MAX_SCORE,
  getSegment,
} from '@/lib/ai-readiness-score-config';
import styles from '@/components/home/v2/homeV2.module.css';
import { inter } from '@/components/home/v2/font';

/** Number of question labels previewed on the intro card. */
const PREVIEW_COUNT = 3;

function ScoreCircle({ score, max }: { score: number | null; max: number }) {
  const pct = score === null ? 0 : score / max;
  const r = 54;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct);
  const color = pct >= 0.7 ? '#047857' : pct >= 0.37 ? '#b45309' : 'var(--dk-red, #E94560)';

  return (
    <svg
      width="140"
      height="140"
      viewBox="0 0 120 120"
      className={styles.aiRing}
      aria-hidden="true"
    >
      <circle cx="60" cy="60" r={r} fill="none" stroke="#efe8dc" strokeWidth="8" />
      {score !== null ? (
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
          className={styles.aiRingArc}
        />
      ) : null}
      <text x="60" y="58" textAnchor="middle" fontSize="28" fontWeight="900" fill="#0F172A">
        {score === null ? '?' : score}
      </text>
      <text x="60" y="76" textAnchor="middle" fontSize="11" fontWeight="600" fill="#5b6474">
        / {max}
      </text>
    </svg>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <section id="ai-readiness" className={`${styles.v2} ${inter.className} ${styles.ai}`}>
      <div className={styles.sec}>
        <div className={styles.wrap}>{children}</div>
      </div>
    </section>
  );
}

export default function AiReadinessScore() {
  const t = useTranslations('ai_readiness');
  const tv = useTranslations('homeV2.ai');
  const locale = useLocale();
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});

  const questions = aiReadinessQuestions;
  const currentQ = questions[step];
  const isLastStep = step === questions.length - 1;

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
    trackEvent(ANALYTICS_EVENTS.AI_READINESS_COMPLETED, { score: totalScore, segment: segment.id });
  };

  // Intro state
  if (!started) {
    return (
      <Shell>
        <div className={styles.aiIntro}>
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.dot} />
              {tv('eyebrow')}
            </span>
            <h2 className={styles.h2}>{t('section_title')}</h2>
            <p className={styles.aiLead}>{t('section_description')}</p>
            <button
              type="button"
              onClick={() => {
                setStarted(true);
                trackEvent(ANALYTICS_EVENTS.AI_READINESS_STARTED);
              }}
              className={`${styles.btn} ${styles.btnRed} ${styles.aiStart}`}
            >
              <Sparkles className={styles.aiBtnIc} aria-hidden="true" />
              {t('start_button')}
            </button>
          </div>

          <div className={styles.aiPreview}>
            <div className={styles.aiPreviewTop}>
              <ScoreCircle score={null} max={AI_READINESS_MAX_SCORE} />
              <div>
                <b className={styles.aiPreviewMeta}>
                  {tv('meta', { n: questions.length, max: AI_READINESS_MAX_SCORE })}
                </b>
                <span className={styles.aiPreviewHint}>{tv('resultHint')}</span>
              </div>
            </div>
            <span className={styles.aiPreviewLbl}>{tv('preview')}</span>
            <ol className={styles.aiQList}>
              {questions.slice(0, PREVIEW_COUNT).map((q, i) => (
                <li key={q.id}>
                  <span className={styles.n}>{i + 1}</span>
                  <span>{t(`${q.translationKey.replace('ai_readiness.', '')}.label`)}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Shell>
    );
  }

  // Result state
  if (step >= questions.length) {
    const segKey = segment.translationKey.replace('ai_readiness.', '');
    return (
      <Shell>
        <div className={`${styles.aiCard} ${styles.aiResult}`}>
          <p className={styles.aiPreviewLbl}>{t('result.score_label')}</p>
          <ScoreCircle score={totalScore} max={AI_READINESS_MAX_SCORE} />

          <h3 className={styles.aiH3}>{t(`${segKey}.title`)}</h3>
          <p className={styles.aiLead}>{t(`${segKey}.description`)}</p>

          <div className={styles.aiTools}>
            <p className={styles.aiPreviewLbl}>{t('result.recommended_tools_title')}</p>
            <div className={styles.aiToolList}>
              {segment.recommendedTools.map((slug) => (
                <Link key={slug} href={`/${locale}/toolkit/${slug}`} className={styles.aiTool}>
                  <Wrench className={styles.aiBtnIc} aria-hidden="true" />
                  {slug}
                </Link>
              ))}
            </div>
          </div>

          <div className={styles.aiActions}>
            <Link
              href={`/${locale}/kazan-ai?context=ai_readiness_result&segment=${segment.id}`}
              className={`${styles.btn} ${styles.btnRed}`}
            >
              <Sparkles className={styles.aiBtnIc} aria-hidden="true" />
              {t('result.kazan_cta')}
            </Link>
            <button
              type="button"
              onClick={handleRestart}
              className={`${styles.btn} ${styles.btnGhost}`}
            >
              <RotateCcw className={styles.aiBtnIc} aria-hidden="true" />
              {t('result.restart')}
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  // Question state
  const qKey = currentQ.translationKey.replace('ai_readiness.', '');
  const selectedOption = answers[currentQ.id];

  return (
    <Shell>
      <div className={styles.aiCard}>
        {/* Progress */}
        <div className={styles.aiProgress}>
          <span className={styles.aiStep}>
            {step + 1} {t('navigation.question_of')}
          </span>
          <div className={styles.aiBar}>
            <div
              className={styles.aiBarFill}
              style={{ width: `${((step + 1) / questions.length) * 100}%` }}
            />
          </div>
        </div>

        <h3 className={styles.aiQ}>{t(`${qKey}.label`)}</h3>

        <div className={styles.aiOpts}>
          {currentQ.options.map((opt) => {
            const optKey = opt.translationKey.replace('ai_readiness.', '');
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleSelect(currentQ.id, opt.id)}
                className={`${styles.aiOpt} ${isSelected ? styles.aiOptOn : ''}`}
              >
                <span className={styles.aiRadio} aria-hidden="true" />
                {t(optKey)}
              </button>
            );
          })}
        </div>

        {/* Navigation */}
        <div className={styles.aiNav}>
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 0}
            className={styles.aiBack}
          >
            <ArrowLeft className={styles.aiBtnIc} aria-hidden="true" />
            {t('navigation.back')}
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!selectedOption}
              className={`${styles.btn} ${styles.btnRed} ${styles.aiNext}`}
            >
              {t('result.score_label')}
              <ArrowRight className={styles.aiBtnIc} aria-hidden="true" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedOption}
              className={`${styles.btn} ${styles.btnRed} ${styles.aiNext}`}
            >
              {t('navigation.next')}
              <ArrowRight className={styles.aiBtnIc} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </Shell>
  );
}
