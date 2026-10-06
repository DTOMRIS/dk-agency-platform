'use client';

/**
 * TASK-0498 — «WhatsApp-dan idxal»: fayl → Təhlil et (preview, yazmır) → İdxal et.
 * Böyük ZIP-dən (şəkil/səs ilə yüzlərlə MB) `_chat.txt` brauzerdə çıxarılır,
 * serverə yalnız mətn göndərilir.
 */

import { useRef, useState } from 'react';
import { FileUp, Loader2, ShieldCheck } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';
import {
  IMPORT_WINDOWS,
  SUPPLY_CATEGORY_KEYS,
  groupNameFromFileName,
} from '@/lib/supply/categories';
import type { SupplyCopy } from '@/lib/supply/copy';
import { canExtractInBrowser, extractChatFromZipFile } from '@/lib/supply/zip-client';

import type { ImportSummary } from './types';
import { CARD, CategoryBadges, FIELD, PILL_BTN, categoryLabel, errorText } from './ui';

const SERVER_ZIP_LIMIT = 25 * 1024 * 1024;

function isZip(file: File): boolean {
  return /\.zip$/i.test(file.name) || file.type === 'application/zip';
}

export default function ImportPanel({
  copy,
  locale,
  onImported,
}: {
  copy: SupplyCopy;
  locale: Locale;
  onImported: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [group, setGroup] = useState('');
  const [months, setMonths] = useState<number>(6);
  const [phase, setPhase] = useState<'idle' | 'extracting' | 'analysing' | 'importing'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [done, setDone] = useState<string | null>(null);

  function pickFile(next: File | null) {
    setFile(next);
    setSummary(null);
    setDone(null);
    setError(null);
    if (next) setGroup(groupNameFromFileName(next.name));
  }

  /** Göndəriləcək faylı hazırlayır: ZIP-i mümkünsə brauzerdə `_chat.txt`-yə çevirir. */
  async function payloadFile(source: File): Promise<File> {
    if (!isZip(source)) return source;
    if (!canExtractInBrowser()) {
      if (source.size > SERVER_ZIP_LIMIT) throw new Error('zip_too_large');
      return source;
    }
    setPhase('extracting');
    try {
      const text = await extractChatFromZipFile(source);
      return new File([text], '_chat.txt', { type: 'text/plain' });
    } catch (zipError) {
      const code =
        zipError instanceof Error && zipError.message ? `zip_${zipError.message}` : 'zip_not_zip';
      throw new Error(code === 'zip_too_large' ? 'text_too_large' : code);
    }
  }

  async function send(mode: 'preview' | 'commit') {
    if (!file) {
      setError(copy.errors.file_required);
      return;
    }
    setError(null);
    setDone(null);
    try {
      const upload = await payloadFile(file);
      setPhase(mode === 'preview' ? 'analysing' : 'importing');
      const form = new FormData();
      form.set('file', upload);
      form.set('months', String(months));
      form.set('group', group.trim() || groupNameFromFileName(file.name));
      form.set('mode', mode);
      const response = await fetch('/api/dashboard/supply/import', { method: 'POST', body: form });
      const payload = (await response.json().catch(() => ({}))) as ImportSummary & {
        error?: string;
      };
      if (!response.ok) {
        setError(errorText(copy, payload.error, response.status));
        return;
      }
      setSummary(payload);
      if (mode === 'commit' && payload.result) {
        setDone(copy.importDone(payload.result));
        onImported();
      }
    } catch (sendError) {
      const code = sendError instanceof Error ? sendError.message : undefined;
      setError(errorText(copy, code));
    } finally {
      setPhase('idle');
    }
  }

  const busy = phase !== 'idle';
  const db = summary?.db;
  const canImport = Boolean(summary) && db?.state === 'ready' && !busy && !done;
  const relevantClasses = summary?.classCounts ?? [];

  return (
    <section className={`${CARD} p-5 sm:p-6`} aria-labelledby="supply-import-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 max-w-3xl">
          <h2
            id="supply-import-title"
            className="text-[20px] font-bold tracking-tight text-slate-900"
          >
            {copy.importTitle}
          </h2>
          <p className="mt-1 text-[14px] leading-relaxed text-slate-700">{copy.importIntro}</p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-semibold text-emerald-800">
          <ShieldCheck size={14} aria-hidden="true" />
          {copy.previewNoWrite}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto]">
        <div className="min-w-0">
          <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            {copy.fileLabel}
          </span>
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              className={`${PILL_BTN} bg-[#EEF4FF] text-[#0A4FB8] hover:bg-[#E0EBFF]`}
            >
              <FileUp size={16} aria-hidden="true" />
              {copy.chooseFile}
            </button>
            <span className="min-w-0 truncate text-[13px] font-medium text-slate-800">
              {file
                ? copy.fileSelected(file.name, (file.size / 1024 / 1024).toFixed(1))
                : copy.noFile}
            </span>
            <input
              ref={inputRef}
              type="file"
              accept=".zip,.txt,application/zip,text/plain"
              className="sr-only"
              aria-label={copy.fileLabel}
              data-testid="supply-file"
              onChange={(event) => pickFile(event.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        <label className="min-w-0">
          <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            {copy.groupLabel}
          </span>
          <input
            value={group}
            maxLength={120}
            onChange={(event) => setGroup(event.target.value)}
            placeholder={copy.groupPlaceholder}
            className={`${FIELD} w-full placeholder:text-slate-500`}
          />
        </label>
        <div>
          <span className="mb-1.5 block text-[12px] font-semibold text-slate-700">
            {copy.windowLabel}
          </span>
          <div className="flex flex-wrap gap-1 rounded-full bg-[#F2F2F7] p-1">
            {IMPORT_WINDOWS.map((value) => (
              <button
                key={value}
                type="button"
                aria-pressed={months === value}
                onClick={() => {
                  setMonths(value);
                  setSummary(null);
                  setDone(null);
                }}
                className={`h-8 whitespace-nowrap rounded-full px-3 text-[12px] font-semibold transition-colors ${
                  months === value
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {copy.windowOption(value)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => void send('preview')}
          disabled={busy || !file}
          className={`${PILL_BTN} bg-slate-900 text-white hover:bg-slate-800`}
        >
          {phase === 'analysing' || phase === 'extracting' ? (
            <Loader2 size={16} className="animate-spin" />
          ) : null}
          {phase === 'extracting'
            ? copy.zipExtracting
            : phase === 'analysing'
              ? copy.analysing
              : copy.analyse}
        </button>
        <button
          type="button"
          onClick={() => void send('commit')}
          disabled={!canImport}
          className={`${PILL_BTN} bg-[#E11D48] text-white hover:bg-[#BE123C]`}
        >
          {phase === 'importing' ? <Loader2 size={16} className="animate-spin" /> : null}
          {phase === 'importing' ? copy.importing : copy.importButton}
        </button>
        <span className="text-[12px] font-medium text-slate-700">{copy.reimportNote}</span>
      </div>

      {error ? (
        <div className="mt-4 rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-800">
          {error}
        </div>
      ) : null}
      {done ? (
        <div className="mt-4 rounded-[16px] border border-emerald-200 bg-emerald-50 px-4 py-3 text-[14px] font-medium text-emerald-800">
          {done}
        </div>
      ) : null}

      {summary ? (
        <div className="mt-6 space-y-5" data-testid="supply-preview">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[17px] font-bold text-slate-900">
              {copy.previewTitle}
              {summary.group ? (
                <span className="font-medium text-slate-700"> · {summary.group}</span>
              ) : null}
            </h3>
            {summary.firstDate && summary.lastDate ? (
              <span className="text-[13px] font-medium text-slate-700">
                {copy.period(formatAzDate(summary.since), formatAzDate(summary.lastDate))}
              </span>
            ) : null}
          </div>

          {db?.state === 'tables_missing' ? (
            <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900">
              {copy.dbStateTablesMissing}
            </div>
          ) : null}
          {db?.state === 'unavailable' ? (
            <div className="rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900">
              {copy.dbStateUnavailable}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label={copy.statMessages} value={summary.messagesInWindow} />
            <Stat
              label={copy.statSuppliers}
              value={summary.suppliers.total}
              hint={
                db?.state === 'ready'
                  ? copy.newVsExisting(db.newSuppliers, db.existingSuppliers)
                  : copy.withPhone(summary.suppliers.withPhone)
              }
            />
            <Stat
              label={copy.statRequests}
              value={summary.requests.total}
              hint={
                db?.state === 'ready'
                  ? copy.newVsExisting(db.newRequests, db.existingRequests)
                  : undefined
              }
            />
            <Stat label={copy.statOffers} value={summary.suppliers.offers} />
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 overflow-x-auto rounded-[18px] ring-1 ring-slate-200">
              <table className="w-full min-w-[320px] text-left text-[13px]">
                <caption className="px-4 pt-3 text-left text-[13px] font-bold text-slate-900">
                  {copy.classTableTitle}
                </caption>
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-700">
                    <th className="px-4 py-2 font-semibold">{copy.colClass}</th>
                    <th className="px-4 py-2 text-right font-semibold">{copy.colMessages}</th>
                    <th className="px-4 py-2 text-right font-semibold">{copy.colUnique}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {relevantClasses.map((row) => (
                    <tr key={row.cls}>
                      <td className="px-4 py-1.5 font-medium text-slate-900">
                        {copy.classLabels[row.cls] ?? row.cls}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-slate-800">
                        {row.messages}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-slate-800">
                        {row.unique}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-[18px] ring-1 ring-slate-200">
              <table className="w-full min-w-[320px] text-left text-[13px]">
                <caption className="px-4 pt-3 text-left text-[13px] font-bold text-slate-900">
                  {copy.categoriesTitle}
                </caption>
                <thead>
                  <tr className="text-[11px] uppercase tracking-wide text-slate-700">
                    <th className="px-4 py-2 font-semibold">{copy.colCategories}</th>
                    <th className="px-4 py-2 text-right font-semibold">{copy.colSuppliers}</th>
                    <th className="px-4 py-2 text-right font-semibold">{copy.colRequests}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {SUPPLY_CATEGORY_KEYS.map((key) => (
                    <tr key={key}>
                      <td className="px-4 py-1.5 font-medium text-slate-900">
                        {categoryLabel(key, locale)}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-slate-800">
                        {summary.suppliers.categories[key] ?? 0}
                      </td>
                      <td className="px-4 py-1.5 text-right tabular-nums text-slate-800">
                        {summary.requests.categories[key] ?? 0}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 overflow-x-auto rounded-[18px] ring-1 ring-slate-200">
              <table className="w-full min-w-[440px] text-left text-[13px]">
                <caption className="px-4 pt-3 text-left text-[13px] font-bold text-slate-900">
                  {copy.sampleSuppliers}
                </caption>
                <tbody className="divide-y divide-slate-100">
                  {summary.suppliers.sample.map((row, index) => (
                    <tr key={`${row.displayName}-${index}`} className="align-top">
                      <td className="min-w-[180px] px-4 py-2">
                        <div className="font-semibold text-slate-900">{row.displayName}</div>
                        <div className="text-[12px] text-slate-700">
                          {copy.postsCount(row.posts)} · {copy.phonesCount(row.phones)}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <CategoryBadges keys={row.categories} locale={locale} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-[12px] tabular-nums text-slate-700">
                        {formatAzDate(row.lastSeen)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="min-w-0 overflow-x-auto rounded-[18px] ring-1 ring-slate-200">
              <table className="w-full min-w-[440px] text-left text-[13px]">
                <caption className="px-4 pt-3 text-left text-[13px] font-bold text-slate-900">
                  {copy.sampleRequests}
                </caption>
                <tbody className="divide-y divide-slate-100">
                  {summary.requests.sample.map((row, index) => (
                    <tr key={`${row.requesterName}-${index}`} className="align-top">
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-semibold text-slate-900">{row.requesterName}</span>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-800">
                            {copy.requestTypes[
                              row.requestType as keyof SupplyCopy['requestTypes']
                            ] ?? row.requestType}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-2 text-[12px] text-slate-700">{row.text}</p>
                      </td>
                      <td className="whitespace-nowrap px-4 py-2 text-right text-[12px] tabular-nums text-slate-700">
                        {formatAzDate(row.postedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function Stat({ label, value, hint }: { label: string; value: number; hint?: string }) {
  return (
    <div className="rounded-[18px] bg-[#F7F7FA] p-4">
      <p className="text-[13px] font-medium text-slate-700">{label}</p>
      <p className="mt-2 text-[28px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">
        {value}
      </p>
      {hint ? <p className="mt-1.5 text-[12px] font-medium text-slate-700">{hint}</p> : null}
    </div>
  );
}
