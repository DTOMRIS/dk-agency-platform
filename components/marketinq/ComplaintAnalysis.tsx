'use client';

import { useEffect, useMemo, useState, useTransition } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  History,
  Loader2,
  MessageSquareWarning,
  Sparkles,
  Trash2,
} from 'lucide-react';
import {
  analyzeComplaint,
  type ComplaintAnalysisResult,
  type ComplaintCategory,
  type ComplaintChannel,
  type ComplaintSeverity,
  type CustomerType,
} from '@/app/actions/complaint-analysis-ai';

type ActiveTab = 'response' | 'discovery' | 'internal';

type HistoryItem = {
  id: string;
  at: string;
  category: ComplaintCategory;
  secondaryCategories: ComplaintCategory[];
  severity: ComplaintSeverity;
  preview: string;
};

const HISTORY_KEY = 'dk_complaint_analysis_history';

const CHANNELS: ComplaintChannel[] = ['face_to_face', 'phone', 'whatsapp', 'google_maps', 'instagram', 'other'];
const CUSTOMER_TYPES: CustomerType[] = ['first_time', 'regular', 'unknown'];

const CATEGORY_META: Record<ComplaintCategory, { color: string; keywords: string[] }> = {
  food_quality: {
    color: 'border-red-200 bg-red-50 text-red-700',
    keywords: ['soyuq', 'bişməmiş', 'bismemis', 'yemək', 'yemek', 'dad', 'iy', 'pis qoxu', 'qoxu'],
  },
  wait_speed: {
    color: 'border-yellow-200 bg-yellow-50 text-yellow-700',
    keywords: ['gözlədim', 'gozledim', 'gecikmə', 'gecikme', 'gec gəldi', 'gec geldi', 'uzun', 'sürət', 'suret', '45 dəqiqə', 'deqiqe'],
  },
  cleanliness: {
    color: 'border-blue-200 bg-blue-50 text-blue-700',
    keywords: ['çirkli', 'cirkli', 'palaz', 'tuvalet', 'masa', 'stol', 'natəmiz', 'natemiz'],
  },
  service_staff: {
    color: 'border-orange-200 bg-orange-50 text-orange-700',
    keywords: ['kobud', 'xidmət', 'xidmet', 'qaşqabaqlı', 'qasqabaqli', 'cavab', 'ofisiant', 'personal'],
  },
  price_bill: {
    color: 'border-green-200 bg-green-50 text-green-700',
    keywords: ['baha', 'qiymət', 'qiymet', 'hesab', 'pul', 'artıq', 'artiq'],
  },
  delivery: {
    color: 'border-purple-200 bg-purple-50 text-purple-700',
    keywords: ['çatdırılma', 'catdirilma', 'kuryer', 'gecikdi', 'delivery', 'wolt', 'bolt'],
  },
  other: {
    color: 'border-slate-200 bg-slate-50 text-slate-700',
    keywords: [],
  },
};

const SEVERITY_COLOR: Record<ComplaintSeverity, string> = {
  low: 'border-green-200 bg-green-50 text-green-700',
  medium: 'border-yellow-200 bg-yellow-50 text-yellow-700',
  high: 'border-orange-200 bg-orange-50 text-orange-700',
  critical: 'border-red-200 bg-red-50 text-red-700',
};

function normalizeText(value: string) {
  return value.toLocaleLowerCase('az-AZ');
}

function detectCategories(text: string): ComplaintCategory[] {
  const normalized = normalizeText(text);
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  if (wordCount < 3) return [];

  const matches = (Object.keys(CATEGORY_META) as ComplaintCategory[])
    .filter((category) => category !== 'other')
    .filter((category) => CATEGORY_META[category].keywords.some((keyword) => normalized.includes(keyword)));

  return matches.length ? matches : ['other'];
}

function estimateSeverity(categories: ComplaintCategory[], text: string): ComplaintSeverity {
  const normalized = normalizeText(text);
  if (/(zəhər|zeher|xəstə|xeste|təcili|tecili|qan|allergiya|polis)/.test(normalized)) return 'critical';
  if (categories.length >= 2 || /(45|60|bir saat|soyuq|kobud)/.test(normalized)) return 'high';
  if (categories.includes('service_staff') || categories.includes('food_quality') || categories.includes('wait_speed')) return 'medium';
  return 'low';
}

