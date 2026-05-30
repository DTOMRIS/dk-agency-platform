'use client';

import { useState } from 'react';
import {
  Building2, Camera, Check, Globe, Mail, MapPin, Phone,
  Save, Shield, User, FileText, Eye, EyeOff, AlertCircle,
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

export default function ProfilPage() {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isPublic, setIsPublic] = useState(true);
  const [form, setForm] = useState({
    companyName: '',
    sector: '',
    description: '',
    city: '',
    district: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    contactPerson: '',
    contactRole: '',
    language: 'az',
    voen: '',
  });

  const handleChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Client-side resize to max 800px, ~200KB
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

  const handleSave = async () => {
    setSaving(true);
    // TODO: POST /api/user/profile — admin onay gözləyəcək
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-900">Şirkət profili</h1>
        <p className="mt-1 text-sm text-slate-500">
          Bilgiləriniz admin tərəfindən yoxlanıb təsdiq olunacaq. Digər üzvlər təsdiqlənmiş profili görə biləcək.
        </p>
      </div>

      {/* Admin onay statusu */}
      <div className="mb-6 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-5 py-3">
        <AlertCircle size={18} className="text-amber-600 flex-shrink-0" />
        <p className="text-sm text-amber-800">
          <strong>Onay gözləyir.</strong> Profiliniz admin tərəfindən yoxlanacaq. Təsdiqdən sonra digər üzvlərə görünəcək.
        </p>
      </div>

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
              <label className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dk-red text-white flex items-center justify-center cursor-pointer hover:bg-dk-red/90 shadow-lg">
                <Camera size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
              </label>
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
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Building2 size={12} className="inline mr-1" /> Şirkət adı *
              </label>
              <input
                type="text"
                value={form.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                placeholder="DK Agency MMC"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Sektor *</label>
              <select
                value={form.sector}
                onChange={(e) => handleChange('sector', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
              >
                <option value="">Seçin...</option>
                {SECTORS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Şirkət təsviri</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange('description', e.target.value)}
                rows={3}
                placeholder="Şirkətiniz haqqında qısa məlumat..."
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm resize-none focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">VÖEN</label>
              <input
                type="text"
                value={form.voen}
                onChange={(e) => handleChange('voen', e.target.value)}
                placeholder="1234567890"
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Globe size={12} className="inline mr-1" /> Dil seçimi
              </label>
              <select
                value={form.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
              >
                {LANGUAGES.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Ünvan */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <MapPin size={14} className="inline mr-1" /> Ünvan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Şəhər *</label>
              <input type="text" value={form.city} onChange={(e) => handleChange('city', e.target.value)}
                placeholder="Bakı" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Rayon</label>
              <input type="text" value={form.district} onChange={(e) => handleChange('district', e.target.value)}
                placeholder="Nəsimi" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Tam ünvan</label>
              <input type="text" value={form.address} onChange={(e) => handleChange('address', e.target.value)}
                placeholder="Nizami küç. 45, Bakı" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
          </div>
        </div>

        {/* Əlaqə */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">Əlaqə məlumatları</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Phone size={12} className="inline mr-1" /> Telefon *
              </label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="+994 50 XXX XX XX" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Mail size={12} className="inline mr-1" /> E-poçt
              </label>
              <input type="email" value={form.email} onChange={(e) => handleChange('email', e.target.value)}
                placeholder="info@company.az" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <Globe size={12} className="inline mr-1" /> Veb-sayt
              </label>
              <input type="url" value={form.website} onChange={(e) => handleChange('website', e.target.value)}
                placeholder="https://company.az" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                <User size={12} className="inline mr-1" /> Əlaqə şəxsi
              </label>
              <input type="text" value={form.contactPerson} onChange={(e) => handleChange('contactPerson', e.target.value)}
                placeholder="Ad Soyad" className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red" />
            </div>
          </div>
        </div>

        {/* Görünürlük */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            <Shield size={14} className="inline mr-1" /> Profil görünürlüyü
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-700">
                {isPublic ? 'Profil digər üzvlərə görünür' : 'Profil gizlidir'}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                {isPublic ? 'Kataloqda göstərilir (admin təsdiqi lazım)' : 'Yalnız siz görürsünüz'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsPublic(!isPublic)}
              className={`relative w-12 h-7 rounded-full transition-colors ${isPublic ? 'bg-emerald-500' : 'bg-slate-300'}`}
            >
              <span className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${isPublic ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        </div>

        {/* Saxla */}
        <div className="flex items-center justify-between pt-4">
          <p className="text-xs text-slate-400">
            <FileText size={12} className="inline mr-1" />
            Saxladıqdan sonra admin yoxlayıb təsdiq edəcək.
          </p>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-dk-red px-6 py-3 text-sm font-bold text-white hover:bg-dk-red/90 disabled:opacity-50"
          >
            {saving ? (
              <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
            ) : saved ? (
              <Check size={16} />
            ) : (
              <Save size={16} />
            )}
            {saving ? 'Saxlanılır...' : saved ? 'Saxlanıldı!' : 'Saxla və göndər'}
          </button>
        </div>
      </div>
    </div>
  );
}
