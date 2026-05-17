'use client';

import { useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowLeft, BarChart3, Plus, Target, Trash2, TrendingUp } from 'lucide-react';
import {
  calculateReklamRoi,
  REKLAM_CHANNEL_TYPES,
  type ReklamCampaignType,
  type ReklamChannelInput,
  type ReklamChannelType,
  type ReklamHealthStatus,
} from '@/lib/marketing-tools/reklam-roi';

type TranslationFn = ReturnType<typeof useTranslations>;

type ChannelRow = {
  id: string;
  type: ReklamChannelType;
  budget: string;
  commissionPercent: string;
  newCustomers: string;
  reach: string;
  impressions: string;
};

type ValidationErrors = {
  channels?: string;
  averageOrderValue?: string;
  repeatPurchasePercent?: string;
  organicValuePerReach?: string;
};

function parseNumber(value: string): number {
  return Number.parseFloat(value.replace(',', '.'));
}

function getIntlLocale(locale: string): string {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function newChannel(index: number): ChannelRow {
  return {
    id: `channel-${Date.now()}-${index}`,
    type: REKLAM_CHANNEL_TYPES[index % REKLAM_CHANNEL_TYPES.length],
    budget: '',
    commissionPercent: '12',
    newCustomers: '',
    reach: '',
    impressions: '',
  };
}

const DEMO_CHANNELS: ChannelRow[] = [
  { id: 'demo-1', type: 'instagram_facebook', budget: '600', commissionPercent: '12', newCustomers: '18', reach: '18000', impressions: '42000' },
  { id: 'demo-2', type: 'influencer', budget: '450', commissionPercent: '12', newCustomers: '14', reach: '22000', impressions: '36000' },
  { id: 'demo-3', type: 'telegram', budget: '180', commissionPercent: '12', newCustomers: '7', reach: '6500', impressions: '9000' },
];

export default function ReklamRoiPage({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.reklamRoi');
  const locale = useLocale();
  const intlLocale = getIntlLocale(locale);

  const [campaignType, setCampaignType] = useState<ReklamCampaignType>('conversion');
  const [averageOrderValue, setAverageOrderValue] = useState('32');
  const [repeatPurchasePercent, setRepeatPurchasePercent] = useState('35');
  const [organicValuePerReach, setOrganicValuePerReach] = useState('0.03');
  const [channels, setChannels] = useState<ChannelRow[]>(DEMO_CHANNELS);
  const [submitted, setSubmitted] = useState(true);
  const [errors, setErrors] = useState<ValidationErrors>({});

  const input = useMemo(() => ({
    campaignType,
    averageOrderValue: Math.max(0, parseNumber(averageOrderValue) || 0),
    repeatPurchasePercent: Math.min(95, Math.max(0, parseNumber(repeatPurchasePercent) || 0)),
    organicValuePerReach: Math.max(0, parseNumber(organicValuePerReach) || 0),
    channels: channels.map((channel): ReklamChannelInput => ({
      id: channel.id,
      type: channel.type,
      budget: Math.max(0, parseNumber(channel.budget) || 0),
      commissionPercent: Math.max(0, parseNumber(channel.commissionPercent) || 0),
      newCustomers: Math.max(0, Math.floor(parseNumber(channel.newCustomers) || 0)),
      reach: Math.max(0, Math.floor(parseNumber(channel.reach) || 0)),
      impressions: Math.max(0, Math.floor(parseNumber(channel.impressions) || 0)),
    })),
  }), [averageOrderValue, campaignType, channels, organicValuePerReach, repeatPurchasePercent]);

  const analysis = useMemo(() => calculateReklamRoi(input), [input]);

  function formatMoney(value: number): string {
    return `${new Intl.NumberFormat(intlLocale, { maximumFractionDigits: 2 }).format(value)} ${t('currency')}`;
  }

  function formatNumber(value: number, digits = 1): string {
    return new Intl.NumberFormat(intlLocale, { maximumFractionDigits: digits }).format(value);
  }

  function channelName(type: ReklamChannelType): string {
    return t(`channels.${type}`);
  }

  function statusClass(status: ReklamHealthStatus): string {
    if (status === 'healthy') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
    if (status === 'weak') return 'border-amber-200 bg-amber-50 text-amber-700';
    if (status === 'harmful') return 'border-red-200 bg-red-50 text-red-700';
    return 'border-slate-200 bg-slate-50 text-slate-600';
  }

  function validate(): ValidationErrors {
    const nextErrors: ValidationErrors = {};
    const hasBudget = channels.some((channel) => (parseNumber(channel.budget) || 0) > 0);
    if (!hasBudget) nextErrors.channels = t('inputs.validation.channelBudget');

    if (campaignType === 'conversion') {
      const aov = parseNumber(averageOrderValue);
      const repeat = parseNumber(repeatPurchasePercent);
      if (!Number.isFinite(aov) || aov <= 0) nextErrors.averageOrderValue = t('inputs.averageOrderValue.validation');
      if (!Number.isFinite(repeat) || repeat < 0 || repeat > 95) nextErrors.repeatPurchasePercent = t('inputs.repeatPurchasePercent.validation');
    } else {
      const organicValue = parseNumber(organicValuePerReach);
      if (!Number.isFinite(organicValue) || organicValue < 0) nextErrors.organicValuePerReach = t('inputs.organicValuePerReach.validation');
    }

    return nextErrors;
  }

  function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitted(Object.keys(nextErrors).length === 0);
  }

  function updateChannel(id: string, field: keyof Omit<ChannelRow, 'id'>, value: string) {
    setChannels((prev) => prev.map((channel) => channel.id === id ? { ...channel, [field]: value } : channel));
  }

  function addChannel() {
    setChannels((prev) => prev.length >= 8 ? prev : [...prev, newChannel(prev.length)]);
  }

  function removeChannel(id: string) {
    setChannels((prev) => prev.length <= 1 ? prev : prev.filter((channel) => channel.id !== id));
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';
  const labelClass = 'mb-1.5 block text-sm font-bold text-[var(--dk-navy)]';

  const conversionRows = analysis.conversionChannels;
  const awarenessRows = analysis.awarenessChannels;
  const maxRoas = Math.max(1, ...conversionRows.map((channel) => channel.roas));
  const maxCpm = Math.max(1, ...awarenessRows.map((channel) => channel.cpm));

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold uppercase text-purple-700">
            {t('tier')}
          </div>
          <h1 className="font-serif text-3xl font-bold text-[var(--dk-navy)] sm:text-4xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
      </div>

      <form onSubmit={submitForm} className="grid gap-6 lg:grid-cols-[380px_1fr]">
        <section className="space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('campaignType.title')}</h2>
            <div className="grid gap-3">
              {(['conversion', 'awareness'] as ReklamCampaignType[]).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setCampaignType(type)}
                  className={`rounded-xl border p-3 text-left transition ${
                    campaignType === type
                      ? 'border-[var(--dk-gold)] bg-[#FFF8E7]'
                      : 'border-slate-200 bg-white hover:border-[var(--dk-gold)]'
                  }`}
                >
                  <span className="block text-sm font-extrabold text-[var(--dk-navy)]">{t(`campaignType.${type}`)}</span>
                  <span className="mt-1 block text-xs leading-5 text-slate-600">{t(`campaignType.${type}Description`)}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('inputs.channelsTitle')}</h2>
              <button
                type="button"
                onClick={addChannel}
                disabled={channels.length >= 8}
                className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-bold text-slate-600 transition hover:border-[var(--dk-gold)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus size={16} />
                {t('inputs.addChannel')}
              </button>
            </div>
            {errors.channels && <p className="mb-3 rounded-lg bg-red-50 p-2 text-xs font-semibold text-[var(--dk-red)]">{errors.channels}</p>}

            <div className="space-y-4">
              {channels.map((channel, index) => (
                <div key={channel.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-[var(--dk-navy)]">{t('inputs.channelNumber', { number: index + 1 })}</p>
                    <button
                      type="button"
                      onClick={() => removeChannel(channel.id)}
                      disabled={channels.length <= 1}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                      {t('inputs.removeChannel')}
                    </button>
                  </div>

                  <div className="grid gap-3">
                    <label>
                      <span className={labelClass}>{t('inputs.channelType.label')}</span>
                      <select value={channel.type} onChange={(event) => updateChannel(channel.id, 'type', event.target.value as ReklamChannelType)} className={inputClass}>
                        {REKLAM_CHANNEL_TYPES.map((type) => (
                          <option key={type} value={type}>{channelName(type)}</option>
                        ))}
                      </select>
                    </label>
                    <label>
                      <span className={labelClass}>{t('inputs.budget.label')}</span>
                      <input value={channel.budget} onChange={(event) => updateChannel(channel.id, 'budget', event.target.value)} inputMode="decimal" className={inputClass} placeholder={t('inputs.budget.placeholder')} />
                    </label>
                    {channel.type === 'influencer' && (
                      <label>
                        <span className={labelClass}>{t('inputs.commissionPercent.label')}</span>
                        <input value={channel.commissionPercent} onChange={(event) => updateChannel(channel.id, 'commissionPercent', event.target.value)} inputMode="decimal" className={inputClass} placeholder={t('inputs.commissionPercent.placeholder')} />
                      </label>
                    )}
                    {campaignType === 'conversion' ? (
                      <label>
                        <span className={labelClass}>{t('inputs.newCustomers.label')}</span>
                        <input value={channel.newCustomers} onChange={(event) => updateChannel(channel.id, 'newCustomers', event.target.value)} inputMode="numeric" className={inputClass} placeholder={t('inputs.newCustomers.placeholder')} />
                      </label>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        <label>
                          <span className={labelClass}>{t('inputs.reach.label')}</span>
                          <input value={channel.reach} onChange={(event) => updateChannel(channel.id, 'reach', event.target.value)} inputMode="numeric" className={inputClass} placeholder={t('inputs.reach.placeholder')} />
                        </label>
                        <label>
                          <span className={labelClass}>{t('inputs.impressions.label')}</span>
                          <input value={channel.impressions} onChange={(event) => updateChannel(channel.id, 'impressions', event.target.value)} inputMode="numeric" className={inputClass} placeholder={t('inputs.impressions.placeholder')} />
                        </label>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('inputs.resultsTitle')}</h2>
            {campaignType === 'conversion' ? (
              <div className="space-y-4">
                <label>
                  <span className={labelClass}>{t('inputs.averageOrderValue.label')}</span>
                  <input value={averageOrderValue} onChange={(event) => setAverageOrderValue(event.target.value)} inputMode="decimal" className={inputClass} placeholder={t('inputs.averageOrderValue.placeholder')} />
                  {errors.averageOrderValue && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.averageOrderValue}</span>}
                </label>
                <label>
                  <span className={labelClass}>{t('inputs.repeatPurchasePercent.label')}</span>
                  <input value={repeatPurchasePercent} onChange={(event) => setRepeatPurchasePercent(event.target.value)} inputMode="decimal" className={inputClass} placeholder={t('inputs.repeatPurchasePercent.placeholder')} />
                  {errors.repeatPurchasePercent && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.repeatPurchasePercent}</span>}
                </label>
              </div>
            ) : (
              <label>
                <span className={labelClass}>{t('inputs.organicValuePerReach.label')}</span>
                <input value={organicValuePerReach} onChange={(event) => setOrganicValuePerReach(event.target.value)} inputMode="decimal" className={inputClass} placeholder={t('inputs.organicValuePerReach.placeholder')} />
                {errors.organicValuePerReach && <span className="mt-1 block text-xs font-semibold text-[var(--dk-red)]">{errors.organicValuePerReach}</span>}
              </label>
            )}
            <button type="submit" className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-[var(--dk-red)] px-4 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90">
              {t('cta')}
            </button>
          </div>
        </section>

        <section className="space-y-5">
          {submitted && campaignType === 'conversion' && (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MetricCard label={t('results.totalRoas')} value={`${formatNumber(analysis.totalRoas)}x`} />
                <MetricCard label={t('results.totalCac')} value={formatMoney(analysis.totalCac)} />
                <MetricCard label={t('results.roiPercent')} value={`${formatNumber(analysis.totalRoiPercent)}%`} />
                <MetricCard label={t('results.totalRevenue')} value={formatMoney(analysis.totalRevenue)} />
              </div>

              <div className={`rounded-xl border p-4 shadow-sm sm:p-5 ${statusClass(analysis.ltvCacStatus)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase">{t('ltvCacCard.title')}</p>
                    <h2 className="mt-2 text-2xl font-extrabold text-[var(--dk-navy)]">{formatNumber(analysis.ltvCacRatio)}:1</h2>
                    <p className="mt-1 text-sm font-semibold">{t(`ltvCacCard.${analysis.ltvCacStatus}`)}</p>
                  </div>
                  <Target size={24} />
                </div>
                <p className="mt-3 text-xs leading-5 opacity-90">{t('results.ltvFormulaNote')}</p>
              </div>

              <ResultHighlights
                best={analysis.bestConversionChannel ? channelName(analysis.bestConversionChannel.type) : '-'}
                worst={analysis.worstConversionChannel ? channelName(analysis.worstConversionChannel.type) : '-'}
                bestLabel={t('results.bestChannel')}
                worstLabel={t('results.worstChannel')}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <BarChart3 size={18} className="text-[var(--dk-gold)]" />
                  <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('results.chartTitle')}</h2>
                </div>
                <div data-testid="reklam-roi-chart" className="overflow-x-auto">
                  <svg viewBox="0 0 640 220" role="img" aria-label={t('results.chartTitle')} className="min-w-[620px]">
                    <line x1="36" y1="174" x2="620" y2="174" stroke="#E5E7EB" />
                    {conversionRows.map((channel, index) => {
                      const x = 72 + index * 108;
                      const height = Math.max(4, (channel.roas / maxRoas) * 132);
                      const y = 174 - height;
                      const isBest = channel.id === analysis.bestConversionChannel?.id;
                      const isWorst = channel.id === analysis.worstConversionChannel?.id && conversionRows.length > 1;
                      return (
                        <g key={channel.id}>
                          <rect x={x - 24} y={y} width="48" height={height} rx="7" fill={isBest ? '#C5A022' : isWorst ? '#E94560' : '#1A1A2E'} opacity={isWorst ? 0.75 : 0.9} />
                          <text x={x} y={y - 8} textAnchor="middle" className="fill-slate-600 text-[11px] font-bold">{formatNumber(channel.roas)}x</text>
                          <text x={x} y="194" textAnchor="middle" className="fill-slate-600 text-[10px] font-bold">{channelName(channel.type)}</text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              <ConversionTable rows={conversionRows} channelName={channelName} formatMoney={formatMoney} formatNumber={formatNumber} t={t} />
            </>
          )}

          {submitted && campaignType === 'awareness' && (
            <>
              <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm font-semibold leading-6 text-blue-800">
                {t('awarenessInfo')}
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <MetricCard label={t('results.totalReach')} value={formatNumber(analysis.totalReach, 0)} />
                <MetricCard label={t('results.averageCpm')} value={formatMoney(analysis.averageCpm)} />
                <MetricCard label={t('results.totalEmv')} value={formatMoney(analysis.totalEmv)} />
              </div>

              <ResultHighlights
                best={analysis.bestAwarenessChannel ? channelName(analysis.bestAwarenessChannel.type) : '-'}
                worst={analysis.worstAwarenessChannel ? channelName(analysis.worstAwarenessChannel.type) : '-'}
                bestLabel={t('results.bestChannel')}
                worstLabel={t('results.worstChannel')}
              />

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-4 flex items-center gap-2">
                  <TrendingUp size={18} className="text-[var(--dk-gold)]" />
                  <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('results.cpmChartTitle')}</h2>
                </div>
                <div data-testid="reklam-roi-chart" className="space-y-3">
                  {awarenessRows.map((channel) => {
                    const width = Math.max(4, Math.min(100, (channel.cpm / maxCpm) * 100));
                    return (
                      <div key={channel.id}>
                        <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                          <span>{channelName(channel.type)}</span>
                          <span>{formatMoney(channel.cpm)}</span>
                        </div>
                        <div className="h-7 rounded-full bg-slate-100">
                          <div className="h-7 rounded-full bg-[var(--dk-gold)]" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <AwarenessTable rows={awarenessRows} channelName={channelName} formatMoney={formatMoney} formatNumber={formatNumber} t={t} />
            </>
          )}

          <div className="rounded-xl border border-amber-200 bg-[#FFF8E7] p-4 text-sm leading-6 text-[var(--dk-navy)] shadow-sm">
            <p className="font-extrabold">{t('benchmarkNote.title')}</p>
            <p className="mt-1">{t('benchmarkNote.body')}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold leading-6 text-slate-700 shadow-sm">
            {t('ahilikQuote')}
          </div>
        </section>
      </form>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
      <p className="mt-2 text-xl font-extrabold text-[var(--dk-navy)]">{value}</p>
    </div>
  );
}

function ResultHighlights({
  best,
  worst,
  bestLabel,
  worstLabel,
}: {
  best: string;
  worst: string;
  bestLabel: string;
  worstLabel: string;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl border border-amber-200 bg-[#FFF8E7] p-4 shadow-sm">
        <p className="text-xs font-bold uppercase text-amber-700">{bestLabel}</p>
        <p className="mt-2 text-lg font-extrabold text-[var(--dk-navy)]">{best}</p>
      </div>
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 shadow-sm">
        <p className="text-xs font-bold uppercase text-[var(--dk-red)]">{worstLabel}</p>
        <p className="mt-2 text-lg font-extrabold text-[var(--dk-navy)]">{worst}</p>
      </div>
    </div>
  );
}

function ConversionTable({
  rows,
  channelName,
  formatMoney,
  formatNumber,
  t,
}: {
  rows: ReturnType<typeof calculateReklamRoi>['conversionChannels'];
  channelName: (type: ReklamChannelType) => string;
  formatMoney: (value: number) => string;
  formatNumber: (value: number, digits?: number) => string;
  t: TranslationFn;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.tableTitle')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[720px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-3 pr-3">{t('table.channel')}</th>
              <th className="py-3 pr-3">{t('table.budget')}</th>
              <th className="py-3 pr-3">{t('table.customers')}</th>
              <th className="py-3 pr-3">{t('table.cac')}</th>
              <th className="py-3 pr-3">{t('table.roas')}</th>
              <th className="py-3 pr-3">{t('table.roi')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-bold text-[var(--dk-navy)]">{channelName(row.type)}</td>
                <td className="py-3 pr-3">{formatMoney(row.effectiveBudget)}</td>
                <td className="py-3 pr-3">{formatNumber(row.newCustomers, 0)}</td>
                <td className="py-3 pr-3">{formatMoney(row.cac)}</td>
                <td className="py-3 pr-3">{formatNumber(row.roas)}x</td>
                <td className="py-3 pr-3">{formatNumber(row.roiPercent)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AwarenessTable({
  rows,
  channelName,
  formatMoney,
  formatNumber,
  t,
}: {
  rows: ReturnType<typeof calculateReklamRoi>['awarenessChannels'];
  channelName: (type: ReklamChannelType) => string;
  formatMoney: (value: number) => string;
  formatNumber: (value: number, digits?: number) => string;
  t: TranslationFn;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('results.tableTitle')}</h2>
      <div className="overflow-x-auto">
        <table className="min-w-[680px] w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
              <th className="py-3 pr-3">{t('table.channel')}</th>
              <th className="py-3 pr-3">{t('table.budget')}</th>
              <th className="py-3 pr-3">{t('table.reach')}</th>
              <th className="py-3 pr-3">{t('table.impressions')}</th>
              <th className="py-3 pr-3">{t('table.cpm')}</th>
              <th className="py-3 pr-3">{t('table.emv')}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-100">
                <td className="py-3 pr-3 font-bold text-[var(--dk-navy)]">{channelName(row.type)}</td>
                <td className="py-3 pr-3">{formatMoney(row.budget)}</td>
                <td className="py-3 pr-3">{formatNumber(row.reach, 0)}</td>
                <td className="py-3 pr-3">{formatNumber(row.impressions, 0)}</td>
                <td className="py-3 pr-3">{formatMoney(row.cpm)}</td>
                <td className="py-3 pr-3">{formatMoney(row.emv)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
