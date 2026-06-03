'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, HelpCircle } from 'lucide-react';
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

function Tooltip({ text }: { text: string }) {
  return (
    <span className="group relative ml-1 inline-flex cursor-help">
      <HelpCircle className="h-3.5 w-3.5 text-slate-400" />
      <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl bg-slate-900 p-3 text-xs font-normal leading-relaxed text-white opacity-0 shadow-xl transition-opacity group-hover:opacity-100">
        {text}
      </span>
    </span>
  );
}

export default function RoiCalculator() {
  const t = useTranslations('franchiseRoi');

  const [inputs, setInputs] = useState({
    revenue: ROI_DEFAULTS.revenue,
    marginPercent: ROI_DEFAULTS.marginPercent,
    opex: ROI_DEFAULTS.opex,
    royaltyPercent: ROI_DEFAULTS.royaltyPercent,
    adFundPercent: ROI_DEFAULTS.adFundPercent,
    entryFee: ROI_DEFAULTS.entryFee,
    setupCost: ROI_DEFAULTS.setupCost,
    workingCapital: ROI_DEFAULTS.workingCapital,
  });

  const [explainOpen, setExplainOpen] = useState(false);

  const update = useCallback((field: string, value: string) => {
    setInputs(prev => ({ ...prev, [field]: Number(value) || 0 }));
  }, []);

  const result = calcRoi(inputs);

  const operatingFields: Array<{ key: keyof typeof inputs; unit: string }> = [
    { key: 'revenue', unit: 'AZN' },
    { key: 'marginPercent', unit: '%' },
    { key: 'opex', unit: 'AZN' },
    { key: 'royaltyPercent', unit: '%' },
    { key: 'adFundPercent', unit: '%' },
  ];

  const investmentFields: Array<{ key: keyof typeof inputs; unit: string }> = [
    { key: 'entryFee', unit: 'AZN' },
    { key: 'setupCost', unit: 'AZN' },
    { key: 'workingCapital', unit: 'AZN' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        {/* Inputs */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-slate-400">{t('sectionOperating')}</h3>
            {operatingFields.map(({ key, unit }) => (
              <div key={key} className="mb-4">
                <label className="mb-1 flex items-center text-sm font-bold text-slate-900">
                  {t(`fields.${key}.label`)}
                  <Tooltip text={t(`fields.${key}.hint`)} />
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

          <div className="rounded-2xl border border-[var(--dk-gold)]/30 bg-[var(--dk-gold)]/5 p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-black uppercase tracking-widest text-[var(--dk-gold)]">{t('sectionInvestment')}</h3>
            {investmentFields.map(({ key, unit }) => (
              <div key={key} className="mb-4">
                <label className="mb-1 flex items-center text-sm font-bold text-slate-900">
                  {t(`fields.${key}.label`)}
                  <Tooltip text={t(`fields.${key}.hint`)} />
                </label>
                <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-[var(--dk-gold)]">
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
            <div className="mt-2 flex justify-between rounded-xl bg-white px-4 py-3 text-sm font-bold text-slate-900 shadow-sm">
              <span>{t('totalInvestment')}</span>
              <span>{fmt(result.investment)}</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:sticky md:top-24 md:self-start">
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
              ['payback', result.paybackMonths < Infinity ? `${Math.round(result.paybackMonths)} ${t('months')}` : t('noProfit')],
            ] as [string, string][]).map(([label, val]) => (
              <div key={label} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
                <span className="text-slate-500">{t(`results.${label}`)}</span>
                <span className="font-bold text-slate-900">{val}</span>
              </div>
            ))}

            <div className="flex justify-between border-b border-dashed border-slate-100 pb-2">
              <span className="text-slate-500">{t('totalInvestment')}</span>
              <span className="font-bold text-slate-900">{fmt(result.investment)}</span>
            </div>
            <div className="space-y-1 pl-4 text-xs text-slate-400">
              <div className="flex justify-between"><span>{t('fields.entryFee.label')}</span><span>{fmt(inputs.entryFee)}</span></div>
              <div className="flex justify-between"><span>{t('fields.setupCost.label')}</span><span>{fmt(inputs.setupCost)}</span></div>
              <div className="flex justify-between"><span>{t('fields.workingCapital.label')}</span><span>{fmt(inputs.workingCapital)}</span></div>
            </div>
          </div>

          <div className={`mt-5 rounded-xl p-4 text-sm font-semibold ${VERDICT_STYLES[result.verdict]}`}>
            {t(`verdict.${result.verdict}`)}
          </div>
        </div>
      </div>

      {/* Explain Panel */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <button
          type="button"
          onClick={() => setExplainOpen(p => !p)}
          className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-bold text-slate-900 hover:bg-slate-50 transition-colors rounded-2xl"
        >
          {t('explain.toggle')}
          <ChevronDown className={`h-5 w-5 text-slate-400 transition-transform ${explainOpen ? 'rotate-180' : ''}`} />
        </button>

        {explainOpen && (
          <div className="border-t border-slate-100 px-6 pb-6 pt-4 space-y-6">
            {/* Ödəniş növləri */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-[var(--dk-gold)]">{t('explain.paymentTypesTitle')}</h4>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                <p><strong className="text-slate-900">{t('explain.entryFeeTitle')}</strong> {t('explain.entryFeeDesc')}</p>
                <p><strong className="text-slate-900">{t('explain.royaltyTitle')}</strong> {t('explain.royaltyDesc')}</p>
                <p><strong className="text-slate-900">{t('explain.adFundTitle')}</strong> {t('explain.adFundDesc')}</p>
              </div>
            </div>

            {/* Franchise növləri */}
            <div>
              <h4 className="mb-3 text-xs font-black uppercase tracking-widest text-[var(--dk-red)]">{t('explain.franchiseTypesTitle')}</h4>
              <div className="space-y-3 text-sm leading-relaxed text-slate-600">
                <p><strong className="text-slate-900">{t('explain.singleUnit')}</strong> {t('explain.singleUnitDesc')}</p>
                <p><strong className="text-slate-900">{t('explain.area')}</strong> {t('explain.areaDesc')}</p>
                <p><strong className="text-slate-900">{t('explain.master')}</strong> {t('explain.masterDesc')}</p>
                <p><strong className="text-slate-900">{t('explain.sub')}</strong> {t('explain.subDesc')}</p>
              </div>
              <div className="mt-4 rounded-xl bg-amber-50 p-4 text-sm">
                <p className="font-bold text-amber-800">{t('explain.warning')}</p>
                <p className="mt-2 text-amber-700">{t('explain.tip')}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
