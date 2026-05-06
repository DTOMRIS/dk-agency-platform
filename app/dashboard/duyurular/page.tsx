// app/dashboard/duyurular/page.tsx
// DK Agency Dashboard - Duyuru Merkezi
// Kaynak: egitim-sistemi/portal/admin/announcements mimarisi

'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  Megaphone, Send, Loader2, CheckCircle, Users,
  Building2, ShieldCheck, Bell, X,
  Info, AlertTriangle, Settings
} from 'lucide-react';
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<
  Locale,
  {
    pageTitle: string;
    pageSubtitle: string;
    realtimeBadge: string;
    successTitle: string;
    successDesc: string;
    errorRequired: string;
    sectionTypeTitle: string;
    sectionAudienceTitle: string;
    selectAllBtn: string;
    deselectAllBtn: string;
    noSelectionNote: string;
    sectionContentTitle: string;
    labelTitle: string;
    placeholderTitle: string;
    labelMessage: string;
    placeholderMessage: string;
    labelActionUrl: string;
    previewTitle: string;
    previewDefaultTitle: string;
    previewDefaultMessage: string;
    previewActionText: string;
    btnSending: string;
    btnSend: string;
    infoNote: string;
    roleOptions: Array<{ value: string; label: string; desc: string }>;
    typeOptions: Array<{ value: string; label: string }>;
  }
