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
    <div className="mx-auto max-w-[1320px] px-4 py-6 sm:px-8 sm:py-8">
      <div className="mb-8">
        <h1 className="text-[32px] font-bold tracking-tight text-slate-900 sm:text-[38px]">Profil onayları</h1>
        <p className="mt-1 text-[15px] text-slate-600">Üzv profillərini yoxlayın, təsdiq edin və ya rədd edin.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative w-full sm:max-w-md sm:flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" aria-hidden="true" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Şirkət, email, ad axtar..."
            aria-label="Şirkət, email, ad axtar..."
            className="w-full pl-10 pr-4 h-11 rounded-full border-0 bg-white text-[14px] text-slate-800 shadow-[0_1px_2px_rgba(0,0,0,0.05)] outline-none transition focus:ring-2 focus:ring-[#0A7AFF]/30"
          />
        </div>
        {(['submitted', 'approved', 'rejected', 'draft', 'all'] as const).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStatusFilter(s)}
            aria-pressed={statusFilter === s}
            className={`h-9 whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors ${
              statusFilter === s
                ? 'bg-[#EEF4FF] text-slate-900 ring-1 ring-[#0A5BD6]/20'
                : 'bg-white text-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:bg-slate-50'
            }`}
          >
            {s === 'all' ? 'Hamısı' : STATUS_CONFIG[s].label}
          </button>
        ))}
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex items-center justify-center py-20 rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A5BD6]" />
        </div>
      ) : profiles.length === 0 ? (
        <div className="py-20 text-center rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <Shield size={40} className="mx-auto mb-4 text-slate-400" />
          <p className="text-sm text-slate-600">Bu statusda profil yoxdur.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-[22px] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)]">
          <table className="w-full min-w-[760px] text-sm">
            <thead>
              <tr className="text-[12px] uppercase tracking-wide text-slate-500">
                <th className="px-4 py-3 text-left font-semibold">Şirkət</th>
                <th className="px-4 py-3 text-left font-semibold">E-poçt</th>
                <th className="px-4 py-3 text-left font-semibold">Sektor</th>
                <th className="px-4 py-3 text-left font-semibold">Şəhər</th>
                <th className="px-4 py-3 text-left font-semibold">Status</th>
                <th className="px-4 py-3 text-center font-semibold">Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {profiles.map((p) => {
                const cfg = STATUS_CONFIG[p.approvalStatus] || STATUS_CONFIG.draft;
                return (
                  <tr key={p.id} className="border-t border-slate-100 transition-colors hover:bg-[#F9F9FB]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {p.logoUrl ? (
                          <img src={p.logoUrl} alt="" className="h-9 w-9 rounded-full object-cover" />
                        ) : (
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8F1FF]">
                            <Building2 size={14} className="text-[#0A5BD6]" />
                          </div>
                        )}
                        <span className="font-medium text-slate-900">{p.company || '—'}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{p.email}</td>
                    <td className="px-4 py-3 text-slate-600">{p.sector || '—'}</td>
                    <td className="px-4 py-3 text-slate-600">{p.city || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[12px] font-semibold ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button type="button" onClick={() => setDetail(p)} aria-label="Profil detalları" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#EEF4FF] text-[#0A5BD6] transition-colors hover:bg-[#E0EBFF]">
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[22px] bg-white shadow-[0_24px_64px_rgba(0,0,0,0.18)]">
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <h2 className="text-[17px] font-semibold text-slate-900">Profil detalları</h2>
              <button type="button" onClick={() => { setDetail(null); setRejectionReason(''); }} aria-label="Bağla" className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#F2F2F7] text-slate-700 hover:bg-slate-200">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              {/* Logo + company */}
              <div className="flex items-center gap-4">
                {detail.logoUrl ? (
                  <img src={detail.logoUrl} alt="" className="h-16 w-16 rounded-full border border-slate-200 object-cover" />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E8F1FF]">
                    <Building2 size={28} className="text-[#0A5BD6]" />
                  </div>
                )}
                <div>
                  <h3 className="text-[22px] font-semibold tracking-tight text-slate-900">{detail.company || 'Ad yoxdur'}</h3>
                  <p className="text-sm text-slate-500">{detail.sector || '—'} · {detail.city || '—'}</p>
                </div>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
                      type="button"
                      onClick={() => handleAction(detail.id, 'approve')}
                      disabled={actionLoading}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-emerald-600 px-4 text-[14px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50"
                    >
                      <Check size={16} /> Təsdiq et
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!rejectionReason) {
                          const el = document.getElementById('rejection-input');
                          if (el) el.focus();
                          return;
                        }
                        handleAction(detail.id, 'reject');
                      }}
                      disabled={actionLoading}
                      className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-rose-50 px-4 text-[14px] font-semibold text-rose-700 transition-colors hover:bg-rose-100 disabled:opacity-50"
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
                    aria-label="Rədd səbəbi (rədd edirsinizsə)..."
                    className="w-full rounded-full border border-slate-200 bg-[#F9F9FB] px-4 py-2.5 text-[14px] text-slate-900 outline-none focus:border-rose-300 focus:bg-white"
                  />
                </div>
              )}

              {detail.approvalStatus === 'approved' && (
                <div className="flex items-center gap-2 rounded-[14px] bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
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
    <div className="flex items-start gap-2.5 rounded-[14px] bg-[#F2F2F7] px-3.5 py-2.5">
      <span className="mt-0.5 text-[#0A5BD6]">{icon}</span>
      <div className="min-w-0">
        <p className="text-[12px] text-slate-500">{label}</p>
        <p className="break-words text-sm font-medium text-slate-900">{value || '—'}</p>
      </div>
    </div>
  );
}
