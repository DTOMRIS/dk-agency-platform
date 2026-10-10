'use client';

/**
 * @file RoiCalculator.tsx
 * @purpose Franchise ROI calculator. TASK-0531 (owner 10.10: «/franchise/roi-kalkulyatoru eski model»):
 *          v2 design — cream surface, white input cards, ink result panel that stays in view on desktop.
 *          Pattern taken from turnover-cost calculators that convert well: the next step (a free review of
 *          the numbers) sits INSIDE the result panel, where the number lands — not in a separate block.
 *          Same maths as before (lib/data/franchiseRoi.ts); inputs use the shared DecimalInput (12,5 = 12.5).
 */

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronDown, Info, MessageCircle } from 'lucide-react';
import { calcRoi, ROI_DEFAULTS, type RoiInput, type RoiVerdict } from '@/lib/data/franchiseRoi';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import { whatsappHref } from '@/lib/contact-channels';

const fmt = (n: number) => `${n.toLocaleString(AZ_NUMBER_LOCALE, { maximumFractionDigits: 0 })} ₼`;

const VERDICT_TONE: Record<RoiVerdict, string> = {
  good: 'bg-emerald-400/15 text-emerald-200 ring-emerald-300/30',
  mid: 'bg-amber-400/15 text-amber-100 ring-amber-300/30',
  bad: 'bg-[#D63B54]/20 text-rose-100 ring-rose-300/30',
  negative: 'bg-[#D63B54]/20 text-rose-100 ring-rose-300/30',
};

const EMPTY: RoiInput = { revenue: 0, marginPercent: 0, opex: 0, royaltyPercent: 0, adFundPercent: 0, entryFee: 0, setupCost: 0, workingCapital: 0 };

type Field = { key: keyof RoiInput; unit: string };
const OPERATING: Field[] = [
  { key: 'revenue', unit: '₼' },
  { key: 'marginPercent', unit: '%' },
  { key: 'opex', unit: '₼' },
  { key: 'royaltyPercent', unit: '%' },
  { key: 'adFundPercent', unit: '%' },
];
const INVESTMENT: Field[] = [
  { key: 'entryFee', unit: '₼' },
  { key: 'setupCost', unit: '₼' },
  { key: 'workingCapital', unit: '₼' },
];

