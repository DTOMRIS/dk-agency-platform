'use client';
import { useCallback, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import KazanLeadStatusActions from './KazanLeadStatusActions';
import { bakuDay, followupFlag, salesStages, type salesSummary } from '@/lib/sales/followup';
import type { SalesLead } from '@/lib/sales/types';
import { formatAzDateTime, formatNumber } from '@/lib/i18n/format';

export default function KazanSalesBoard({ initial = {} }: { initial?: { status?: string; intent?: string; businessType?: string } }) {
  const t = useTranslations('salesFollowup');
  const legacy = useTranslations('dashboardKazanLeads');
  const locale = useLocale();
  const [leads, setLeads] = useState<SalesLead[]>([]);
  const [available, setAvailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [notice, setNotice] = useState(false);
  const [stage, setStage] = useState(initial.status === 'converted' ? 'won' : initial.status === 'dismissed' ? 'lost' : initial.status || 'all');
  const [intent, setIntent] = useState(initial.intent || 'all');
  const [business, setBusiness] = useState(initial.businessType || 'all');
  const [queue, setQueue] = useState('all');
  const [search, setSearch] = useState('');
  const [summary, setSummary] = useState<ReturnType<typeof salesSummary>>({ total: 0, won: 0, overdue: 0, unplanned: 0, pipeline: 0, collected: 0, minutes: 0 });
  const [totalMatches, setTotalMatches] = useState(0);
  const [page, setPage] = useState(0);
  const [refresh, setRefresh] = useState(0);
  const load = useCallback(async (signal?: AbortSignal) => {
    setBusy(true);
    setError(false);
    try {
      const res = await fetch(`/api/dashboard/kazan-sales?${new URLSearchParams({ stage, intent, businessType: business, queue, search, page: String(page) })}`, { cache: 'no-store', signal });
      if (!res.ok) throw new Error('unavailable');
      const body = await res.json() as { success: boolean; summary: ReturnType<typeof salesSummary>; totalMatches: number; items: SalesLead[] };
      if (!body.success || !Array.isArray(body.items)) throw new Error('invalid_response');
      setLeads(body.items); setSummary(body.summary); setTotalMatches(body.totalMatches); setAvailable(true);
    } catch { if (!signal?.aborted) { setError(true); setAvailable(false); } }
    finally { if (!signal?.aborted) { setLoading(false); setBusy(false); } }
  }, [stage, intent, business, queue, search, page]);
  useEffect(() => { const controller = new AbortController(); void load(controller.signal); return () => controller.abort(); }, [load, refresh]);
  const today = bakuDay();

  const visible = leads;
  const card = 'rounded-[22px] border border-[#E4DCCD] bg-white p-5 sm:p-6';
  const select = 'mt-1 min-h-11 w-full rounded-xl border border-[#E4DCCD] bg-white px-3 text-sm text-slate-900';
  const metric = (v: number) => available ? formatNumber(v, locale, { maximumFractionDigits: 2 }) : '—';
  return <div className="min-h-full bg-[#F6F1E9] px-4 py-6 text-slate-900 sm:px-8"><div className="mx-auto max-w-[1320px] space-y-5">
    <header><h1 className="text-3xl font-black">{t('title')}</h1><p className="mt-2 max-w-4xl text-sm leading-6 text-slate-700">{t('subtitle')}</p></header>
    {busy && !loading && <p role="status" className="text-sm text-slate-700">{t('loading')}</p>}
    {notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-900">{t('saved')}</p>}
    {loading ? <p role="status">{t('loading')}</p> : error ? <div role="alert" className={card}><p>{t('loadError')}</p><button type="button" onClick={() => void load()} className="mt-3 min-h-11 rounded-xl border border-slate-400 px-4 text-slate-900">{t('retry')}</button></div> : <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {(['total', 'won', 'overdue', 'unplanned', 'pipeline', 'collected', 'minutes'] as const).map(key => <div key={key} className={card}><p className="text-sm text-slate-700">{t(`metrics.${key}`)}</p><p className="mt-2 text-2xl font-black" data-testid={`sales-metric-${key}`}>{metric(summary[key])}{(key === 'pipeline' || key === 'collected') && available ? ' ₼' : ''}</p></div>)}
      </div>
      <p className="text-xs leading-5 text-slate-700">{t('sampleNote', { count: totalMatches })}</p>
      <details className={card}><summary className="cursor-pointer text-base font-bold text-slate-900">{t('playbook')}</summary><div className="mt-4 grid gap-4 md:grid-cols-3">{['discovery', 'diagnostic', 'monthly'].map(v => <article key={v} className="rounded-xl bg-[#F6F1E9] p-4"><h2 className="font-bold">{t(`services.${v}`)}</h2><p className="mt-2 text-sm leading-6 text-slate-800">{t(`scopes.${v}`)}</p></article>)}</div><p className="mt-4 whitespace-pre-line text-sm leading-6 text-slate-800">{t('discoveryQuestions')}</p></details>
      <section className={card} aria-label={t('filters')}><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <label className="text-sm font-semibold text-slate-800">{t('search')}<input value={search} onChange={e => { setSearch(e.target.value); setPage(0); setNotice(false); }} className={select} /></label>
        <label className="text-sm font-semibold text-slate-800">{t('stage')}<select value={stage} onChange={e => { setStage(e.target.value); setPage(0); setNotice(false); }} className={select}><option value="all">{t('all')}</option>{salesStages.map(v => <option key={v} value={v}>{t(`stages.${v}`)}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-800">{legacy('filters.intent')}<select value={intent} onChange={e => { setIntent(e.target.value); setPage(0); setNotice(false); }} className={select}>{['all','food_cost','pnl','aqta','delivery','general'].map(v => <option key={v} value={v}>{legacy(`intentOptions.${v}`)}</option>)}</select></label>
        <label className="text-sm font-semibold text-slate-800">{legacy('filters.businessType')}<select value={business} onChange={e => { setBusiness(e.target.value); setPage(0); setNotice(false); }} className={select}>{['all','restoran','kafe','franchise','diger'].map(v => <option key={v} value={v}>{legacy(`businessTypeOptions.${v}`)}</option>)}</select></label>
      </div><div className="mt-4 flex flex-wrap gap-2">{['all','unplanned','overdue','today','scheduled','closed'].map(v => <button key={v} type="button" aria-pressed={queue === v} onClick={() => { setQueue(v); setPage(0); setNotice(false); }} className={`min-h-10 rounded-full border px-4 text-sm font-semibold ${queue === v ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-300 bg-white text-slate-800'}`}>{v === 'all' ? t('all') : t(`flags.${v}`)}</button>)}</div></section>
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-700">{t('visible', { count: visible.length })} · {t('pageNumber', { page: page + 1 })}</p><div className="flex gap-2"><button type="button" disabled={page === 0} onClick={() => setPage(v => v - 1)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm text-slate-900 disabled:opacity-50">{t('previous')}</button><button type="button" disabled={(page + 1) * 25 >= totalMatches} onClick={() => setPage(v => v + 1)} className="min-h-11 rounded-xl border border-slate-300 px-4 text-sm text-slate-900 disabled:opacity-50">{t('next')}</button></div></div>
      {!visible.length && <p className={card}>{t('empty')}</p>}
      {visible.map(lead => <article key={lead.id} className={card} data-testid={`sales-lead-${lead.id}`}><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-4"><h2 className="break-words text-2xl font-black">{lead.name}</h2>
          <p className="break-words text-sm text-slate-800">{lead.phone}{lead.email ? ` · ${lead.email}` : ''}</p>
          <div className="flex flex-wrap gap-2 text-xs font-semibold"><span className="rounded-full bg-sky-50 px-3 py-2 text-sky-900">{t(`stages.${lead.sales.stage}`)}</span><span className="rounded-full bg-amber-50 px-3 py-2 text-amber-950">{t(`flags.${followupFlag(lead.sales, today)}`)}</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-800">{legacy(`intentOptions.${lead.intent}`)}</span><span className="rounded-full bg-slate-100 px-3 py-2 text-slate-800">{legacy(`businessTypeOptions.${lead.businessType}`)}</span></div>
          <dl className="grid grid-cols-2 gap-3 text-xs text-slate-800"><div><dt>{legacy('createdAt')}</dt><dd>{formatAzDateTime(lead.createdAt)}</dd></div><div><dt>{legacy('whatsapp')}</dt><dd>{lead.whatsappHandoff ? legacy('yes') : legacy('no')}</dd></div><div><dt>{legacy('meeting')}</dt><dd>{lead.meetingRequested ? legacy('yes') : legacy('no')}</dd></div>{lead.leadScore !== null && <div><dt>{t('score')}</dt><dd>{lead.leadScore}/100</dd></div>}</dl>
          <p className="text-sm font-semibold">{legacy('lastMessages')}</p>
          {(lead.conversationContext ?? []).map((m, i) => <div key={i} className="rounded-xl bg-[#F6F1E9] p-4 text-sm leading-6 text-slate-900"><p className="font-semibold">{m.role === 'user' ? legacy('roleUser') : legacy('roleAi')}</p><p className="whitespace-pre-wrap break-words">{m.content}</p></div>)}
        </div><div className="min-w-0 rounded-xl bg-[#FBF8F3] p-4"><KazanLeadStatusActions key={`${lead.id}-${lead.sales.version}`} lead={lead} available={available && !busy} onDirty={() => setNotice(false)} onSaved={async () => { setNotice(true); setPage(0); setRefresh(v => v + 1); }} /></div>
      </div></article>)}
    </>}
  </div></div>;
}
