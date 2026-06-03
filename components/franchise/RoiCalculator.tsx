'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { calcRoi, ROI_DEFAULTS, type RoiVerdict } from '@/lib/data/franchiseRoi';

function fmt(n: number) {
  return n.toLocaleString('az-AZ', { maximumFractionDigits: 0 }) + ' AZN';
}

const VERDICT_STYLES: Record<RoiVerdict, string> = {
  good: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  mid: 'bg-amber-50 text-amber-700 border border-amber-200',
  bad: 'bg-red-50 text-red-700 border border-red-200',
  negative: 'bg-red-50 text-red-700 border border-red-200',
};

export default function RoiCalculator() {
  const t = useTranslations('franchiseRoi');

  const [inputs, setInputs] = useState({
    revenue: ROI_DEFAULTS.revenue,
    marginPercent: ROI_DEFAULTS.marginPercent,
    opex: ROI_DEFAULTS.opex,
    royaltyPercent: ROI_DEFAULTS.royaltyPercent,
    adFundPercent: ROI_DEFAULTS.adFundPercent,
    investment: ROI_DEFAULTS.investment,
  });

  const update = useCallback((field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  }, []);

  const result = calcRoi(inputs);

  const fields: Array<{ key: keyof typeof inputs; unit: string }> = [
    { key: 'revenue', unit: 'AZN' },
    { key: 'marginPercent', unit: '%' },
    { key: 'opex', unit: 'AZN' },
    { key: 'royaltyPercent', unit: '%' },
    { key: 'adFundPercent', unit: '%' },
    { key: 'investment', unit: 'AZN' },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Inputs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {fields.map(({ key, unit }) => (
          <div key={key} className="mb-4">
            <label className="mb-1 block text-sm font-bold text-slate-900">
              {t(`fields.${key}.label`)}
              <span className="ml-2 text-xs font-normal text-slate-400">{t(`fields.${key}.hint`)}</span>
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-[var(--dk-gold)]">
              <input
                type="number"
                value={inputs[key]}
                onChange={e => update(key, e.target.value)}
                className="w-full border-none px-3 py-3 text-base focus:outline-none"
              />
              <span className="shrink-0 bg-amber-50 px-3 py-3 text-sm font-bold text-amber-700">{unit}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Results */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-1 font-display text-5xl font-extrabold text-slate-900">
          {result.roi > 0 ? '+' : ''}{result.roi.toFixed(1)}%
        </div>
        <div className="mb-5 text-sm text-slate-400">{t('roiLabel')}</div>

        <div className="space-y-3 text-sm">
          {([
            ['grossProfit', fmt(result.grossProfit)],
            ['royaltyAdFund', fmt(result.royaltyAdFund)],
            ['opex', fmt(inputs.opex)],
            ['netProfit', fmt(result.netProfit)],
            ['payback', result.paybackMonths < 120 ? `${Math.round(result.paybackMonths)} ${t('months')}` : t('noProfit')],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
              <span className="text-slate-500">{t(`results.${label}`)}</span>
              <span className="font-bold text-slate-900">{val}</span>
            </div>
          ))}
        </div>

        <div className={`mt-5 rounded-xl p-4 text-sm font-semibold ${VERDICT_STYLES[result.verdict]}`}>
          {t(`verdict.${result.verdict}`)}
        </div>
      </div>
    </div>
  );
}
