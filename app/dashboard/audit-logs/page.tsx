'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

interface AuditLog {
  id: number;
  adminId: number;
  adminEmail: string;
  action: string;
  targetUserId: number | null;
  targetEmail: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_BADGE: Record<string, string> = {
  'member.created': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'member.role_changed': 'bg-amber-50 text-amber-700 border-amber-200',
  'member.deleted': 'bg-red-50 text-red-700 border-red-200',
  'member.password_reset': 'bg-[#EEE6D8] text-[#0F172A] border-[#E4DCCD]',
};

const ACTIONS = ['member.created', 'member.role_changed', 'member.deleted', 'member.password_reset'];

function formatDate(d: string) {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
}

export default function AuditLogsPage() {
  const t = useTranslations('dashboard.auditLog');

  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (actionFilter) params.set('action', actionFilter);
      if (fromDate) params.set('from', fromDate);
      if (toDate) params.set('to', toDate);

      const res = await fetch(`/api/admin/audit-logs?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setLogs(data.logs);
      setTotalPages(data.totalPages);
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const inputCls =
    'h-11 rounded-xl border border-[#E4DCCD] bg-[#FBF8F3] px-3 text-sm text-[#0F172A] outline-none transition focus:border-[#0F172A] focus:ring-2 focus:ring-[#0F172A]/10';

  return (
    <div className="min-h-full bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">{t('title')}</h1>
          <p className="mt-1 text-sm text-[#5B6474]">{t('subtitle')}</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <Filter size={16} className="text-[#334155]" />
          <select
            value={actionFilter}
            onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
            className={inputCls}
          >
            <option value="">{t('filterAction')}</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>{t(`actions.${a}`)}</option>
            ))}
          </select>
          <input
            type="date"
            value={fromDate}
            onChange={(e) => { setFromDate(e.target.value); setPage(1); }}
            className={inputCls}
            placeholder={t('filterFrom')}
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => { setToDate(e.target.value); setPage(1); }}
            className={inputCls}
            placeholder={t('filterTo')}
          />
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-[22px] border border-[#E4DCCD] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          {loading ? (
            <div className="py-16 text-center text-sm text-[#334155]">{t('loading')}</div>
          ) : logs.length === 0 ? (
            <div className="py-16 text-center text-sm text-[#334155]">{t('empty')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b border-[#E4DCCD] bg-[#FBF8F3] text-left text-[#5B6474]">
                  <tr>
                    <th className="px-4 py-3 font-semibold">{t('colDate')}</th>
                    <th className="px-4 py-3 font-semibold">{t('colAdmin')}</th>
                    <th className="px-4 py-3 font-semibold">{t('colAction')}</th>
                    <th className="px-4 py-3 font-semibold">{t('colTarget')}</th>
                    <th className="px-4 py-3 font-semibold">{t('colDetails')}</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-t border-[#EFE9DE] hover:bg-[#FBF8F3]">
                      <td className="px-4 py-3 text-[#5B6474] whitespace-nowrap">{formatDate(log.createdAt)}</td>
                      <td className="px-4 py-3 text-[#334155]">{log.adminEmail}</td>
                      <td className="px-4 py-3">
                        <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_BADGE[log.action] || 'bg-[#FBF8F3] text-[#5B6474] border-[#E4DCCD]'}`}>
                          {t(`actions.${log.action}`)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#334155]">{log.targetEmail || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[#334155]">
                        {log.metadata ? JSON.stringify(log.metadata) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page <= 1}
              className="inline-flex items-center gap-1 rounded-full border border-[#E4DCCD] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#EEE6D8] disabled:opacity-40"
            >
              <ChevronLeft size={14} />
              {t('prev')}
            </button>
            <span className="text-xs text-[#334155]">
              {t('pageLabel')} {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              className="inline-flex items-center gap-1 rounded-full border border-[#E4DCCD] bg-white px-3.5 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:bg-[#EEE6D8] disabled:opacity-40"
            >
              {t('next')}
              <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
