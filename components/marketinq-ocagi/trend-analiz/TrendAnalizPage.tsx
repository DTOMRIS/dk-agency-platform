'use client';

import { useMemo, useState, useTransition, type FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { Lightbulb, Loader2, Sparkles, TrendingUp } from 'lucide-react';
import { generateTrendRecommendations, type TrendRecommendation } from '@/app/actions/trend-ai-recommendations';
import {
  AUDIENCES,
  RESTAURANT_TYPES,
  STRENGTHS,
  calculateTrendAnalysis,
  type TrendAudience,
  type TrendId,
  type TrendProfile,
  type TrendRestaurantType,
  type TrendScore,
  type TrendStrength,
} from '@/lib/marketing-tools/trend-analiz';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

function getIntlLocale(locale: string): string {
  if (locale === 'az') return AZ_NUMBER_LOCALE;
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function scoreColor(score: number, isTop: boolean): string {
  if (isTop) return '#C5A022';
  if (score >= 80) return '#10B981';
  if (score >= 60) return '#64748B';
  return '#94A3B8';
}

function formatScore(value: number, locale: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
}

function TrendChart({
  scores,
  topTrendIds,
  labelForTrend,
  chartLabel,
  locale,
}: {
  scores: TrendScore[];
  topTrendIds: TrendId[];
  labelForTrend: (trendId: TrendId) => string;
  chartLabel: string;
  locale: string;
}) {
  const width = 760;
  const height = 310;
  const left = 176;
  const top = 26;
  const barHeight = 22;
  const gap = 12;
  const maxWidth = 500;

  return (
    <div className="overflow-x-auto">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={chartLabel}
        data-testid="trend-analiz-chart"
        className="min-w-[720px]"
      >
        {[0, 25, 50, 75, 100].map((tick) => {
          const x = left + tick * (maxWidth / 100);
          return (
            <g key={tick}>
              <line x1={x} y1="18" x2={x} y2="286" stroke="#E5E7EB" strokeWidth="1" />
              <text x={x} y="305" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold">
                {tick}
              </text>
            </g>
          );
        })}
        {scores.map((score, index) => {
          const isTop = topTrendIds.includes(score.trendId);
          const y = top + index * (barHeight + gap);
          const barWidth = Math.max(8, score.score * (maxWidth / 100));
          return (
            <g key={score.trendId}>
              <text x="12" y={y + 15} className="fill-slate-600 text-[11px] font-bold">
                {labelForTrend(score.trendId).slice(0, 24)}
              </text>
              <rect x={left} y={y} width={maxWidth} height={barHeight} rx="7" fill="#F1F5F9" />
              <rect x={left} y={y} width={barWidth} height={barHeight} rx="7" fill={scoreColor(score.score, isTop)} opacity="0.92" />
              <text x={left + barWidth + 8} y={y + 15} className="fill-slate-700 text-[11px] font-extrabold">
                {formatScore(score.score, locale)}
              </text>
              {isTop && (
                <circle cx={left - 12} cy={y + 11} r="4" fill="#C5A022" />
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}

export default function TrendAnalizPage({ backHref = '/b2b-panel/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.trendAnaliz');
  const rawLocale = useLocale();
  const searchParams = useSearchParams();
  const locale = getIntlLocale(rawLocale);
  const [restaurantType, setRestaurantType] = useState<TrendRestaurantType>('city');
  const [audience, setAudience] = useState<TrendAudience>('mixed');
  const [strength, setStrength] = useState<TrendStrength>('food_quality');
  const [submitted, setSubmitted] = useState(false);
  const [aiSource, setAiSource] = useState<'none' | 'ai' | 'fallback'>('none');
  const [recommendations, setRecommendations] = useState<Record<TrendId, string>>({} as Record<TrendId, string>);
  const [isPending, startTransition] = useTransition();

  const profile: TrendProfile = useMemo(() => ({ restaurantType, audience, strength }), [restaurantType, audience, strength]);
  const analysis = useMemo(() => calculateTrendAnalysis(profile), [profile]);
  const topTrendIds = useMemo(() => analysis.topTrends.map((trend) => trend.trendId), [analysis]);

  function fallbackStep(trendId: TrendId): string {
    return t(`trends.${trendId}.fallbackFirstStep`);
  }

  function applyFallback() {
    const fallback = Object.fromEntries(
      topTrendIds.map((trendId) => [trendId, fallbackStep(trendId)]),
    ) as Record<TrendId, string>;
    setRecommendations(fallback);
    setAiSource('fallback');
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSubmitted(true);
    setAiSource('none');
    setRecommendations({} as Record<TrendId, string>);

    startTransition(async () => {
      const result = await generateTrendRecommendations({
        restaurantType,
        audience,
        strength,
        locale: rawLocale,
        forceFallback: searchParams.get('forceFallback') === '1',
      });

      if (!result.ok) {
        applyFallback();
        return;
      }

      const mapped = Object.fromEntries(
        result.recommendations.map((item: TrendRecommendation) => [item.trendId, item.firstStep]),
      ) as Record<TrendId, string>;
      setRecommendations(mapped);
      setAiSource('ai');
    });
  }

  const selectClass = 'min-h-11 w-full rounded-lg border border-[#E4DCCD] bg-white px-3 text-sm font-semibold text-[#0F172A] outline-none transition focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="trend-analiz" title={t('title')} subtitle={t('subtitle')} backHref={backHref} />

      <form onSubmit={handleSubmit} className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-4 lg:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[#0F172A]">{t('inputs.restaurantType')}</span>
            <select value={restaurantType} onChange={(event) => { setRestaurantType(event.target.value as TrendRestaurantType); setSubmitted(false); }} className={selectClass}>
              {RESTAURANT_TYPES.map((type) => (
                <option key={type} value={type}>{t(`restaurantTypes.${type}`)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[#0F172A]">{t('inputs.audience')}</span>
            <select value={audience} onChange={(event) => { setAudience(event.target.value as TrendAudience); setSubmitted(false); }} className={selectClass}>
              {AUDIENCES.map((item) => (
                <option key={item} value={item}>{t(`audience.${item}`)}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[#0F172A]">{t('inputs.strength')}</span>
            <select value={strength} onChange={(event) => { setStrength(event.target.value as TrendStrength); setSubmitted(false); }} className={selectClass}>
              {STRENGTHS.map((item) => (
                <option key={item} value={item}>{t(`strength.${item}`)}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 flex justify-center">
          <button type="submit" disabled={isPending} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-6 text-base font-bold text-white shadow-lg transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-70">
            {isPending ? <Loader2 size={18} className="animate-spin" /> : <TrendingUp size={18} />}
            {isPending ? t('loading') : t('cta')}
          </button>
        </div>
      </form>

      {submitted && (
        <div className="mt-8 space-y-6">
          <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 sm:p-5">
            <div className="flex gap-3">
              <Lightbulb size={20} className="mt-0.5 shrink-0 text-blue-600" />
              <div>
                <h2 className="text-sm font-extrabold text-[#0F172A]">{t('sectorContext.title')}</h2>
                <p className="mt-1 text-sm leading-6 text-blue-800">{t('sectorContext.body')}</p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-[#0F172A]">{t('results.chartTitle')}</h2>
              <span className="rounded-full border border-[#F4B8C3] bg-[#F6F1E9] px-3 py-1 text-xs font-bold text-[#0F172A]">
                {t('results.topThree')}
              </span>
            </div>
            <TrendChart
              scores={analysis.scores}
              topTrendIds={topTrendIds}
              labelForTrend={(trendId) => t(`trends.${trendId}.title`)}
              chartLabel={t('results.chartTitle')}
              locale={locale}
            />
          </section>

          {aiSource === 'fallback' && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800" data-testid="trend-ai-fallback-note">
              {t('aiUnavailableNote')}
            </div>
          )}

          <section className="grid gap-4 lg:grid-cols-3" data-testid="trend-top-cards">
            {analysis.topTrends.map((trend) => (
              <article key={trend.trendId} className="rounded-xl border border-[#F4B8C3] bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-extrabold uppercase text-[#BE2F47]">
                      {t('topTrends.rank', { rank: trend.rank })}
                    </span>
                    <h3 className="mt-1 text-base font-extrabold text-[#0F172A]">{t(`trends.${trend.trendId}.title`)}</h3>
                  </div>
                  <span className="rounded-full bg-[#F6F1E9] px-2.5 py-1 text-xs font-extrabold text-[#0F172A]">
                    {formatScore(trend.score, locale)}
                  </span>
                </div>
                <p className="text-sm leading-6 text-slate-600">{t(`trends.${trend.trendId}.description`)}</p>
                <p className="mt-3 rounded-lg border border-[#EFE9DE] bg-[#FBF8F3] p-3 text-xs leading-5 text-slate-600">{t(`trends.${trend.trendId}.azContext`)}</p>
                <div className="mt-4 rounded-lg border border-[#F4B8C3] bg-[#F6F1E9] p-3">
                  <div className="mb-1 flex items-center gap-2 text-xs font-extrabold uppercase text-[#0F172A]">
                    <Sparkles size={14} />
                    {aiSource === 'ai' ? t('topTrends.aiStep') : t('topTrends.fallbackStep')}
                  </div>
                  <p className="text-sm font-semibold leading-6 text-[#0F172A]">
                    {recommendations[trend.trendId] ?? fallbackStep(trend.trendId)}
                  </p>
                </div>
              </article>
            ))}
          </section>

          <div className="rounded-lg border border-[#F4B8C3] bg-[#F6F1E9] p-4">
            <p className="text-sm font-bold italic leading-6 text-[#0F172A]">{t('ahilikQuote')}</p>
          </div>
        </div>
      )}
    </div>
  );
}
