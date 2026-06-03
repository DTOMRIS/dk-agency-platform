'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Building2, Check, Clock, Eye, Mail, MapPin, Phone,
  Search, Shield, X, ExternalLink, Globe,
} from 'lucide-react';

type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

interface ProfileRow {
  id: number;
  email: string;
  fullName: string | null;
  company: string | null;
  sector: string | null;
  city: string | null;
  district: string | null;
  voen: string | null;
  logoUrl: string | null;
  approvalStatus: ApprovalStatus;
  updatedAt: string | null;
  phone: string | null;
  website: string | null;
  authorizedPerson: string | null;
  slug: string | null;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; bg: string }> = {
  draft: { label: 'Qaralama', color: 'text-slate-600', bg: 'bg-slate-100' },
  submitted: { label: 'Gözləyir', color: 'text-amber-700', bg: 'bg-amber-50' },
  approved: { label: 'Təsdiqləndi', color: 'text-emerald-700', bg: 'bg-emerald-50' },
  rejected: { label: 'Rədd edildi', color: 'text-red-700', bg: 'bg-red-50' },
};

export default function ProfilOnayPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('submitted');
  const [detail, setDetail] = useState<ProfileRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchProfiles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: statusFilter });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/profiles?${params}`);
      if (res.ok) {
        const data = await res.json();
        setProfiles(data.profiles || []);
      }
    } catch { /* network error */ }
    setLoading(false);
  }, [statusFilter, search]);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch-on-mount with reusable callback
  useEffect(() => { void fetchProfiles(); }, [fetchProfiles]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { action };
      if (action === 'reject' && rejectionReason) {
        body.reason = rejectionReason;
      }
      const res = await fetch(`/api/admin/profiles/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setDetail(null);
        setRejectionReason('');
        fetchProfiles();
      }
    } catch { /* network error */ }
    setActionLoading(false);
  };

  const counts = {
    submitted: profiles.length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Profil onayları</h1>
        <p className="mt-1 text-sm text-slate-500">Üzv profillərini yoxlayın, təsdiq edin və ya rədd edin.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirkət, email, ad axtar..."
            className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-[var(--dk-red)]"
          />
        </div>
        {(['submitted', 'approved', 'rejected', 'draft', 'all'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              statusFilter === s
                ? 'bg-[var(--dk-navy)] text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s === 'all' ? 'Hamısı' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-slate-300 border-t-[var(--dk-red)] rounded-full" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20">
          <Shield size={48} className="mx-auto mb-4 text-slate-300" />
          <p className="text-sm text-slate-500">Bu statusda profil yoxdur.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50">
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Şirkət</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Email</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Sektor</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Şəhər</th>
                <th className="px-4 py-3 text-left font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3 text-center font-semibold text-slate-600">Əməliyyat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {profiles.map((p) => {
                const cfg = STATUS_CONFIG[p.approvalStatus] || STATUS_CONFIG.draft;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                            <Building2 size={14} className="text-slate-400" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{p.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.sector || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setDetail(p)} className="text-[var(--dk-navy)] hover:text-[var(--dk-red)] font-medium text-xs">
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">Profil detalları</h2>
              <button onClick={() => { setDetail(null); setRejectionReason(''); }} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Logo + company */}
              <div className="flex items-center gap-4">
                {detail.logoUrl ? (
                  <img src={detail.logoUrl} alt="" className="w-16 h-16 rounded-2xl object-cover border border-slate-200" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                    <Building2 size={28} className="text-slate-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">{detail.company || 'Ad yoxdur'}</h3>
                  <p className="text-sm text-slate-500">{detail.sector || '—'} · {detail.city || '—'}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <InfoRow icon={<Mail size={14} />} label="Email" value={detail.email} />
                <InfoRow icon={<Phone size={14} />} label="Telefon" value={detail.phone} />
                <InfoRow icon={<Building2 size={14} />} label="VÖEN" value={detail.voen} />
                <InfoRow icon={<Globe size={14} />} label="Veb-sayt" value={detail.website} />
                <InfoRow icon={<MapPin size={14} />} label="Ünvan" value={[detail.city, detail.district].filter(Boolean).join(', ')} />
                <InfoRow icon={<Shield size={14} />} label="Əlaqə şəxsi" value={detail.authorizedPerson} />
              </div>

              {detail.slug && (
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <ExternalLink size={12} />
                  <span>Public URL: /uzv/{detail.slug}</span>
                </div>
              )}

              {/* Actions */}
              {(detail.approvalStatus === 'submitted' || detail.approvalStatus === 'draft') && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleAction(detail.id, 'approve')}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check size={16} /> Təsdiq et
                    </button>
                    <button
                      onClick={() => {
                        if (!rejectionReason) {
                          const el = document.getElementById('rejection-input');
                          if (el) el.focus();
                          return;
                        }
                        handleAction(detail.id, 'reject');
                      }}
                      disabled={actionLoading}
                      className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-3 text-sm font-bold text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      <X size={16} /> Rədd et
                    </button>
                  </div>
                  <input
                    id="rejection-input"
                    type="text"
                    placeholder="Rədd səbəbi (rədd edirsinizsə)..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-red-400"
                  />
                </div>
              )}

              {detail.approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 px-4 py-3 rounded-xl">
                  <Check size={16} /> Profil təsdiqlənib və public kataloqda görünür.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | null | undefined }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2">
      <span className="text-slate-400 mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700">{value || '—'}</p>
      </div>
    </div>
  );
}
