'use client';

/**
 * @file QonaqAnketiPage.tsx
 * @purpose TASK-0523 (OCAQ logic → DK): guest survey builder + answer checker. No AI, no DB:
 *          everything is computed in the browser (lib/marketing-tools/qonaq-anketi.ts).
 *          Questions are our own wording (messages: mqForms.qonaqAnketi) — not OCAQ / Shaurma copy.
 */

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { AZ_NUMBER_LOCALE } from '@/lib/i18n/format';
import { ArrowLeft, Clipboard, Printer } from 'lucide-react';
import ToolTabs from '../ToolTabs';
import {
  analyseSurvey,
  DEFAULT_PERFECT_WARN_PCT,
  MIN_RESPONSES,
  parseSurveyText,
  SURVEY_GROUPS,
  SURVEY_QUESTIONS,
  type SurveyAnalysis,
} from '@/lib/marketing-tools/qonaq-anketi';

const SAMPLE = [
  'q1,q2,q3,q4,q5,q6,q7,q8,nps,san',
  '5,4,4,5,5,4,5,4,9,140',
  '4,4,3,4,5,3,4,4,8,120',
  '5,5,5,5,5,5,5,5,10,35',
  '3,3,2,3,4,2,3,3,5,160',
  '5,5,4,5,5,4,5,5,10,110',
  '4,3,3,4,4,3,4,4,7,130',
  '5,5,5,5,5,5,5,5,10,40',
  '4,4,4,4,5,4,4,4,8,100',
  '5,4,5,5,5,4,5,5,9,150',
  '2,3,3,2,4,3,3,3,4,170',
  '5,5,5,4,5,5,5,5,10,90',
  '4,4,4,5,4,4,4,4,8,125',
].join('\n');

const card = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';
const input = 'min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15';
const ghostBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-800 transition hover:border-slate-400';
const redBtn = 'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-dk-red-strong px-5 text-sm font-bold text-white transition hover:bg-dk-red-deep';

