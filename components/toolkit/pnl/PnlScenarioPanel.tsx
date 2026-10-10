'use client';

/**
 * @file PnlScenarioPanel.tsx
 * @purpose TASK-0523 (owner 2026-10-09: «P&L simulyatoru pulsuz P&L ilə birləşir, USTA-da AI şərhi qalır»).
 *          Break-even sales, a «what if» scenario and the USTA-only AI comment, shown under the free
 *          /toolkit/pnl table. Replaces the separate PLSimulator (/marketinq/pl-simulyatoru) engine.
 *          Only food + packaging move with sales; wages, rent and the rest are paid either way.
 */

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Sparkles } from 'lucide-react';
import { getPLAIAnalysis } from '@/app/actions/pl-ai-analysis';
import { withLocale, normalizeLocale } from '@/i18n/config';

type Props = {
  revenue: number;
  /** food + packaging — grows with sales */
  variableCost: number;
  /** staff + management */
  labor: number;
  /** everything else (rent, utilities, ads …) */
  otherFixed: number;
  formatCurrency: (value: number) => string;
  formatPercent: (value: number) => string;
};

export function pnlBreakeven(revenue: number, variableCost: number, fixedCost: number): number | null {
  if (revenue <= 0) return null;
  const variableShare = variableCost / revenue;
  if (variableShare >= 1) return null;
  return fixedCost / (1 - variableShare);
}

const sliderClass = 'w-full accent-[#D63B54]';

