'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { Clock, ArrowRight, Sparkles, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { trackEvent } from '@/lib/analytics/yandex-metrica';
import { ANALYTICS_EVENTS } from '@/lib/analytics/events';
import {
  getRecommendedActions,
  getSeverity,
  type MetricKey,
  type Severity,
  type Action,
} from '@/lib/recommendation-engine';

interface WeeklyActionsPanelProps {
  metrics: Record<MetricKey, number>;
  context: 'p_l_simulator';
}

function SeverityBadge({ severity, label }: { severity: Severity; label: string }) {
  const styles: Record<Severity, { icon: typeof CheckCircle2; bg: string; text: string; ring: string }> = {
    OK: { icon: CheckCircle2, bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200' },
    WARNING: { icon: AlertTriangle, bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' },
    CRITICAL: { icon: XCircle, bg: 'bg-red-50', text: 'text-red-700', ring: 'ring-red-200' },
  };
  const s = styles[severity];
  const Icon = s.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function ActionCard({
  action,
  index,
  locale,
}: {
  action: Action;
  index: number;
  locale: string;
}) {
  const t = useTranslations();
  const actionKey = action.translationKey.replace('weekly_actions.', '');

  return (
    <div className="group relative flex gap-4 rounded-[18px] border border-[#E4DCCD] bg-white p-5 transition hover:border-[#0F172A]">
      {/* Step number */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-dk-red-strong text-sm font-black text-white">
        {index + 1}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-bold text-[#0F172A]">
            {t(`weekly_actions.${actionKey}.title`)}
          </h4>
          <span className="flex shrink-0 items-center gap-1 rounded-full border border-[#EFE9DE] bg-[#FBF8F3] px-2.5 py-1 text-xs font-medium text-slate-600">
            <Clock className="h-3 w-3" />
            {action.durationMinutes} {t('weekly_actions.duration_unit')}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-600">
          {t(`weekly_actions.${actionKey}.description`)}
        </p>

        <Link
          href={`/${locale}/toolkit/${action.toolSlug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#BE2F47] transition hover:underline"
        >
          {t(`weekly_actions.${actionKey}.cta`)}
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}

export default function WeeklyActionsPanel({ metrics, context }: WeeklyActionsPanelProps) {
  const t = useTranslations('weekly_actions');
  const tLabel = useTranslations('pnlV2.weeklyActions');
  const locale = useLocale();
  const actions = getRecommendedActions(metrics);

  // Severity summary for metrics
  const metricSeverities: Array<{ metric: MetricKey; label: string; severity: Severity }> = [
    { metric: 'food_cost', label: tLabel('foodCost'), severity: getSeverity('food_cost', metrics.food_cost) },
    { metric: 'labor_cost', label: tLabel('laborCost'), severity: getSeverity('labor_cost', metrics.labor_cost) },
    { metric: 'net_profit', label: tLabel('netProfit'), severity: getSeverity('net_profit', metrics.net_profit) },
    { metric: 'rent_ratio', label: tLabel('rent'), severity: getSeverity('rent_ratio', metrics.rent_ratio) },
  ];

  const hasIssues = metricSeverities.some((m) => m.severity !== 'OK');

  useEffect(() => {
    if (hasIssues && actions.length > 0) {
      trackEvent(ANALYTICS_EVENTS.WEEKLY_ACTIONS_SHOWN, { action_count: actions.length, context });
    }
  }, [hasIssues, actions.length, context]);

  if (!hasIssues) {
    return (
      <div className="rounded-[22px] border border-emerald-200 bg-emerald-50 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h3 className="mt-3 text-lg font-bold text-emerald-800">{t('all_good_title')}</h3>
        <p className="mt-1 text-sm text-emerald-600">{t('all_good_description')}</p>
      </div>
    );
  }

  // TASK-0514: btoa exists in Node 18+ too — encoding on both sides avoids the hydration mismatch
  // the old `typeof window` branch caused (empty href on the server, full href on the client).
  const metricsBase64 = btoa(JSON.stringify(metrics));

  return (
    <div className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-[#FBF8F3]">
      {/* Header */}
      <div className="border-b border-[#E4DCCD] bg-white px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FBEFF1]">
            <Sparkles className="h-5 w-5 text-[#BE2F47]" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-[-0.02em] text-[#0F172A]">
              {t('panel_title')}
            </h3>
            <p className="text-xs text-slate-600">{t('panel_subtitle')}</p>
          </div>
        </div>

        {/* Severity badges */}
        <div className="mt-4 flex flex-wrap gap-2">
          {metricSeverities.filter((m) => m.severity !== 'OK').map((m) => (
            <SeverityBadge
              key={m.metric}
              severity={m.severity}
              label={`${m.label}: ${t(`severity.${m.severity.toLowerCase()}`)}`}
            />
          ))}
        </div>
      </div>

      {/* Action cards */}
      <div className="space-y-3 p-6">
        {actions.map((action, i) => (
          <ActionCard key={action.id} action={action} index={i} locale={locale} />
        ))}
      </div>

      {/* KAZAN CTA */}
      <div className="border-t border-[#E4DCCD] bg-white px-6 py-5">
        <Link
          href={`/${locale}/kazan-ai?context=weekly_actions&source=${context}&metrics=${metricsBase64}`}
          className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[#0F172A] py-3 font-bold text-white transition hover:bg-[#1E293B]"
        >
          <Sparkles className="h-5 w-5 text-amber-400" />
          {t('kazan_cta')}
        </Link>
      </div>
    </div>
  );
}
