'use client';

/** TASK-0498 — Təchizatçılar: axtarış, filtrlər, cədvəl, status/razılıq, ətraflı panel, CSV. */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ChevronRight, Download, Search, X } from 'lucide-react';

import type { Locale } from '@/i18n/config';
import { formatAzDate } from '@/lib/i18n/format';
import { IMPORT_WINDOWS, SUPPLIER_STATUSES, SUPPLY_CATEGORY_KEYS } from '@/lib/supply/categories';
import type { SupplyCopy } from '@/lib/supply/copy';

import type { SupplierItem, SupplierListResponse } from './types';
import {
  Avatar,
  CARD,
  CategoryBadges,
  ConsentSwitch,
  FIELD,
  PILL_BTN,
  Pager,
  PhoneList,
  StatusSelect,
  categoryLabel,
  errorText,
} from './ui';

export interface SupplierFilterState {
  q: string;
  categories: string[];
  status: string;
  active: string;
  phone: boolean;
  group: string;
  sort: 'lastSeen' | 'postCount';
}

export const EMPTY_SUPPLIER_FILTERS: SupplierFilterState = {
  q: '',
  categories: [],
  status: '',
  active: '',
  phone: false,
  group: '',
  sort: 'lastSeen',
};

function toQuery(filters: SupplierFilterState, page: number): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set('q', filters.q.trim());
  if (filters.categories.length) params.set('cat', filters.categories.join(','));
  if (filters.status) params.set('status', filters.status);
  if (filters.active) params.set('active', filters.active);
  if (filters.phone) params.set('phone', '1');
  if (filters.group) params.set('group', filters.group);
  if (filters.sort !== 'lastSeen') params.set('sort', filters.sort);
  if (page > 1) params.set('page', String(page));
  return params;
}

