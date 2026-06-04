'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { calcGuesthouseRoi, GUESTHOUSE_ROI_DEFAULTS, type GuesthouseRoiVerdict } from '@/lib/data/guesthouseRoi';

function fmt(n: number) { return n.toLocaleString('az-AZ', { maximumFractionDigits: 0 }) + ' AZN'; }

const VERDICT_STYLES: Record<GuesthouseRoiVerdict, string> = {
  healthy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  borderline: 'bg-amber-50 text-amber-700 border border-amber-200',
  risky: 'bg-red-50 text-red-700 border border-red-200',
  unprofitable: 'bg-red-50 text-red-700 border border-red-200',
};

export default function GuesthouseRoiCalculator() {
  const t = useTranslations('guesthouseRoi');
  const [inputs, setInputs] = useState({ ...GUESTHOUSE_ROI_DEFAULTS });
  const update = useCallback((field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  }, []);

  const result = calcGuesthouseRoi(inputs);

  const fields: Array<{ key: keyof typeof inputs; unit: string }> = [
    { key: 'nightlyPrice', unit: 'AZN' },
    { key: 'roomCount', unit: '' },
    { key: 'occupancyPercent', unit: '%' },
    { key: 'avgCommissionPercent', unit: '%' },
    { key: 'otaSharePercent', unit: '%' },
    { key: 'monthlyFixedCost', unit: 'AZN' },
    { key: 'initialInvestment', unit: 'AZN' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {fields.map(({ key, unit }) => (
          <div key={key} className="mb-4">
            <label className="mb-1 block text-sm font-bold text-slate-900">
              {t(`inputs.${key}.label`)}
              <span className="ml-2 text-xs font-normal text-slate-400">{t(`inputs.${key}.hint`)}</span>
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-[var(--dk-gold)]">
              <input type="number" value={inputs[key]} onChange={e => update(key, e.target.value)}
                className="w-full border-none px-3 py-3 text-base focus:outline-none" />
              {unit && <span className="shrink-0 bg-amber-50 px-3 py-3 text-sm font-bold text-amber-700">{unit}</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:sticky md:top-24 md:self-start">
        <div className="mb-5 space-y-3 text-sm">
          {([
            ['monthlyGrossLabel', fmt(result.monthlyGross)],
            ['otaRevenueLabel', fmt(result.otaRevenue)],
            ['directRevenueLabel', fmt(result.directRevenue)],
            ['otaCommissionLabel', `-${fmt(result.otaCommission)}`],
            ['monthlyNetLabel', fmt(result.monthlyNet)],
            ['annualNetLabel', fmt(result.annualNet)],
            ['paybackLabel', result.paybackMonths < Infinity ? `${Math.round(result.paybackMonths)} ${t('results.paybackMonthsUnit', { count: Math.round(result.paybackMonths) })}` : t('results.noProfitText')],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
              <span className="text-slate-500">{t(`results.${label}`)}</span>
              <span className="font-bold text-slate-900">{val}</span>
            </div>
          ))}
        </div>
        <div className={`rounded-xl p-4 text-sm font-semibold ${VERDICT_STYLES[result.verdict]}`}>
          {t(`verdicts.${result.verdict}`)}
        </div>
      </div>
    </div>
  );
}