export default function PnlScenarioPanel({ revenue, variableCost, labor, otherFixed, formatCurrency, formatPercent }: Props) {
  const t = useTranslations('toolkit.pnl.scenario');
  const locale = normalizeLocale(useLocale());
  const [salesGrowth, setSalesGrowth] = useState(0);
  const [foodCut, setFoodCut] = useState(0);
  const [fixedCut, setFixedCut] = useState(0);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [needsUsta, setNeedsUsta] = useState(false);
  const [isPending, startTransition] = useTransition();

  const fixedCost = labor + otherFixed;
  const netProfit = revenue - variableCost - fixedCost;
  const breakeven = pnlBreakeven(revenue, variableCost, fixedCost);

  const scenario = useMemo(() => {
    const sales = revenue * (1 + salesGrowth / 100);
    const variable = variableCost * (1 + salesGrowth / 100) * (1 - foodCut / 100);
    const fixed = fixedCost * (1 - fixedCut / 100);
    const net = sales - variable - fixed;
    return { sales, net, delta: net - netProfit };
  }, [fixedCost, fixedCut, foodCut, netProfit, revenue, salesGrowth, variableCost]);

  if (revenue <= 0) return null;

  const pct = (value: number) => (revenue > 0 ? (value / revenue) * 100 : 0);

  function askAI() {
    setAiError(null);
    setNeedsUsta(false);
    startTransition(async () => {
      const result = await getPLAIAnalysis({
        period: 'monthly',
        totalSales: revenue,
        cogs: variableCost,
        foodCostPercent: Math.round(pct(variableCost) * 10) / 10,
        labor,
        laborPercent: Math.round(pct(labor) * 10) / 10,
        primeCost: variableCost + labor,
        primeCostPercent: Math.round(pct(variableCost + labor) * 10) / 10,
        overhead: otherFixed,
        netProfit,
        netProfitPercent: Math.round(pct(netProfit) * 10) / 10,
        breakevenSales: Math.max(0, Math.round(breakeven ?? 0)),
      });
      if (result.ok && result.analysis) {
        setAiText(result.analysis);
        return;
      }
      setAiText(null);
      if (result.error === 'unauthorized') setNeedsUsta(true);
      else setAiError(t(`errors.${result.error ?? 'ai-failed'}`));
    });
  }

  const gap = breakeven === null ? null : revenue - breakeven;

  return (
    <div className="space-y-4" data-testid="pnl-scenario-panel">
      <div className={`rounded-2xl p-5 ring-1 ${gap !== null && gap >= 0 ? 'bg-emerald-50 text-emerald-800 ring-emerald-500/20' : 'bg-red-50 text-red-700 ring-red-500/20'}`}>
        <div className="mb-2 text-[11px] font-bold tracking-widest text-slate-700 uppercase">{t('breakevenLabel')}</div>
        <div className="text-3xl font-black tabular-nums" data-testid="pnl-breakeven">{breakeven === null ? '—' : formatCurrency(breakeven)}</div>
        <p className="mt-1 text-xs font-semibold">
          {breakeven === null
            ? t('breakevenImpossible')
            : gap !== null && gap >= 0
              ? t('breakevenAbove', { value: formatCurrency(gap) })
              : t('breakevenBelow', { value: formatCurrency(Math.abs(gap ?? 0)) })}
        </p>
        <p className="mt-2 text-[11px] leading-5 text-slate-600">{t('breakevenNote')}</p>
      </div>

      <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
        <h3 className="text-sm font-bold text-slate-900">{t('title')}</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">{t('subtitle')}</p>
        <div className="mt-4 space-y-4">
          {([
            ['salesGrowth', salesGrowth, setSalesGrowth, -30, 50],
            ['foodCut', foodCut, setFoodCut, 0, 30],
            ['fixedCut', fixedCut, setFixedCut, 0, 30],
          ] as const).map(([key, value, setter, min, max]) => (
            <label key={key} className="block">
              <span className="flex items-center justify-between text-xs font-semibold text-slate-700">
                {t(`sliders.${key}`)}
                <span className="tabular-nums font-bold text-slate-900">{value > 0 && key === 'salesGrowth' ? '+' : ''}{value}%</span>
              </span>
              <input type="range" min={min} max={max} step={1} value={value} onChange={(event) => setter(Number(event.target.value))} className={sliderClass} data-testid={`pnl-slider-${key}`} />
            </label>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-sm">
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">{t('scenarioNet')}</div>
            <div className={`text-lg font-black tabular-nums ${scenario.net >= 0 ? 'text-emerald-700' : 'text-red-700'}`} data-testid="pnl-scenario-net">{formatCurrency(scenario.net)}</div>
            <div className="text-xs text-slate-600">{formatPercent(scenario.sales > 0 ? (scenario.net / scenario.sales) * 100 : 0)}</div>
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-500 uppercase">{t('scenarioDelta')}</div>
            <div className={`text-lg font-black tabular-nums ${scenario.delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`} data-testid="pnl-scenario-delta">{scenario.delta > 0 ? '+' : ''}{formatCurrency(scenario.delta)}</div>
            <div className="text-xs text-slate-600">{t('perMonth')}</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-slate-950 p-5 text-white">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-300" aria-hidden="true" />
          <h3 className="text-sm font-bold">{t('aiTitle')}</h3>
          <span className="rounded-full bg-amber-400/20 px-2 py-0.5 text-[10px] font-bold text-amber-300 uppercase">USTA</span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-300">{t('aiBody')}</p>
        <button type="button" onClick={askAI} disabled={isPending} data-testid="pnl-ai-button"
          className="mt-3 inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-dk-red-strong px-4 text-sm font-bold text-white transition hover:bg-dk-red-deep disabled:opacity-60">
          {isPending ? t('aiLoading') : t('aiCta')}
        </button>
        {needsUsta && (
          <p className="mt-3 text-xs leading-5 text-slate-200" role="status" data-testid="pnl-ai-usta">
            {t('aiUsta')}{' '}
            <Link href={withLocale(locale, '/qiymet')} className="font-bold text-amber-300 underline">{t('aiUstaLink')}</Link>
          </p>
        )}
        {aiError && <p className="mt-3 text-xs font-semibold text-red-300" role="alert">{aiError}</p>}
        {aiText && <div className="mt-3 max-h-96 overflow-y-auto whitespace-pre-wrap rounded-xl bg-white/5 p-3 text-xs leading-6 text-slate-100" data-testid="pnl-ai-text">{aiText}</div>}
      </div>
    </div>
  );
}
