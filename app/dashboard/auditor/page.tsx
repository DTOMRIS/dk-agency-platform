'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  ClipboardCopy,
  FileText,
  Loader2,
  MapPin,
  MessageCircle,
  Phone,
  Plus,
  Search,
  Store,
  Trash2,
  X,
} from 'lucide-react';

// ── Types ───────────────────────────────────────────────────────────

interface AuditRow {
  id: number;
  name: string;
  address: string | null;
  phone: string | null;
  category: string;
  photos: string[];
  status: string;
  aiAnalysis: AiAnalysis | null;
  createdAt: string;
}

interface AiAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendations: Array<{ priority: string; area: string; action: string; dkAgencyHelp: string }>;
  estimatedRevenue: { min: number; max: number; currency: string };
  redFlags: string[];
  whatsappTemplate: string;
  summary: string;
}

interface AuditAction {
  id: number;
  actionType: string;
  date: string;
  notes: string | null;
}

interface AuditDetail extends AuditRow {
  actions: AuditAction[];
  socialLinks: { instagram?: string; facebook?: string };
  deliveryLinks: { wolt?: string; bolt?: string };
  menuPhotoUrl: string | null;
  notes: string | null;
}

type View = 'list' | 'new' | 'detail';

// ── Constants ───────────────────────────────────────────────────────

const CATEGORIES = [
  { key: 'kafe', label: 'Kafe' },
  { key: 'restoran', label: 'Restoran' },
  { key: 'fast-food', label: 'Fast Food' },
  { key: 'fine-dining', label: 'Fine Dining' },
] as const;

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  draft: { label: 'Qaralama', color: 'text-slate-600', bg: 'bg-slate-100' },
  sent: { label: 'Göndərildi', color: 'text-blue-600', bg: 'bg-blue-100' },
  meeting: { label: 'Görüş', color: 'text-amber-600', bg: 'bg-amber-100' },
  converted: { label: 'Müştəri', color: 'text-emerald-600', bg: 'bg-emerald-100' },
  rejected: { label: 'Rədd', color: 'text-red-600', bg: 'bg-red-100' },
};

const STATUSES = ['draft', 'sent', 'meeting', 'converted', 'rejected'] as const;

// ── Mock Data ───────────────────────────────────────────────────────

const MOCK_AUDITS: AuditRow[] = [
  {
    id: 1, name: 'Şuşa Restoran', address: 'Nizami küç. 45, Bakı', phone: '+994501234567',
    category: 'restoran', photos: ['https://picsum.photos/400/300?random=1'], status: 'draft',
    aiAnalysis: { strengths: ['Gözəl interyerə sahib məkan', 'Müştəri rəyləri əsasən müsbətdir'], weaknesses: ['Sosial media aktivliyi aşağıdır', 'Menyu dizaynı köhnəlmişdir'], recommendations: [{ priority: 'yüksək', area: 'Sosial media', action: 'Instagram strategiyası hazırlayın', dkAgencyHelp: 'DK Agency SMM idarəetmə' }], estimatedRevenue: { min: 8000, max: 15000, currency: 'AZN' }, redFlags: [], whatsappTemplate: 'Salam Şuşa Restoran 👋\n\nDK Agency olaraq sizin restoranı araşdırdıq...', summary: 'Güclü interyerə sahib, sosial media inkişaf etdirilməlidir.' },
    createdAt: '2026-04-29T10:00:00Z',
  },
  {
    id: 2, name: 'Baku Burger', address: 'Əhmədli, Bakı', phone: null,
    category: 'fast-food', photos: [], status: 'sent',
    aiAnalysis: { strengths: ['Sürətli xidmət', 'Delivery mövcuddur'], weaknesses: ['Brending zəifdir'], recommendations: [], estimatedRevenue: { min: 5000, max: 10000, currency: 'AZN' }, redFlags: [], whatsappTemplate: '', summary: 'Delivery güclüdür, brending yenilənməlidir.' },
    createdAt: '2026-04-28T14:00:00Z',
  },
  {
    id: 3, name: 'Nərgiz Kafe', address: 'Xətai pr. 12', phone: '+994551112233',
    category: 'kafe', photos: ['https://picsum.photos/400/300?random=3', 'https://picsum.photos/400/300?random=4'], status: 'meeting',
    aiAnalysis: { strengths: ['Rahat atmosfer', 'Heyət dostcasına'], weaknesses: ['Menyu limitlidir'], recommendations: [], estimatedRevenue: { min: 3000, max: 7000, currency: 'AZN' }, redFlags: [], whatsappTemplate: '', summary: 'Kafe seqmentində güclü namizəd.' },
    createdAt: '2026-04-27T09:00:00Z',
  },
];

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(d: string) {
  return new Intl.DateTimeFormat('az-AZ', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(d));
}

