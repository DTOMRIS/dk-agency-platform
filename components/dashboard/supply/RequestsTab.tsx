'use client';

/** TASK-0498 — Tələb lövhəsi: alıcı tələbləri + kateqoriya kəsişməsi ilə «Uyğun təchizatçılar». */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';
import {
  IMPORT_WINDOWS,
  REQUEST_STATUSES,
  REQUEST_TYPES,
  SUPPLY_CATEGORY_KEYS,
} from '@/lib/supply/categories';
import type { SupplyCopy } from '@/lib/supply/copy';

import type { RequestItem, RequestListResponse } from './types';
import {
  Avatar,
  CARD,
  CategoryBadges,
  FIELD,
  PILL_BTN,
  Pager,
  PhoneList,
  StatusSelect,
  categoryLabel,
  errorText,
} from './ui';

interface RequestFilterState {
  q: string;
  type: string;
  cat: string;
  status: string;
  months: string;
}

const EMPTY: RequestFilterState = { q: '', type: '', cat: '', status: '', months: '' };

export default function RequestsTab({
  copy,
  locale,
  refreshKey,
  onTablesMissing,
  onShowSuppliers,
}: {
  copy: SupplyCopy;
  locale: Locale;
  refreshKey: number;
  onTablesMissing: () => void;
  onShowSuppliers: (categories: string[]) => void;
}) {
  const [filters, setFilters] = useState<RequestFilterState>(EMPTY);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<RequestListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState<Set<number>>(new Set());
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => (prev.q === search ? prev : { ...prev, q: search }));
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => {
    const params = new URLSearchParams();
    if (filters.q.trim()) params.set('q', filters.q.trim());
    if (filters.type) params.set('type', filters.type);
    if (filters.cat) params.set('cat', filters.cat);
    if (filters.status) params.set('status', filters.status);
    if (filters.months) params.set('months', filters.months);
    if (page > 1) params.set('page', String(page));
    return params.toString();
  }, [filters, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/supply/requests?${query}`);
      const payload = (await response.json().catch(() => ({}))) as RequestListResponse & {
        error?: string;
      };
      if (!response.ok) {
        if (payload.error === 'tables_missing') onTablesMissing();
        setData(null);
        setError(
          payload.error === 'tables_missing'
            ? null
            : errorText(copy, payload.error, response.status)
        );
        return;
      }
      setData(payload);
    } catch {
      setError(copy.loadFailed);
    } finally {
      setLoading(false);
    }
  }, [query, copy, onTablesMissing]);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  function update(patch: Partial<RequestFilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  async function patchRequest(id: number, body: Record<string, unknown>): Promise<boolean> {
    setBusyId(id);
    try {
      const response = await fetch(`/api/dashboard/supply/requests/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        row?: { id: number; status: string; notes: string | null };
        error?: string;
      };
      if (!response.ok || !payload.row) {
        setError(errorText(copy, payload.error, response.status));
        return false;
      }
      const row = payload.row;
      setData((prev) =>
        prev
          ? {
              ...prev,
              rows: prev.rows.map((r) =>
                r.id === id ? { ...r, status: row.status, notes: row.notes } : r
              ),
            }
          : prev
      );
      return true;
    } catch {
      setError(copy.saveFailed);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  function toggle(id: number) {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const hasFilters = Boolean(
    filters.q || filters.type || filters.cat || filters.status || filters.months
  );

  return (
    <div className="space-y-4">
      <div className={`${CARD} flex flex-wrap items-center gap-2 p-4 sm:p-5`}>
        <label className="relative min-w-0 flex-1 basis-[220px]">
          <span className="sr-only">{copy.searchRequests}</span>
          <Search
            size={16}
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
            aria-hidden="true"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={copy.searchRequests}
            className={`${FIELD} w-full pl-10 placeholder:text-slate-500`}
          />
        </label>
        <select
          aria-label={copy.filterType}
          value={filters.type}
          onChange={(e) => update({ type: e.target.value })}
          className={FIELD}
        >
          <option value="">{copy.allTypes}</option>
          {REQUEST_TYPES.map((type) => (
            <option key={type} value={type}>
              {copy.requestTypes[type]}
            </option>
          ))}
        </select>
        <select
          aria-label={copy.filterCategory}
          value={filters.cat}
          onChange={(e) => update({ cat: e.target.value })}
          className={FIELD}
        >
          <option value="">{copy.allCategories}</option>
          {SUPPLY_CATEGORY_KEYS.map((key) => (
            <option key={key} value={key}>
              {categoryLabel(key, locale)}
            </option>
          ))}
        </select>
        <select
          aria-label={copy.filterStatus}
          value={filters.status}
          onChange={(e) => update({ status: e.target.value })}
          className={FIELD}
        >
          <option value="">{copy.allStatuses}</option>
          {REQUEST_STATUSES.map((status) => (
            <option key={status} value={status}>
              {copy.requestStatuses[status]}
            </option>
          ))}
        </select>
        <select
          aria-label={copy.filterDate}
          value={filters.months}
          onChange={(e) => update({ months: e.target.value })}
          className={FIELD}
        >
          <option value="">{copy.anyTime}</option>
          {IMPORT_WINDOWS.map((m) => (
            <option key={m} value={String(m)}>
              {copy.lastMonths(m)}
            </option>
          ))}
        </select>
        {data ? (
          <span className="rounded-full bg-[#F2F2F7] px-3 py-1.5 text-[12px] font-semibold text-slate-900">
            {copy.resultsCount(data.total)}
          </span>
        ) : null}
      </div>

      {error ? (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      {loading && !data ? (
        <div className={`${CARD} px-5 py-10 text-center text-[14px] text-slate-700`}>
          {copy.loading}
        </div>
      ) : null}
      {data && data.rows.length === 0 ? (
        <div className={`${CARD} px-5 py-10 text-center text-[14px] text-slate-700`}>
          {hasFilters ? copy.emptyRequests : copy.emptyRequestsAll}
        </div>
      ) : null}

      <ul className="space-y-3" data-testid="supply-requests-list">
        {data?.rows.map((row) => (
          <RequestCard
            key={row.id}
            row={row}
            copy={copy}
            locale={locale}
            expanded={open.has(row.id)}
            busy={busyId === row.id}
            onToggle={() => toggle(row.id)}
            onPatch={(body) => patchRequest(row.id, body)}
            onShowSuppliers={onShowSuppliers}
          />
        ))}
      </ul>

      <Pager page={page} pages={pages} copy={copy} onPage={setPage} />
    </div>
  );
}

function RequestCard({
  row,
  copy,
  locale,
  expanded,
  busy,
  onToggle,
  onPatch,
  onShowSuppliers,
}: {
  row: RequestItem;
  copy: SupplyCopy;
  locale: Locale;
  expanded: boolean;
  busy: boolean;
  onToggle: () => void;
  onPatch: (body: Record<string, unknown>) => Promise<boolean>;
  onShowSuppliers: (categories: string[]) => void;
}) {
  const [notes, setNotes] = useState(row.notes ?? '');
  const [noteSaved, setNoteSaved] = useState(false);
  const statusOptions: Array<[string, string]> = REQUEST_STATUSES.map((s) => [
    s,
    copy.requestStatuses[s],
  ]);
  const typeLabel =
    copy.requestTypes[row.requestType as keyof SupplyCopy['requestTypes']] ?? row.requestType;

  async function saveNotes() {
    if ((row.notes ?? '') === notes.trim()) return;
    const ok = await onPatch({ notes: notes.trim() || null });
    setNoteSaved(ok);
  }

  return (
    <li className={`${CARD} p-4 sm:p-5`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <Avatar name={row.requesterName} />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-slate-900">{row.requesterName}</span>
              <span className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-semibold text-violet-800">
                {typeLabel}
              </span>
            </div>
            <div className="text-[12px] font-medium text-slate-700">
              {formatAzDate(row.postedAt)} · {row.sourceGroup}
            </div>
          </div>
        </div>
        <StatusSelect
          value={row.status}
          options={statusOptions}
          label={`${copy.colStatus}: ${row.requesterName}`}
          disabled={busy}
          onChange={(value) => void onPatch({ status: value })}
        />
      </div>

      <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-relaxed text-slate-900">
        {row.text}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <CategoryBadges keys={row.categories} locale={locale} />
        {row.phones.length ? <PhoneList phones={row.phones} copy={copy} /> : null}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3">
        <button
          type="button"
          aria-expanded={expanded}
          onClick={onToggle}
          className={`${PILL_BTN} h-9 ${
            row.matchCount > 0
              ? 'bg-emerald-50 text-emerald-900 hover:bg-emerald-100'
              : 'bg-[#F2F2F7] text-slate-800'
          }`}
        >
          {copy.matchesButton(row.matchCount)}
          {expanded ? (
            <ChevronUp size={14} aria-hidden="true" />
          ) : (
            <ChevronDown size={14} aria-hidden="true" />
          )}
        </button>
        <label className="min-w-0 flex-1 basis-[240px]">
          <span className="sr-only">{copy.notes}</span>
          <input
            value={notes}
            maxLength={4000}
            onChange={(event) => {
              setNotes(event.target.value);
              setNoteSaved(false);
            }}
            onBlur={() => void saveNotes()}
            placeholder={copy.notesPlaceholder}
            className={`${FIELD} h-9 w-full placeholder:text-slate-500`}
          />
        </label>
        {noteSaved ? (
          <span className="text-[12px] font-semibold text-emerald-700">{copy.notesSaved}</span>
        ) : null}
      </div>

      {expanded ? (
        <div className="mt-3 rounded-[16px] bg-[#F7F7FA] p-3">
          {row.categories.length === 0 ? (
            <p className="text-[13px] text-slate-700">{copy.noCategories}</p>
          ) : row.matches.length === 0 ? (
            <p className="text-[13px] text-slate-700">{copy.noMatches}</p>
          ) : (
            <>
              <ul className="divide-y divide-slate-200/70">
                {row.matches.map((match) => (
                  <li
                    key={match.id}
                    className="flex flex-wrap items-start justify-between gap-3 py-2"
                  >
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900">{match.displayName}</div>
                      <div className="mt-1">
                        <CategoryBadges keys={match.categories} locale={locale} />
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <PhoneList phones={match.phones} copy={copy} />
                      <span className="text-[11px] font-medium text-slate-700">
                        {copy.colLastSeen}: {formatAzDate(match.lastSeen)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
              {row.matchCount > row.matches.length ? (
                <button
                  type="button"
                  onClick={() => onShowSuppliers(row.categories)}
                  className="mt-2 text-[13px] font-semibold text-[#0A5BD6] hover:underline"
                >
                  {copy.showInSuppliers} ({row.matchCount})
                </button>
              ) : null}
            </>
          )}
        </div>
      ) : null}
    </li>
  );
}
