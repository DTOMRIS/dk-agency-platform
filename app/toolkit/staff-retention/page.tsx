'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Lightbulb, RotateCcw, Users } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('az-AZ')} ₼`;
}

export default function StaffRetentionPage() {
  const t = useTranslations('toolkit.staffRetention');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });

  const [employeeCount, setEmployeeCount] = useState(18);
  const [averageSalary, setAverageSalary] = useState(850);
  const [yearlyLeavers, setYearlyLeavers] = useState(12);

  const topReasons = [t('reason1'), t('reason2'), t('reason3'), t('reason4'), t('reason5')];

  const strategies = [t('strategy1'), t('strategy2'), t('strategy3'), t('strategy4'), t('strategy5'), t('strategy6'), t('strategy7')];

  const blogLinks = [
    { title: t('blogLink1Title'), href: '/blog/isci-saxlama-7-strategiya', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), href: '/toolkit/pnl', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), href: '/kazan-ai', tag: t('blogLink3Tag') },
  ];

  const stats = useMemo(() => {
    const safeEmployeeCount = Math.max(employeeCount, 1);
    const turnoverRate = (yearlyLeavers / safeEmployeeCount) * 100;
    const replacementCostLow = averageSalary * 2;
    const replacementCostHigh = averageSalary * 3;
    const replacementCostMid = averageSalary * 2.5;
    const annualLoss = yearlyLeavers * replacementCostMid;
    return { turnoverRate, replacementCostLow, replacementCostHigh, replacementCostMid, annualLoss };
  }, [averageSalary, employeeCount, yearlyLeavers]);

  const resetAll = () => { setEmployeeCount(18); setAverageSalary(850); setYearlyLeavers(12); };

  // ── Input Section ─────────────────────────────────────────────────

  const inputSection = (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-slate-900">{t('calculatorTitle')}</h2>
          <p className="text-sm text-slate-500">{t('calculatorSubtitle')}</p>
        </div>
        <button onClick={resetAll} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-indigo-600">
          <RotateCcw size={13} /> {t('reset')}
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">{t('labelEmployeeCount')}</label>
          <input type="number" value={employeeCount} onChange={(e) => setEmployeeCount(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">{t('labelAverageSalary')}</label>
          <input type="number" value={averageSalary} onChange={(e) => setAverageSalary(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-slate-500">{t('labelYearlyLeavers')}</label>
          <input type="number" value={yearlyLeavers} onChange={(e) => setYearlyLeavers(parseFloat(e.target.value) || 0)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 font-semibold text-slate-900 outline-none transition-all focus:border-indigo-300 focus:ring-2 focus:ring-indigo-500/20" />
        </div>
      </div>

      {/* Financial Impact */}
      <div className="border-t border-slate-100 pt-5 space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('financialImpactTitle')}</h3>
        <div className="rounded-xl bg-slate-50 p-4">
          <div className="text-xs text-slate-500">{t('turnoverRateLabel')}</div>
          <div className="mt-1 text-2xl font-black text-slate-900">{stats.turnoverRate.toFixed(1)}%</div>
          <p className="mt-2 text-sm text-slate-500">{t('turnoverRateBenchmark')}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-100">
          <div className="text-xs text-slate-500">{t('replacementCostLabel')}</div>
          <div className="mt-1 text-2xl font-black text-indigo-700">
            {formatCurrency(stats.replacementCostLow)} - {formatCurrency(stats.replacementCostHigh)}
          </div>
          <p className="mt-2 text-sm text-slate-500">{t('replacementCostNote')}</p>
        </div>
        <div className="rounded-xl bg-slate-900 p-4 text-white">
          <div className="text-xs uppercase tracking-widest text-slate-400">{t('annualLossLabel')}</div>
          <div className="mt-1 text-3xl font-black">{formatCurrency(stats.annualLoss)}</div>
          <p className="mt-2 text-sm text-slate-300">{t('annualLossNote')}</p>
        </div>
      </div>

      {/* Action Plan */}
      <div className="border-t border-slate-100 pt-5 space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">{t('actionPlanTitle')}</h3>
        {strategies.map((item, index) => (
          <div key={index} className="rounded-xl border border-slate-100 p-4">
            <div className="mb-1 text-xs font-bold uppercase tracking-widest text-indigo-500">{t('stepPrefix')} {index + 1}</div>
            <p className="text-sm leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>

      {/* Pre-shift */}
      <div className="border-t border-slate-100 pt-5">
        <div className="mb-3 flex items-center gap-2 text-indigo-600">
          <Users size={18} />
          <h3 className="text-base font-bold text-slate-900">{t('preShiftTitle')}</h3>
        </div>
        <p className="text-sm leading-7 text-slate-600">{t('preShiftBody')}</p>
      </div>
    </div>
  );

  // ── Result Section ────────────────────────────────────────────────

  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statEmployeeCount')}</div>
        <div className="mt-1 text-3xl font-black text-slate-900">{employeeCount}</div>
      </div>
      <div className="rounded-xl bg-indigo-50 p-4 ring-1 ring-indigo-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-500">{t('statTurnoverRate')}</div>
        <div className="mt-1 text-3xl font-black text-indigo-600">{stats.turnoverRate.toFixed(1)}%</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statReplacementCost')}</div>
        <div className="mt-1 text-2xl font-black text-slate-900">{formatCurrency(stats.replacementCostMid)}</div>
      </div>
      <div className="rounded-xl bg-white p-4 ring-1 ring-slate-200/60">
        <div className="text-[11px] font-bold uppercase tracking-widest text-slate-400">{t('statAnnualLoss')}</div>
        <div className="mt-1 text-2xl font-black text-slate-900">{formatCurrency(stats.annualLoss)}</div>
      </div>

      {/* Top 5 Reasons */}
      <div className="border-t border-slate-100 pt-4">
        <div className="mb-3 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-indigo-600">
          {t('knowledgePanelBadge')}
        </div>
        <h3 className="text-base font-black text-slate-900">{t('top5Title')}</h3>
        <div className="mt-3 space-y-2">
          {topReasons.map((reason, index) => (
            <div key={index} className="rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-600">{reason}</div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Bottom Section ────────────────────────────────────────────────

  const bottomSection = (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-2xl bg-slate-950 p-6 text-white shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-indigo-300">
          <Lightbulb size={16} />
          <span className="text-xs font-bold uppercase tracking-widest">{t('dkAdviceLabel')}</span>
        </div>
        <p className="text-sm leading-7 text-slate-300">{t('dkAdviceBody')}</p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-3 flex items-center gap-2 text-slate-900">
          <BookOpen size={16} />
          <h3 className="text-base font-bold">{t('usefulLinksTitle')}</h3>
        </div>
        <div className="space-y-3">
          {blogLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 transition-colors hover:border-indigo-200 hover:bg-indigo-50">
              <div>
                <div className="text-xs uppercase tracking-widest text-slate-400">{item.tag}</div>
                <div className="text-sm font-semibold text-slate-900">{item.title}</div>
              </div>
              <ArrowRight size={16} className="text-slate-400 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <ToolkitStudioLayout
      toolId="staff-retention"
      toolName={t('title')}
      toolDescription={t('subtitle')}
      tier="kalfa"
      inputSection={inputSection}
      resultSection={resultSection}
      bottomSection={bottomSection}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({ toolId: 'staff-retention', locale, result: { turnoverRate: stats.turnoverRate, replacementCost: stats.replacementCostMid, annualLoss: stats.annualLoss, employeeCount } });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
