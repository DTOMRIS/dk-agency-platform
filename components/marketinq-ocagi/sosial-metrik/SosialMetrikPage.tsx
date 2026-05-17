'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BarChart3, Info, TrendingUp } from 'lucide-react';
import {
  calculateInstagram,
  calculateTikTok,
  type ContentTypeMetric,
  type HealthStatus,
  type InstagramAnalysis,
  type SocialPlatform,
  type TikTokAnalysis,
} from '@/lib/marketing-tools/sosial-metrik';

// ── HELPERS ──────────────────────────────────────────────

function parseNumber(value: string): number {
  return Math.max(0, Number.parseFloat(value.replace(',', '.')) || 0);
}

function getIntlLocale(locale: string): string {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function statusColor(status: HealthStatus): string {
  if (status === 'excellent') return 'border-emerald-300 bg-emerald-50 text-emerald-700';
  if (status === 'good') return 'border-emerald-200 bg-emerald-50 text-emerald-600';
  if (status === 'average') return 'border-amber-200 bg-amber-50 text-amber-700';
  return 'border-red-200 bg-red-50 text-red-700';
}

function scoreColor(score: number): string {
  if (score >= 75) return '#10B981'; // emerald-500
  if (score >= 50) return '#C5A022'; // dk-gold
  if (score >= 30) return '#F59E0B'; // amber-500
  return '#E94560'; // dk-red
}

// ── COMPONENT ────────────────────────────────────────────

export default function SosialMetrikPage({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.sosialMetrik');
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);

  // Platform selection
  const [platform, setPlatform] = useState<SocialPlatform>('instagram');
  const [submitted, setSubmitted] = useState(false);

  // Instagram inputs
  const [igFollowers, setIgFollowers] = useState('8500');
  const [igLikes, setIgLikes] = useState('1200');
  const [igComments, setIgComments] = useState('85');
  const [igSaves, setIgSaves] = useState('140');
  const [igShares, setIgShares] = useState('45');
  const [igPostCount, setIgPostCount] = useState('10');
  const [igReach, setIgReach] = useState('');
  // Content breakdown
  const [showContentBreakdown, setShowContentBreakdown] = useState(false);
  const [reelsCount, setReelsCount] = useState('4');
  const [carouselCount, setCarouselCount] = useState('3');
  const [singleCount, setSingleCount] = useState('3');
  const [reelsLikes, setReelsLikes] = useState('620');
  const [reelsComments, setReelsComments] = useState('48');
  const [reelsSaves, setReelsSaves] = useState('75');
  const [reelsShares, setReelsShares] = useState('28');
  const [carouselLikes, setCarouselLikes] = useState('380');
  const [carouselComments, setCarouselComments] = useState('25');
  const [carouselSaves, setCarouselSaves] = useState('50');
  const [carouselShares, setCarouselShares] = useState('12');
  const [singleLikes, setSingleLikes] = useState('200');
  const [singleComments, setSingleComments] = useState('12');
  const [singleSaves, setSingleSaves] = useState('15');
  const [singleShares, setSingleShares] = useState('5');

  // TikTok inputs
  const [ttFollowers, setTtFollowers] = useState('5200');
  const [ttLikes, setTtLikes] = useState('3400');
  const [ttComments, setTtComments] = useState('120');
  const [ttShares, setTtShares] = useState('85');
  const [ttSaves, setTtSaves] = useState('210');
  const [ttViews, setTtViews] = useState('92000');
  const [ttPostCount, setTtPostCount] = useState('10');

  // Analysis
  const analysis = useMemo(() => {
    if (!submitted) return null;

    if (platform === 'instagram') {
      return calculateInstagram({
        followers: parseNumber(igFollowers),
        totalLikes: parseNumber(igLikes),
        totalComments: parseNumber(igComments),
        totalSaves: parseNumber(igSaves),
        totalShares: parseNumber(igShares),
        postCount: parseNumber(igPostCount),
        avgReach: igReach ? parseNumber(igReach) : undefined,
        ...(showContentBreakdown ? {
          reelsCount: parseNumber(reelsCount),
          carouselCount: parseNumber(carouselCount),
          singleCount: parseNumber(singleCount),
          reelsLikes: parseNumber(reelsLikes),
          reelsComments: parseNumber(reelsComments),
          reelsSaves: parseNumber(reelsSaves),
          reelsShares: parseNumber(reelsShares),
          carouselLikes: parseNumber(carouselLikes),
          carouselComments: parseNumber(carouselComments),
          carouselSaves: parseNumber(carouselSaves),
          carouselShares: parseNumber(carouselShares),
          singleLikes: parseNumber(singleLikes),
          singleComments: parseNumber(singleComments),
          singleSaves: parseNumber(singleSaves),
          singleShares: parseNumber(singleShares),
        } : {}),
      });
    }

    return calculateTikTok({
      followers: parseNumber(ttFollowers),
      totalLikes: parseNumber(ttLikes),
      totalComments: parseNumber(ttComments),
      totalShares: parseNumber(ttShares),
      totalSaves: parseNumber(ttSaves),
      totalViews: parseNumber(ttViews),
      postCount: parseNumber(ttPostCount),
    });
  }, [submitted, platform, igFollowers, igLikes, igComments, igSaves, igShares, igPostCount, igReach, showContentBreakdown, reelsCount, carouselCount, singleCount, reelsLikes, reelsComments, reelsSaves, reelsShares, carouselLikes, carouselComments, carouselSaves, carouselShares, singleLikes, singleComments, singleSaves, singleShares, ttFollowers, ttLikes, ttComments, ttShares, ttSaves, ttViews, ttPostCount]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  function formatNumber(value: number, digits = 2): string {
    return new Intl.NumberFormat(intlLocale, { maximumFractionDigits: digits }).format(value);
  }

  function statusLabel(status: HealthStatus): string {
    return t(`healthScore.${status}`);
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6">
        <div className="mb-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold uppercase text-purple-700">
          {t('tier')}
        </div>
        <h1 className="text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
      </div>

      {/* Platform Tabs */}
      <div className="mb-6 flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1">
        {(['instagram', 'tiktok'] as const).map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => { setPlatform(p); setSubmitted(false); }}
            className={`flex-1 rounded-md px-4 py-2.5 text-sm font-bold transition ${platform === p ? 'bg-white text-[var(--dk-navy)] shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t(`platforms.${p}`)}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Instagram Form */}
        {platform === 'instagram' && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('inputs.ig_title')}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.followers')}</span>
                <input value={igFollowers} onChange={(e) => { setIgFollowers(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_likes')}</span>
                <input value={igLikes} onChange={(e) => { setIgLikes(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_comments')}</span>
                <input value={igComments} onChange={(e) => { setIgComments(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_saves')}</span>
                <input value={igSaves} onChange={(e) => { setIgSaves(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_shares')}</span>
                <input value={igShares} onChange={(e) => { setIgShares(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.post_count')}</span>
                <input value={igPostCount} onChange={(e) => { setIgPostCount(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label className="sm:col-span-2 lg:col-span-3">
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.avg_reach')} <span className="font-normal text-slate-400">({t('inputs.optional')})</span></span>
                <input value={igReach} onChange={(e) => { setIgReach(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} placeholder={t('inputs.reach_placeholder')} />
              </label>
            </div>

            {/* Content breakdown toggle */}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <button type="button" onClick={() => setShowContentBreakdown(!showContentBreakdown)} className="text-sm font-bold text-[var(--dk-gold)] hover:underline">
                {showContentBreakdown ? '− ' : '+ '}{t('inputs.content_breakdown')}
              </button>
              {showContentBreakdown && (
                <div className="mt-3 space-y-3">
                  {/* Reels */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-extrabold uppercase text-slate-500">{t('contentType.reels')}</p>
                    <div className="grid gap-2 sm:grid-cols-5">
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.count')}</span><input value={reelsCount} onChange={(e) => { setReelsCount(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.likes')}</span><input value={reelsLikes} onChange={(e) => { setReelsLikes(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.comments')}</span><input value={reelsComments} onChange={(e) => { setReelsComments(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.saves')}</span><input value={reelsSaves} onChange={(e) => { setReelsSaves(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.shares')}</span><input value={reelsShares} onChange={(e) => { setReelsShares(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                    </div>
                  </div>
                  {/* Carousel */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-extrabold uppercase text-slate-500">{t('contentType.carousel')}</p>
                    <div className="grid gap-2 sm:grid-cols-5">
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.count')}</span><input value={carouselCount} onChange={(e) => { setCarouselCount(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.likes')}</span><input value={carouselLikes} onChange={(e) => { setCarouselLikes(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.comments')}</span><input value={carouselComments} onChange={(e) => { setCarouselComments(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.saves')}</span><input value={carouselSaves} onChange={(e) => { setCarouselSaves(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.shares')}</span><input value={carouselShares} onChange={(e) => { setCarouselShares(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                    </div>
                  </div>
                  {/* Single */}
                  <div className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                    <p className="mb-2 text-xs font-extrabold uppercase text-slate-500">{t('contentType.single')}</p>
                    <div className="grid gap-2 sm:grid-cols-5">
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.count')}</span><input value={singleCount} onChange={(e) => { setSingleCount(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.likes')}</span><input value={singleLikes} onChange={(e) => { setSingleLikes(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.comments')}</span><input value={singleComments} onChange={(e) => { setSingleComments(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.saves')}</span><input value={singleSaves} onChange={(e) => { setSingleSaves(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                      <label><span className="mb-1 block text-xs text-slate-500">{t('inputs.shares')}</span><input value={singleShares} onChange={(e) => { setSingleShares(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} /></label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* TikTok Form */}
        {platform === 'tiktok' && (
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('inputs.tt_title')}</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.followers')}</span>
                <input value={ttFollowers} onChange={(e) => { setTtFollowers(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_likes')}</span>
                <input value={ttLikes} onChange={(e) => { setTtLikes(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_comments')}</span>
                <input value={ttComments} onChange={(e) => { setTtComments(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_shares')}</span>
                <input value={ttShares} onChange={(e) => { setTtShares(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_saves')}</span>
                <input value={ttSaves} onChange={(e) => { setTtSaves(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.total_views')}</span>
                <input value={ttViews} onChange={(e) => { setTtViews(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
              <label>
                <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('inputs.post_count')}</span>
                <input value={ttPostCount} onChange={(e) => { setTtPostCount(e.target.value); setSubmitted(false); }} inputMode="numeric" className={inputClass} />
              </label>
            </div>
          </section>
        )}

        {/* Submit */}
        <div className="mt-5 flex justify-center">
          <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--dk-red)] px-6 text-base font-bold text-white shadow-lg transition hover:bg-[var(--dk-red)]/90">
            <BarChart3 size={18} />
            {t('cta')}
          </button>
        </div>
      </form>

      {/* ── RESULTS ── */}
      {submitted && analysis && (
        <div className="mt-8 space-y-6">
          {/* Health Score Circle + KPIs */}
          <div className="grid gap-6 lg:grid-cols-[200px_1fr]">
            {/* Score circle */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label={t('healthScore.title')}>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#E5E7EB" strokeWidth="10" />
                <circle
                  cx="60" cy="60" r="50" fill="none"
                  stroke={scoreColor(analysis.healthScore)}
                  strokeWidth="10"
                  strokeLinecap="round"
                  strokeDasharray={`${analysis.healthScore * 3.14} 314`}
                  transform="rotate(-90 60 60)"
                />
                <text x="60" y="55" textAnchor="middle" className="text-2xl font-extrabold" fill={scoreColor(analysis.healthScore)}>{analysis.healthScore}</text>
                <text x="60" y="72" textAnchor="middle" className="text-[10px] font-bold" fill="#64748B">/100</text>
              </svg>
              <p className="mt-2 text-sm font-extrabold text-[var(--dk-navy)]">{t('healthScore.title')}</p>
              <span className={`mt-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${statusColor(analysis.status)}`}>
                {statusLabel(analysis.status)}
              </span>
            </div>

            {/* KPI cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {/* ER Follower */}
              <div className={`rounded-lg border p-3 ${statusColor(analysis.status)}`}>
                <p className="text-xs font-bold uppercase tracking-wide">ER ({t('results.follower_based')})</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber(analysis.platform === 'instagram' ? (analysis as InstagramAnalysis).erFollower : (analysis as TikTokAnalysis).erFollower)}%</p>
              </div>

              {/* ER Reach (Instagram) or ER Views (TikTok) */}
              {analysis.platform === 'instagram' && (analysis as InstagramAnalysis).erReach !== null && (
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-700">
                  <p className="text-xs font-bold uppercase tracking-wide">ER ({t('results.reach_based')})</p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber((analysis as InstagramAnalysis).erReach!)}%</p>
                </div>
              )}
              {analysis.platform === 'tiktok' && (
                <div className={`rounded-lg border p-3 ${statusColor(analysis.status)}`}>
                  <p className="text-xs font-bold uppercase tracking-wide">ER ({t('results.views_based')})</p>
                  <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber((analysis as TikTokAnalysis).erViews)}%</p>
                </div>
              )}

              {/* Benchmark */}
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('results.benchmark')}</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber(analysis.benchmark)}%</p>
                <p className="mt-0.5 text-xs font-bold text-slate-500">
                  {analysis.platform === 'instagram' ? t(`benchmark.${(analysis as InstagramAnalysis).followerTier}`) : 'F&B TikTok'}
                </p>
              </div>

              {/* Delta */}
              <div className={`rounded-lg border p-3 ${analysis.benchmarkDelta >= 0 ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
                <p className="text-xs font-bold uppercase tracking-wide">{t('results.delta')}</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{analysis.benchmarkDelta >= 0 ? '+' : ''}{formatNumber(analysis.benchmarkDelta)}%</p>
              </div>

              {/* Total interactions */}
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('results.total_interactions')}</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber(analysis.totalInteractions, 0)}</p>
              </div>

              {/* Avg per post */}
              <div className="rounded-lg border border-slate-200 bg-white p-3">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{t('results.avg_per_post')}</p>
                <p className="mt-1 text-xl font-extrabold text-[var(--dk-navy)]">{formatNumber(analysis.avgInteractionsPerPost, 1)}</p>
              </div>
            </div>
          </div>

          {/* ER vs Benchmark Bar Chart (native SVG) */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.chart_title')}</h2>
            <div className="overflow-x-auto">
              <svg viewBox="0 0 400 160" role="img" aria-label={t('results.chart_title')} className="min-w-[380px]">
                <line x1="40" y1="120" x2="360" y2="120" stroke="#E5E7EB" strokeWidth="1" />
                {/* Your ER bar */}
                {(() => {
                  const er = analysis.platform === 'tiktok' ? (analysis as TikTokAnalysis).erViews : (analysis as InstagramAnalysis).erFollower;
                  const maxVal = Math.max(er, analysis.benchmark) * 1.3;
                  const erHeight = Math.max(6, (er / maxVal) * 90);
                  const benchHeight = Math.max(6, (analysis.benchmark / maxVal) * 90);
                  return (
                    <>
                      <rect x="100" y={120 - erHeight} width="60" height={erHeight} rx="6" fill={scoreColor(analysis.healthScore)} opacity="0.85" />
                      <text x="130" y={120 - erHeight - 8} textAnchor="middle" className="text-[12px] font-bold" fill={scoreColor(analysis.healthScore)}>{formatNumber(er)}%</text>
                      <text x="130" y="138" textAnchor="middle" className="fill-slate-600 text-[11px] font-bold">{t('results.your_er')}</text>

                      <rect x="240" y={120 - benchHeight} width="60" height={benchHeight} rx="6" fill="#1A1A2E" opacity="0.7" />
                      <text x="270" y={120 - benchHeight - 8} textAnchor="middle" className="text-[12px] font-bold" fill="#1A1A2E">{formatNumber(analysis.benchmark)}%</text>
                      <text x="270" y="138" textAnchor="middle" className="fill-slate-600 text-[11px] font-bold">{t('results.benchmark')}</text>
                    </>
                  );
                })()}
              </svg>
            </div>
          </section>

          {/* Content type performance (Instagram only) */}
          {analysis.platform === 'instagram' && (analysis as InstagramAnalysis).contentBreakdown && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
              <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.content_performance')}</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                      <th className="py-3 pr-3">#</th>
                      <th className="py-3 pr-3">{t('contentType.type')}</th>
                      <th className="py-3 pr-3">{t('inputs.post_count')}</th>
                      <th className="py-3 pr-3">ER%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {((analysis as InstagramAnalysis).contentBreakdown as ContentTypeMetric[]).map((item) => (
                      <tr key={item.type} className={`border-b border-slate-100 ${item.rank === 1 ? 'bg-amber-50' : ''}`}>
                        <td className="py-3 pr-3 font-bold text-[var(--dk-navy)]">{item.rank === 1 ? '🏆' : item.rank}</td>
                        <td className="py-3 pr-3 font-bold text-[var(--dk-navy)]">{t(`contentType.${item.type}`)}</td>
                        <td className="py-3 pr-3">{item.postCount}</td>
                        <td className="py-3 pr-3 font-bold">{formatNumber(item.er)}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Action recommendations */}
          <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--dk-red)]" />
              <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('actions.title')}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {analysis.status === 'weak' || analysis.status === 'average' ? (
                <>
                  <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-3">
                    <p className="text-sm font-bold text-[var(--dk-navy)]">{t('actions.switch_to_video')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.switch_to_video_detail')}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-3">
                    <p className="text-sm font-bold text-[var(--dk-navy)]">{t('actions.reply_fast')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.reply_fast_detail')}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-3">
                    <p className="text-sm font-bold text-[var(--dk-navy)]">{t('actions.save_content')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.save_content_detail')}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <p className="text-sm font-bold text-emerald-700">{t('actions.keep_going')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.keep_going_detail')}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-3">
                    <p className="text-sm font-bold text-[var(--dk-navy)]">{t('actions.experiment')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.experiment_detail')}</p>
                  </div>
                  <div className="rounded-lg border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-3">
                    <p className="text-sm font-bold text-[var(--dk-navy)]">{t('actions.ugc')}</p>
                    <p className="mt-1 text-xs text-slate-500">{t('actions.ugc_detail')}</p>
                  </div>
                </>
              )}
            </div>
          </section>

          {/* Info boxes */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-blue-800">{t('infoLowEr.title')}</p>
                <p className="mt-1 text-xs leading-5 text-blue-700">{t('infoLowEr.body')}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
              <Info size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-bold text-blue-800">{t('infoMethodology.title')}</p>
                <p className="mt-1 text-xs leading-5 text-blue-700">{t('infoMethodology.body')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
