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
    <div className="group relative flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 transition hover:border-[var(--dk-red,#E94560)]/30 hover:shadow-md">
      {/* Step number */}
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--dk-red,#E94560)] to-[var(--dk-red,#E94560)]/80 text-sm font-black text-white shadow-sm">
        {index + 1}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-bold text-[var(--dk-navy,#1A1A2E)]">
            {t(`weekly_actions.${actionKey}.title`)}
          </h4>
          <span className="flex shrink-0 items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
            <Clock className="h-3 w-3" />
            {action.durationMinutes} {t('weekly_actions.duration_unit')}
          </span>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-slate-500">
          {t(`weekly_actions.${actionKey}.description`)}
        </p>

        <Link
          href={`/${locale}/toolkit/${action.toolSlug}`}
          className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--dk-red,#E94560)] transition hover:underline"
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
  const locale = useLocale();
  const actions = getRecommendedActions(metrics);

  // Severity summary for metrics
  const metricSeverities: Array<{ metric: MetricKey; label: string; severity: Severity }> = [
    { metric: 'food_cost', label: 'Food Cost', severity: getSeverity('food_cost', metrics.food_cost) },
    { metric: 'labor_cost', label: 'Labor Cost', severity: getSeverity('labor_cost', metrics.labor_cost) },
    { metric: 'net_profit', label: 'Net Profit', severity: getSeverity('net_profit', metrics.net_profit) },
    { metric: 'rent_ratio', label: 'Rent', severity: getSeverity('rent_ratio', metrics.rent_ratio) },
  ];

  const hasIssues = metricSeverities.some((m) => m.severity !== 'OK');

  useEffect(() => {
    if (hasIssues && actions.length > 0) {
      trackEvent(ANALYTICS_EVENTS.WEEKLY_ACTIONS_SHOWN, { action_count: actions.length, context });
    }
  }, [hasIssues, actions.length, context]);

  if (!hasIssues) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-500" />
        <h3 className="mt-3 text-lg font-bold text-emerald-800">{t('all_good_title')}</h3>
        <p className="mt-1 text-sm text-emerald-600">{t('all_good_description')}</p>
      </div>
    );
  }

  const metricsBase64 = typeof window !== 'undefined'
    ? btoa(JSON.stringify(metrics))
    : '';

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 via-white to-[var(--dk-red-light,#FFF0F3)]/30 shadow-lg">
      {/* Header */}
      <div className="border-b border-slate-200 bg-white/80 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--dk-red,#E94560)]/10">
            <Sparkles className="h-5 w-5 text-[var(--dk-red,#E94560)]" />
          </div>
          <div>
            <h3 className="text-lg font-black text-[var(--dk-navy,#1A1A2E)]">
              {t('panel_title')}
            </h3>
            <p className="text-xs text-slate-500">{t('panel_subtitle')}</p>
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
      <div className="border-t border-slate-200 bg-white/60 px-6 py-5 backdrop-blur-sm">
        <Link
          href={`/${locale}/kazan-ai?context=weekly_actions&source=${context}&metrics=${metricsBase64}`}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-navy,#1A1A2E)] py-3.5 font-bold text-white transition hover:bg-slate-800"
        >
          <Sparkles className="h-5 w-5 text-amber-400" />
          {t('kazan_cta')}
        </Link>
      </div>
    </div>
  );
}
