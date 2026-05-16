'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Users, ShieldCheck, Crown, GraduationCap } from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';
import MembersTable from '@/components/dashboard/MembersTable';

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

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
  error: string;
  stats: { total: string; verified: string; kalfa: string; usta: string };
}> = {
  az: {
    pageTitle: 'İstifadəçilər',
    pageSubtitle: 'Qeydiyyatdan keçən üzvlər və abunəlik statusları',
    error: 'Xəta baş verdi, yenidən cəhd edin',
    stats: { total: 'Cəmi üzv', verified: 'Təsdiqlənmiş', kalfa: 'KALFA', usta: 'USTA' },
  },
  ru: {
    pageTitle: 'Пользователи',
    pageSubtitle: 'Зарегистрированные участники и статусы подписок',
    error: 'Произошла ошибка, попробуйте снова',
    stats: { total: 'Всего', verified: 'Подтверждённые', kalfa: 'KALFA', usta: 'USTA' },
  },
  en: {
    pageTitle: 'Users',
    pageSubtitle: 'Registered members and subscription statuses',
    error: 'An error occurred, please try again',
    stats: { total: 'Total members', verified: 'Verified', kalfa: 'KALFA', usta: 'USTA' },
  },
  tr: {
    pageTitle: 'Kullanıcılar',
    pageSubtitle: 'Kayıtlı üyeler ve abonelik durumları',
    error: 'Bir hata oluştu, tekrar deneyin',
    stats: { total: 'Toplam üye', verified: 'Doğrulanmış', kalfa: 'KALFA', usta: 'USTA' },
  },
};

const STAT_CARDS = [
  { key: 'total' as const, icon: Users, color: 'text-[var(--dk-navy)]' },
  { key: 'verified' as const, icon: ShieldCheck, color: 'text-emerald-600' },
  { key: 'kalfa' as const, icon: Crown, color: 'text-purple-600' },
  { key: 'usta' as const, icon: GraduationCap, color: 'text-amber-600' },
];

export default function DashboardUsersPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const c = pageCopy[locale];

  const [members, setMembers] = useState<Member[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, verified: 0, kalfa: 0, usta: 0, sagird: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

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
    } catch {
      setError(c.error);
    } finally {
      setLoading(false);
    }
  }, [page, search, planFilter, statusFilter, c.error]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  return (
    <div className="bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-[var(--dk-navy)]">{c.pageTitle}</h1>
          <p className="mt-1 text-sm text-slate-500">{c.pageSubtitle}</p>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {STAT_CARDS.map(({ key, icon: Icon, color }) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-center gap-3">
                <Icon size={20} className={color} />
                <div>
                  <p className="text-2xl font-bold text-[var(--dk-navy)]">{stats[key]}</p>
                  <p className="text-xs text-slate-500">{c.stats[key]}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        )}

        {/* Table */}
        <MembersTable
          members={members}
          loading={loading}
          page={page}
          totalPages={totalPages}
          search={search}
          planFilter={planFilter}
          statusFilter={statusFilter}
          onSearchChange={(v) => { setSearch(v); setPage(1); }}
          onPlanChange={(v) => { setPlanFilter(v); setPage(1); }}
          onStatusChange={(v) => { setStatusFilter(v); setPage(1); }}
          onPageChange={setPage}
          locale={locale}
        />
      </div>
    </div>
  );
}
