'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Crown, GraduationCap, ShieldCheck, UserPlus, Users } from 'lucide-react';
import MembersTable from '@/components/dashboard/MembersTable';
import AddMemberModal from '@/components/dashboard/AddMemberModal';

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

interface Stats {
  total: number;
  verified: number;
  kalfa: number;
  usta: number;
  sagird: number;
}

const STAT_CARDS = [
  { key: 'total' as const, icon: Users, color: 'text-[var(--dk-navy)]' },
  { key: 'verified' as const, icon: ShieldCheck, color: 'text-emerald-600' },
  { key: 'kalfa' as const, icon: Crown, color: 'text-purple-600' },
  { key: 'usta' as const, icon: GraduationCap, color: 'text-amber-600' },
];

export default function DashboardUsersPage() {
  const t = useTranslations('dashboard.members');

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, kalfa: 0, usta: 0, sagird: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      if (search) params.set('search', search);
      if (planFilter) params.set('plan', planFilter);
      if (statusFilter) params.set('status', statusFilter);

      const res = await fetch(`/api/admin/members?${params}`);
      if (!res.ok) throw new Error('fetch-failed');

      const data = await res.json();
      setMembers(data.members);
      setStats(data.stats);
      setTotalPages(data.totalPages);
      if (data.currentUserId) setCurrentUserId(data.currentUserId);
    } catch {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter, t]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleRoleChange = useCallback(
    async (memberId: number, newRole: string) => {
      const res = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'role-change-failed');
      }
      setMembers((prev) =>
        prev.map((m) => (m.id === memberId ? { ...m, role: newRole } : m)),
      );
    },
    [],
  );

  const handleDelete = useCallback(
    async (memberId: number) => {
      const res = await fetch(`/api/admin/members/${memberId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('delete-failed');
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    },
    [],
  );

  const handleBulkDelete = useCallback(
    async (ids: number[]) => {
      const res = await fetch('/api/admin/members/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      });
      if (!res.ok) throw new Error('bulk-delete-failed');
      const data = await res.json();
      if (data.deleted > 0) {
        fetchMembers();
      }
    },
    [fetchMembers],
  );

  return (
    <div className="min-h-full bg-[#F2F2F7] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mx-auto max-w-[1320px] space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">{t('pageTitle')}</h1>
            <p className="mt-1 text-[15px] text-slate-600">{t('pageSubtitle')}</p>
          </div>
          <button
            type="button"
            onClick={() => setAddModalOpen(true)}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-[#E11D48] px-5 text-[14px] font-semibold text-white transition-colors hover:bg-[#BE123C]"
          >
            <UserPlus size={16} />
            {t('addMember.button')}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, icon: Icon, color }) => (
            <div key={key} className="rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="flex items-center justify-between">
                <p className="text-[14px] font-medium text-slate-600">{t(`stats.${key}`)}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F2F2F7]">
                  <Icon size={18} className={color} aria-hidden="true" />
                </span>
              </div>
              <p className="mt-3 text-[34px] font-semibold leading-none tracking-tight text-slate-900 tabular-nums">{stats[key]}</p>
            </div>
          ))}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        <MembersTable
          members={members}
          loading={loading}
          page={page}
          totalPages={totalPages}
          search={search}
          planFilter={planFilter}
          statusFilter={statusFilter}
          currentUserId={currentUserId}
          onRoleChange={handleRoleChange}
          onDelete={handleDelete}
          onBulkDelete={handleBulkDelete}
          onSearchChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
          onPlanChange={(v) => {
            setPlanFilter(v);
            setPage(1);
          }}
          onStatusChange={(v) => {
            setStatusFilter(v);
            setPage(1);
          }}
          onPageChange={setPage}
        />

        <AddMemberModal
          open={addModalOpen}
          onClose={() => setAddModalOpen(false)}
          onSuccess={() => {
            fetchMembers();
          }}
        />
      </div>
    </div>
  );
}