> = {
  az: {
    pageTitle: 'Elan Mərkəzi',
    pageSubtitle: 'Bildiriş və elanları buradan göndərin',
    realtimeBadge: 'Real-time',
    successTitle: 'Elan Göndərildi!',
    successDesc: 'Bildiriş uğurla çatdırıldı.',
    errorRequired: 'Başlıq və mesaj tələb olunur',
    sectionTypeTitle: 'Elan Növü',
    sectionAudienceTitle: 'Hədəf Auditoriya',
    selectAllBtn: 'Hamısını Seç',
    deselectAllBtn: 'Heç birini Seçmə',
    noSelectionNote: 'Seçim edilmədikdə bütün istifadəçilərə göndərilir',
    sectionContentTitle: 'Məzmun',
    labelTitle: 'Başlıq *',
    placeholderTitle: 'Elan başlığı...',
    labelMessage: 'Mesaj *',
    placeholderMessage: 'Elan məzmunu...',
    labelActionUrl: 'Əməliyyat Linki (istəyə bağlı)',
    previewTitle: 'Önizləmə',
    previewDefaultTitle: 'Elan Başlığı',
    previewDefaultMessage: 'Elan məzmunu burada görünəcək...',
    previewActionText: 'Ətraflı Bax →',
    btnSending: 'Göndərilir...',
    btnSend: 'Elanı Göndər',
    infoNote: 'Elan seçilmiş istifadəçi qruplarına ani olaraq çatdırılacaq. E-poçt bildirişi də göndərilir.',
    roleOptions: [
      { value: 'investor', label: 'İnvestorlar', desc: 'B2B İnvestorlara' },
      { value: 'partner', label: 'Partnerlər', desc: 'İş ortaqlarına' },
      { value: 'admin', label: 'Adminlər', desc: 'Admin komandasına' },
    ],
    typeOptions: [
      { value: 'info', label: 'Məlumat' },
      { value: 'warning', label: 'Xəbərdarlıq' },
      { value: 'success', label: 'Uğur' },
      { value: 'system', label: 'Sistem' },
    ],
  },
  ru: {
    pageTitle: 'Центр уведомлений',
    pageSubtitle: 'Отправляйте уведомления и объявления отсюда',
    realtimeBadge: 'В реальном времени',
    successTitle: 'Объявление отправлено!',
    successDesc: 'Уведомление успешно доставлено.',
    errorRequired: 'Заголовок и сообщение обязательны',
    sectionTypeTitle: 'Тип объявления',
    sectionAudienceTitle: 'Целевая аудитория',
    selectAllBtn: 'Выбрать всё',
    deselectAllBtn: 'Снять все',
    noSelectionNote: 'Если выбор не сделан, отправляется всем пользователям',
    sectionContentTitle: 'Содержание',
    labelTitle: 'Заголовок *',
    placeholderTitle: 'Заголовок объявления...',
    labelMessage: 'Сообщение *',
    placeholderMessage: 'Текст объявления...',
    labelActionUrl: 'Ссылка действия (необязательно)',
    previewTitle: 'Предпросмотр',
    previewDefaultTitle: 'Заголовок объявления',
    previewDefaultMessage: 'Содержание объявления появится здесь...',
    previewActionText: 'Подробнее →',
    btnSending: 'Отправка...',
    btnSend: 'Отправить объявление',
    infoNote: 'Объявление будет мгновенно доставлено выбранным группам пользователей. Также отправляется e-mail уведомление.',
    roleOptions: [
      { value: 'investor', label: 'Инвесторы', desc: 'B2B инвесторам' },
      { value: 'partner', label: 'Партнёры', desc: 'Бизнес-партнёрам' },
      { value: 'admin', label: 'Администраторы', desc: 'Команде администраторов' },
    ],
    typeOptions: [
      { value: 'info', label: 'Информация' },
      { value: 'warning', label: 'Предупреждение' },
      { value: 'success', label: 'Успех' },
      { value: 'system', label: 'Система' },
    ],
  },
  en: {
    pageTitle: 'Announcement Center',
    pageSubtitle: 'Send notifications and announcements from here',
    realtimeBadge: 'Real-time',
    successTitle: 'Announcement Sent!',
    successDesc: 'Notification delivered successfully.',
    errorRequired: 'Title and message are required',
    sectionTypeTitle: 'Announcement Type',
    sectionAudienceTitle: 'Target Audience',
    selectAllBtn: 'Select All',
    deselectAllBtn: 'Deselect All',
    noSelectionNote: 'If no selection is made, it will be sent to all users',
    sectionContentTitle: 'Content',
    labelTitle: 'Title *',
    placeholderTitle: 'Announcement title...',
    labelMessage: 'Message *',
    placeholderMessage: 'Announcement content...',
    labelActionUrl: 'Action Link (optional)',
    previewTitle: 'Preview',
    previewDefaultTitle: 'Announcement Title',
    previewDefaultMessage: 'Announcement content will appear here...',
    previewActionText: 'View Details →',
    btnSending: 'Sending...',
    btnSend: 'Send Announcement',
    infoNote: 'The announcement will be instantly delivered to the selected user groups. An email notification will also be sent.',
    roleOptions: [
      { value: 'investor', label: 'Investors', desc: 'B2B Investors' },
      { value: 'partner', label: 'Partners', desc: 'Business partners' },
      { value: 'admin', label: 'Admins', desc: 'Admin team' },
    ],
    typeOptions: [
      { value: 'info', label: 'Information' },
      { value: 'warning', label: 'Warning' },
      { value: 'success', label: 'Success' },
      { value: 'system', label: 'System' },
    ],
  },
  tr: {
    pageTitle: 'Duyuru Merkezi',
    pageSubtitle: 'Bildirim ve duyuruları buradan gönderin',
    realtimeBadge: 'Real-time',
    successTitle: 'Duyuru Gönderildi!',
    successDesc: 'Bildirim başarıyla iletildi.',
    errorRequired: 'Başlık ve mesaj zorunludur',
    sectionTypeTitle: 'Duyuru Tipi',
    sectionAudienceTitle: 'Hedef Kitle',
    selectAllBtn: 'Tümünü Seç',
    deselectAllBtn: 'Hiçbirini Seçme',
    noSelectionNote: 'Seçim yapılmadığında tüm kullanıcılara gönderilir',
    sectionContentTitle: 'İçerik',
    labelTitle: 'Başlık *',
    placeholderTitle: 'Duyuru başlığı...',
    labelMessage: 'Mesaj *',
    placeholderMessage: 'Duyuru içeriği...',
    labelActionUrl: 'Aksiyon Linki (opsiyonel)',
    previewTitle: 'Önizleme',
    previewDefaultTitle: 'Duyuru Başlığı',
    previewDefaultMessage: 'Duyuru içeriği burada görünecek...',
    previewActionText: 'Detayları Gör →',
    btnSending: 'Gönderiliyor...',
    btnSend: 'Duyuruyu Gönder',
    infoNote: 'Duyuru, seçilen kullanıcı gruplarına anlık olarak iletilecektir. E-posta bildirimi de gönderilir.',
    roleOptions: [
      { value: 'investor', label: 'Yatırımcılar', desc: 'B2B Yatırımcılar' },
      { value: 'partner', label: 'Partnerler', desc: 'İş ortaklarına' },
      { value: 'admin', label: 'Adminler', desc: 'Admin ekibine' },
    ],
    typeOptions: [
      { value: 'info', label: 'Bilgilendirme' },
      { value: 'warning', label: 'Uyarı' },
      { value: 'success', label: 'Başarı' },
      { value: 'system', label: 'Sistem' },
    ],
  },
};

const TYPE_ICONS = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  system: Settings,
};

const TYPE_COLORS = {
  info: 'blue',
  warning: 'amber',
  success: 'green',
  system: 'purple',
} as const;

const ROLE_ICONS = {
  investor: Building2,
  partner: Users,
  admin: ShieldCheck,
};