function SurveyBuilder() {
  const t = useTranslations('mqForms.qonaqAnketi');
  const [name, setName] = useState('');
  const [copied, setCopied] = useState(false);
  const intro = name.trim() ? t('surveyIntro', { name: name.trim() }) : t('surveyIntroNoName');

  const plainText = [
    intro,
    `(${t('scaleNote')})`,
    '',
    ...SURVEY_QUESTIONS.map((q, i) => `${i + 1}. ${t(`questions.${q.id}`)}  1 2 3 4 5`),
    '',
    t('lowReason'),
    '',
    `9. ${t('npsQuestion')}  0 1 2 3 4 5 6 7 8 9 10`,
    `10. ${t('openBest')}`,
    `11. ${t('openFix')}`,
    '',
    t('thanks'),
  ].join('\n');

  async function copy() {
    try {
      await navigator.clipboard.writeText(plainText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard blocked — the text is visible on the page to copy by hand */
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <style jsx global>{`
        @media print {
          body * { visibility: hidden !important; }
          #qa-print, #qa-print * { visibility: visible !important; }
          #qa-print { position: absolute; inset: 0; border: 0 !important; box-shadow: none !important; }
        }
      `}</style>
      <div className={`${card} no-print`}>
        <label className="block max-w-md">
          <span className="mb-1.5 block text-sm font-bold text-slate-900">{t('restaurantName')}</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={60} placeholder={t('restaurantPlaceholder')} className={input} data-testid="qa-name" />
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => window.print()} className={redBtn} data-testid="qa-print">
            <Printer size={16} aria-hidden="true" />{t('print')}
          </button>
          <button type="button" onClick={copy} className={ghostBtn} data-testid="qa-copy">
            <Clipboard size={16} aria-hidden="true" />{copied ? t('copied') : t('copyText')}
          </button>
        </div>
      </div>

      <div id="qa-print" className={card} data-testid="qa-preview">
        <p className="text-base font-bold text-slate-900">{intro}</p>
        <p className="mt-1 text-xs text-slate-500">{t('scaleNote')}</p>
        <ol className="mt-4 space-y-3">
          {SURVEY_QUESTIONS.map((q, i) => (
            <li key={q.id} className="flex flex-col gap-1.5 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-sm text-slate-800">
                <span className="mr-1 font-bold">{i + 1}.</span>{t(`questions.${q.id}`)}
                <span className="ml-2 text-[10px] font-bold uppercase text-slate-400">{t(`groups.${q.group}`)}</span>
              </span>
              <span className="flex gap-1.5" aria-hidden="true">
                {[1, 2, 3, 4, 5].map((v) => (
                  <span key={v} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-xs font-bold text-slate-600">{v}</span>
                ))}
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-sm text-slate-700">{t('lowReason')}</p>
        <div className="mt-1 h-10 rounded-lg border border-dashed border-slate-300" />
        <p className="mt-4 text-sm font-semibold text-slate-800">9. {t('npsQuestion')}</p>
        <div className="mt-2 flex flex-wrap gap-1" aria-hidden="true">
          {Array.from({ length: 11 }, (_, v) => (
            <span key={v} className="grid h-8 w-8 place-items-center rounded-lg border border-slate-300 text-xs font-bold text-slate-600">{v}</span>
          ))}
        </div>
        <p className="mt-4 text-sm font-semibold text-slate-800">10. {t('openBest')}</p>
        <div className="mt-1 h-10 rounded-lg border border-dashed border-slate-300" />
        <p className="mt-3 text-sm font-semibold text-slate-800">11. {t('openFix')}</p>
        <div className="mt-1 h-10 rounded-lg border border-dashed border-slate-300" />
        <p className="mt-4 text-center text-sm font-bold text-slate-900">{t('thanks')}</p>
      </div>
    </div>
  );
}

function SurveyChecker() {
  const t = useTranslations('mqForms.qonaqAnketi');
  const locale = useLocale();
  const numberLocale = locale === 'az' ? AZ_NUMBER_LOCALE : locale === 'ru' ? 'ru-RU' : locale === 'tr' ? 'tr-TR' : 'en-US';
  const fmt = (v: number) => new Intl.NumberFormat(numberLocale, { maximumFractionDigits: 1 }).format(v);
  const [text, setText] = useState('');
  const [threshold, setThreshold] = useState(String(DEFAULT_PERFECT_WARN_PCT));
  const [submitted, setSubmitted] = useState<string | null>(null);

  const limit = Math.min(100, Math.max(1, Number(threshold) || DEFAULT_PERFECT_WARN_PCT));
  const parsed = useMemo(() => (submitted === null ? null : parseSurveyText(submitted)), [submitted]);
  const analysis: SurveyAnalysis | null = useMemo(
    () => (parsed && parsed.rows.length ? analyseSurvey(parsed.rows, { perfectWarnPct: limit }) : null),
    [limit, parsed],
  );

  return (
    <div className="mx-auto max-w-6xl space-y-5 px-4 py-6 sm:px-6">
      <div className={card}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-bold text-slate-900">{t('pasteLabel')}</span>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={8} placeholder={t('pastePlaceholder')}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-[#D63B54] focus:ring-2 focus:ring-[#D63B54]/15" data-testid="qa-paste" />
        </label>
        <label className="mt-3 block max-w-sm">
          <span className="mb-1.5 block text-sm font-bold text-slate-900">{t('perfectLabel')}</span>
          <input value={threshold} onChange={(e) => setThreshold(e.target.value)} inputMode="numeric" className={input} data-testid="qa-threshold" />
          <span className="mt-1 block text-xs leading-5 text-slate-500">{t('perfectHint')}</span>
        </label>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" onClick={() => setSubmitted(text)} className={redBtn} data-testid="qa-analyse">{t('analyse')}</button>
          <button type="button" onClick={() => { setText(SAMPLE); setSubmitted(SAMPLE); }} className={ghostBtn} data-testid="qa-sample">{t('loadSample')}</button>
          <button type="button" onClick={() => { setText(''); setSubmitted(null); }} className={ghostBtn}>{t('clear')}</button>
        </div>
        {parsed && parsed.skipped.length > 0 && (
          <p className="mt-3 text-xs font-semibold text-amber-800">{t('skipped', { lines: parsed.skipped.join(', ') })}</p>
        )}
      </div>

      {parsed && !analysis && <p className="rounded-xl bg-amber-50 p-4 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">{t('empty')}</p>}

      {analysis && (
        <div className="space-y-4" data-testid="qa-result">
          {!analysis.reliable && (
            <p className="rounded-xl bg-amber-50 p-3 text-sm font-semibold text-amber-800 ring-1 ring-amber-200">{t('notReliable', { min: MIN_RESPONSES })}</p>
          )}
          <div className="grid gap-3 sm:grid-cols-3">
            <div className={card}>
              <p className="text-xs font-bold uppercase text-slate-500">{t('responses')}</p>
              <p className="mt-1 text-2xl font-black text-slate-900" data-testid="qa-count">{analysis.responses}</p>
            </div>
            <div className={card}>
              <p className="text-xs font-bold uppercase text-slate-500">{t('overall')}</p>
              <p className="mt-1 text-2xl font-black text-slate-900" data-testid="qa-overall">{analysis.overall ?? '—'}%</p>
            </div>
            <div className={card}>
              <p className="text-xs font-bold uppercase text-slate-500">{t('nps')}</p>
              <p className="mt-1 text-2xl font-black text-slate-900" data-testid="qa-nps">{analysis.nps ?? '—'}</p>
              <p className="mt-1 text-xs text-slate-500">{t('npsHint', { promoters: analysis.promotersPct, detractors: analysis.detractorsPct })}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {SURVEY_GROUPS.map((g) => (
              <div key={g} className={card}>
                <p className="text-xs font-bold uppercase text-slate-500">{t(`groups.${g}`)}</p>
                <p className="mt-1 text-xl font-black text-slate-900">{analysis.groups[g] ?? '—'}%</p>
              </div>
            ))}
          </div>

          <div className={`${card} ${analysis.perfectWarning ? 'border-red-200 bg-red-50' : ''}`} data-testid="qa-perfect">
            <p className="text-xs font-bold uppercase text-slate-500">{t('perfect')}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{analysis.perfectPct}%</p>
            <p className={`mt-1 text-sm ${analysis.perfectWarning ? 'font-semibold text-red-700' : 'text-slate-600'}`}>
              {analysis.perfectWarning ? t('perfectWarn', { pct: analysis.perfectPct, limit }) : t('perfectOk', { limit })}
            </p>
          </div>

          <div className={`${card} ${analysis.rushedWarning ? 'border-amber-200 bg-amber-50' : ''}`}>
            <p className="text-xs font-bold uppercase text-slate-500">{t('rushed')}</p>
            <p className="mt-1 text-xl font-black text-slate-900">{analysis.rushedPct === null ? '—' : `${analysis.rushedPct}%`}</p>
            <p className="mt-1 text-sm text-slate-600">{analysis.rushedPct === null ? t('noTime') : analysis.rushedWarning ? t('rushedWarn') : ''}</p>
          </div>

          <div className={card}>
            <p className="mb-3 text-sm font-bold text-slate-900">{t('weakTitle')}</p>
            {analysis.weakQuestions.length === 0 ? (
              <p className="text-sm text-slate-600">{t('noWeak')}</p>
            ) : (
              <ul className="space-y-2">
                {analysis.weakQuestions.map((q) => (
                  <li key={q.id} className="border-l-4 border-amber-400 pl-3">
                    <p className="text-sm font-semibold text-slate-900">{t(`questions.${q.id}`)}</p>
                    <p className="text-xs text-slate-600">{t(`groups.${q.group}`)} · {t('weakItem', { pct: q.lowSharePct, avg: fmt(q.avg) })}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function QonaqAnketiPage({ initialTab = 'build', backHref = '/b2b-panel/marketinq-ocagi' }: { initialTab?: 'build' | 'check'; backHref?: string }) {
  const t = useTranslations('mqForms.qonaqAnketi');
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        <Link href={backHref} className="no-print inline-flex items-center gap-1.5 text-sm font-semibold text-slate-500 transition hover:text-slate-900">
          <ArrowLeft size={16} aria-hidden="true" />{t('back')}
        </Link>
        <div className="mt-3">
          <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold uppercase text-emerald-700">{t('tier')}</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">{t('subtitle')}</p>
        </div>
      </div>
      <ToolTabs
        label={t('tabsLabel')}
        initialTab={initialTab}
        tabs={[
          { key: 'build', label: t('tabBuild'), hint: t('tabBuildHint'), content: <SurveyBuilder /> },
          { key: 'check', label: t('tabCheck'), hint: t('tabCheckHint'), content: <SurveyChecker /> },
        ]}
      />
    </div>
  );
}
