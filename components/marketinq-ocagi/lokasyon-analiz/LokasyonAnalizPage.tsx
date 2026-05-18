'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, Building2, Calculator, Loader2, MapPinned, Sparkles } from 'lucide-react';
import { generateLokasyonRecommendations } from '@/app/actions/lokasyon-ai-recommendations';
import {
  CRITERIA,
  DEFAULT_ANSWERS,
  DEFAULT_BREAKEVEN,
  LOCATION_TYPES,
  RISK_FLAGS,
  calculateLocationAnalysis,
  type AnswerValue,
  type BreakevenInput,
  type LocationCriterionId,
  type LocationMode,
  type LocationProfile,
  type LocationType,
  type RiskFlagId,
} from '@/lib/marketing-tools/lokasyon-analiz';

function getIntlLocale(locale: string): string {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function formatMoney(value: number | null, locale: string): string {
  if (value === null) return 'N/A';
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function answerColor(value: AnswerValue): string {
  if (value === 2) return '#C5A022';
  if (value === 1) return '#64748B';
  return '#E94560';
}

function LocationChart({
  profile,
  locale,
  labelForCriterion,
  chartLabel,
}: {
  profile: LocationProfile;
  locale: string;
  labelForCriterion: (criterionId: LocationCriterionId) => string;
  chartLabel: string;
}) {
  const analysis = calculateLocationAnalysis(profile);
  const width = 780;
  const height = Math.max(260, analysis.scoredCriteria.length * 34 + 42);
  const left = 210;
  const maxWidth = 500;

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label={chartLabel} data-testid="lokasyon-chart" className="min-w-[720px]">
        {[0, 50, 100].map((tick) => {
          const x = left + tick * (maxWidth / 100);
          return (
            <g key={tick}>
              <line x1={x} y1="16" x2={x} y2={height - 24} stroke="#E5E7EB" />
              <text x={x} y={height - 6} textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">{tick}</text>
            </g>
          );
        })}
        {analysis.scoredCriteria.map((item, index) => {
          const percent = Math.round((item.weightedScore / item.maxScore) * 100);
          const barWidth = Math.max(8, percent * (maxWidth / 100));
          const y = 24 + index * 34;
          return (
            <g key={item.criterionId}>
              <text x="12" y={y + 15} className="fill-slate-600 text-[11px] font-bold">
                {labelForCriterion(item.criterionId).slice(0, 28)}
              </text>
              <rect x={left} y={y} width={maxWidth} height="22" rx="7" fill="#F1F5F9" />
              <rect x={left} y={y} width={barWidth} height="22" rx="7" fill={answerColor(item.value)} opacity="0.92" />
              <text x={left + barWidth + 8} y={y + 15} className="fill-slate-700 text-[11px] font-extrabold">
                {new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(percent)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function LokasyonAnalizPage({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.lokasyonAnaliz');
  const rawLocale = useLocale();
  const searchParams = useSearchParams();
  const locale = getIntlLocale(rawLocale);
  const [mode, setMode] = useState<LocationMode>('new');
  const [locationType, setLocationType] = useState<LocationType>('street');
  const [answers, setAnswers] = useState<Record<LocationCriterionId, AnswerValue>>(DEFAULT_ANSWERS);
  const [riskFlags, setRiskFlags] = useState<RiskFlagId[]>([]);
  const [breakeven, setBreakeven] = useState<BreakevenInput>(DEFAULT_BREAKEVEN);
  const [submitted, setSubmitted] = useState(false);
  const [aiSource, setAiSource] = useState<'none' | 'ai' | 'fallback'>('none');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const profile: LocationProfile = useMemo(() => ({ mode, locationType, answers, riskFlags, breakeven }), [mode, locationType, answers, riskFlags, breakeven]);
  const analysis = useMemo(() => calculateLocationAnalysis(profile), [profile]);
  const applicableCriteria = useMemo(() => CRITERIA.filter((criterion) => criterion.appliesTo.includes(locationType)), [locationType]);

  const numberClass = 'min-h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';
  const answerButtons: Array<{ value: AnswerValue; keyName: 'yes' | 'partial' | 'no' }> = [
    { value: 2, keyName: 'yes' },
    { value: 1, keyName: 'partial' },
    { value: 0, keyName: 'no' },
  ];

  function setAnswer(criterionId: LocationCriterionId, value: AnswerValue) {
    setAnswers((current) => ({ ...current, [criterionId]: value }));
    setSubmitted(false);
  }

  function setBreakevenField(field: keyof BreakevenInput, value: string) {
    setBreakeven((current) => ({ ...current, [field]: Number(value) || 0 }));
    setSubmitted(false);
  }

  function toggleRiskFlag(flag: RiskFlagId) {
    setRiskFlags((current) => (current.includes(flag) ? current.filter((item) => item !== flag) : [...current, flag]));
    setSubmitted(false);
  }

  function fallbackRecommendations(): string[] {
    const weaknessItems = analysis.weaknesses.slice(0, 3).map((criterionId) => t(`recommendations.criteria.${criterionId}`));
    const riskItems = analysis.applicableRiskFlags.slice(0, 2).map((flag) => t(`recommendations.risk.${flag}`));
    const marginItems = analysis.breakeven.sustainable ? [] : [t('recommendations.marginWarning')];
    return [
      ...marginItems,
      ...weaknessItems,
      ...riskItems,
      t('recommendations.observeDayparts'),
      t('recommendations.parkingCheck'),
      t('recommendations.rentGate'),
    ].slice(0, 3);
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setAiSource('none');
    setRecommendations([]);

    startTransition(async () => {
      const result = await generateLokasyonRecommendations({
        mode,
        locationType,
        answers,
        riskFlags,
        breakeven,
        locale: rawLocale,
        forceFallback: searchParams.get('forceFallback') === '1',
      });

      if (!result.ok) {
        setRecommendations(fallbackRecommendations());
        setAiSource('fallback');
        return;
      }

      setRecommendations(result.recommendations);
      setAiSource('ai');
    });
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold uppercase text-purple-700">{t('tier')}</div>
        <h1 className="font-['Playfair_Display'] text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 lg:grid-cols-2">
          <div>
            <span className="mb-2 block text-sm font-bold text-[var(--dk-navy)]">{t('modes.label')}</span>
            <div className="grid grid-cols-2 gap-2" data-testid="lokasyon-mode-toggle">
              {(['new', 'existing'] as LocationMode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => { setMode(item); setSubmitted(false); }}
                  className={`min-h-11 rounded-lg border px-3 text-sm font-bold transition ${mode === item ? 'border-[var(--dk-gold)] bg-[var(--dk-gold)]/10 text-[var(--dk-navy)]' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {t(`modes.${item}`)}
                </button>
              ))}
            </div>
          </div>
          <label>
            <span className="mb-2 block text-sm font-bold text-[var(--dk-navy)]">{t('locationTypes.label')}</span>
            <select value={locationType} onChange={(event) => { setLocationType(event.target.value as LocationType); setSubmitted(false); }} className={numberClass} data-testid="lokasyon-type-select">
              {LOCATION_TYPES.map((item) => <option key={item} value={item}>{t(`locationTypes.${item}`)}</option>)}
            </select>
          </label>
        </div>

        {locationType === 'mall' && (
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4" data-testid="lokasyon-avm-extra">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[var(--dk-navy)]"><Building2 size={16} />{t('avmExtra.title')}</h2>
            <div className="grid gap-2 sm:grid-cols-2">
              {(['management', 'entryCounts', 'deliveryHours', 'freightLift'] as const).map((item) => (
                <div key={item} className="rounded-lg border border-blue-100 bg-white p-3 text-xs font-semibold leading-5 text-blue-900">{t(`avmExtra.${item}`)}</div>
              ))}
            </div>
          </section>
        )}

        <section>
          <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-[var(--dk-navy)]"><MapPinned size={18} />{t('criteria.title')}</h2>
          <div className="grid gap-3 lg:grid-cols-2">
            {applicableCriteria.map((criterion) => (
              <div key={criterion.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div className="mb-3">
                  <div className="text-sm font-extrabold text-[var(--dk-navy)]">{t(`criteria.${criterion.id}.label`)}</div>
                  <div className="mt-1 text-xs leading-5 text-slate-500">{t(`criteria.${criterion.id}.tooltip`)}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {answerButtons.map((answer) => (
                    <button
                      key={answer.keyName}
                      type="button"
                      onClick={() => setAnswer(criterion.id, answer.value)}
                      className={`min-h-9 rounded-lg border px-2 text-xs font-bold transition ${answers[criterion.id] === answer.value ? 'border-[var(--dk-gold)] bg-white text-[var(--dk-navy)] shadow-sm' : 'border-slate-200 bg-white/70 text-slate-500 hover:border-slate-300'}`}
                    >
                      {t(`answers.${answer.keyName}`)}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {mode === 'new' && (
          <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <h2 className="mb-3 flex items-center gap-2 text-base font-extrabold text-[var(--dk-navy)]"><Calculator size={18} />{t('breakeven.title')}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {(Object.keys(DEFAULT_BREAKEVEN) as Array<keyof BreakevenInput>).map((field) => (
                <label key={field}>
                  <span className="mb-1.5 block text-xs font-bold text-slate-600">{t(`breakeven.inputs.${field}`)}</span>
                  <input type="number" min="0" value={breakeven[field]} onChange={(event) => setBreakevenField(field, event.target.value)} className={numberClass} />
                </label>
              ))}
            </div>
          </section>
        )}

        {mode === 'existing' && (
          <section className="rounded-xl border border-red-100 bg-red-50 p-4" data-testid="lokasyon-risk-flags">
            <h2 className="mb-3 text-base font-extrabold text-[var(--dk-navy)]">{t('riskFlags.title')}</h2>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {RISK_FLAGS.map((flag) => (
                <label key={flag} className="flex items-start gap-2 rounded-lg border border-red-100 bg-white p-3 text-sm font-semibold text-slate-700">
                  <input type="checkbox" checked={riskFlags.includes(flag)} onChange={() => toggleRiskFlag(flag)} className="mt-1" />
                  <span>{t(`riskFlags.${flag}`)}</span>
                </label>
              ))}
            </div>
          </section>
        )}

        <div className="flex justify-center">
          <button type="submit" disabled={isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-70">
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <MapPinned size={18} />}
            {isPending ? t('loading') : t('cta')}
          </button>
        </div>
      </form>

      {submitted && (
        <div className="mt-8 space-y-6">
          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-xl border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-4">
              <div className="text-xs font-extrabold uppercase text-[var(--dk-gold)]">{t('results.score')}</div>
              <div className="mt-2 text-4xl font-extrabold text-[var(--dk-navy)]">{analysis.score}</div>
              <div className="mt-2 text-sm font-bold text-slate-600">{t(`levels.${analysis.level}`)}</div>
            </div>
            {mode === 'new' && (
              <div className={`rounded-xl border p-4 lg:col-span-2 ${analysis.breakeven.sustainable ? 'border-slate-200 bg-white' : 'border-red-200 bg-red-50'}`} data-testid="lokasyon-breakeven-card">
                <div className="text-xs font-extrabold uppercase text-slate-500">{t('breakeven.resultLabel')}</div>
                <div className="mt-2 text-3xl font-extrabold text-[var(--dk-navy)]">{formatMoney(analysis.breakeven.monthlyBreakevenSales, locale)} {t('breakeven.currency')}</div>
                <p className="mt-2 text-sm leading-6 text-slate-600">{analysis.breakeven.sustainable ? t('breakeven.resultHelp') : t('breakeven.unsustainable')}</p>
                <p className="mt-2 text-xs leading-5 text-slate-500">{t('estimateDisclaimer')}</p>
              </div>
            )}
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.chartTitle')}</h2>
            <LocationChart profile={profile} locale={locale} labelForCriterion={(criterionId) => t(`criteria.${criterionId}.label`)} chartLabel={t('results.chartTitle')} />
          </section>

          {mode === 'existing' && analysis.applicableRiskFlags.length > 0 && (
            <section className="rounded-xl border border-red-200 bg-red-50 p-4" data-testid="lokasyon-risk-results">
              <h2 className="text-base font-extrabold text-[var(--dk-navy)]">{t('riskFlags.resultTitle')}</h2>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {analysis.applicableRiskFlags.map((flag) => (
                  <div key={flag} className="rounded-lg border border-red-100 bg-white p-3 text-sm font-semibold text-red-800">{t(`riskFlags.${flag}`)}</div>
                ))}
              </div>
            </section>
          )}

          {aiSource === 'fallback' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800" data-testid="lokasyon-ai-fallback-note">
              {t('aiUnavailableNote')}
            </div>
          )}

          <section className="grid gap-4 lg:grid-cols-3" data-testid="lokasyon-recommendations">
            {(recommendations.length ? recommendations : fallbackRecommendations()).map((item, index) => (
              <article key={`${item}-${index}`} className="rounded-xl border border-[var(--dk-gold)]/30 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2 text-xs font-extrabold uppercase text-[var(--dk-gold)]">
                  <Sparkles size={14} />
                  {t('recommendations.title', { index: index + 1 })}
                </div>
                <p className="text-sm font-semibold leading-6 text-[var(--dk-navy)]">{item}</p>
              </article>
            ))}
          </section>

          <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-4">
            <p className="font-['Playfair_Display'] text-sm font-bold italic leading-6 text-[var(--dk-navy)]">{t('ahilikQuote')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