function CategoryBadge({
  category,
  label,
}: {
  category: ComplaintCategory;
  label: string;
}) {
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${CATEGORY_META[category].color}`}>
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const t = useTranslations('marketinq.complaintAnalysis');
  const [copied, setCopied] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }}
      className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-[var(--dk-navy)] transition hover:border-[var(--dk-gold)]"
    >
      {copied ? <Check size={15} /> : <Copy size={15} />}
      {copied ? t('copied') : t('copy_btn')}
    </button>
  );
}

export default function ComplaintAnalysis({ backHref = '/dashboard/marketinq-ocagi' }: { backHref?: string }) {
  const t = useTranslations('marketinq.complaintAnalysis');
  const locale = useLocale();

  const [complaintText, setComplaintText] = useState('');
  const [channel, setChannel] = useState<ComplaintChannel>('whatsapp');
  const [customerType, setCustomerType] = useState<CustomerType>('unknown');
  const [date, setDate] = useState('');
  const [result, setResult] = useState<ComplaintAnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<ActiveTab>('response');
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isPending, startTransition] = useTransition();

  const detectedCategories = useMemo(() => detectCategories(complaintText), [complaintText]);
  const instantSeverity = useMemo(() => estimateSeverity(detectedCategories, complaintText), [detectedCategories, complaintText]);
  const canAnalyze = complaintText.trim().length >= 20 && complaintText.trim().length <= 1000;

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(HISTORY_KEY);
      if (stored) setHistory(JSON.parse(stored) as HistoryItem[]);
    } catch {
      setHistory([]);
    }
  }, []);

  function saveHistory(next: HistoryItem[]) {
    setHistory(next);
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
  }

  function addToHistory(data: ComplaintAnalysisResult) {
    const next: HistoryItem[] = [
      {
        id: `${Date.now()}`,
        at: new Date().toISOString(),
        category: data.category,
        secondaryCategories: data.secondaryCategories,
        severity: data.severity,
        preview: complaintText.trim().slice(0, 90),
      },
      ...history,
    ].slice(0, 5);
    saveHistory(next);
  }

  function clearHistory() {
    saveHistory([]);
  }

  function handleAnalyze() {
    if (!canAnalyze) {
      setError(t('validation_error'));
      return;
    }

    setError(null);
    setResult(null);
    setActiveTab('response');

    startTransition(async () => {
      const response = await analyzeComplaint({
        complaintText,
        channel,
        customerType,
        date: date || undefined,
        clientCategory: detectedCategories[0],
      });

      if (!response.ok) {
        setError(t(`errors.${response.error}`));
        return;
      }

      setResult(response.data);
      addToHistory(response.data);
    });
  }

  const categoryLabels: Record<ComplaintCategory, string> = {
    food_quality: t('categories.food_quality'),
    wait_speed: t('categories.wait_speed'),
    cleanliness: t('categories.cleanliness'),
    service_staff: t('categories.service_staff'),
    price_bill: t('categories.price_bill'),
    delivery: t('categories.delivery'),
    other: t('categories.other'),
  };

  const severityLabels: Record<ComplaintSeverity, string> = {
    low: t('severity_low'),
    medium: t('severity_medium'),
    high: t('severity_high'),
    critical: t('severity_critical'),
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
      <Link href={backHref} className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} />
        {t('back_to_tools')}
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="mb-2 inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-bold uppercase text-amber-700">
            KALFA
          </div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)] sm:text-3xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
      </div>

      <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
          <MessageSquareWarning size={18} className="mt-0.5 shrink-0" />
          <p>{t('philosophy')}</p>
        </div>

        <div className="grid gap-4">
          <label>
            <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('complaint_label')}</span>
            <textarea
              value={complaintText}
              onChange={(event) => setComplaintText(event.target.value)}
              rows={5}
              maxLength={1000}
              className="w-full resize-y rounded-lg border border-slate-200 px-3 py-3 text-sm text-[var(--dk-navy)] outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20"
              placeholder={t('complaint_placeholder')}
            />
            <span className="mt-1 block text-right text-xs text-slate-400">{complaintText.length}/1000</span>
          </label>

          <div className="grid gap-4 sm:grid-cols-3">
            <label>
              <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('channel_label')}</span>
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as ComplaintChannel)}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[var(--dk-navy)] outline-none focus:border-[var(--dk-gold)]"
              >
                {CHANNELS.map((item) => <option key={item} value={item}>{t(`channels.${item}`)}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('customer_type_label')}</span>
              <select
                value={customerType}
                onChange={(event) => setCustomerType(event.target.value as CustomerType)}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[var(--dk-navy)] outline-none focus:border-[var(--dk-gold)]"
              >
                {CUSTOMER_TYPES.map((item) => <option key={item} value={item}>{t(`customerTypes.${item}`)}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-1.5 block text-sm font-bold text-[var(--dk-navy)]">{t('date_label')}</span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="min-h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-[var(--dk-navy)] outline-none focus:border-[var(--dk-gold)]"
              />
            </label>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">{t('instant_category')}</p>
            <div className="flex flex-wrap gap-2">
              {detectedCategories.length ? detectedCategories.map((category) => (
                <CategoryBadge key={category} category={category} label={categoryLabels[category]} />
              )) : (
                <span className="text-sm text-slate-400">{t('instant_empty')}</span>
              )}
              {detectedCategories.length > 0 && (
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${SEVERITY_COLOR[instantSeverity]}`}>
                  {severityLabels[instantSeverity]}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || isPending}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--dk-red)] px-6 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--dk-red)]/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {t('analyze_btn')}
          </button>
        </div>
      </section>

      {isPending && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="space-y-3">
            <div className="h-4 w-10/12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-8/12 animate-pulse rounded bg-slate-100" />
            <div className="h-4 w-11/12 animate-pulse rounded bg-slate-100" />
          </div>
        </section>
      )}

      {result && (
        <section className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <CategoryBadge category={result.category} label={categoryLabels[result.category]} />
            {result.secondaryCategories.map((category) => (
              <CategoryBadge key={category} category={category} label={categoryLabels[category]} />
            ))}
            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${SEVERITY_COLOR[result.severity]}`}>
              {severityLabels[result.severity]}
            </span>
            <span className="text-xs text-slate-500">{result.severityReason}</span>
          </div>

          <div className="mb-4 grid grid-cols-3 rounded-lg bg-slate-100 p-1">
            {(['response', 'discovery', 'internal'] as ActiveTab[]).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`min-h-10 rounded-md px-2 text-xs font-bold transition sm:text-sm ${activeTab === tab ? 'bg-white text-[var(--dk-navy)] shadow-sm' : 'text-slate-500'}`}
              >
                {tab === 'response' ? t('tab_response') : tab === 'discovery' ? t('tab_discovery') : t('tab_internal')}
              </button>
            ))}
          </div>

          {activeTab === 'response' && (
            <div className="rounded-lg bg-slate-50 p-4">
              <div className="mb-3 flex justify-end">
                <CopyButton text={result.customerResponse} />
              </div>
              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{result.customerResponse}</p>
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-sm leading-6 text-blue-900">
                <strong>{t('follow_up')}:</strong> {result.followUpRecommendation}
              </div>
            </div>
          )}

          {activeTab === 'discovery' && (
            <div className="space-y-3">
              {result.discoveryQuestions.map((question, index) => (
                <div key={question} className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-[var(--dk-navy)]">
                  <span className="mr-2 font-bold text-[var(--dk-gold)]">{index + 1}.</span>
                  {question}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'internal' && (
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-slate-50 p-3">
                <p className="text-xs font-bold uppercase text-slate-500">{t('internal_owner')}</p>
                <p className="mt-1 text-sm font-bold text-[var(--dk-navy)]">{result.internalNote.owner}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-2">
                <p className="text-xs font-bold uppercase text-slate-500">{t('internal_process')}</p>
                <p className="mt-1 text-sm text-[var(--dk-navy)]">{result.internalNote.processCheck}</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 sm:col-span-3">
                <p className="text-xs font-bold uppercase text-slate-500">{t('tab_internal')}</p>
                <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.internalNote.note}</p>
              </div>
              <div className="rounded-lg border border-amber-100 bg-amber-50 p-3 sm:col-span-3">
                <p className="text-xs font-bold uppercase text-amber-700">{t('capa_title')}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t('capa_investigation')}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.capa.investigation}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t('capa_closure')}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.capa.closureCriteria}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t('capa_corrective')}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.capa.correctiveAction}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500">{t('capa_preventive')}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.capa.preventiveAction}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="text-xs font-bold text-slate-500">{t('capa_recurrence')}</p>
                    <p className="mt-1 text-sm leading-6 text-[var(--dk-navy)]">{result.capa.recurrenceCheck}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="inline-flex items-center gap-2 text-lg font-bold text-[var(--dk-navy)]">
            <History size={18} />
            {t('history_title')}
          </h2>
          {history.length > 0 && (
            <button
              type="button"
              onClick={clearHistory}
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <Trash2 size={15} />
              {t('history_clear')}
            </button>
          )}
        </div>
        <div className="space-y-3">
          {history.length ? history.map((item) => (
            <div key={item.id} className="rounded-lg border border-slate-200 p-3">
              <div className="mb-2 flex flex-wrap gap-2">
                <CategoryBadge category={item.category} label={categoryLabels[item.category]} />
                <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${SEVERITY_COLOR[item.severity]}`}>
                  {severityLabels[item.severity]}
                </span>
              </div>
              <p className="text-sm text-slate-600">{item.preview}</p>
              <p className="mt-1 text-xs text-slate-400">{new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.at))}</p>
            </div>
          )) : (
            <p className="text-sm text-slate-400">{t('history_empty')}</p>
          )}
        </div>
      </section>
    </div>
  );
}
