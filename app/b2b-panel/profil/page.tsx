'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Building2, Camera, Check, Globe, Mail, MapPin, Phone,
  Save, Shield, User, FileText, AlertCircle, Loader2, Send,
  Instagram, Linkedin, MessageCircle, X,
} from 'lucide-react';

const LANGUAGES = [
  { value: 'az', label: 'Azərbaycanca' },
  { value: 'ru', label: 'Русский' },
  { value: 'en', label: 'English' },
  { value: 'tr', label: 'Türkçe' },
];

const SECTORS = [
  'Restoran', 'Kafe', 'Bar / Pub', 'Fast Food',
  'Otel / Pansiyon', 'Catering', 'Digər',
];

type ApprovalStatus = 'draft' | 'submitted' | 'approved' | 'rejected';

const STATUS_MAP: Record<ApprovalStatus, { label: string; color: string; bg: string; icon: typeof Check }> = {
  draft: { label: 'Qaralama — hələ göndərilməyib', color: 'text-slate-600', bg: 'border-slate-200 bg-slate-50', icon: FileText },
  submitted: { label: 'Admin yoxlamasını gözləyir', color: 'text-amber-700', bg: 'border-amber-200 bg-amber-50', icon: AlertCircle },
  approved: { label: 'Profil təsdiqlənib — kataloqda görünür', color: 'text-emerald-700', bg: 'border-emerald-200 bg-emerald-50', icon: Check },
  rejected: { label: 'Rədd edildi — düzəlib yenidən göndərin', color: 'text-red-700', bg: 'border-red-200 bg-red-50', icon: X },
};

interface FormData {
  company: string;
  sector: string;
  description: string;
  voen: string;
  city: string;
  district: string;
  streetAddress: string;
  contactPhone: string;
  whatsapp: string;
  website: string;
  authorizedPerson: string;
  position: string;
  bio: string;
  instagram: string;
  linkedin: string;
  language: string;
}

const EMPTY_FORM: FormData = {
  company: '', sector: '', description: '', voen: '',
  city: '', district: '', streetAddress: '',
  contactPhone: '', whatsapp: '', website: '',
  authorizedPerson: '', position: '',
  bio: '', instagram: '', linkedin: '', language: 'az',
};

