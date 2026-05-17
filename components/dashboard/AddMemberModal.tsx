'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AddMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddMemberModal({ open, onClose, onSuccess }: AddMemberModalProps) {
  const t = useTranslations('dashboard.members');

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/admin/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), role }),
      });

      if (res.status === 409) {
        setError(t('addMember.errorEmailExists'));
        return;
      }
      if (!res.ok) {
        setError(t('addMember.errorGeneric'));
        return;
      }

      const data = await res.json();
      if (data.warning === 'user-created-email-failed') {
        setError(t('addMember.warningEmailFailed'));
      }

      // Reset form
      setName('');
      setEmail('');
      setRole('member');
      onSuccess();
      if (!data.warning) onClose();
    } catch {
      setError(t('addMember.errorGeneric'));
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[var(--dk-gold)] focus:ring-2 focus:ring-[var(--dk-gold)]/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-[var(--dk-navy)]">
            {t('addMember.title')}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t('addMember.fieldName')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className={inputCls}
              placeholder="Ad Soyad"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t('addMember.fieldEmail')} *
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputCls}
              placeholder="email@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-500">
              {t('addMember.fieldRole')}
            </label>
            <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
              <option value="member">{t('roles.member')}</option>
              <option value="admin">{t('roles.admin')}</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading || !name.trim() || !email.trim()}
            className="w-full rounded-xl bg-[var(--dk-gold)] px-4 py-2.5 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t('states.loading') : t('addMember.submit')}
          </button>
        </form>
      </div>
    </div>
  );
}