// ── Main Component ──────────────────────────────────────────────────

export default function AuditorDashboard() {
  const [view, setView] = useState<View>('list');
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAuditId, setSelectedAuditId] = useState<number | null>(null);

  const fetchAudits = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/audit?${params}`);
      const json = (await res.json()) as { data: AuditRow[] };
      if (json.data?.length > 0) {
        setAudits(json.data);
      } else {
        setAudits(MOCK_AUDITS);
      }
    } catch {
      setAudits(MOCK_AUDITS);
    }
    setLoading(false);
  }, [statusFilter, searchQuery]);

  useEffect(() => { void fetchAudits(); }, [fetchAudits]);

  const openDetail = (id: number) => {
    setSelectedAuditId(id);
    setView('detail');
  };

  const handleNewAuditSuccess = (audit: AuditRow) => {
    setAudits((prev) => [audit, ...prev]);
    setView('list');
  };

  if (view === 'new') {
    return <NewAuditView onBack={() => setView('list')} onSuccess={handleNewAuditSuccess} />;
  }

  if (view === 'detail' && selectedAuditId) {
    return <DetailView auditId={selectedAuditId} onBack={() => setView('list')} onRefresh={fetchAudits} />;
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-[var(--dk-navy)]">Restoran Auditor</h1>
          <p className="mt-1 text-sm text-slate-500">Foto-əsaslı AI audit və satış axını</p>
        </div>
        <button
          type="button"
          onClick={() => setView('new')}
          className="inline-flex items-center gap-2 rounded-xl bg-[var(--dk-navy)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--dk-navy)]/90 active:scale-[0.98]"
        >
          <Plus size={16} /> Yeni Audit
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {['all', ...STATUSES].map((s) => {
          const cfg = s === 'all' ? { label: 'Hamısı', bg: 'bg-slate-100', color: 'text-slate-700' } : STATUS_CONFIG[s];
          const count = s === 'all' ? audits.length : audits.filter((a) => a.status === s).length;
          return (
            <button
              key={s}
              type="button"
              onClick={() => setStatusFilter(s)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                statusFilter === s ? `${cfg.bg} ${cfg.color} ring-2 ring-offset-1 ring-slate-300` : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {cfg.label}
              {count > 0 && <span className="rounded-full bg-white/50 px-1.5 text-[10px]">{count}</span>}
            </button>
          );
        })}

        <div className="ml-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <Search size={14} className="text-slate-400" />
          <input
            type="text"
            placeholder="Axtar..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-32 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400 sm:w-48"
          />
        </div>
      </div>

      {/* Audit Cards */}
      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {audits
            .filter((a) => statusFilter === 'all' || a.status === statusFilter)
            .map((audit) => (
              <AuditCard key={audit.id} audit={audit} onClick={() => openDetail(audit.id)} />
            ))}
          {audits.length === 0 && (
            <div className="col-span-full py-16 text-center text-sm text-slate-400">
              Audit tapılmadı. "Yeni Audit" ilə başlayın.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Audit Card ──────────────────────────────────────────────────────

function AuditCard({ audit, onClick }: { audit: AuditRow; onClick: () => void }) {
  const cfg = STATUS_CONFIG[audit.status] ?? STATUS_CONFIG['draft'];
  const summary = audit.aiAnalysis?.summary ?? 'AI analizi gözlənilir...';

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-4 text-left transition hover:border-[var(--dk-gold)] hover:shadow-lg active:scale-[0.99]"
    >
      {/* Photo */}
      {audit.photos.length > 0 ? (
        <div className="mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
          <img src={audit.photos[0]} alt={audit.name} className="h-full w-full object-cover" />
        </div>
      ) : (
        <div className="mb-3 flex h-36 w-full items-center justify-center rounded-xl bg-slate-100">
          <Store size={32} className="text-slate-300" />
        </div>
      )}

      {/* Info */}
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-800 group-hover:text-[var(--dk-navy)]">{audit.name}</h3>
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${cfg.bg} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>

      {audit.address && (
        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <MapPin size={10} /> {audit.address}
        </p>
      )}

      <p className="mt-2 line-clamp-2 text-xs text-slate-500">{summary}</p>

      <div className="mt-3 flex items-center justify-between">
        <span className="text-[10px] text-slate-400">{formatDate(audit.createdAt)}</span>
        <ChevronRight size={14} className="text-slate-300 transition group-hover:text-[var(--dk-gold)]" />
      </div>
    </button>
  );
}

// ── New Audit View (Mobile-first) ───────────────────────────────────

function NewAuditView({ onBack, onSuccess }: { onBack: () => void; onSuccess: (a: AuditRow) => void }) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('restoran');
  const [photos, setPhotos] = useState<string[]>([]);
  const [instagram, setInstagram] = useState('');
  const [facebook, setFacebook] = useState('');
  const [wolt, setWolt] = useState('');
  const [bolt, setBolt] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    for (const file of Array.from(files)) {
      const url = URL.createObjectURL(file);
      setPhotos((prev) => [...prev, url]);
    }
  };

  const removePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (!name.trim()) { setError('Restoran adı məcburidir'); return; }
    setSubmitting(true);
    setError(null);
    setElapsed(0);

    timerRef.current = setInterval(() => setElapsed((p) => p + 1), 1000);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          address: address.trim() || undefined,
          phone: phone.trim() || undefined,
          category,
          photos,
          socialLinks: {
            instagram: instagram.trim() || undefined,
            facebook: facebook.trim() || undefined,
          },
          deliveryLinks: {
            wolt: wolt.trim() || undefined,
            bolt: bolt.trim() || undefined,
          },
        }),
      });

      const json = (await res.json()) as { data: AuditRow; aiAnalysis?: AiAnalysis };
      const audit: AuditRow = {
        ...json.data,
        aiAnalysis: json.aiAnalysis ?? json.data.aiAnalysis ?? null,
      };
      onSuccess(audit);
    } catch (err) {
      setError(String(err));
    } finally {
      if (timerRef.current) clearInterval(timerRef.current);
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[var(--dk-navy)]">
        <ArrowLeft size={16} /> Geri
      </button>

      <h1 className="text-xl font-black text-[var(--dk-navy)]">Yeni Audit</h1>

      {/* Form */}
      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <Field label="Restoran adı *" value={name} onChange={setName} placeholder="Şuşa Restoran" />
        <Field label="Ünvan" value={address} onChange={setAddress} placeholder="Nizami küç. 45, Bakı" />
        <Field label="Telefon" value={phone} onChange={setPhone} placeholder="+994501234567" />

        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Kateqoriya</label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setCategory(c.key)}
                className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                  category === c.key
                    ? 'bg-[var(--dk-navy)] text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Photo Upload */}
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Fotolar</label>
          <div className="flex flex-wrap gap-2">
            {photos.map((url, i) => (
              <div key={i} className="group relative h-20 w-20 overflow-hidden rounded-xl bg-slate-100">
                <img src={url} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute right-1 top-1 rounded-full bg-red-500 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => photoRef.current?.click()}
              className="flex h-20 w-20 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 text-slate-400 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)]"
            >
              <Camera size={24} />
            </button>
          </div>
          <input
            ref={photoRef}
            type="file"
            accept="image/*"
            capture="environment"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
          <p className="mt-1 text-[10px] text-slate-400">Xarici görünüş, daxili, menyu — max 5 foto</p>
        </div>

        {/* Social & Delivery */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Instagram" value={instagram} onChange={setInstagram} placeholder="instagram.com/..." small />
          <Field label="Facebook" value={facebook} onChange={setFacebook} placeholder="facebook.com/..." small />
          <Field label="Wolt" value={wolt} onChange={setWolt} placeholder="wolt.com/..." small />
          <Field label="Bolt Food" value={bolt} onChange={setBolt} placeholder="food.bolt.eu/..." small />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">{error}</div>
      )}

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--dk-navy)] py-3.5 text-sm font-bold text-white transition hover:bg-[var(--dk-navy)]/90 disabled:opacity-60 active:scale-[0.98]"
      >
        {submitting ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            AI analiz edir... {elapsed}s
          </>
        ) : (
          <>
            <Check size={18} /> Audit yarat
          </>
        )}
      </button>
    </div>
  );
}

// ── Detail View ─────────────────────────────────────────────────────

function DetailView({ auditId, onBack, onRefresh }: { auditId: number; onBack: () => void; onRefresh: () => void }) {
  const [audit, setAudit] = useState<AuditDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/audit/${auditId}`);
        const json = (await res.json()) as { data: AuditDetail };
        setAudit(json.data);
      } catch {
        // Mock fallback
        const mock = MOCK_AUDITS.find((a) => a.id === auditId);
        if (mock) {
          setAudit({
            ...mock,
            actions: [],
            socialLinks: {},
            deliveryLinks: {},
            menuPhotoUrl: null,
            notes: null,
          });
        }
      }
      setLoading(false);
    }
    void load();
  }, [auditId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!audit) return;
    try {
      await fetch(`/api/audit/${audit.id}`, {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      setAudit((prev) => prev ? { ...prev, status: newStatus } : prev);
      onRefresh();
    } catch { /* ignore */ }
  };

  const copyWhatsApp = () => {
    const template = audit?.aiAnalysis?.whatsappTemplate ?? '';
    navigator.clipboard.writeText(template).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (loading || !audit) {
    return (
      <div className="flex h-48 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const analysis = audit.aiAnalysis;
  const cfg = STATUS_CONFIG[audit.status] ?? STATUS_CONFIG['draft'];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button type="button" onClick={onBack} className="flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-[var(--dk-navy)]">
          <ArrowLeft size={16} /> Geri
        </button>
        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
      </div>

      <h1 className="text-xl font-black text-[var(--dk-navy)]">{audit.name}</h1>
      {audit.address && <p className="flex items-center gap-1 text-sm text-slate-500"><MapPin size={12} /> {audit.address}</p>}
      {audit.phone && <p className="flex items-center gap-1 text-sm text-slate-500"><Phone size={12} /> {audit.phone}</p>}

      {/* Photos */}
      {audit.photos.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {audit.photos.map((url, i) => (
            <img key={i} src={url} alt="" className="h-32 w-44 shrink-0 rounded-xl object-cover" />
          ))}
        </div>
      )}

      {/* Status Change */}
      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => {
          const sc = STATUS_CONFIG[s];
          return (
            <button
              key={s}
              type="button"
              onClick={() => handleStatusChange(s)}
              className={`rounded-xl px-3 py-2 text-xs font-semibold transition ${
                audit.status === s
                  ? `${sc.bg} ${sc.color} ring-2 ring-offset-1`
                  : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
              }`}
            >
              {sc.label}
            </button>
          );
        })}
      </div>

      {/* AI Analysis */}
      {analysis && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h2 className="mb-2 text-sm font-bold text-[var(--dk-navy)]">Xülasə</h2>
            <p className="text-sm text-slate-600">{analysis.summary}</p>
            {analysis.estimatedRevenue && (
              <p className="mt-2 text-xs text-slate-400">
                Təxmini aylıq gəlir: {analysis.estimatedRevenue.min.toLocaleString()}-{analysis.estimatedRevenue.max.toLocaleString()} {analysis.estimatedRevenue.currency}
              </p>
            )}
          </div>

          {/* Strengths */}
          <Section title="Güclü tərəflər" items={analysis.strengths} color="emerald" />

          {/* Weaknesses */}
          <Section title="Zəif tərəflər" items={analysis.weaknesses} color="amber" />

          {/* Red Flags */}
          {analysis.redFlags.length > 0 && (
            <Section title="Kritik problemlər" items={analysis.redFlags} color="red" />
          )}

          {/* Recommendations */}
          {analysis.recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h2 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">Tövsiyələr</h2>
              <div className="space-y-3">
                {analysis.recommendations.map((rec, i) => (
                  <div key={i} className="rounded-xl border border-slate-100 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        rec.priority === 'yüksək' ? 'bg-red-100 text-red-600' :
                        rec.priority === 'orta' ? 'bg-amber-100 text-amber-600' :
                        'bg-slate-100 text-slate-600'
                      }`}>{rec.priority}</span>
                      <span className="text-xs font-semibold text-slate-700">{rec.area}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{rec.action}</p>
                    <p className="mt-1 text-xs text-blue-600">DK Agency: {rec.dkAgencyHelp}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyWhatsApp}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100 active:scale-[0.98]"
            >
              {copied ? <Check size={16} /> : <MessageCircle size={16} />}
              {copied ? 'Kopyalandı!' : 'WhatsApp şablonu'}
            </button>
            <button
              type="button"
              onClick={async () => {
                const { exportAuditToPdf } = await import('@/lib/audit/audit-pdf');
                exportAuditToPdf(audit, analysis);
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 active:scale-[0.98]"
            >
              <FileText size={16} /> PDF ixrac
            </button>
          </div>
        </div>
      )}

      {/* Action History */}
      {audit.actions?.length > 0 && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-bold text-[var(--dk-navy)]">Tarixçə</h2>
          <div className="space-y-2">
            {audit.actions.map((action) => (
              <div key={action.id} className="flex items-center gap-3 text-xs">
                <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">{action.actionType}</span>
                <span className="text-slate-400">{formatDate(action.date)}</span>
                {action.notes && <span className="text-slate-500">{action.notes}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared UI ───────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, small }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; small?: boolean;
}) {
  return (
    <div>
      <label className={`mb-1 block font-semibold text-slate-500 ${small ? 'text-[10px]' : 'text-xs'}`}>{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700 outline-none transition focus:border-[var(--dk-gold)] focus:bg-white ${small ? 'py-2' : 'py-2.5'}`}
      />
    </div>
  );
}

function Section({ title, items, color }: { title: string; items: string[]; color: 'emerald' | 'amber' | 'red' }) {
  if (items.length === 0) return null;
  const colors = {
    emerald: 'border-emerald-200 bg-emerald-50',
    amber: 'border-amber-200 bg-amber-50',
    red: 'border-red-200 bg-red-50',
  };
  const dotColors = { emerald: 'bg-emerald-400', amber: 'bg-amber-400', red: 'bg-red-400' };

  return (
    <div className={`rounded-2xl border p-5 ${colors[color]}`}>
      <h2 className="mb-2 text-sm font-bold text-[var(--dk-navy)]">{title}</h2>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColors[color]}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
