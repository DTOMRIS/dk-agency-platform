'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, KeyRound, Mail, Phone, Building2, Calendar, Shield, Trash2 } from 'lucide-react';

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
  'member.password_reset': 'bg-[#EEE6D8] text-[#0F172A] border-[#E4DCCD]',
};

const ROLE_BADGE: Record<string, string> = {
  admin: 'bg-red-50 text-red-700 border-red-200',
  member: 'bg-[#FBF8F3] text-[#334155] border-[#E4DCCD]',
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
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<MemberDetail | null>(null);
  const [activity, setActivity] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

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
      if (data.currentUserId) setCurrentUserId(data.currentUserId);
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
      // TASK-0548: the page's own back link is rendered from the first frame, so PanelBackBar (which looks for
      // [data-back-button] once per route) steps aside and the page keeps exactly one back control.
      <div className="min-h-full bg-[#F6F1E9] p-6 lg:p-8">
        <div className="mx-auto max-w-4xl">
          <Link href="/dashboard/users" data-back-button className="inline-flex items-center gap-1 rounded-full border border-[#E4DCCD] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0F172A] hover:bg-[#EEE6D8]">
            <ArrowLeft size={14} /> {t('back')}
          </Link>
          <div className="flex items-center justify-center py-32">
            <span className="text-sm text-[#5B6474]">{t('loading')}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-full bg-[#F6F1E9] p-6 lg:p-8">
        <div className="mx-auto max-w-3xl text-center py-16">
          <p className="text-sm text-[#5B6474]">{error === 'not-found' ? t('notFound') : t('error')}</p>
          <Link href="/dashboard/users" data-back-button className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#0F172A] hover:underline">
            <ArrowLeft size={14} /> {t('back')}
          </Link>
        </div>
      </div>
    );
  }

  const role = user.role || 'member';
  const isVerified = user.emailVerified === true;

  return (
    <div className="min-h-full bg-[#F6F1E9] p-6 lg:p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Back */}
        <Link href="/dashboard/users" data-back-button className="inline-flex items-center gap-1 rounded-full border border-[#E4DCCD] bg-white px-3.5 py-1.5 text-sm font-semibold text-[#0F172A] hover:bg-[#EEE6D8]">
          <ArrowLeft size={14} /> {t('back')}
        </Link>

        {/* Profile Card */}
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
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
            <div className="flex items-center gap-3 text-sm text-[#334155]">
              <Mail size={16} className="text-[#334155]" />
              {user.email}
            </div>
            {user.phone && (
              <div className="flex items-center gap-3 text-sm text-[#334155]">
                <Phone size={16} className="text-[#334155]" />
                {user.phone}
              </div>
            )}
            {user.company && (
              <div className="flex items-center gap-3 text-sm text-[#334155]">
                <Building2 size={16} className="text-[#334155]" />
                {user.company}
              </div>
            )}
            <div className="flex items-center gap-3 text-sm text-[#334155]">
              <Calendar size={16} className="text-[#334155]" />
              {t('joined')}: {formatDate(user.createdAt)}
            </div>
            <div className="flex items-center gap-3 text-sm text-[#334155]">
              <Shield size={16} className="text-[#334155]" />
              {t('role')}: {role}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <QuickActions userId={user.id} isSelf={user.id === currentUserId} t={t} onSuccess={fetchDetail} onDeleted={() => router.push('/dashboard/users')} />

        {/* Recent Activity */}
        <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
          <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">{t('recentActivity')}</h2>
          {activity.length === 0 ? (
            <p className="mt-4 text-sm text-[#334155]">{t('noActivity')}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {activity.map((log) => (
                <div key={log.id} className="flex items-center justify-between rounded-xl border border-[#EFE9DE] px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${ACTION_BADGE[log.action] || 'bg-[#FBF8F3] text-[#5B6474] border-[#E4DCCD]'}`}>
                      {tAudit(`actions.${log.action}`)}
                    </span>
                    <span className="text-xs text-[#5B6474]">{log.adminEmail}</span>
                  </div>
                  <span className="text-xs text-[#334155] whitespace-nowrap">{formatDateTime(log.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function QuickActions({ userId, isSelf, t, onSuccess, onDeleted }: { userId: number; isSelf: boolean; t: (key: string) => string; onSuccess: () => void; onDeleted: () => void }) {
  const [resetting, setResetting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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

  const handleDelete = async () => {
    setDeleting(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/admin/members/${userId}`, { method: 'DELETE' });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'failed');
      }
      onDeleted();
    } catch (err: unknown) {
      const msg = err instanceof Error && err.message === 'already-deleted' ? t('deleteAlready') : t('deleteError');
      setMessage({ type: 'error', text: msg });
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
      setDeleteInput('');
    }
  };

  return (
    <div className="rounded-[22px] border border-[#E4DCCD] bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.03)]">
      <h2 className="text-lg font-bold tracking-tight text-[#0F172A]">{t('quickActions')}</h2>
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
          className="inline-flex items-center gap-2 rounded-full border border-[#E4DCCD] bg-white px-4 py-2.5 text-sm font-semibold text-[#0F172A] transition hover:bg-[#EEE6D8] disabled:opacity-50"
        >
          <KeyRound size={16} />
          {resetting ? '...' : t('resetPassword')}
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={() => {
              if (!window.confirm(t('deleteConfirm1'))) return;
              setShowDeleteConfirm(true);
            }}
            className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 size={16} />
            {t('deleteAccount')}
          </button>
        )}
        {isSelf && (
          <span className="inline-flex items-center gap-2 rounded-full border border-[#EFE9DE] px-4 py-2.5 text-sm text-[#5B6474] cursor-not-allowed" title={t('deleteSelfForbidden')}>
            <Trash2 size={16} />
            {t('deleteAccount')}
          </span>
        )}
      </div>

      {/* Double confirm: type SİL */}
      {showDeleteConfirm && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 space-y-3">
          <p className="text-sm text-red-700">{t('deleteConfirm2')}</p>
          <input
            type="text"
            value={deleteInput}
            onChange={(e) => setDeleteInput(e.target.value)}
            className="h-11 w-full rounded-xl border border-red-300 bg-white px-3 text-sm text-[#0F172A] outline-none focus:ring-2 focus:ring-red-300"
            placeholder="SİL"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteInput !== 'SİL' || deleting}
              className="rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-40"
            >
              {deleting ? '...' : t('deleteConfirmBtn')}
            </button>
            <button
              type="button"
              onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
              className="rounded-full border border-[#E4DCCD] bg-white px-4 py-2 text-xs font-semibold text-[#0F172A]"
            >
              {t('cancel')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
