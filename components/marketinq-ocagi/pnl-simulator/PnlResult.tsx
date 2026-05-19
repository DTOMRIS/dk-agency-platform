'use client';

import Link from 'next/link';
import { TrendingUp, TrendingDown, Minus, AlertTriangle, Lightbulb, Shield } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PnlCalc {
  revenue: number; cogs: number; cogsPercent: number;
  operatingProfit: number; operatingProfitPercent: number;
  controllable: number; controllablePercent: number;
  controllableProfit: number; controllableProfitPercent: number;
  uncontrollable: number; uncontrollablePercent: number;
  netProfit: number; netProfitPercent: number;
  primeCost: number; primeCostPercent: number;
  foodCostPercent: number; laborCostPercent: number; rentPercent: number;
}
interface AIInsight {
  verdict: string; keyFindings: string[]; risks: string[]; recommendations: string[];
  benchmarkComparison: { foodCostStatus: string; laborCostStatus: string; rentStatus: string; netProfitStatus: string };
  ahilikQuote: string;
}

interface PnlResultData { pnl: PnlCalc; aiInsight: AIInsight }

function VerdictBadge({ verdict }: { verdict: string }) {
  const cfg = verdict === 'SAGLAM' ? { bg: 'bg-green-100', text: 'text-green-700', icon: TrendingUp }
    : verdict === 'KRITIK' ? { bg: 'bg-red-100', text: 'text-red-700', icon: TrendingDown }
    : { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: Minus };
  const Icon = cfg.icon;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold ${cfg.bg} ${cfg.text}`}><Icon size={16} />{verdict}</span>;
}

function KpiCard({ label, value, benchmark, ok }: { label: string; value: string; benchmark: string; ok: boolean }) {
  return (
    <div className={`rounded-xl border p-3 text-center ${ok ? 'border-green-200 bg-green-50' : 'border-amber-200 bg-amber-50'}`}>
      <p className="text-[10px] font-semibold uppercase text-slate-400">{label}</p>
      <p className={`text-xl font-bold ${ok ? 'text-green-700' : 'text-amber-700'}`}>{value}</p>
      <p className="text-[10px] text-slate-500">{benchmark}</p>
    </div>
  );
}

interface Props { result: PnlResultData; onRedo: () => void }

export default function PnlResult({ result, onRedo }: Props) {
  const t = useTranslations('marketinq.plSimulator');
  const { pnl: p, aiInsight: ai } = result;
  const fmt = (v: number) => `${v.toLocaleString()} ₼`;

  return (
    <div className="space-y-6">
      {/* Verdict */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center">
        <VerdictBadge verdict={ai.verdict} />
        <p className="mt-3 text-3xl font-bold text-[var(--dk-navy)]">{t('pnlResult_netProfit')}: {fmt(p.netProfit)}</p>
        <p className="mt-1 text-sm text-slate-500">{p.netProfitPercent}%</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <KpiCard label={t('pnlResult_foodCost')} value={`${p.foodCostPercent}%`} benchmark="28-35%" ok={p.foodCostPercent <= 35} />
        <KpiCard label={t('pnlResult_laborCost')} value={`${p.laborCostPercent}%`} benchmark="25-32%" ok={p.laborCostPercent <= 32} />
        <KpiCard label={t('pnlResult_rentLabel')} value={`${p.rentPercent}%`} benchmark="8-15%" ok={p.rentPercent <= 15} />
        <KpiCard label={t('pnlResult_primeCost')} value={`${p.primeCostPercent}%`} benchmark="<65%" ok={p.primeCostPercent < 65} />
      </div>

      {/* P&L Table */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t('pnlResult_pnlTitle')}</h3>
        <div className="space-y-1 text-sm">
          {[
            [t('pnlResult_revenue'), p.revenue, 100],
            [`− ${t('pnlResult_cogs')}`, -p.cogs, -p.cogsPercent],
            [`= ${t('pnlResult_opProfit')}`, p.operatingProfit, p.operatingProfitPercent],
            [`− ${t('pnlResult_ctrl')}`, -p.controllable, -p.controllablePercent],
            [`= ${t('pnlResult_ctrlProfit')}`, p.controllableProfit, p.controllableProfitPercent],
            [`− ${t('pnlResult_unctrl')}`, -p.uncontrollable, -p.uncontrollablePercent],
            [`= ${t('pnlResult_netProfit')}`, p.netProfit, p.netProfitPercent],
          ].map(([label, amount, pct], i) => {
            const isResult = String(label).startsWith('=');
            return (
              <div key={i} className={`flex justify-between py-1.5 ${isResult ? 'font-bold border-t border-slate-200 pt-2' : ''}`}>
                <span className={isResult ? 'text-[var(--dk-navy)]' : 'text-slate-600'}>{label}</span>
                <div className="flex gap-4">
                  <span className={`w-24 text-right ${Number(amount) < 0 ? 'text-red-600' : 'text-[var(--dk-navy)]'}`}>{fmt(Number(amount))}</span>
                  <span className="w-12 text-right text-slate-400">{Number(pct).toFixed(1)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insight */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-[var(--dk-navy)]">{t('pnlResult_aiTitle')}</h3>

        {/* Benchmark */}
        <div className="mb-4 grid grid-cols-2 gap-2 rounded-lg bg-slate-50 p-3 text-xs">
          <div><span className="text-slate-400">{t('pnlResult_foodCost')}:</span> <span className="font-semibold">{ai.benchmarkComparison.foodCostStatus}</span></div>
          <div><span className="text-slate-400">{t('pnlResult_laborCost')}:</span> <span className="font-semibold">{ai.benchmarkComparison.laborCostStatus}</span></div>
          <div><span className="text-slate-400">{t('pnlResult_rentLabel')}:</span> <span className="font-semibold">{ai.benchmarkComparison.rentStatus}</span></div>
          <div><span className="text-slate-400">{t('pnlResult_netProfit')}:</span> <span className="font-semibold">{ai.benchmarkComparison.netProfitStatus}</span></div>
        </div>

        {ai.keyFindings.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-slate-500"><Lightbulb size={12} />{t('pnlResult_findings')}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.keyFindings.map((f, i) => <li key={i}>• {f}</li>)}</ul>
          </div>
        )}
        {ai.risks.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-amber-600"><AlertTriangle size={12} />{t('pnlResult_risks')}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.risks.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        )}
        {ai.recommendations.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-bold text-green-600"><Shield size={12} />{t('pnlResult_recs')}</p>
            <ul className="space-y-1 text-sm text-slate-600">{ai.recommendations.map((r, i) => <li key={i}>• {r}</li>)}</ul>
          </div>
        )}

        <p className="mt-4 text-center text-xs italic text-slate-400">&ldquo;{ai.ahilikQuote}&rdquo; — Əhilik</p>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onRedo} className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-navy)] hover:text-[var(--dk-navy)]">{t('pnlResult_redo')}</button>
        <Link href="/dashboard/marketinq-ocagi" className="flex flex-1 items-center justify-center rounded-xl bg-[var(--dk-navy)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90">{t('pnlResult_next')}</Link>
      </div>
    </div>
  );
}