export default function DashboardDuyurularPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

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
    if (selectedRoles.length === copy.roleOptions.length) {
      setSelectedRoles([]);
    } else {
      setSelectedRoles(copy.roleOptions.map(r => r.value));
    }
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      setError(copy.errorRequired);
      return;
    }

    setSending(true);
    setError('');

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

  const typeConfig = copy.typeOptions.find(o => o.value === type) ?? copy.typeOptions[0];
  const typeColor = TYPE_COLORS[type as keyof typeof TYPE_COLORS] ?? 'blue';
  const TypeIcon = TYPE_ICONS[type as keyof typeof TYPE_ICONS] ?? Info;

  const colorVariants = {
    blue: {
      border: 'border-blue-200 bg-blue-50',
      badge: 'bg-blue-500',
      active: 'bg-blue-50 border-blue-500 text-blue-600',
    },
    amber: {
      border: 'border-amber-200 bg-amber-50',
      badge: 'bg-amber-500',
      active: 'bg-amber-50 border-amber-500 text-amber-600',
    },
    green: {
      border: 'border-green-200 bg-green-50',
      badge: 'bg-green-500',
      active: 'bg-green-50 border-green-500 text-green-600',
    },
    purple: {
      border: 'border-purple-200 bg-purple-50',
      badge: 'bg-purple-500',
      active: 'bg-purple-50 border-purple-500 text-purple-600',
    },
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-xl">
            <Megaphone size={24} className="text-dk-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
            <p className="text-gray-500 text-sm mt-0.5">{copy.pageSubtitle}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-red-50 rounded-xl">
          <Bell size={14} className="text-dk-red" />
          <span className="text-xs font-bold text-dk-red">{copy.realtimeBadge}</span>
        </div>
      </div>

      {/* Success Banner */}
      {sent && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 p-4 text-white flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <div>
            <p className="font-bold">{copy.successTitle}</p>
            <p className="text-white/80 text-sm">{copy.successDesc}</p>
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
          {/* Type */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{copy.sectionTypeTitle}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {copy.typeOptions.map((opt) => {
                const Icon = TYPE_ICONS[opt.value as keyof typeof TYPE_ICONS] ?? Info;
                const isActive = type === opt.value;
                const color = TYPE_COLORS[opt.value as keyof typeof TYPE_COLORS] ?? 'blue';

                return (
                  <button
                    key={opt.value}
                    onClick={() => setType(opt.value)}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? colorVariants[color].active
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

          {/* Audience */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900">{copy.sectionAudienceTitle}</h3>
              <button
                onClick={selectAll}
                className="text-sm text-dk-red font-medium hover:text-dk-red-strong"
              >
                {selectedRoles.length === copy.roleOptions.length ? copy.deselectAllBtn : copy.selectAllBtn}
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-3">
              {copy.roleOptions.map((role) => {
                const Icon = ROLE_ICONS[role.value as keyof typeof ROLE_ICONS] ?? Users;
                const isSelected = selectedRoles.includes(role.value);

                return (
                  <button
                    key={role.value}
                    onClick={() => toggleRole(role.value)}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-dk-red bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Icon size={24} className={isSelected ? 'text-dk-red' : 'text-gray-400'} />
                    <p className={`font-medium mt-2 ${isSelected ? 'text-dk-red' : 'text-gray-700'}`}>
                      {role.label}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{role.desc}</p>
                  </button>
                );
              })}
            </div>
            {selectedRoles.length === 0 && (
              <p className="text-sm text-gray-500 mt-3 text-center">{copy.noSelectionNote}</p>
            )}
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{copy.sectionContentTitle}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.labelTitle}</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={copy.placeholderTitle}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.labelMessage}</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={copy.placeholderMessage}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{copy.labelActionUrl}</label>
                <input
                  type="url"
                  value={actionUrl}
                  onChange={(e) => setActionUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-dk-red/20 focus:border-dk-red"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preview & Send */}
        <div className="space-y-6">
          {/* Preview */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4">{copy.previewTitle}</h3>
            <div className={`rounded-xl border-2 p-4 ${colorVariants[typeColor].border}`}>
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorVariants[typeColor].badge}`}>
                  {React.createElement(TypeIcon, { size: 20, className: 'text-white' })}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-gray-900">
                    {title || copy.previewDefaultTitle}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {message || copy.previewDefaultMessage}
                  </p>
                  {actionUrl && (
                    <a href={actionUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-dk-red font-medium mt-2 inline-block">
                      {copy.previewActionText}
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
            className="w-full flex items-center justify-center gap-3 bg-dk-red hover:bg-dk-red-strong disabled:bg-gray-300 text-white px-6 py-4 rounded-xl font-bold transition-colors"
          >
            {sending ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {copy.btnSending}
              </>
            ) : (
              <>
                <Send size={20} />
                {copy.btnSend}
              </>
            )}
          </button>

          {/* Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500">{copy.infoNote}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
