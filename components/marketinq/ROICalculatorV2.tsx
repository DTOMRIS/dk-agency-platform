'use client';

import { useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  ArrowLeft,
  Clipboard,
  Download,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import { getROIAIAnalysis } from '@/app/actions/roi-ai-analysis';

type ChannelRow = {
  id: string;
  name: string;
  customName: string;
  spend: string;
  revenue: string;
  newCustomers: string;
};

type ChannelMetric = {
  id: string;
  name: string;
  spend: number;
  revenue: number;
  newCustomers: number;
  roiPercent: number;
  roas: number;
  cac: number;
  paybackDays: number;
};

type Status = 'good' | 'warning' | 'critical' | 'neutral';

const CHANNEL_OPTIONS = ['Instagram', 'Facebook', 'Google Ads', 'WhatsApp', 'Flyer/Çap', 'Lokal reklam', 'Digər'];

const DEMO_CHANNELS: ChannelRow[] = [
  { id: 'demo-1', name: 'Instagram', customName: '', spend: '500', revenue: '1800', newCustomers: '15' },
  { id: 'demo-2', name: 'Google Ads', customName: '', spend: '800', revenue: '1200', newCustomers: '8' },
  { id: 'demo-3', name: 'Flyer/Çap', customName: '', spend: '200', revenue: '300', newCustomers: '3' },
];

function newChannel(index: number): ChannelRow {
  return { id: `channel-${Date.now()}-${index}`, name: CHANNEL_OPTIONS[index % 2 === 0 ? 0 : 2], customName: '', spend: '', revenue: '', newCustomers: '' };
}

function parseAmount(value: string): number {
  return Math.max(0, Number.parseFloat(value.replace(',', '.')) || 0);
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}

function getIntlLocale(locale: string) {
  if (locale === 'az') return 'az-AZ';
  if (locale === 'tr') return 'tr-TR';
  if (locale === 'ru') return 'ru-RU';
  return 'en-US';
}

function statusColor(status: Status) {
  if (status === 'good') return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  if (status === 'warning') return 'border-amber-200 bg-amber-50 text-amber-700';
  if (status === 'critical') return 'border-red-200 bg-red-50 text-red-700';
  return 'border-slate-200 bg-slate-50 text-slate-600';
}

function roiStatus(roi: number): Status {
  if (roi > 100) return 'good';
  if (roi >= 0) return 'warning';
  return 'critical';
}

export default function ROICalculatorV2({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.roiCalculator');
  const locale = useLocale();
  const localeForIntl = getIntlLocale(locale);

  const [campaignName, setCampaignName] = useState('May 2026 Instagram Kampaniyası');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [avgCheck, setAvgCheck] = useState('25');
  const [monthlyVisits, setMonthlyVisits] = useState('2');
  const [loyaltyMonths, setLoyaltyMonths] = useState('12');
  const [channels, setChannels] = useState<ChannelRow[]>(DEMO_CHANNELS);
  const [aiText, setAiText] = useState<string | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  const analysis = useMemo(() => {
    const averageCheck = parseAmount(avgCheck);
    const monthlyVisitCount = parseAmount(monthlyVisits);
    const loyalty = parseAmount(loyaltyMonths);
    const dailyVisitFrequency = monthlyVisitCount > 0 ? monthlyVisitCount / 30 : 0;

    const channelMetrics: ChannelMetric[] = channels
      .map((channel) => {
        const spend = parseAmount(channel.spend);
        const revenue = parseAmount(channel.revenue);
        const newCustomers = Math.floor(parseAmount(channel.newCustomers));
        const cac = newCustomers > 0 ? spend / newCustomers : 0;
        return {
          id: channel.id,
          name: channel.name === 'Digər' && channel.customName.trim() ? channel.customName.trim().slice(0, 40) : channel.name,
          spend,
          revenue,
          newCustomers,
          roiPercent: spend > 0 ? ((revenue - spend) / spend) * 100 : 0,
          roas: spend > 0 ? revenue / spend : 0,
          cac,
          paybackDays: averageCheck > 0 && dailyVisitFrequency > 0 ? cac / (averageCheck * dailyVisitFrequency) : 0,
        };
      })
      .filter((channel) => channel.spend > 0)
      .map((channel) => ({
        ...channel,
        roiPercent: round(channel.roiPercent),
        roas: round(channel.roas),
        cac: round(channel.cac),
        paybackDays: round(channel.paybackDays),
      }));

    const sortedChannels = [...channelMetrics].sort((a, b) => b.roiPercent - a.roiPercent);
    const totalSpend = channelMetrics.reduce((sum, channel) => sum + channel.spend, 0);
    const totalRevenue = channelMetrics.reduce((sum, channel) => sum + channel.revenue, 0);
    const totalNewCustomers = channelMetrics.reduce((sum, channel) => sum + channel.newCustomers, 0);
    const totalROI = totalSpend > 0 ? ((totalRevenue - totalSpend) / totalSpend) * 100 : 0;
    const totalROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
    const totalCAC = totalNewCustomers > 0 ? totalSpend / totalNewCustomers : 0;
    const ltv = averageCheck * monthlyVisitCount * loyalty;
    const ltvCacRatio = totalCAC > 0 ? ltv / totalCAC : 0;
    const paybackDays = averageCheck > 0 && dailyVisitFrequency > 0 ? totalCAC / (averageCheck * dailyVisitFrequency) : 0;

    return {
      averageCheck,
      monthlyVisitCount,
      loyalty,
      channels: channelMetrics,
      sortedChannels,
      totalSpend,
      totalRevenue,
      totalNewCustomers,
      totalROI: round(totalROI),
      totalROAS: round(totalROAS),
      totalCAC: round(totalCAC),
      ltv: round(ltv),
      ltvCacRatio: round(ltvCacRatio),
      paybackDays: round(paybackDays),
      bestChannel: sortedChannels[0] ?? null,
      worstChannel: sortedChannels[sortedChannels.length - 1] ?? null,
    };
  }, [avgCheck, channels, loyaltyMonths, monthlyVisits]);

  function formatMoney(value: number) {
    return `${new Intl.NumberFormat(localeForIntl, { maximumFractionDigits: 1 }).format(round(value))} AZN`;
  }

  function formatNumber(value: number, digits = 1) {
    return new Intl.NumberFormat(localeForIntl, { maximumFractionDigits: digits }).format(round(value));
  }

  function updateChannel(id: string, field: keyof Omit<ChannelRow, 'id'>, value: string) {
    setChannels((prev) => prev.map((channel) => channel.id === id ? { ...channel, [field]: value } : channel));
    setAiText(null);
    setAiError(null);
  }

  function addChannel() {
    setChannels((prev) => prev.length >= 8 ? prev : [...prev, newChannel(prev.length + 1)]);
  }

  function removeChannel(id: string) {
    setChannels((prev) => prev.length <= 1 ? prev : prev.filter((channel) => channel.id !== id));
  }

  function statusLabel(status: Status) {
    if (status === 'good') return t('status_good');
    if (status === 'warning') return t('status_warning');
    if (status === 'critical') return t('status_critical');
    return '-';
  }

  const kpis = [
    { label: t('total_roi'), value: `${formatNumber(analysis.totalROI)}%`, status: roiStatus(analysis.totalROI), hint: t('benchmark_roi') },
    { label: t('total_roas'), value: `${formatNumber(analysis.totalROAS)}x`, status: analysis.totalROAS > 3 ? 'good' as Status : 'warning' as Status, hint: t('benchmark_roas') },
    { label: t('total_cac'), value: formatMoney(analysis.totalCAC), status: 'neutral' as Status, hint: '' },
    { label: 'LTV', value: formatMoney(analysis.ltv), status: 'neutral' as Status, hint: '' },
    { label: t('ltv_cac_ratio'), value: `${formatNumber(analysis.ltvCacRatio)}:1`, status: analysis.ltvCacRatio >= 3 ? 'good' as Status : 'critical' as Status, hint: t('benchmark_ltv') },
    { label: t('payback_days'), value: `${formatNumber(analysis.paybackDays, 0)} ${t('days')}`, status: analysis.paybackDays > 0 && analysis.paybackDays < 180 ? 'good' as Status : 'warning' as Status, hint: t('benchmark_payback') },
    { label: t('best_channel'), value: analysis.bestChannel?.name ?? '-', status: 'good' as Status, hint: analysis.bestChannel ? `${formatNumber(analysis.bestChannel.roiPercent)}% ROI` : '' },
    { label: t('worst_channel'), value: analysis.worstChannel?.name ?? '-', status: 'warning' as Status, hint: analysis.worstChannel ? `${formatNumber(analysis.worstChannel.roiPercent)}% ROI` : '' },
  ];

  const copyText = `${t('title')}
${t('campaign_name')}: ${campaignName}
${t('total_roi')}: ${formatNumber(analysis.totalROI)}%
${t('total_roas')}: ${formatNumber(analysis.totalROAS)}x
${t('total_cac')}: ${formatMoney(analysis.totalCAC)}
LTV: ${formatMoney(analysis.ltv)}
${t('ltv_cac_ratio')}: ${formatNumber(analysis.ltvCacRatio)}:1
${t('best_channel')}: ${analysis.bestChannel?.name ?? '-'}
${t('worst_channel')}: ${analysis.worstChannel?.name ?? '-'}`;

  async function copyResult() {
    await navigator.clipboard.writeText(copyText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function loadAI() {
    if (!analysis.channels.length || analysis.totalCAC <= 0) {
      setAiError(t('validation_error'));
      return;
    }
    setAiError(null);
    startTransition(async () => {
      const result = await getROIAIAnalysis({
        campaignName,
        period: `${startDate || '-'} - ${endDate || '-'}`,
        ltv: analysis.ltv,
        totalCAC: analysis.totalCAC,
        ltvCacRatio: analysis.ltvCacRatio,
        bestChannel: analysis.bestChannel?.name ?? '-',
        worstChannel: analysis.worstChannel?.name ?? '-',
        channels: analysis.channels.map((channel) => ({
          name: channel.name,
          spend: channel.spend,
          revenue: channel.revenue,
          newCustomers: channel.newCustomers,
          roiPercent: channel.roiPercent,
          roas: channel.roas,
          cac: channel.cac,
        })),
      });

      if (result.ok && result.analysis) {
        setAiText(result.analysis);
        setAiError(null);
      } else {
        setAiText(null);
        setAiError(t(`errors.${result.error ?? 'ai-failed'}`));
      }
    });
  }

  const inputClass = 'min-h-11 w-full rounded-lg border border-slate-200 px-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8 print:max-w-none print:px-0">
      <style jsx global>{`
        @media print {
          body { background: white !important; }
          header, nav, footer, .no-print { display: none !important; }
          .print-surface { box-shadow: none !important; border-color: #d1d5db !important; break-inside: avoid; }
        }
      `}</style>

      <Link href={backHref} className="no-print mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-xs font-bold uppercase text-purple-700">
            KALFA
          </div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
        <div className="no-print flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={copyResult}
            disabled={!analysis.channels.length}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Clipboard size={16} />
            {copied ? t('copied') : t('copy_result')}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            disabled={!analysis.channels.length}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-[var(--dk-navy)] shadow-sm transition hover:border-[var(--dk-gold)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Download size={16} />
            {t('export_pdf')}
          </button>
        </div>
      </div>

      <section className="print-surface mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('general_params')}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <label className="sm:col-span-2">
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('campaign_name')}</span>
            <input value={campaignName} onChange={(event) => setCampaignName(event.target.value)} className={inputClass} maxLength={80} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('start_date')}</span>
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('end_date')}</span>
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('avg_check')}</span>
            <input value={avgCheck} onChange={(event) => setAvgCheck(event.target.value)} inputMode="decimal" className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('monthly_visits')}</span>
            <input value={monthlyVisits} onChange={(event) => setMonthlyVisits(event.target.value)} inputMode="decimal" className={inputClass} />
          </label>
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('loyalty_months')}</span>
            <input value={loyaltyMonths} onChange={(event) => setLoyaltyMonths(event.target.value)} inputMode="decimal" className={inputClass} />
          </label>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)]">
        <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('channels_title')}</h2>
            <button
              type="button"
              onClick={addChannel}
              disabled={channels.length >= 8}
              className="no-print inline-flex min-h-10 items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 px-3 text-sm font-bold text-slate-600 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus size={16} />
              {t('add_channel')}
            </button>
          </div>

          <div className="space-y-4">
            {channels.map((channel, index) => {
              const metric = analysis.channels.find((item) => item.id === channel.id);
              return (
                <div key={channel.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 sm:p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <p className="text-sm font-extrabold text-[var(--dk-navy)]">{t('channel')} #{index + 1}</p>
                    <button
                      type="button"
                      onClick={() => removeChannel(channel.id)}
                      disabled={channels.length <= 1}
                      className="no-print inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={14} />
                      {t('remove_channel')}
                    </button>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label>
                      <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('channel_name')}</span>
                      <select value={channel.name} onChange={(event) => updateChannel(channel.id, 'name', event.target.value)} className={inputClass}>
                        {CHANNEL_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                      </select>
                    </label>
                    {channel.name === 'Digər' && (
                      <label>
                        <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('custom_channel')}</span>
                        <input value={channel.customName} onChange={(event) => updateChannel(channel.id, 'customName', event.target.value)} className={inputClass} maxLength={40} />
                      </label>
                    )}
                    <label>
                      <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('budget_spent')}</span>
                      <input value={channel.spend} onChange={(event) => updateChannel(channel.id, 'spend', event.target.value)} inputMode="decimal" className={inputClass} placeholder="0" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('revenue_earned')}</span>
                      <input value={channel.revenue} onChange={(event) => updateChannel(channel.id, 'revenue', event.target.value)} inputMode="decimal" className={inputClass} placeholder="0" />
                    </label>
                    <label>
                      <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('new_customers')}</span>
                      <input value={channel.newCustomers} onChange={(event) => updateChannel(channel.id, 'newCustomers', event.target.value)} inputMode="numeric" className={inputClass} placeholder="0" />
                    </label>
                  </div>

                  {metric && (
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                      <div className={`rounded-lg border p-2 ${statusColor(roiStatus(metric.roiPercent))}`}>
                        <p className="text-[10px] font-bold uppercase">ROI</p>
                        <p className="text-base font-extrabold">{formatNumber(metric.roiPercent)}%</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2 text-[var(--dk-navy)]">
                        <p className="text-[10px] font-bold uppercase text-slate-500">ROAS</p>
                        <p className="text-base font-extrabold">{formatNumber(metric.roas)}x</p>
                      </div>
                      <div className="rounded-lg border border-slate-200 bg-white p-2 text-[var(--dk-navy)]">
                        <p className="text-[10px] font-bold uppercase text-slate-500">CAC</p>
                        <p className="text-base font-extrabold">{formatMoney(metric.cac)}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--dk-red)]" />
              <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('results_title')}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {kpis.map((kpi) => (
                <div key={kpi.label} className={`rounded-lg border p-3 ${statusColor(kpi.status)}`}>
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-xs font-bold uppercase tracking-wide">{kpi.label}</p>
                    <span className="shrink-0 rounded-full bg-white/80 px-2 py-0.5 text-[11px] font-bold">{statusLabel(kpi.status)}</span>
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-[var(--dk-navy)]">{kpi.value}</p>
                  {kpi.hint && <p className="mt-1 text-xs font-semibold opacity-80">{kpi.hint}</p>}
                </div>
              ))}
            </div>
          </section>

          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('comparison_title')}</h2>
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase text-slate-500">
                    <th className="py-3 pr-3">{t('channel_name')}</th>
                    <th className="py-3 pr-3">{t('budget_spent')}</th>
                    <th className="py-3 pr-3">{t('revenue_earned')}</th>
                    <th className="py-3 pr-3">ROI%</th>
                    <th className="py-3 pr-3">ROAS</th>
                    <th className="py-3 pr-3">CAC</th>
                    <th className="py-3 pr-3">{t('evaluation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {analysis.sortedChannels.map((channel) => {
                    const isBest = channel.id === analysis.bestChannel?.id;
                    const isWorst = channel.id === analysis.worstChannel?.id && analysis.sortedChannels.length > 1;
                    const status = roiStatus(channel.roiPercent);
                    return (
                      <tr key={channel.id} className={`border-b border-slate-100 ${isBest ? 'bg-amber-50' : isWorst ? 'bg-slate-50 opacity-80' : ''}`}>
                        <td className="py-3 pr-3 font-bold text-[var(--dk-navy)]">{channel.name}</td>
                        <td className="py-3 pr-3">{formatMoney(channel.spend)}</td>
                        <td className="py-3 pr-3">{formatMoney(channel.revenue)}</td>
                        <td className="py-3 pr-3 font-bold">{formatNumber(channel.roiPercent)}%</td>
                        <td className="py-3 pr-3">{formatNumber(channel.roas)}x</td>
                        <td className="py-3 pr-3">{formatMoney(channel.cac)}</td>
                        <td className="py-3 pr-3">
                          <span className={`rounded-full border px-2 py-1 text-xs font-bold ${statusColor(status)}`}>{statusLabel(status)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="mb-4 text-lg font-extrabold text-[var(--dk-navy)]">{t('chart_title')}</h2>
            <div className="space-y-3">
              {analysis.sortedChannels.map((channel) => {
                const maxPositive = Math.max(100, ...analysis.sortedChannels.map((item) => item.roiPercent));
                const width = Math.max(2, Math.min(100, (Math.max(0, channel.roiPercent) / maxPositive) * 100));
                const benchmarkLeft = Math.min(100, (100 / maxPositive) * 100);
                return (
                  <div key={channel.id}>
                    <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-600">
                      <span>{channel.name}</span>
                      <span>{formatNumber(channel.roiPercent)}%</span>
                    </div>
                    <div className="relative h-7 rounded-full bg-slate-100">
                      <span className="absolute inset-y-0 border-l-2 border-dashed border-slate-400" style={{ left: `${benchmarkLeft}%` }} />
                      <div className={`h-7 rounded-full ${channel.roiPercent > 100 ? 'bg-emerald-500' : channel.roiPercent >= 0 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${width}%` }} />
                    </div>
                  </div>
                );
              })}
              <p className="text-xs font-semibold text-slate-500">{t('benchmark_line')}</p>
            </div>
          </section>

          <section className="print-surface rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-[var(--dk-navy)]">{t('ai_title')}</h2>
                <p className="mt-1 text-sm text-slate-500">{t('ai_subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={loadAI}
                disabled={isPending || !analysis.channels.length}
                className="no-print inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[var(--dk-red)] px-4 text-sm font-bold text-white transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                {t('ai_btn')}
              </button>
            </div>

            {isPending && (
              <div className="space-y-3">
                <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-9/12 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
              </div>
            )}

            {!isPending && aiError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
                {aiError}
                <button type="button" onClick={loadAI} className="ml-2 inline-flex items-center gap-1 font-extrabold text-[var(--dk-navy)]">
                  <RefreshCw size={14} /> {t('retry')}
                </button>
              </div>
            )}

            {!isPending && aiText && (
              <div className="whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-7 text-slate-700">{aiText}</div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
