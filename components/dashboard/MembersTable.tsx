'use client';

import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface Member {
  id: number;
  email: string;
  fullName: string | null;
  company: string | null;
  phone: string | null;
  role: string | null;
  emailVerified: boolean | null;
  createdAt: string | null;
  plan: string | null;
  subStatus: string | null;
}

interface MembersTableProps {
  members: Member[];
  loading: boolean;
  page: number;
  totalPages: number;
  search: string;
  planFilter: string;
  statusFilter: string;
  onSearchChange: (v: string) => void;
  onPlanChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPageChange: (p: number) => void;
}

const PLAN_BADGE: Record<string, string> = {
  SAGIRD: 'bg-teal-50 text-teal-700 border-teal-200',
  KALFA: 'bg-purple-50 text-purple-700 border-purple-200',
  USTA: 'bg-amber-50 text-amber-700 border-amber-200',
};

function getPlanKey(plan: string) {
  return plan.toLowerCase() as 'sagird' | 'kalfa' | 'usta';
}

function getStatusKey(status: string) {
  return status as 'active' | 'trial' | 'expired' | 'cancelled';
}

function formatDate(d: string | null) {
  if (!d) return '-';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

export default function MembersTable(props: MembersTableProps) {
  const t = useTranslations('dashboard.members');
  const {
    members,
    loading,
    page,
    totalPages,
    search,
    planFilter,
    statusFilter,
    onSearchChange,
    onPlanChange,
    onStatusChange,
    onPageChange,
  } = props;

  const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t('filters.searchPlaceholder')}
            className={`${inputCls} w-full pl-9`}
          />
        </div>
        <select value={planFilter} onChange={(e) => onPlanChange(e.target.value)} className={inputCls}>
          <option value="">{t('filters.allPlans')}</option>
          <option value="SAGIRD">{t('plans.sagird')}</option>
          <option value="KALFA">{t('plans.kalfa')}</option>
          <option value="USTA">{t('plans.usta')}</option>
        </select>
        <select value={statusFilter} onChange={(e) => onStatusChange(e.target.value)} className={inputCls}>
          <option value="">{t('filters.allStatuses')}</option>
          <option value="active">{t('statuses.active')}</option>
          <option value="trial">{t('statuses.trial')}</option>
          <option value="expired">{t('statuses.expired')}</option>
          <option value="cancelled">{t('statuses.cancelled')}</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400">{t('states.loading')}</div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center text-sm text-slate-400">{t('states.empty')}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">{t('columns.email')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.name')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.company')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.plan')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.phone')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.createdAt')}</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-slate-700">{m.email}</td>
                    <td className="px-4 py-3 font-medium text-[var(--dk-navy)]">{m.fullName || '-'}</td>
                    <td className="px-4 py-3 text-slate-500">{m.company || '-'}</td>
                    <td className="px-4 py-3">
                      {m.plan ? (
                        <span
                          className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            PLAN_BADGE[m.plan] || 'bg-slate-50 text-slate-500 border-slate-200'
                          }`}
                        >
                          {m.plan in PLAN_BADGE ? t(`plans.${getPlanKey(m.plan)}`) : m.plan}
                        </span>
                      ) : (
                        <span className="text-slate-300">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-slate-500">
                        {m.subStatus && ['active', 'trial', 'expired', 'cancelled'].includes(m.subStatus)
                          ? t(`statuses.${getStatusKey(m.subStatus)}`)
                          : m.subStatus || '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{m.phone || '-'}</td>
                    <td className="px-4 py-3 text-slate-400">{formatDate(m.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            <ChevronLeft size={14} />
            {t('pagination.prev')}
          </button>
          <span className="text-xs text-slate-400">
            {t('pagination.pageLabel')} {page} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:bg-slate-50 disabled:opacity-40"
          >
            {t('pagination.next')}
            <ChevronRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