export default function ProfilPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const [approvalStatus, setApprovalStatus] = useState<ApprovalStatus>('draft');
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [error, setError] = useState('');

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/user/profile');
      if (!res.ok) return;
      const data = await res.json();

      if (data.memberProfile) {
        const mp = data.memberProfile;
        setForm({
          company: mp.company || '',
          sector: mp.sector || '',
          description: mp.description || '',
          voen: mp.voen || '',
          city: mp.city || '',
          district: mp.district || '',
          streetAddress: mp.streetAddress || '',
          contactPhone: mp.contactPhone || '',
          whatsapp: mp.whatsapp || '',
          website: mp.website || '',
          authorizedPerson: mp.authorizedPerson || '',
          position: mp.position || '',
          bio: mp.bio || '',
          instagram: mp.instagram || '',
          linkedin: mp.linkedin || '',
          language: mp.language || 'az',
        });
        setLogoPreview(mp.logoUrl || null);
        setApprovalStatus(mp.approvalStatus || 'draft');
        setRejectionReason(mp.rejectionReason || null);
        setIsPublic(mp.visibilitySettings?.isPublic !== false);
      }
    } catch { /* network error */ }
    setLoading(false);
  }, []);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 800;
        const scale = Math.min(1, maxW / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          setLogoPreview(canvas.toDataURL('image/jpeg', 0.8));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (submitForReview = false) => {
    if (submitForReview) {
      if (!form.company.trim()) { setError('Şirkət adı məcburidir.'); return; }
      if (!form.contactPhone.trim()) { setError('Telefon məcburidir.'); return; }
      setSubmitting(true);
    } else {
      setSaving(true);
    }
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          logoUrl: logoPreview,
          visibilitySettings: { isPublic },
          submitForReview,
        }),
      });

      if (res.ok) {
        setSaved(true);
        if (submitForReview) {
          setApprovalStatus('submitted');
        }
        // Clear old localStorage data
        try { localStorage.removeItem('dk_company_profile'); } catch { /* ignore */ }
      } else {
        setError('Xəta baş verdi. Yenidən cəhd edin.');
      }
    } catch {
      setError('Şəbəkə xətası.');
    }

    setSaving(false);
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={24} className="animate-spin text-slate-400" />
      </div>
    );
  }

  const statusCfg = STATUS_MAP[approvalStatus];
  const StatusIcon = statusCfg.icon;
  const isReadonly = approvalStatus === 'submitted' || approvalStatus === 'approved';

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Şirkət profili</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bilgiləriniz admin tərəfindən yoxlanıb təsdiq olunacaq. Təsdiqlənmiş profil kataloqda görünəcək.
        </p>
      </div>

      {/* Approval status banner */}
      <div className={`mb-6 flex items-start gap-3 rounded-xl border px-5 py-3 ${statusCfg.bg}`}>
        <StatusIcon size={18} className={`${statusCfg.color} flex-shrink-0 mt-0.5`} />
        <div>
          <p className={`text-sm font-semibold ${statusCfg.color}`}>{statusCfg.label}</p>
          {rejectionReason && approvalStatus === 'rejected' && (
            <p className="text-xs text-red-600 mt-1">Səbəb: {rejectionReason}</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      <div className="space-y-8">
        {/* Logo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Şirkət logosu</h2>
          <div className="flex items-center gap-6">
            <div className="relative">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo" className="w-24 h-24 rounded-2xl object-cover border border-slate-200" />
              ) : (
                <div className="w-24 h-24 rounded-2xl bg-slate-100 flex items-center justify-center border border-slate-200">
                  <Building2 size={32} className="text-slate-400" />
                </div>
              )}
              {!isReadonly && (
                <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-[var(--dk-red)] text-white flex items-center justify-center cursor-pointer hover:bg-[var(--dk-red)]/90 shadow-lg">
                  <Camera size={14} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                </label>
              )}
            </div>
            <div className="text-xs text-slate-500">
              <p>Max 2MB, avtomatik 800px-ə kiçildiləcək.</p>
              <p className="mt-1">JPG, PNG formatları.</p>
            </div>
          </div>
        </div>

        {/* Əsas bilgilər */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Əsas məlumatlar</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Şirkət adı *" icon={Building2} value={form.company} onChange={(v) => handleChange('company', v)} placeholder="DK Agency MMC" disabled={isReadonly} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sektor *</label>
              <select value={form.sector} onChange={(e) => handleChange('sector', e.target.value)} disabled={isReadonly}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20 focus:border-[var(--dk-red)] disabled:bg-slate-50 disabled:text-slate-500">
                <option value="">Seçin...</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Şirkət təsviri</label>
              <textarea value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} disabled={isReadonly}
                placeholder="Şirkətiniz haqqında qısa məlumat..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20 focus:border-[var(--dk-red)] disabled:bg-slate-50 disabled:text-slate-500" />
            </div>
            <Field label="VÖEN" icon={FileText} value={form.voen} onChange={(v) => handleChange('voen', v)} placeholder="1234567890" disabled={isReadonly} />
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1"><Globe size={12} className="inline mr-1" /> Dil seçimi</label>
              <select value={form.language} onChange={(e) => handleChange('language', e.target.value)} disabled={isReadonly}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20 focus:border-[var(--dk-red)] disabled:bg-slate-50 disabled:text-slate-500">
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ünvan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4"><MapPin size={14} className="inline mr-1" /> Ünvan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Şəhər *" value={form.city} onChange={(v) => handleChange('city', v)} placeholder="Bakı" disabled={isReadonly} />
            <Field label="Rayon" value={form.district} onChange={(v) => handleChange('district', v)} placeholder="Nəsimi" disabled={isReadonly} />
            <div className="sm:col-span-2">
              <Field label="Tam ünvan" value={form.streetAddress} onChange={(v) => handleChange('streetAddress', v)} placeholder="Nizami küç. 45, Bakı" disabled={isReadonly} />
            </div>
          </div>
        </div>

        {/* Əlaqə */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Əlaqə məlumatları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Telefon *" icon={Phone} value={form.contactPhone} onChange={(v) => handleChange('contactPhone', v)} placeholder="+994 50 XXX XX XX" disabled={isReadonly} />
            <Field label="WhatsApp" icon={MessageCircle} value={form.whatsapp} onChange={(v) => handleChange('whatsapp', v)} placeholder="+994 50 XXX XX XX" disabled={isReadonly} />
            <Field label="Veb-sayt" icon={Globe} value={form.website} onChange={(v) => handleChange('website', v)} placeholder="https://company.az" disabled={isReadonly} />
            <Field label="Əlaqə şəxsi" icon={User} value={form.authorizedPerson} onChange={(v) => handleChange('authorizedPerson', v)} placeholder="Ad Soyad" disabled={isReadonly} />
            <Field label="Vəzifə" value={form.position} onChange={(v) => handleChange('position', v)} placeholder="Direktor" disabled={isReadonly} />
          </div>
        </div>

        {/* Bio & Social */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Haqqında & Sosial</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Bio</label>
              <textarea value={form.bio} onChange={(e) => handleChange('bio', e.target.value)} rows={3} disabled={isReadonly}
                placeholder="Təcrübəniz, uğurlarınız..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20 focus:border-[var(--dk-red)] disabled:bg-slate-50 disabled:text-slate-500" />
            </div>
            <Field label="Instagram" icon={Instagram} value={form.instagram} onChange={(v) => handleChange('instagram', v)} placeholder="@company" disabled={isReadonly} />
            <Field label="LinkedIn" icon={Linkedin} value={form.linkedin} onChange={(v) => handleChange('linkedin', v)} placeholder="https://linkedin.com/company/..." disabled={isReadonly} />
          </div>
        </div>

        {/* Görünürlük */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4"><Shield size={14} className="inline mr-1" /> Profil görünürlüyü</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {isPublic ? 'Profil digər üzvlərə görünür' : 'Profil gizlidir'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPublic ? 'Kataloqda göstərilir (admin təsdiqi lazım)' : 'Yalnız siz görürsünüz'}
              </p>
            </div>
            <button type="button" onClick={() => { if (!isReadonly) setIsPublic(!isPublic); }} disabled={isReadonly}
              className={`relative w-12 h-7 rounded-full transition-colors disabled:opacity-50 ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}>
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Actions */}
        {!isReadonly && (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4">
            <p className="text-xs text-slate-400">
              <FileText size={12} className="inline mr-1" />
              Qaralama olaraq saxlayın və ya onaya göndərin.
            </p>
            <div className="flex gap-3">
              <button onClick={() => handleSave(false)} disabled={saving || submitting}
                className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {saving ? 'Saxlanılır...' : 'Qaralama saxla'}
              </button>
              <button onClick={() => handleSave(true)} disabled={saving || submitting}
                className="flex items-center gap-2 rounded-xl bg-[var(--dk-red)] px-5 py-3 text-sm font-bold text-white hover:bg-[var(--dk-red)]/90 disabled:opacity-50">
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {submitting ? 'Göndərilir...' : 'Onaya göndər'}
              </button>
            </div>
          </div>
        )}

        {isReadonly && approvalStatus !== 'approved' && (
          <p className="text-center text-sm text-amber-600 py-4">
            Profil admin yoxlamasında — düzəliş etmək üçün nəticəni gözləyin.
          </p>
        )}
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, placeholder, disabled }: {
  label: string;
  icon?: React.ComponentType<{ size: number; className?: string }>;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  disabled?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">
        {Icon && <Icon size={12} className="inline mr-1" />} {label}
      </label>
      <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} disabled={disabled}
        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dk-red)]/20 focus:border-[var(--dk-red)] disabled:bg-slate-50 disabled:text-slate-500" />
    </div>
  );
}
