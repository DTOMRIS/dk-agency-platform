'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, KeyRound, Mail, Phone, Building2, Calendar, Shield } from 'lucide-react';

interface MemberDetail {
  id: number;
  email: string;
  fullName: string | null;
  company: string | null;
  phone: string | null;
  role: string | null;
  emailVerified: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}

interface AuditEntry {
  id: number;
  adminEmail: string;
  action: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
}

const ACTION_BADGE: Record<string, string> = {
  'member.created': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'member.role_changed': 'bg-amber-50 text-amber-700 border-amber-200',
  'member.deleted': 'bg-red-50 text-red-700 border-red-200',
  'member.password_reset': 'bg-blue-50 text-blue-700 border-blue-200',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  member: 'bg-slate-50 text-slate-600 border-slate-200',
};

function formatDate(d: string | null) {
  if (!d) return '-';
  const date = new Date(d);
  return `${String(date.getDate()).padStart(2, '0')}.${String(date.getMonth() + 1).padStart(2, '0')}.${date.getFullYear()}`;
}

function formatDateTime(d: string) {
  const date = new Date(d);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const mins = String(date.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
}

export default function MemberDetailPage() {
  const t = useTranslations('dashboard.memberDetail');
  const tAudit = useTranslations('dashboard.auditLog');
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<MemberDetail | null>(null);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/members/${id}`);
      if (res.status === 404) {
        setError('not-found');
        return;
      }
      if (!res.ok) throw new Error('fetch-failed');
      const data = await res.json();
      setUser(data.user);
      setActivity(data.recentActivity || []);
    } catch {
      setError('fetch-failed');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="text-sm text-slate-400">{t('loading')}</span>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="bg-white p-6 lg:p-8">
        <div className="mx-auto max-w-3xl text-center py-16">
          <p className="text-sm text-slate-500">{error === 'not-found' ? t('notFound') : t('error')}</p>
          <Link href="/dashboard/users" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[var(--dk-gold)] hover:underline">
            <ArrowLeft size={14} /> {t('back')}
          </Link>
        </div>
      </div>
    );
  }

  const role = user.role || 'member';
  const isVerified = user.emailVerified === true;

  return (
    <div className="bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back */}
        <Link href="/dashboard/users" className="inline-flex items-center gap-1 text-sm font-medium text-slate-500 hover:text-[var(--dk-navy)]">
          <ArrowLeft size={14} /> {t('back')}
        </Link>

        {/* Profile Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-[var(--dk-navy)]">
                {user.fullName || user.email}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3">
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ROLE_BADGE[role] || ROLE_BADGE.member}`}>
                  {role}
                </span>
                <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${isVerified ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'}`}>
                  {isVerified ? t('statusActive') : t('statusPending')}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail size={16} className="text-slate-400" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Phone size={16} className="text-slate-400" />
                {user.phone}
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building2 size={16} className="text-slate-400" />
                {user.company}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar size={16} className="text-slate-400" />
              {t('joined')}: {formatDate(user.createdAt)}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Shield size={16} className="text-slate-400" />
              {t('role')}: {role}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions userId={user.id} t={t} onSuccess={fetchDetail} />

        {/* Recent Activity */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="font-display text-lg font-bold text-[var(--dk-navy)]">{t('recentActivity')}</h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-slate-400">{t('noActivity')}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_BADGE[log.action] || 'bg-slate-50 text-slate-500 border-slate-200'}`}>
                      {tAudit(`actions.${log.action}`)}
                    </span>
                    <span className="text-xs text-slate-500">{log.adminEmail}</span>
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActions({ userId, t, onSuccess }: { userId: number; t: (key: string) => string; onSuccess: () => void }) {
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleResetPassword = async () => {
    if (!window.confirm(t('resetConfirm'))) return;
    setResetting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/members/${userId}/reset-password`, { method: 'POST' });
      if (!res.ok) throw new Error('failed');
      setMessage({ type: 'success', text: t('resetSuccess') });
      onSuccess();
    } catch {
      setMessage({ type: 'error', text: t('resetError') });
    } finally {
      setResetting(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-display text-lg font-bold text-[var(--dk-navy)]">{t('quickActions')}</h2>
      {message && (
        <div className={`mt-3 rounded-xl border px-4 py-2 text-sm ${message.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
          {message.text}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleResetPassword}
          disabled={resetting}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-[var(--dk-gold)] hover:bg-[var(--dk-gold)]/5 disabled:opacity-50"
        >
          <KeyRound size={16} />
          {resetting ? '...' : t('resetPassword')}
        </button>
      </div>
    </div>
  );
}
