import { getSeverity, type MetricKey, type Severity } from '@/lib/recommendation-engine';

export interface KazanContext {
  context: string | null;
  source: string | null;
  metrics: Record<string, number> | null;
  segment: string | null;
  score: number | null;
}

export function parseKazanContext(searchParams: URLSearchParams): KazanContext {
  const context = searchParams.get('context');
  const source = searchParams.get('source');
  const segment = searchParams.get('segment');
  const scoreRaw = searchParams.get('score');
  const metricsB64 = searchParams.get('metrics');

  let metrics: Record<string, number> | null = null;
  if (metricsB64) {
    try {
      const decoded = atob(decodeURIComponent(metricsB64));
      metrics = JSON.parse(decoded);
    } catch {
      metrics = null;
    }
  }

  return {
    context,
    source,
    metrics,
    segment,
    score: scoreRaw ? parseInt(scoreRaw, 10) : null,
  };
}

export function hasContext(ctx: KazanContext): boolean {
  return ctx.context !== null && (ctx.metrics !== null || ctx.segment !== null);
}

const severityEmoji: Record<Severity, string> = {
  OK: '✅',
  WARNING: '⚠️',
  CRITICAL: '🔴',
};

const benchmarkRanges: Record<MetricKey, string> = {
  food_cost: '28-32%',
  labor_cost: '18-25%',
  net_profit: '12-18%',
  rent_ratio: '<8%',
};

function sanityCheck(metrics: Record<string, number>): string[] {
  const warnings: string[] = [];
  if (metrics.food_cost > 60) warnings.push('food_cost_high');
  if (metrics.net_profit < -30) warnings.push('net_profit_critical');
  if (metrics.rent_ratio > 25) warnings.push('rent_high');
  const sum = (metrics.food_cost || 0) + (metrics.labor_cost || 0) + (metrics.rent_ratio || 0);
  if (sum > 100) warnings.push('sum_exceeds');
  return warnings;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type TranslatorFn = (key: string, values?: Record<string, unknown>) => any;

export function buildPnlGreeting(
  metrics: Record<string, number>,
  t: TranslatorFn,
): string {
  const s = (key: string) => String(t(key));
  const metricKeys: MetricKey[] = ['food_cost', 'labor_cost', 'net_profit', 'rent_ratio'];
  const lines: string[] = [];

  lines.push(s('contextGreeting.pnl.intro'));
  lines.push('');
  lines.push(`📊 **${s('contextGreeting.pnl.results_title')}**`);

  for (const key of metricKeys) {
    const val = metrics[key] ?? 0;
    const sev = getSeverity(key, val);
    const emoji = severityEmoji[sev];
    const benchmark = benchmarkRanges[key];
    const label = s(`contextGreeting.pnl.metric.${key}`);
    lines.push(`• ${label}: ${val}% ${emoji} (${s('contextGreeting.pnl.sector')}: ${benchmark})`);
  }

  const warnings = sanityCheck(metrics);
  if (warnings.length > 0) {
    lines.push('');
    lines.push(`⚠️ **${s('contextGreeting.pnl.sanity_title')}**`);
    for (const w of warnings) {
      lines.push(`• ${s(`contextGreeting.pnl.sanity.${w}`)}`);
    }
  }

  lines.push('');
  lines.push(s('contextGreeting.pnl.questions_intro'));
  lines.push(`1. ${s('contextGreeting.pnl.question_1')}`);
  lines.push(`2. ${s('contextGreeting.pnl.question_2')}`);
  lines.push(`3. ${s('contextGreeting.pnl.question_3')}`);

  return lines.join('\n');
}

export function buildReadinessGreeting(
  segment: string,
  score: number,
  t: TranslatorFn,
): string {
  const s = (key: string) => String(t(key));
  const lines: string[] = [];
  const segKey = segment.toLowerCase();

  lines.push(s('contextGreeting.readiness.intro'));
  lines.push('');
  lines.push(`🎯 **${s('contextGreeting.readiness.score_label')}:** ${score}/30`);
  lines.push(`**${s('contextGreeting.readiness.segment_label')}:** ${s(`contextGreeting.readiness.segment.${segKey}`)}`);
  lines.push('');
  lines.push(s('contextGreeting.readiness.questions_intro'));
  lines.push(`1. ${s('contextGreeting.readiness.question_1')}`);
  lines.push(`2. ${s('contextGreeting.readiness.question_2')}`);

  return lines.join('\n');
}

export function buildSystemPromptInjection(ctx: KazanContext): string {
  if (ctx.context === 'weekly_actions' && ctx.metrics) {
    const metricKeys: MetricKey[] = ['food_cost', 'labor_cost', 'net_profit', 'rent_ratio'];
    const lines = ['Kullanıcı P&L Simulator-dan gəlib. Cari metrik-ləri:'];
    for (const key of metricKeys) {
      const val = ctx.metrics[key] ?? 0;
      const sev = getSeverity(key, val);
      lines.push(`- ${key}: ${val}% (severity: ${sev}, benchmark: ${benchmarkRanges[key]})`);
    }
    lines.push('Cavablarında bu rəqəmlərə referans ver, ümumi məsləhət yox, bu spesifik vəziyyət üçün konkret tövsiyə ver.');
    return lines.join('\n');
  }

  if (ctx.context === 'ai_readiness_result' && ctx.segment) {
    return `Kullanıcı AI Hazırlıq Skoru testindən gəlib. Nəticə: ${ctx.score}/30, seqment: ${ctx.segment}. Bu seqmentə uyğun konkret tövsiyələr ver.`;
  }

  return '';
}
