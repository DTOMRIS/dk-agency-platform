'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, Search, Trash2 } from 'lucide-react';
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
  currentUserId: number | null;
  onSearchChange: (v: string) => void;
  onPlanChange: (v: string) => void;
  onStatusChange: (v: string) => void;
  onPageChange: (p: number) => void;
  onRoleChange: (memberId: number, newRole: string) => Promise<void>;
  onDelete: (memberId: number, email: string) => Promise<void>;
  onBulkDelete: (ids: number[]) => Promise<void>;
}

const PLAN_BADGE: Record<string, string> = {
  SAGIRD: 'bg-teal-50 text-teal-700 border-teal-200',
  KALFA: 'bg-purple-50 text-purple-700 border-purple-200',
  USTA: 'bg-amber-50 text-amber-700 border-amber-200',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  member: 'bg-slate-50 text-slate-600 border-slate-200',
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
    currentUserId,
    onSearchChange,
    onPlanChange,
    onStatusChange,
    onPageChange,
    onRoleChange,
    onDelete,
    onBulkDelete,
  } = props;

  const [changingRoleId, setChangingRoleId] = useState<number | null>(null);
  const [roleError, setRoleError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleRoleSelect = async (memberId: number, newRole: string) => {
    setChangingRoleId(memberId);
    setRoleError(null);
    try {
      await onRoleChange(memberId, newRole);
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message === 'self-role-forbidden'
        ? t('roles.selfForbidden')
        : t('roles.changeError');
      setRoleError(msg);
      setTimeout(() => setRoleError(null), 3000);
    } finally {
      setChangingRoleId(null);
    }
  };

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === members.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(members.map((m) => m.id)));
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selected].filter((id) => id !== currentUserId);
    if (ids.length === 0) return;
    if (!window.confirm(t('bulkConfirm', { n: ids.length }))) return;
    setBulkDeleting(true);
    try {
      await onBulkDelete(ids);
      setSelected(new Set());
    } finally {
      setBulkDeleting(false);
    }
  };

  const handleSingleDelete = async (id: number, email: string) => {
    if (!window.confirm(t('deleteConfirm', { email }))) return;
    await onDelete(id, email);
  };

  const inputCls =
    'rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  return (
    <div className="space-y-4">
      {roleError && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {roleError}
        </div>
      )}

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

      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5">
          <span className="text-sm font-medium text-red-700">{t('selected', { n: selected.size })}</span>
          <button
            type="button"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            <Trash2 size={12} />
            {bulkDeleting ? '...' : t('bulkDelete')}
          </button>
        </div>
      )}

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
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.size === members.length && members.length > 0} onChange={toggleAll} className="rounded" />
                  </th>
                  <th className="px-4 py-3 font-semibold">{t('columns.email')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.name')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.company')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.role')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.plan')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.status')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.phone')}</th>
                  <th className="px-4 py-3 font-semibold">{t('columns.createdAt')}</th>
                  <th className="px-4 py-3 font-semibold"></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isSelf = m.id === currentUserId;
                  const role = m.role || 'member';
                  return (
                    <tr key={m.id} className="border-t border-slate-100 hover:bg-slate-50/50">
                      <td className="w-10 px-4 py-3">
                        <input type="checkbox" checked={selected.has(m.id)} onChange={() => toggleSelect(m.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 text-slate-700">{m.email}</td>
                      <td className="px-4 py-3 font-medium text-[var(--dk-navy)]">{m.fullName || '-'}</td>
                      <td className="px-4 py-3 text-slate-500">{m.company || '-'}</td>
                      <td className="px-4 py-3">
                        {isSelf ? (
                          <span
                            className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider cursor-not-allowed opacity-60 ${ROLE_BADGE[role] || ROLE_BADGE.member}`}
                            title={t('roles.selfForbidden')}
                          >
                            {t(`roles.${role}`)}
                          </span>
                        ) : (
                          <select
                            value={role}
                            onChange={(e) => handleRoleSelect(m.id, e.target.value)}
                            disabled={changingRoleId === m.id}
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider outline-none transition ${ROLE_BADGE[role] || ROLE_BADGE.member} ${changingRoleId === m.id ? 'opacity-50' : 'cursor-pointer hover:ring-2 hover:ring-[var(--dk-gold)]/20'}`}
                          >
                            <option value="member">{t('roles.member')}</option>
                            <option value="admin">{t('roles.admin')}</option>
                          </select>
                        )}
                      </td>
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
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/dashboard/users/${m.id}`}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-50 hover:border-[var(--dk-gold)]"
                          >
                            <Eye size={12} />
                            {t('view')}
                          </Link>
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleSingleDelete(m.id, m.email)}
                              className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 transition hover:bg-red-50"
                            >
                              <Trash2 size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