export default function SuppliersTab({
  copy,
  locale,
  initialFilters,
  refreshKey,
  onTablesMissing,
}: {
  copy: SupplyCopy;
  locale: Locale;
  initialFilters: SupplierFilterState;
  refreshKey: number;
  onTablesMissing: () => void;
}) {
  const [filters, setFilters] = useState<SupplierFilterState>(initialFilters);
  const [search, setSearch] = useState(initialFilters.q);
  const [page, setPage] = useState(1);
  const [data, setData] = useState<SupplierListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<SupplierItem | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null);

  useEffect(() => {
    setFilters(initialFilters);
    setSearch(initialFilters.q);
    setPage(1);
  }, [initialFilters]);

  // Axtarış yazılarkən hər hərfə sorğu getməsin.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFilters((prev) => (prev.q === search ? prev : { ...prev, q: search }));
      setPage(1);
    }, 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  const query = useMemo(() => toQuery(filters, page), [filters, page]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/dashboard/supply/suppliers?${query.toString()}`);
      const payload = (await response.json().catch(() => ({}))) as SupplierListResponse & {
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

  function update(patch: Partial<SupplierFilterState>) {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }

  function toggleCategory(key: string) {
    update({
      categories: filters.categories.includes(key)
        ? filters.categories.filter((c) => c !== key)
        : [...filters.categories, key],
    });
  }

  async function patchSupplier(id: number, body: Record<string, unknown>): Promise<boolean> {
    setBusyId(id);
    try {
      const response = await fetch(`/api/dashboard/supply/suppliers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        row?: SupplierItem;
        error?: string;
      };
      if (!response.ok || !payload.row) {
        setError(errorText(copy, payload.error, response.status));
        return false;
      }
      const row = payload.row;
      setData((prev) =>
        prev ? { ...prev, rows: prev.rows.map((r) => (r.id === id ? { ...r, ...row } : r)) } : prev
      );
      setSelected((prev) => (prev && prev.id === id ? { ...prev, ...row } : prev));
      return true;
    } catch {
      setError(copy.saveFailed);
      return false;
    } finally {
      setBusyId(null);
    }
  }

  const pages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;
  const statusOptions: Array<[string, string]> = SUPPLIER_STATUSES.map((s) => [
    s,
    copy.supplierStatuses[s],
  ]);
  const csvParams = toQuery(filters, 1);
  csvParams.set('format', 'csv');
  const hasFilters =
    Boolean(
      filters.q ||
      filters.categories.length ||
      filters.status ||
      filters.active ||
      filters.phone ||
      filters.group
    ) || filters.sort !== 'lastSeen';

  return (
    <div className="space-y-4">
      <div className={`${CARD} space-y-4 p-4 sm:p-5`}>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative min-w-0 flex-1 basis-[220px]">
            <span className="sr-only">{copy.searchSuppliers}</span>
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
              aria-hidden="true"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={copy.searchSuppliers}
              className={`${FIELD} w-full pl-10 placeholder:text-slate-500`}
            />
          </label>
          <select
            aria-label={copy.filterStatus}
            value={filters.status}
            onChange={(event) => update({ status: event.target.value })}
            className={FIELD}
          >
            <option value="">{copy.allStatuses}</option>
            {statusOptions.map(([key, text]) => (
              <option key={key} value={key}>
                {text}
              </option>
            ))}
          </select>
          <select
            aria-label={copy.filterActivity}
            value={filters.active}
            onChange={(event) => update({ active: event.target.value })}
            className={FIELD}
          >
            <option value="">{copy.anyTime}</option>
            {IMPORT_WINDOWS.map((m) => (
              <option key={m} value={String(m)}>
                {copy.lastMonths(m)}
              </option>
            ))}
          </select>
          <select
            aria-label={copy.filterGroup}
            value={filters.group}
            onChange={(event) => update({ group: event.target.value })}
            className={`${FIELD} max-w-[220px]`}
          >
            <option value="">{copy.allGroups}</option>
            {(data?.groups ?? []).map((group) => (
              <option key={group} value={group}>
                {group}
              </option>
            ))}
          </select>
          <select
            aria-label={copy.sortLabel}
            value={filters.sort}
            onChange={(event) =>
              update({ sort: event.target.value === 'postCount' ? 'postCount' : 'lastSeen' })
            }
            className={FIELD}
          >
            <option value="lastSeen">{copy.sortLastSeen}</option>
            <option value="postCount">{copy.sortPosts}</option>
          </select>
          <button
            type="button"
            aria-pressed={filters.phone}
            onClick={() => update({ phone: !filters.phone })}
            className={`${PILL_BTN} ${
              filters.phone
                ? 'bg-[#EEF4FF] text-[#0A4FB8] ring-1 ring-[#0A7AFF]/30'
                : 'bg-white text-slate-800 ring-1 ring-slate-200'
            }`}
          >
            {copy.hasPhone}
          </button>
        </div>

        <div>
          <span className="mb-2 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
            {copy.filterCategory}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {SUPPLY_CATEGORY_KEYS.map((key) => {
              const active = filters.categories.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => toggleCategory(key)}
                  className={`h-8 rounded-full px-3 text-[12px] font-semibold transition-colors ${
                    active
                      ? 'bg-slate-900 text-white'
                      : 'bg-[#F2F2F7] text-slate-800 hover:bg-slate-200'
                  }`}
                >
                  {categoryLabel(key, locale)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3">
          <div className="flex flex-wrap gap-2 text-[12px] font-semibold">
            {data ? (
              <>
                <span className="rounded-full bg-[#F2F2F7] px-3 py-1 text-slate-900">
                  {copy.summaryTotal(data.summary.total)}
                </span>
                <span className="rounded-full bg-[#F2F2F7] px-3 py-1 text-slate-900">
                  {copy.summaryWithPhone(data.summary.withPhone)}
                </span>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-800">
                  {copy.summaryConsented(data.summary.consented)}
                </span>
                {hasFilters ? (
                  <span className="rounded-full bg-[#EEF4FF] px-3 py-1 text-[#0A4FB8]">
                    {copy.resultsCount(data.total)}
                  </span>
                ) : null}
              </>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {hasFilters ? (
              <button
                type="button"
                onClick={() => {
                  setSearch('');
                  setFilters(EMPTY_SUPPLIER_FILTERS);
                  setPage(1);
                }}
                className={`${PILL_BTN} h-9 bg-white text-slate-800 ring-1 ring-slate-200 hover:bg-slate-50`}
              >
                <X size={14} aria-hidden="true" />
                {copy.clearFilters}
              </button>
            ) : null}
            <a
              href={`/api/dashboard/supply/suppliers?${csvParams.toString()}`}
              download
              className={`${PILL_BTN} h-9 bg-slate-900 text-white hover:bg-slate-800`}
            >
              <Download size={14} aria-hidden="true" />
              {copy.exportCsv}
            </a>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-[16px] border border-rose-200 bg-rose-50 px-4 py-3 text-[14px] font-medium text-rose-800">
          {error}
        </div>
      ) : null}

      <div className={`${CARD} min-w-0 overflow-hidden`}>
        <div className="relative min-w-0 overflow-x-auto">
          <table
            className="w-full min-w-[980px] text-left text-[13px]"
            data-testid="supply-suppliers-table"
          >
            <thead className="bg-[#FAFAFC]">
              <tr className="text-[11px] uppercase tracking-wide text-slate-700">
                <th className="px-5 py-3 font-semibold">{copy.colSupplier}</th>
                <th className="px-3 py-3 font-semibold">{copy.colCategories}</th>
                <th className="px-3 py-3 font-semibold">{copy.colPhones}</th>
                <th className="px-3 py-3 font-semibold">{copy.colLastSeen}</th>
                <th className="px-3 py-3 text-right font-semibold">{copy.colPosts}</th>
                <th className="px-3 py-3 font-semibold">{copy.colStatus}</th>
                <th className="px-3 py-3 font-semibold">{copy.colConsent}</th>
                <th className="py-3 pl-1 pr-4">
                  <span className="sr-only">{copy.details}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && !data ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[14px] text-slate-700">
                    {copy.loading}
                  </td>
                </tr>
              ) : null}
              {data && data.rows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-[14px] text-slate-700">
                    {hasFilters ? copy.emptySuppliers : copy.emptySuppliersAll}
                  </td>
                </tr>
              ) : null}
              {data?.rows.map((row) => (
                <tr key={row.id} className="align-top hover:bg-[#FAFAFC]">
                  <td className="px-5 py-3">
                    <div className="flex items-start gap-3">
                      <Avatar name={row.displayName} />
                      <div className="min-w-0">
                        <div className="max-w-[220px] truncate font-semibold text-slate-900">
                          {row.displayName}
                        </div>
                        {row.company ? (
                          <div className="max-w-[220px] truncate text-[12px] text-slate-700">
                            {row.company}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </td>
                  <td className="min-w-[170px] max-w-[230px] px-3 py-3">
                    <CategoryBadges keys={row.categories} locale={locale} />
                  </td>
                  <td className="px-3 py-3">
                    <PhoneList phones={row.phones} copy={copy} />
                  </td>
                  <td className="whitespace-nowrap px-3 py-3 tabular-nums text-slate-800">
                    {formatAzDate(row.lastSeen)}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold text-slate-900">
                    {row.postCount}
                  </td>
                  <td className="px-3 py-3">
                    <StatusSelect
                      value={row.status}
                      options={statusOptions}
                      label={`${copy.colStatus}: ${row.displayName}`}
                      disabled={busyId === row.id}
                      onChange={(value) => void patchSupplier(row.id, { status: value })}
                    />
                  </td>
                  <td className="px-3 py-3">
                    <ConsentSwitch
                      checked={row.publicConsent}
                      label={`${copy.consentLabel}: ${row.displayName}`}
                      onText={copy.consentOn}
                      offText={copy.consentOff}
                      disabled={busyId === row.id}
                      onChange={(value) => void patchSupplier(row.id, { publicConsent: value })}
                    />
                  </td>
                  <td className="py-3 pl-1 pr-4 text-right">
                    <button
                      type="button"
                      onClick={() => setSelected(row)}
                      aria-label={`${copy.details}: ${row.displayName}`}
                      title={copy.details}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-slate-900 hover:bg-slate-200"
                    >
                      <ChevronRight size={16} aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Pager page={page} pages={pages} copy={copy} onPage={setPage} />

      {selected ? (
        <SupplierDrawer
          key={selected.id}
          supplier={selected}
          copy={copy}
          locale={locale}
          busy={busyId === selected.id}
          onClose={() => setSelected(null)}
          onSave={(body) => patchSupplier(selected.id, body)}
        />
      ) : null}
    </div>
  );
}

function SupplierDrawer({
  supplier,
  copy,
  locale,
  busy,
  onClose,
  onSave,
}: {
  supplier: SupplierItem;
  copy: SupplyCopy;
  locale: Locale;
  busy: boolean;
  onClose: () => void;
  onSave: (body: Record<string, unknown>) => Promise<boolean>;
}) {
  const [company, setCompany] = useState(supplier.company ?? '');
  const [notes, setNotes] = useState(supplier.notes ?? '');
  const [saved, setSaved] = useState<boolean | null>(null);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function save() {
    setSaved(null);
    const ok = await onSave({ company: company.trim() || null, notes: notes.trim() || null });
    setSaved(ok);
  }

  const statusOptions: Array<[string, string]> = SUPPLIER_STATUSES.map((s) => [
    s,
    copy.supplierStatuses[s],
  ]);

  return (
    <div
      className="fixed inset-0 z-[60] flex justify-end"
      role="dialog"
      aria-modal="true"
      aria-labelledby="supplier-drawer-title"
    >
      <button
        type="button"
        aria-label={copy.close}
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30"
      />
      <aside className="relative flex h-full w-full max-w-[520px] flex-col bg-white shadow-2xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar name={supplier.displayName} />
            <div className="min-w-0">
              <h2
                id="supplier-drawer-title"
                className="truncate text-[18px] font-bold text-slate-900"
              >
                {supplier.displayName}
              </h2>
              <p className="text-[12px] font-medium text-slate-700">
                {copy.firstSeen}: {formatAzDate(supplier.firstSeen)} · {copy.colLastSeen}:{' '}
                {formatAzDate(supplier.lastSeen)} · {copy.postsCount(supplier.postCount)}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={copy.close}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F2F2F7] text-slate-900 hover:bg-slate-200"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </header>

        <div className="flex-1 space-y-5 overflow-y-auto px-5 py-5">
          <div className="flex flex-wrap items-center gap-3">
            <StatusSelect
              value={supplier.status}
              options={statusOptions}
              label={copy.colStatus}
              disabled={busy}
              onChange={(value) => void onSave({ status: value })}
            />
            <ConsentSwitch
              checked={supplier.publicConsent}
              label={copy.consentLabel}
              onText={copy.consentOn}
              offText={copy.consentOff}
              disabled={busy}
              onChange={(value) => void onSave({ publicConsent: value })}
            />
          </div>

          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.colPhones}
            </h3>
            <PhoneList phones={supplier.phones} copy={copy} />
          </section>
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.colCategories}
            </h3>
            <CategoryBadges keys={supplier.categories} locale={locale} />
          </section>
          <section>
            <h3 className="mb-1.5 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.sourceGroups}
            </h3>
            <p className="text-[13px] text-slate-800">{supplier.sourceGroups.join(' · ')}</p>
          </section>

          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.company}
            </span>
            <input
              value={company}
              maxLength={200}
              onChange={(event) => setCompany(event.target.value)}
              placeholder={copy.companyPlaceholder}
              className={`${FIELD} w-full placeholder:text-slate-500`}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.notes}
            </span>
            <textarea
              value={notes}
              maxLength={4000}
              rows={4}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={copy.notesPlaceholder}
              className="w-full rounded-[16px] border border-slate-200 bg-white px-4 py-3 text-[13px] text-slate-900 outline-none placeholder:text-slate-500 focus:border-[#0A7AFF] focus:ring-2 focus:ring-[#0A7AFF]/20"
            />
          </label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={busy}
              onClick={() => void save()}
              className={`${PILL_BTN} bg-slate-900 text-white hover:bg-slate-800`}
            >
              {busy ? copy.saving : copy.save}
            </button>
            {saved === true ? (
              <span className="text-[13px] font-semibold text-emerald-700">{copy.saved}</span>
            ) : null}
            {saved === false ? (
              <span className="text-[13px] font-semibold text-rose-700">{copy.saveFailed}</span>
            ) : null}
          </div>

          <section>
            <h3 className="mb-2 text-[12px] font-semibold uppercase tracking-wide text-slate-700">
              {copy.sampleOffers}
            </h3>
            <ul className="space-y-3">
              {supplier.sampleOffers.map((offer) => (
                <li key={offer.k || offer.date} className="rounded-[16px] bg-[#F7F7FA] p-3">
                  <div className="mb-1 text-[11px] font-semibold text-slate-700">
                    {formatAzDate(offer.date)} · {offer.group}
                  </div>
                  <p className="whitespace-pre-wrap break-words text-[13px] leading-relaxed text-slate-900">
                    {offer.text}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </aside>
    </div>
  );
}