export default function RoiCalculator() {
  const t = useTranslations('franchiseRoi');
  const [inputs, setInputs] = useState<RoiInput>({ ...ROI_DEFAULTS });
  const [explainOpen, setExplainOpen] = useState(false);
  const result = calcRoi(inputs);
  const set = (key: keyof RoiInput) => (value: number) => setInputs((prev) => ({ ...prev, [key]: value }));

  const card = 'rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6';
  const fieldRow = (f: Field) => (
    <label key={f.key} className="block" data-testid={`roi-${f.key}`}>
      <span className="flex items-center gap-1.5 text-[14px] font-bold text-[#0F172A]">{t(`fields.${f.key}.label`)}</span>
      <span className="mt-0.5 block text-[12.5px] leading-5 text-slate-500">{t(`fields.${f.key}.hint`)}</span>
      <span className="mt-2 flex items-stretch overflow-hidden rounded-xl border border-[#E4DCCD] bg-white focus-within:border-[#D63B54] focus-within:ring-2 focus-within:ring-[#D63B54]/15">
        <DecimalInput
          value={inputs[f.key]}
          onValueChange={set(f.key)}
          className="w-full min-w-0 border-0 bg-transparent px-3.5 py-3 text-[15px] font-semibold text-[#0F172A] outline-none"
        />
        <span className="grid min-w-12 place-items-center border-l border-[#EFE9DE] bg-[#F6F1E9] px-3 text-[13px] font-bold text-slate-600">{f.unit}</span>
      </span>
    </label>
  );

  const payback = result.paybackMonths < Infinity ? `${Math.round(result.paybackMonths)} ${t('months')}` : t('noProfit');
  const lines: Array<[string, string, boolean?]> = [
    [t('results.grossProfit'), fmt(result.grossProfit)],
    [t('results.royaltyAdFund'), `− ${fmt(result.royaltyAdFund)}`],
    [t('results.opex'), `− ${fmt(inputs.opex)}`],
    [t('results.netProfit'), fmt(result.netProfit), true],
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-start">
        <div className="space-y-5" data-testid="tool-inputs">
          <ToolResetControls
            snapshot={() => inputs}
            restore={setInputs}
            onClear={() => setInputs({ ...EMPTY })}
            onLoadExample={() => setInputs({ ...ROI_DEFAULTS })}
          />
          <section className={card}>
            <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#BE2F47]">{t('sectionOperating')}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">{OPERATING.map(fieldRow)}</div>
          </section>
          <section className={card}>
            <h2 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#BE2F47]">{t('sectionInvestment')}</h2>
            <div className="mt-4 grid gap-5 sm:grid-cols-2">{INVESTMENT.map(fieldRow)}</div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-[#F6F1E9] px-4 py-3 text-[14px] font-bold text-[#0F172A]">
              <span>{t('totalInvestment')}</span>
              <span className="tabular-nums">{fmt(result.investment)}</span>
            </div>
          </section>
        </div>

        {/* Result — ink panel, sticky on desktop; the next step lives here, where the number lands. */}
        <aside className="rounded-[26px] bg-[#0F172A] p-6 text-white shadow-[0_24px_60px_-28px_rgba(15,23,42,0.6)] sm:p-7 lg:sticky lg:top-24" data-testid="tool-result-sheet" aria-live="polite">
          <p className="text-[12px] font-black uppercase tracking-[0.16em] text-slate-400">{t('roiLabel')}</p>
          <p className="mt-2 text-[56px] font-black leading-none tracking-[-0.04em] tabular-nums" data-testid="roi-value">
            {result.roi > 0 ? '+' : ''}
            {result.roi.toFixed(1)}%
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white/[0.06] p-3.5">
              <p className="text-[12px] font-semibold text-slate-400">{t('results.payback')}</p>
              <p className="mt-1 text-[20px] font-black tabular-nums">{payback}</p>
            </div>
            <div className="rounded-2xl bg-white/[0.06] p-3.5">
              <p className="text-[12px] font-semibold text-slate-400">{t('totalInvestment')}</p>
              <p className="mt-1 text-[20px] font-black tabular-nums">{fmt(result.investment)}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-2.5 text-[14px]">
            {lines.map(([label, value, strong]) => (
              <div key={label} className={`flex justify-between gap-4 ${strong ? 'border-t border-white/15 pt-3 text-[16px] font-black' : 'text-slate-300'}`}>
                <dt>{label}</dt>
                <dd className="tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <p className={`mt-5 rounded-2xl p-4 text-[14px] font-semibold leading-6 ring-1 ${VERDICT_TONE[result.verdict]}`} data-testid="roi-verdict">
            {t(`verdict.${result.verdict}`)}
          </p>
          <div className="mt-5 border-t border-white/10 pt-5">
            <p className="text-[15px] font-black">{t('cta.title')}</p>
            <p className="mt-1 text-[13.5px] leading-6 text-slate-300">{t('cta.body')}</p>
            <a
              href={whatsappHref(t('cta.wa', { roi: result.roi.toFixed(1), payback, investment: fmt(result.investment) }))}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-dk-red-strong px-5 text-[14px] font-bold text-white transition-colors hover:bg-dk-red-deep"
            >
              <MessageCircle size={16} aria-hidden="true" />
              {t('cta.button')}
            </a>
          </div>
        </aside>
      </div>

      <div className="rounded-[22px] border border-[#E4DCCD] bg-white">
        <button
          type="button"
          onClick={() => setExplainOpen((open) => !open)}
          aria-expanded={explainOpen}
          className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left text-[15px] font-bold text-[#0F172A] sm:px-6"
        >
          <span className="flex items-center gap-2">
            <Info size={17} className="text-[#BE2F47]" aria-hidden="true" />
            {t('explain.toggle')}
          </span>
          <ChevronDown className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${explainOpen ? 'rotate-180' : ''}`} />
        </button>
        {explainOpen ? (
          <div className="grid gap-6 border-t border-[#EFE9DE] px-5 pb-6 pt-5 sm:px-6 md:grid-cols-2">
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#BE2F47]">{t('explain.paymentTypesTitle')}</h3>
              <div className="mt-3 space-y-3 text-[14px] leading-6 text-slate-600">
                <p><strong className="text-[#0F172A]">{t('explain.entryFeeTitle')}</strong> {t('explain.entryFeeDesc')}</p>
                <p><strong className="text-[#0F172A]">{t('explain.royaltyTitle')}</strong> {t('explain.royaltyDesc')}</p>
                <p><strong className="text-[#0F172A]">{t('explain.adFundTitle')}</strong> {t('explain.adFundDesc')}</p>
              </div>
            </div>
            <div>
              <h3 className="text-[12px] font-black uppercase tracking-[0.16em] text-[#BE2F47]">{t('explain.franchiseTypesTitle')}</h3>
              <div className="mt-3 space-y-3 text-[14px] leading-6 text-slate-600">
                <p><strong className="text-[#0F172A]">{t('explain.singleUnit')}</strong> {t('explain.singleUnitDesc')}</p>
                <p><strong className="text-[#0F172A]">{t('explain.area')}</strong> {t('explain.areaDesc')}</p>
                <p><strong className="text-[#0F172A]">{t('explain.master')}</strong> {t('explain.masterDesc')}</p>
                <p><strong className="text-[#0F172A]">{t('explain.sub')}</strong> {t('explain.subDesc')}</p>
              </div>
              <div className="mt-4 rounded-2xl bg-[#F6F1E9] p-4 text-[14px] leading-6">
                <p className="font-bold text-[#0F172A]">{t('explain.warning')}</p>
                <p className="mt-2 text-slate-600">{t('explain.tip')}</p>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
