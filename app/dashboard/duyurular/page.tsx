// app/dashboard/duyurular/page.tsx
// DK Agency Dashboard - Duyuru Merkezi
// Kaynak: egitim-sistemi/portal/admin/announcements mimarisi

'use client';

import React, { useState } from 'react';
import {
  Megaphone, Send, Loader2, CheckCircle, Users,
  Building2, ShieldCheck, Bell, X,
  Info, AlertTriangle, Settings
} from 'lucide-react';

const ROLE_OPTIONS = [
  { value: 'investor', label: 'Yatırımcılar', icon: Building2, desc: 'B2B Yatırımcılar' },
  { value: 'partner', label: 'Partnerler', icon: Users, desc: 'İş ortaklarına' },
  { value: 'admin', label: 'Adminler', icon: ShieldCheck, desc: 'Admin ekibine' },
];

const TYPE_OPTIONS = [
  { value: 'info', label: 'Bilgilendirme', icon: Info, color: 'blue' },
  { value: 'warning', label: 'Uyarı', icon: AlertTriangle, color: 'amber' },
  { value: 'success', label: 'Başarı', icon: CheckCircle, color: 'green' },
  { value: 'system', label: 'Sistem', icon: Settings, color: 'purple' },
];

export default function DashboardDuyurularPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('info');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [actionUrl, setActionUrl] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const selectAll = () => {
    if (selectedRoles.length === ROLE_OPTIONS.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(ROLE_OPTIONS.map(r => r.value));
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError('Başlık ve mesaj zorunludur');
      return;
    }

    setSending(true);
    setError('');

    // Simülasyon
    setTimeout(() => {
      setSent(true);
      setTitle('');
      setMessage('');
      setActionUrl('');
      setSelectedRoles([]);
      setSending(false);
      setTimeout(() => setSent(false), 5000);
    }, 1500);
  };

  const getTypeConfig = (t: string) => TYPE_OPTIONS.find(o => o.value === t) || TYPE_OPTIONS[0];
  const typeConfig = getTypeConfig(type);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-xl">
            <Megaphone size={24} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Duyuru Merkezi</h1>
            <p className="text-gray-500 text-sm mt-0.5">Bildirim ve duyuruları buradan gönderin</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl">
          <Bell size={14} className="text-red-600" />
          <span className="text-xs font-bold text-red-600">Real-time</span>
        </div>
      </div>

      {/* Success Banner */}
      {sent && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="font-bold">Duyuru Gönderildi!</p>
            <p className="text-white/80 text-sm">Bildirim başarıyla iletildi.</p>
          </div>
          <button onClick={() => setSent(false)} className="ml-auto">
            <X size={20} />
          </button>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-4 text-red-700 flex items-center gap-3">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <button onClick={() => setError('')} className="ml-auto">
            <X size={18} />
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Duyuru Tipi */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Duyuru Tipi</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const isActive = type === opt.value;
                const colors = {
                  blue: 'bg-blue-50 border-blue-500 text-blue-600',
                  amber: 'bg-amber-50 border-amber-500 text-amber-600',
                  green: 'bg-green-50 border-green-500 text-green-600',
                  purple: 'bg-purple-50 border-purple-500 text-purple-600',
                };

                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive 
                        ? colors[opt.color as keyof typeof colors] 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className={isActive ? '' : 'text-gray-400'} />
                    <p className={`text-sm font-medium mt-2 ${isActive ? '' : 'text-gray-600'}`}>
                      {opt.label}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hedef Kitle */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">Hedef Kitle</h3>
              <button
                onClick={selectAll}
                className="text-sm text-red-600 font-medium hover:text-red-700"
              >
                {selectedRoles.length === ROLE_OPTIONS.length ? 'Hiçbirini Seçme' : 'Tümünü Seç'}
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {ROLE_OPTIONS.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRoles.includes(role.value);

                return (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className={isSelected ? 'text-red-600' : 'text-gray-400'} />
                    <p className={`font-medium mt-2 ${isSelected ? 'text-red-700' : 'text-gray-700'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{role.desc}</p>
                  </button>
                );
              })}
            </div>
            {selectedRoles.length === 0 && (
              <p className="text-sm text-gray-500 mt-3 text-center">
                Seçim yapılmadığında tüm kullanıcılara gönderilir
              </p>
            )}
          </div>

          {/* İçerik */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">İçerik</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlık *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Duyuru başlığı..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mesaj *</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Duyuru içeriği..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Aksiyon Linki (opsiyonel)</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Send */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">Önizleme</h3>
            <div className={`rounded-xl border-2 p-4 ${
              typeConfig.color === 'blue' ? 'border-blue-200 bg-blue-50' :
              typeConfig.color === 'amber' ? 'border-amber-200 bg-amber-50' :
              typeConfig.color === 'green' ? 'border-green-200 bg-green-50' :
              'border-purple-200 bg-purple-50'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  typeConfig.color === 'blue' ? 'bg-blue-500' :
                  typeConfig.color === 'amber' ? 'bg-amber-500' :
                  typeConfig.color === 'green' ? 'bg-green-500' :
                  'bg-purple-500'
                }`}>
                  {React.createElement(typeConfig.icon, { size: 20, className: 'text-white' })}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {title || 'Duyuru Başlığı'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {message || 'Duyuru içeriği burada görünecek...'}
                  </p>
                  {actionUrl && (
                    <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-red-600 font-medium mt-2 inline-block">
                      Detayları Gör →
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={sending || !title.trim() || !message.trim()}
            className="w-full flex items-center justify-center gap-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-4 rounded-xl font-bold transition-colors"
          >
            {sending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Send size={20} />
                Duyuruyu Gönder
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">
              Duyuru, seçilen kullanıcı gruplarına anlık olarak iletilecektir. 
              E-posta bildirimi de gönderilir.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

