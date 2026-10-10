'use client';

import { useMemo, useState, type FormEvent, type ReactNode } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AlertTriangle, CalendarDays, TrendingUp } from 'lucide-react';
import {
  calculateSeasonAnalysis,
  RESTAURANT_SEASON_TYPES,
  type MonthProjection,
  type RestaurantSeasonType,
} from '@/lib/marketing-tools/sezon-analitikasi';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { ToolHeader } from '@/components/marketinq-ocagi/MarketinqV2';

type ValidationErrors = {
  monthlyRevenue?: string;
  laborPercent?: string;
  foodCostPercent?: string;
};

function parseNumber(value: string): number {
  return Number.parseFloat(value.replace(',', '.'));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function getIntlLocale(locale: string): string {
  if (locale === 'az') return AZ_NUMBER_LOCALE;
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

export default function SezonAnalitikasiPage({ backHref = '/b2b-panel/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.sezonAnalitikasi');
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);

  const [monthlyRevenue, setMonthlyRevenue] = useState('25000');
  const [restaurantType, setRestaurantType] = useState<RestaurantSeasonType>('city');
  const [laborPercent, setLaborPercent] = useState('28');
  const [foodCostPercent, setFoodCostPercent] = useState('32');
  const [submitted, setSubmitted] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const normalizedInput = useMemo(() => ({
    monthlyRevenue: Math.max(0, parseNumber(monthlyRevenue) || 0),
    restaurantType,
    laborPercent: clamp(parseNumber(laborPercent) || 28, 15, 45),
    foodCostPercent: clamp(parseNumber(foodCostPercent) || 32, 20, 45),
  }), [foodCostPercent, laborPercent, monthlyRevenue, restaurantType]);

  const analysis = useMemo(
    () => calculateSeasonAnalysis(normalizedInput),
    [normalizedInput],
  );

  const maxRevenue = Math.max(...analysis.months.map((month) => month.projectedRevenue));
  const points = analysis.months.map((month, index) => {
    const x = 28 + index * 58;
    const y = 162 - (month.projectedRevenue / maxRevenue) * 122;
    return `${x},${y}`;
  }).join(' ');

  function formatMoney(value: number): string {
    return `${new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 0 }).format(value)} AZN`;
  }

  function formatPercent(value: number): string {
    return new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 }).format(value);
  }

  function monthName(month: MonthProjection): string {
    return t(`months.${month.month}`);
  }

  function validate(): ValidationErrors {
    const nextErrors: ValidationErrors = {};
    const revenue = parseNumber(monthlyRevenue);
    const labor = parseNumber(laborPercent);
    const food = parseNumber(foodCostPercent);

    if (!Number.isFinite(revenue) || revenue <= 0) nextErrors.monthlyRevenue = t('inputs.monthlyRevenue.validation');
    if (!Number.isFinite(labor) || labor < 15 || labor > 45) nextErrors.laborPercent = t('inputs.laborPercent.validation');
    if (!Number.isFinite(food) || food < 20 || food > 45) nextErrors.foodCostPercent = t('inputs.foodCostPercent.validation');

    return nextErrors;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-[#E4DCCD] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';
  const labelClass = 'mb-1.5 block text-sm font-bold text-[#0F172A]';

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-12 sm:px-6">
      <ToolHeader slug="sezon-analitikasi" title={t('title')} subtitle={t('subtitle')} backHref={backHref} />

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <form onSubmit={submitForm} className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-lg font-extrabold text-[#0F172A]">{t('inputs.title')}</h2>
          <div className="space-y-4">
            <label>
              <span className={labelClass}>{t('inputs.monthlyRevenue.label')}</span>
              <input
                value={monthlyRevenue}
                onChange={(event) => setMonthlyRevenue(event.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder={t('inputs.monthlyRevenue.placeholder')}
              />
              {errors.monthlyRevenue && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.monthlyRevenue}</span>}
            </label>

            <label>
              <span className={labelClass}>{t('inputs.restaurantType.label')}</span>
              <select
                value={restaurantType}
                onChange={(event) => setRestaurantType(event.target.value as RestaurantSeasonType)}
                className={inputClass}
              >
                {RESTAURANT_SEASON_TYPES.map((type) => (
                  <option key={type} value={type}>{t(`restaurantTypes.${type}`)}</option>
                ))}
              </select>
            </label>

            <label>
              <span className={labelClass}>{t('inputs.laborPercent.label')}</span>
              <input
                value={laborPercent}
                onChange={(event) => setLaborPercent(event.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder={t('inputs.laborPercent.placeholder')}
              />
              {errors.laborPercent && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.laborPercent}</span>}
            </label>

            <label>
              <span className={labelClass}>{t('inputs.foodCostPercent.label')}</span>
              <input
                value={foodCostPercent}
                onChange={(event) => setFoodCostPercent(event.target.value)}
                inputMode="decimal"
                className={inputClass}
                placeholder={t('inputs.foodCostPercent.placeholder')}
              />
              {errors.foodCostPercent && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.foodCostPercent}</span>}
            </label>

            <button type="submit" className="inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-dk-red-strong px-4 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90">
              {t('cta')}
            </button>
          </div>
        </form>

        <section className="space-y-5">
          {submitted && (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label={t('results.annualRevenue')} value={formatMoney(analysis.annualRevenue)} />
                <MetricCard label={t('results.annualLabor')} value={formatMoney(analysis.annualLaborBudget)} />
                <MetricCard label={t('results.annualInventory')} value={formatMoney(analysis.annualInventoryBudget)} />
              </div>

              <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-[#0F172A]">{t('results.chartTitle')}</h2>
                    <p className="text-xs font-semibold text-slate-500">{t('results.avgCoefficient')}: {formatPercent(analysis.averageCoefficient)}</p>
                  </div>
                  <CalendarDays className="text-[#BE2F47]" size={22} />
                </div>

                <div data-testid="season-chart" className="overflow-x-auto">
                  <svg viewBox="0 0 700 220" role="img" aria-label={t('results.chartTitle')} className="min-w-[640px]">
                    <line x1="20" y1="168" x2="690" y2="168" stroke="#E5E7EB" />
                    <polyline points={points} fill="none" stroke="#E94560" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    {analysis.months.map((month, index) => {
                      const x = 28 + index * 58;
                      const barHeight = (month.projectedRevenue / maxRevenue) * 122;
                      const y = 168 - barHeight;
                      return (
                        <g key={month.month}>
                          <rect x={x - 16} y={y} width="32" height={barHeight} rx="5" fill={month.isDeadMonth ? '#E94560' : '#C5A022'} opacity="0.28" />
                          <circle cx={x} cy={162 - (month.projectedRevenue / maxRevenue) * 122} r="4" fill={month.isDeadMonth ? '#E94560' : '#C5A022'} />
                          <text x={x} y="190" textAnchor="middle" className="fill-slate-600 text-[11px] font-bold">{monthName(month)}</text>
                          <text x={x} y="207" textAnchor="middle" className="fill-slate-400 text-[10px]">{formatPercent(month.coefficient)}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <RiskPanel
                  icon={<AlertTriangle size={18} />}
                  title={t('riskCard.weak')}
                  months={analysis.weakestMonths}
                  monthName={monthName}
                  formatMoney={formatMoney}
                  accent="red"
                  warningText={t('deadMonthWarning')}
                />
                <RiskPanel
                  icon={<TrendingUp size={18} />}
                  title={t('riskCard.strong')}
                  months={analysis.strongestMonths}
                  monthName={monthName}
                  formatMoney={formatMoney}
                  accent="gold"
                />
              </div>

              {analysis.months.some((month) => month.isRamadanWindow) && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold leading-6 text-amber-800">
                  {t('ramadanNote')}
                </div>
              )}

              <div className="overflow-hidden rounded-2xl border border-[#E4DCCD] bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="min-w-[760px] w-full text-left text-sm">
                    <thead className="bg-[#FBF8F3] text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-4 py-3">{t('table.month')}</th>
                        <th className="px-4 py-3">{t('table.coefficient')}</th>
                        <th className="px-4 py-3">{t('table.projectedRevenue')}</th>
                        <th className="px-4 py-3">{t('table.laborBudget')}</th>
                        <th className="px-4 py-3">{t('table.inventoryBudget')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {analysis.months.map((month) => (
                        <tr key={month.month} className={month.isDeadMonth ? 'bg-red-50/45' : ''}>
                          <td className="px-4 py-3 font-bold text-[#0F172A]">{monthName(month)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatPercent(month.coefficient)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMoney(month.projectedRevenue)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMoney(month.laborBudget)}</td>
                          <td className="px-4 py-3 text-slate-700">{formatMoney(month.inventoryBudget)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="rounded-xl border border-[#F4B8C3] bg-[#F6F1E9] p-4 text-sm font-semibold leading-6 text-[#0F172A]">
                {t('ahilikQuote')}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[#0F172A]">{value}</p>
    </div>
  );
}

function RiskPanel({
  icon,
  title,
  months,
  monthName,
  formatMoney,
  accent,
  warningText,
}: {
  icon: ReactNode;
  title: string;
  months: MonthProjection[];
  monthName: (month: MonthProjection) => string;
  formatMoney: (value: number) => string;
  accent: 'red' | 'gold';
  warningText?: string;
}) {
  const color = accent === 'red' ? 'text-[var(--dk-red)] bg-red-50 border-red-100' : 'text-[#8A6F08] bg-amber-50 border-amber-100';

  return (
    <div className="rounded-2xl border border-[#E4DCCD] bg-white p-4 shadow-sm">
      <h3 className="mb-3 flex items-center gap-2 text-sm font-extrabold text-[#0F172A]">
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg border ${color}`}>{icon}</span>
        {title}
      </h3>
      <div className="space-y-2">
        {months.map((month) => (
          <div key={month.month} className="flex items-center justify-between gap-3 rounded-lg bg-[#FBF8F3] px-3 py-2">
            <div>
              <p className="text-sm font-bold text-[#0F172A]">{monthName(month)}</p>
              {month.isDeadMonth && warningText && <p className="mt-0.5 text-xs font-semibold text-[var(--dk-red)]">{warningText}</p>}
            </div>
            <div className="text-right">
              <p className="text-sm font-extrabold text-slate-800">{month.coefficient.toFixed(2)}x</p>
              <p className="text-xs text-slate-500">{formatMoney(month.projectedRevenue)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
