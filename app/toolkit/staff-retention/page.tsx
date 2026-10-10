'use client';

/**
 * İşçi saxlama kalkulyatoru — TASK-0531 (owner 10.10: «ben elimdeki ile yetinmem», Over Easy Office turnover
 * cost calculator as reference). Before: one rule of thumb (replacement = 2–3 monthly salaries). Now the cost
 * of ONE leaver is itemised like the best turnover calculators, with their weak spots fixed:
 *   vacancy   = days the post stays empty × extra paid to others per day (overtime / cover), not «salary saved»
 *   hiring    = manager hours × hourly cost + job ad
 *   training  = training days × value of the trainer's lost time per day (not a fixed 8-hour day)
 *   ramp-up   = days to full speed × GROSS PROFIT lost per day (not revenue — revenue overstates the loss)
 *   mistakes  = one-off waste / wrong orders / complaints while learning
 * Annual loss = leavers per year × cost of one leaver. The 2–3 salary rule stays as a comparison line.
 * Every default is an example (owner rule: no number is shown as a market fact).
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useTranslations, useLocale } from 'next-intl';
import { ArrowRight, BookOpen, Lightbulb, MessageCircle, Users } from 'lucide-react';
import ToolkitStudioLayout, { type AIInsightState } from '@/components/toolkit/ToolkitStudioLayout';
import { getToolkitInsight } from '@/app/actions/toolkit-insight';
import { formatNumber } from '@/lib/i18n/format';
import DecimalInput from '@/components/toolkit/DecimalInput';
import ToolResetControls from '@/components/toolkit/ToolResetControls';
import { whatsappHref } from '@/lib/contact-channels';

/** Example values — «Nümunəni yüklə». */
const EXAMPLE = {
  employeeCount: 18,
  averageSalary: 850,
  yearlyLeavers: 12,
  vacantDays: 14,
  coverPerDay: 20,
  hiringHours: 8,
  managerHourly: 10,
  adCost: 30,
  trainingDays: 5,
  trainerDaily: 25,
  rampDays: 30,
  marginPerDay: 15,
  mistakes: 50,
};
type State = typeof EXAMPLE;
const EMPTY: State = Object.fromEntries(Object.keys(EXAMPLE).map((k) => [k, 0])) as State;

const INT_FIELDS = new Set<keyof State>(['employeeCount', 'yearlyLeavers', 'vacantDays', 'trainingDays', 'rampDays']);

function formatCurrency(value: number, locale: string) {
  return `${formatNumber(Math.round(value), locale)} ₼`;
}

