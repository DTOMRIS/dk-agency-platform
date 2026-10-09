'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { calcGuesthouseRoi, GUESTHOUSE_ROI_DEFAULTS, type GuesthouseRoiVerdict } from '@/lib/data/guesthouseRoi';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';

type RoiField = keyof typeof GUESTHOUSE_ROI_DEFAULTS;
type RoiInputs = Record<RoiField, number>;
/** TASK-0517: «Təmizlə» → every field 0. */
const EMPTY_INPUTS: RoiInputs = {
  nightlyPrice: 0,
  roomCount: 0,
  occupancyPercent: 0,
  avgCommissionPercent: 0,
  otaSharePercent: 0,
  monthlyFixedCost: 0,
  initialInvestment: 0,
};
/** TASK-0515: percentages are clamped to 0–100, money and counts to ≥ 0. */
const PERCENT_FIELDS: ReadonlySet<RoiField> = new Set(['occupancyPercent', 'avgCommissionPercent', 'otaSharePercent']);
function clampField(field: RoiField, value: number): number {
  if (!Number.isFinite(value)) return 0;
  if (PERCENT_FIELDS.has(field)) return Math.min(100, Math.max(0, value));
  if (field === 'roomCount') return Math.max(0, Math.round(value));
  return Math.max(0, value);
}

function fmt(n: number) { return n.toLocaleString(AZ_NUMBER_LOCALE, { maximumFractionDigits: 0 }) + ' AZN'; }

const VERDICT_STYLES: Record<GuesthouseRoiVerdict, string> = {
  healthy: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  borderline: 'bg-amber-50 text-amber-700 border border-amber-200',
  risky: 'bg-red-50 text-red-700 border border-red-200',
  unprofitable: 'bg-red-50 text-red-700 border border-red-200',
};

export default function GuesthouseRoiCalculator() {
  const t = useTranslations('guesthouseRoi');
  const [inputs, setInputs] = useState<RoiInputs>({ ...GUESTHOUSE_ROI_DEFAULTS });
  const [clamped, setClamped] = useState<RoiField | null>(null);
  const update = useCallback((field: RoiField, value: number) => {
    const next = clampField(field, value);
    setClamped(next !== value ? field : null);
    setInputs(prev => ({ ...prev, [field]: next }));
  }, []);

  const result = calcGuesthouseRoi(inputs);

  const fields: Array<{ key: RoiField; unit: string }> = [
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
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm" data-testid="tool-inputs">
        <ToolResetControls<RoiInputs>
          className="mb-5"
          snapshot={() => inputs}
          restore={(saved) => { setClamped(null); setInputs(saved); }}
          onClear={() => { setClamped(null); setInputs({ ...EMPTY_INPUTS }); }}
          onLoadExample={() => { setClamped(null); setInputs({ ...GUESTHOUSE_ROI_DEFAULTS }); }}
        />
        {fields.map(({ key, unit }) => (
          <div key={key} className="mb-4">
            <label htmlFor={`roi-${key}`} className="mb-1 block text-sm font-bold text-slate-900">
              {t(`inputs.${key}.label`)}
              <span className="ml-2 text-xs font-normal text-slate-600">{t(`inputs.${key}.hint`)}</span>
            </label>
            <div className="flex items-center overflow-hidden rounded-xl border border-slate-200 focus-within:border-amber-700">
              <DecimalInput id={`roi-${key}`} value={inputs[key]} onValueChange={(v) => update(key, v)}
                inputMode={key === 'roomCount' ? 'numeric' : 'decimal'}
                className="w-full border-none px-3 py-3 text-base text-slate-900 focus:outline-none" />
              {unit && <span className="shrink-0 bg-amber-50 px-3 py-3 text-sm font-bold text-amber-800">{unit}</span>}
            </div>
            {clamped === key ? (
              <p className="mt-1 text-xs font-semibold text-amber-800" role="status" data-testid={`roi-clamp-${key}`}>
                {PERCENT_FIELDS.has(key) ? t('validation.percentRange') : t('validation.nonNegative')}
              </p>
            ) : null}
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
            ['paybackLabel', result.paybackMonths < Infinity ? t('results.paybackMonthsUnit', { count: Math.round(result.paybackMonths) }) : t('results.noProfitText')],
          ] as [string, string][]).map(([label, val]) => (
            <div key={label} className="flex justify-between border-b border-dashed border-slate-100 pb-2">
              <span className="text-slate-600">{t(`results.${label}`)}</span>
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
