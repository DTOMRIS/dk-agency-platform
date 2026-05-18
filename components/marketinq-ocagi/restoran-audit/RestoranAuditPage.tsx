'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, ChevronDown, ClipboardCheck, Info, ShieldAlert } from 'lucide-react';
import {
  AUDIT_AREAS,
  AUDIT_QUESTIONS,
  DEFAULT_AUDIT_ANSWERS,
  calculateRestaurantAudit,
  getAuditQuestionsByArea,
  type ActionSeverity,
  type AuditAnswerValue,
  type AuditAreaId,
  type AuditLevel,
  type AuditQuestionId,
} from '@/lib/marketing-tools/restoran-audit';

function getIntlLocale(locale: string): string {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function scoreColor(score: number): string {
  if (score >= 80) return '#10B981';
  if (score >= 50) return '#C5A022';
  return '#E94560';
}

function levelClass(level: AuditLevel): string {
  if (level === 'usta') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (level === 'kalfa') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-red-200 bg-red-50 text-red-700';
}

function severityClass(severity: ActionSeverity): string {
  if (severity === 'stable') return 'border-emerald-200 bg-emerald-50';
  if (severity === 'warning') return 'border-amber-200 bg-amber-50';
  return 'border-red-200 bg-red-50';
}

function answerClass(value: AuditAnswerValue, selected: boolean): string {
  if (!selected) return 'border-slate-200 bg-white text-slate-500 hover:border-[var(--dk-gold)]';
  if (value === 2) return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  if (value === 1) return 'border-amber-300 bg-amber-50 text-amber-700';
  return 'border-red-300 bg-red-50 text-red-700';
}

function formatPercent(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function AreaBarChart({
  areaScores,
  areaLabel,
  chartLabel,
}: {
  areaScores: ReturnType<typeof calculateRestaurantAudit>['areaScores'];
  areaLabel: (areaId: AuditAreaId) => string;
  chartLabel: string;
}) {
  const width = 560;
  const height = 220;
  const left = 54;
  const bottom = 176;
  const barWidth = 52;
  const gap = 30;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={chartLabel}
        data-testid="restaurant-audit-chart"
        className="min-w-[540px]"
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = bottom - tick * 1.35;
          return (
            <g key={tick}>
              <line x1="38" y1={y} x2="536" y2={y} stroke="#E5E7EB" strokeWidth="1" />
              <text x="30" y={y + 4} textAnchor="end" className="fill-slate-400 text-[10px] font-bold">
                {tick}
              </text>
            </g>
          );
        })}
        {areaScores.map((area, index) => {
          const x = left + index * (barWidth + gap);
          const barHeight = Math.max(6, area.score * 1.35);
          const y = bottom - barHeight;
          return (
            <g key={area.areaId}>
              <rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill={scoreColor(area.score)} opacity="0.88" />
              <text x={x + barWidth / 2} y={y - 8} textAnchor="middle" className="text-[12px] font-extrabold" fill={scoreColor(area.score)}>
                {area.score}%
              </text>
              <text x={x + barWidth / 2} y="200" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">
                {areaLabel(area.areaId).slice(0, 13)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function RestoranAuditPage({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.restoranAudit');
  const locale = getIntlLocale(useLocale());
  const [answers, setAnswers] = useState<Record<AuditQuestionId, AuditAnswerValue>>(DEFAULT_AUDIT_ANSWERS);
  const [submitted, setSubmitted] = useState(false);
  const [openAreas, setOpenAreas] = useState<Record<AuditAreaId, boolean>>({
    finance_cash: true,
    operations_kitchen: false,
    staff_service: false,
    customer_experience: false,
    digital_presence: false,
    compliance_risk: false,
  });

  const result = useMemo(() => calculateRestaurantAudit(answers), [answers]);
  const answeredCount = useMemo(
    () => AUDIT_QUESTIONS.filter((question) => answers[question.id] !== undefined).length,
    [answers],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
  }

  function setAnswer(questionId: AuditQuestionId, value: AuditAnswerValue) {
    setAnswers((current) => ({ ...current, [questionId]: value }));
    setSubmitted(false);
  }

  function toggleArea(areaId: AuditAreaId) {
    setOpenAreas((current) => ({ ...current, [areaId]: !current[areaId] }));
  }

  function areaName(areaId: AuditAreaId): string {
    return t(`areas.${areaId}.name`);
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold uppercase text-purple-700">
          {t('tier')}
        </div>
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-extrabold text-[var(--dk-navy)]">{t('progress.title')}</p>
              <p className="mt-1 text-xs text-slate-500">
                {t('progress.answered', { answered: answeredCount, total: AUDIT_QUESTIONS.length })}
              </p>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 sm:w-56">
              <div
                className="h-full rounded-full bg-[var(--dk-gold)]"
                style={{ width: `${(answeredCount / AUDIT_QUESTIONS.length) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {AUDIT_AREAS.map((areaId, areaIndex) => {
          const questions = getAuditQuestionsByArea(areaId);
          const areaScore = result.areaScores.find((area) => area.areaId === areaId);
          const isOpen = openAreas[areaId];

          return (
            <section key={areaId} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <button
                type="button"
                data-testid={`audit-area-${areaId}`}
                onClick={() => toggleArea(areaId)}
                className="flex w-full items-center justify-between gap-3 px-4 py-4 text-left transition hover:bg-slate-50 sm:px-5"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-slate-100 text-xs font-extrabold text-[var(--dk-navy)]">
                      {areaIndex + 1}
                    </span>
                    <h2 className="text-sm font-extrabold text-[var(--dk-navy)] sm:text-base">{areaName(areaId)}</h2>
                    {areaScore && (
                      <span className="rounded-full border px-2 py-0.5 text-xs font-bold" style={{ color: scoreColor(areaScore.score), borderColor: `${scoreColor(areaScore.score)}55`, backgroundColor: `${scoreColor(areaScore.score)}10` }}>
                        {formatPercent(areaScore.score, locale)}%
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">{t(`areas.${areaId}.description`)}</p>
                </div>
                <ChevronDown size={18} className={`shrink-0 text-slate-400 transition ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
                  <div className="grid gap-3">
                    {questions.map((question, index) => (
                      <div key={question.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                        <div className="flex gap-2">
                          <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white text-xs font-extrabold text-slate-500">
                            {index + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold leading-5 text-[var(--dk-navy)]">{t(`questions.${question.id}.text`)}</p>
                            <p className="mt-1 text-xs leading-5 text-slate-500">{t(`questions.${question.id}.tooltip`)}</p>
                            <div className="mt-3 grid gap-2 sm:grid-cols-3">
                              {([2, 1, 0] as const).map((value) => (
                                <button
                                  key={value}
                                  type="button"
                                  data-testid={`answer-${question.id}-${value}`}
                                  onClick={() => setAnswer(question.id, value)}
                                  className={`min-h-10 rounded-lg border px-3 text-sm font-bold transition ${answerClass(value, answers[question.id] === value)}`}
                                >
                                  {t(`answers.${value}`)}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </section>
          );
        })}

        <div className="flex justify-center pt-2">
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[var(--dk-red)]/90">
            <ClipboardCheck size={18} />
            {t('cta')}
          </button>
        </div>
      </form>

      {submitted && (
        <div className="mt-8 space-y-6">
          <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
            <section className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm" data-testid="restaurant-audit-score">
              <svg viewBox="0 0 120 120" width="132" height="132" role="img" aria-label={t('results.scoreTitle')}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle
                  cx="60"
                  cy="60"
                  r="50"
                  fill="none"
                  stroke={scoreColor(result.overallScore)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${result.overallScore * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="56" textAnchor="middle" className="text-2xl font-extrabold" fill={scoreColor(result.overallScore)}>
                  {result.overallScore}
                </text>
                <text x="60" y="73" textAnchor="middle" className="fill-slate-500 text-[10px] font-bold">/100</text>
              </svg>
              <p className="mt-2 text-sm font-extrabold text-[var(--dk-navy)]">{t('results.scoreTitle')}</p>
              <span className={`mt-2 rounded-full border px-3 py-1 text-xs font-extrabold ${levelClass(result.level)}`}>
                {t(`levels.${result.level}.name`)}
              </span>
              <p className="mt-2 text-center text-xs leading-5 text-slate-500">{t(`levels.${result.level}.description`)}</p>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.areaChartTitle')}</h2>
              <AreaBarChart areaScores={result.areaScores} areaLabel={areaName} chartLabel={t('results.areaChartTitle')} />
            </section>
          </div>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('actionPlan.title')}</h2>
            <div className="grid gap-3 lg:grid-cols-3">
              {result.priorityActions.map((action) => (
                <article key={action.areaId} className={`rounded-lg border p-4 ${severityClass(action.severity)}`}>
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-extrabold text-[var(--dk-navy)]">{areaName(action.areaId)}</h3>
                    <span className="text-sm font-extrabold" style={{ color: scoreColor(action.score) }}>{action.score}%</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-slate-600">{t(action.actionKey)}</p>
                </article>
              ))}
            </div>
          </section>

          {result.primeCostWarning && (
            <section className="flex gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <ShieldAlert size={20} className="mt-0.5 shrink-0 text-[var(--dk-red)]" />
              <div>
                <h2 className="text-sm font-extrabold text-[var(--dk-navy)]">{t('primeCostWarning.title')}</h2>
                <p className="mt-1 text-xs leading-5 text-slate-600">{t('primeCostWarning.body')}</p>
              </div>
            </section>
          )}

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-lg font-extrabold text-[var(--dk-navy)]">{t('unknown.title')}</h2>
            <p className="mb-4 text-sm leading-6 text-slate-600">{t('unknown.body')}</p>
            {result.unknownCriticalQuestionIds.length > 0 ? (
              <div className="grid gap-2 sm:grid-cols-2">
                {result.unknownCriticalQuestionIds.map((questionId) => (
                  <div key={questionId} className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-bold text-[var(--dk-navy)]">
                    {t(`questions.${questionId}.text`)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{t('unknown.empty')}</p>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-3 text-lg font-extrabold text-[var(--dk-navy)]">{t('urgent.title')}</h2>
            {result.urgentQuestionIds.length > 0 ? (
              <div className="grid gap-2">
                {result.urgentQuestionIds.slice(0, 10).map((questionId) => (
                  <div key={questionId} className="rounded-lg border border-red-100 bg-red-50/60 p-3 text-sm text-slate-700">
                    {t(`questions.${questionId}.text`)}
                  </div>
                ))}
              </div>
            ) : (
              <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-700">{t('urgent.empty')}</p>
            )}
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <p className="text-xs leading-5 text-blue-800">{t('sheddNote')}</p>
            </div>
            <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-4">
              <p className="font-['Playfair_Display'] text-sm font-bold italic leading-6 text-[var(--dk-navy)]">{t('ahilikQuote')}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