export default function StaffRetentionPage() {
  const t = useTranslations('toolkit.staffRetention');
  const locale = useLocale() as 'az' | 'ru' | 'en' | 'tr';
  const [aiInsight, setAiInsight] = useState<AIInsightState>({ status: 'idle' });
  const [v, setV] = useState<State>(EXAMPLE);
  const set = (key: keyof State) => (value: number) =>
    setV((prev) => ({ ...prev, [key]: Math.max(0, INT_FIELDS.has(key) ? Math.round(value) : value) }));

  const topReasons = [t('reason1'), t('reason2'), t('reason3'), t('reason4'), t('reason5')];
  const strategies = [t('strategy1'), t('strategy2'), t('strategy3'), t('strategy4'), t('strategy5'), t('strategy6'), t('strategy7')];
  const blogLinks = [
    { title: t('blogLink1Title'), href: '/blog/isci-saxlama-7-strategiya', tag: t('blogLink1Tag') },
    { title: t('blogLink2Title'), href: '/toolkit/pnl', tag: t('blogLink2Tag') },
    { title: t('blogLink3Title'), href: '/kazan-ai', tag: t('blogLink3Tag') },
  ];

  const stats = useMemo(() => {
    const turnoverRate = v.employeeCount > 0 ? (v.yearlyLeavers / v.employeeCount) * 100 : null;
    const parts = [
      { key: 'vacancy', value: v.vacantDays * v.coverPerDay },
      { key: 'hiring', value: v.hiringHours * v.managerHourly + v.adCost },
      { key: 'training', value: v.trainingDays * v.trainerDaily },
      { key: 'ramp', value: v.rampDays * v.marginPerDay },
      { key: 'mistakes', value: v.mistakes },
    ] as const;
    const perLeaver = parts.reduce((sum, p) => sum + p.value, 0);
    return {
      turnoverRate,
      parts,
      perLeaver,
      annualLoss: perLeaver * v.yearlyLeavers,
      ruleLow: v.averageSalary * 2,
      ruleHigh: v.averageSalary * 3,
    };
  }, [v]);

  const turnoverText =
    stats.turnoverRate === null
      ? '—'
      : `${formatNumber(stats.turnoverRate, locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%`;

  const inputCls =
    'w-full rounded-xl border border-[#E4DCCD] bg-white px-3.5 py-3 text-[15px] font-semibold text-[#0F172A] outline-none transition focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';
  const field = (key: keyof State, unit?: string) => (
    <label key={key} className="block" htmlFor={`sr-${key}`}>
      <span className="block text-[13.5px] font-bold text-[#0F172A]">
        {t(`fields.${key}`)}
        {unit ? <span className="ml-1 font-semibold text-slate-500">({unit})</span> : null}
      </span>
      <DecimalInput
        id={`sr-${key}`}
        inputMode={INT_FIELDS.has(key) ? 'numeric' : 'decimal'}
        value={v[key]}
        onValueChange={set(key)}
        className={`mt-1.5 ${inputCls}`}
      />
    </label>
  );
  const group = (title: string, formula: string, children: React.ReactNode) => (
    <div className="rounded-2xl border border-[#EFE9DE] bg-[#FBF8F3] p-4">
      <p className="text-[14px] font-black text-[#0F172A]">{title}</p>
      <p className="mt-0.5 text-[12.5px] text-slate-500">{formula}</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );

  const inputSection = (
    <div className="space-y-6">
      <ToolResetControls snapshot={() => v} restore={setV} onClear={() => setV({ ...EMPTY })} onLoadExample={() => setV({ ...EXAMPLE })} />
      <div>
        <h2 className="text-[17px] font-black text-[#0F172A]">{t('calculatorTitle')}</h2>
        <p className="mt-1 text-[14px] text-slate-600">{t('calculatorSubtitle')}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {field('employeeCount')}
        {field('averageSalary', '₼')}
        {field('yearlyLeavers')}
      </div>

      <div className="space-y-3 border-t border-[#EFE9DE] pt-5">
        <div>
          <h3 className="text-[15px] font-black text-[#0F172A]">{t('breakdownTitle')}</h3>
          <p className="mt-1 text-[13.5px] leading-6 text-slate-600">{t('breakdownSubtitle')}</p>
        </div>
        {group(t('parts.vacancy'), t('formulas.vacancy'), <>{field('vacantDays')}{field('coverPerDay', '₼')}</>)}
        {group(t('parts.hiring'), t('formulas.hiring'), <>{field('hiringHours')}{field('managerHourly', '₼')}{field('adCost', '₼')}</>)}
        {group(t('parts.training'), t('formulas.training'), <>{field('trainingDays')}{field('trainerDaily', '₼')}</>)}
        {group(t('parts.ramp'), t('formulas.ramp'), <>{field('rampDays')}{field('marginPerDay', '₼')}</>)}
        {group(t('parts.mistakes'), t('formulas.mistakes'), <>{field('mistakes', '₼')}</>)}
      </div>

      <div className="space-y-3 border-t border-[#EFE9DE] pt-5">
        <h3 className="text-[15px] font-black text-[#0F172A]">{t('actionPlanTitle')}</h3>
        {strategies.map((item, index) => (
          <div key={index} className="rounded-2xl border border-[#EFE9DE] bg-white p-4">
            <div className="mb-1 text-[11.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">{t('stepPrefix')} {index + 1}</div>
            <p className="text-[14px] leading-6 text-slate-600">{item}</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#EFE9DE] pt-5">
        <div className="mb-2 flex items-center gap-2">
          <Users size={18} className="text-[#BE2F47]" aria-hidden="true" />
          <h3 className="text-[15px] font-black text-[#0F172A]">{t('preShiftTitle')}</h3>
        </div>
        <p className="text-[14px] leading-7 text-slate-600">{t('preShiftBody')}</p>
      </div>
    </div>
  );

  const max = Math.max(1, ...stats.parts.map((p) => p.value));
  const resultSection = (
    <div className="space-y-4">
      <div className="rounded-2xl bg-[#0F172A] p-5 text-white">
        <p className="text-[11.5px] font-black uppercase tracking-[0.16em] text-slate-400">{t('statAnnualLoss')}</p>
        <p className="mt-1 text-[38px] font-black leading-none tracking-[-0.03em] tabular-nums" data-testid="sr-annual">{formatCurrency(stats.annualLoss, locale)}</p>
        <p className="mt-2 text-[13px] text-slate-300">
          {t('annualFormula', { leavers: v.yearlyLeavers, per: formatCurrency(stats.perLeaver, locale) })}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-[12px] text-slate-400">{t('statReplacementCost')}</p>
            <p className="mt-0.5 text-[19px] font-black tabular-nums" data-testid="sr-per-leaver">{formatCurrency(stats.perLeaver, locale)}</p>
          </div>
          <div className="rounded-xl bg-white/[0.06] p-3">
            <p className="text-[12px] text-slate-400">{t('statTurnoverRate')}</p>
            <p className="mt-0.5 text-[19px] font-black tabular-nums" data-testid="sr-turnover">{turnoverText}</p>
          </div>
        </div>
        <ul className="mt-4 space-y-2.5">
          {stats.parts.map((p) => (
            <li key={p.key}>
              <div className="flex justify-between gap-3 text-[13px]">
                <span className="text-slate-300">{t(`parts.${p.key}`)}</span>
                <span className="font-bold tabular-nums">{formatCurrency(p.value, locale)}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#F28A9B]" style={{ width: `${(p.value / max) * 100}%` }} />
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-white/10 pt-3 text-[12.5px] leading-5 text-slate-400">
          {t('ruleCompare', { low: formatCurrency(stats.ruleLow, locale), high: formatCurrency(stats.ruleHigh, locale) })}
        </p>
        {/* The next step sits where the number lands (turnover-calculator pattern). */}
        <div className="mt-4 border-t border-white/10 pt-4">
          <p className="text-[14.5px] font-black">{t('cta.title')}</p>
          <p className="mt-1 text-[13px] leading-5 text-slate-300">{t('cta.body')}</p>
          <a
            href={whatsappHref(t('cta.wa', { annual: formatCurrency(stats.annualLoss, locale), leavers: v.yearlyLeavers, staff: v.employeeCount }))}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-full bg-dk-red-strong px-4 text-[13.5px] font-bold text-white transition-colors hover:bg-dk-red-deep"
          >
            <MessageCircle size={15} aria-hidden="true" />
            {t('cta.button')}
          </a>
        </div>
      </div>
      <p className="text-[13px] leading-6 text-slate-600">{v.employeeCount > 0 ? t('turnoverRateBenchmark') : t('errNoEmployees')}</p>

      <div className="border-t border-[#EFE9DE] pt-4">
        <p className="text-[11.5px] font-black uppercase tracking-[0.14em] text-[#BE2F47]">{t('knowledgePanelBadge')}</p>
        <h3 className="mt-1 text-[15px] font-black text-[#0F172A]">{t('top5Title')}</h3>
        <div className="mt-3 space-y-2">
          {topReasons.map((reason, index) => (
            <div key={index} className="rounded-xl bg-[#F6F1E9] px-3 py-2.5 text-[13.5px] text-slate-700">{reason}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const bottomSection = (
    <div className="grid gap-5 md:grid-cols-2">
      <div className="rounded-[22px] bg-[#0F172A] p-6 text-white">
        <div className="mb-3 flex items-center gap-2 text-[#F28A9B]">
          <Lightbulb size={16} aria-hidden="true" />
          <span className="text-[12px] font-black uppercase tracking-[0.14em]">{t('dkAdviceLabel')}</span>
        </div>
        <p className="text-[14px] leading-7 text-slate-300">{t('dkAdviceBody')}</p>
      </div>
      <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6">
        <div className="mb-3 flex items-center gap-2 text-[#0F172A]">
          <BookOpen size={16} aria-hidden="true" />
          <h3 className="text-[15px] font-black">{t('usefulLinksTitle')}</h3>
        </div>
        <div className="space-y-3">
          {blogLinks.map((item) => (
            <Link key={item.href} href={item.href}
              className="group flex items-center justify-between rounded-xl border border-[#E4DCCD] px-4 py-3 transition-colors hover:border-[#0F172A]">
              <div>
                <div className="text-[11.5px] font-bold uppercase tracking-[0.12em] text-slate-500">{item.tag}</div>
                <div className="text-[14px] font-semibold text-[#0F172A]">{item.title}</div>
              </div>
              <ArrowRight size={16} className="text-slate-500 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
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
      resultSummary={formatCurrency(stats.annualLoss, locale)}
      aiInsight={aiInsight}
      onRequestInsight={async () => {
        setAiInsight({ status: 'loading' });
        const res = await getToolkitInsight({
          toolId: 'staff-retention',
          locale,
          result: { turnoverRate: stats.turnoverRate ?? 0, replacementCost: stats.perLeaver, annualLoss: stats.annualLoss, employeeCount: v.employeeCount },
        });
        if (res.ok && res.insight) setAiInsight({ status: 'success', text: res.insight });
        else setAiInsight({ status: 'error' });
      }}
    />
  );
}
