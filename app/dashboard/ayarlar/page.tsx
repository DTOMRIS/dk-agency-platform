// app/dashboard/ayarlar/page.tsx
// DK Agency Admin - Sistem Ayarları

'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Bell,
  Shield,
  Mail,
  Database,
  Palette,
  Key,
  Save,
  RefreshCw,
  Check,
  Moon,
  Sun,
  Smartphone,
  Server,
  Clock,
  Languages,
  CreditCard,
  FileText,
} from 'lucide-react';

type SettingsTab = 'general' | 'notifications' | 'security' | 'integrations' | 'appearance';

// SettingsTab type above covers tab navigation

export default function AyarlarPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>('general');
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState({
    // General
    siteName: 'DK Agency',
    siteDescription: 'HORECA B2B Yatırım Platformu',
    language: 'az',
    timezone: 'Asia/Baku',
    currency: 'AZN',
    dateFormat: 'DD/MM/YYYY',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    newListingAlert: true,
    partnerAlert: true,
    dealFlowAlert: true,
    weeklyReport: true,
    
    // Security
    twoFactorAuth: true,
    sessionTimeout: '30',
    ipWhitelist: false,
    auditLog: true,
    passwordExpiry: '90',
    
    // Integrations
    geminiApiKey: 'AIzaSy***************',
    emailProvider: 'sendgrid',
    smsProvider: 'twilio',
    analyticsId: 'GA-XXXXXXX',
    
    // Appearance
    theme: 'light',
    primaryColor: '#dc2626',
    sidebarStyle: 'dark',
    compactMode: false,
  });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const tabs = [
    { id: 'general', label: 'Genel', icon: Settings },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'integrations', label: 'Entegrasyonlar', icon: Database },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
  ];

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Adı</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => setSettings({ ...settings, siteName: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Site Açıklaması</label>
          <input
            type="text"
            value={settings.siteDescription}
            onChange={(e) => setSettings({ ...settings, siteDescription: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Languages size={16} className="inline mr-2" />
            Dil
          </label>
          <select
            value={settings.language}
            onChange={(e) => setSettings({ ...settings, language: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="az">Azərbaycan dili</option>
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="ru">Русский</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Clock size={16} className="inline mr-2" />
            Saat Dilimi
          </label>
          <select
            value={settings.timezone}
            onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="Asia/Baku">Bakü (UTC+4)</option>
            <option value="Europe/Istanbul">İstanbul (UTC+3)</option>
            <option value="Europe/London">Londra (UTC+0)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <CreditCard size={16} className="inline mr-2" />
            Para Birimi
          </label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="AZN">Azerbaycan Manatı (₼)</option>
            <option value="TRY">Türk Lirası (₺)</option>
            <option value="USD">ABD Doları ($)</option>
            <option value="EUR">Euro (€)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText size={16} className="inline mr-2" />
            Tarih Formatı
          </label>
          <select
            value={settings.dateFormat}
            onChange={(e) => setSettings({ ...settings, dateFormat: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-blue-700">
          <Bell size={18} />
          <span className="font-medium">Bildirim kanallarını ve tercihlerinizi yönetin</span>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Bildirim Kanalları</h3>
        {[
          { key: 'emailNotifications', label: 'E-posta Bildirimleri', icon: Mail, desc: 'Önemli güncellemeler için e-posta al' },
          { key: 'pushNotifications', label: 'Push Bildirimleri', icon: Smartphone, desc: 'Tarayıcı push bildirimleri' },
          { key: 'smsNotifications', label: 'SMS Bildirimleri', icon: Smartphone, desc: 'Kritik uyarılar için SMS' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
                <item.icon size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Bildirim Türleri</h3>
        {[
          { key: 'newListingAlert', label: 'Yeni İlan Bildirimi', desc: 'Yeni ilan eklendiğinde bildir' },
          { key: 'partnerAlert', label: 'Partner Aktivitesi', desc: 'Partner işlemleri için bildir' },
          { key: 'dealFlowAlert', label: 'Deal Flow Güncellemesi', desc: 'Anlaşma durumu değişikliklerinde bildir' },
          { key: 'weeklyReport', label: 'Haftalık Rapor', desc: 'Her Pazartesi özet rapor gönder' },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div>
              <p className="font-medium text-gray-900">{item.label}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-amber-700">
          <Shield size={18} />
          <span className="font-medium">Güvenlik ayarları platformun güvenliğini etkiler</span>
        </div>
      </div>

      <div className="space-y-4">
        {[
          { key: 'twoFactorAuth', label: 'İki Faktörlü Doğrulama', desc: 'Admin girişlerinde 2FA zorunlu', icon: Key },
          { key: 'auditLog', label: 'Denetim Kaydı', desc: 'Tüm işlemleri logla', icon: FileText },
          { key: 'ipWhitelist', label: 'IP Beyaz Liste', desc: 'Sadece belirli IP\'lerden erişim', icon: Globe },
        ].map((item) => (
          <div key={item.key} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <item.icon size={20} className="text-red-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            </div>
            <button
              onClick={() => setSettings({ ...settings, [item.key]: !settings[item.key as keyof typeof settings] })}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings[item.key as keyof typeof settings] ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings[item.key as keyof typeof settings] ? 'translate-x-6' : 'translate-x-0.5'
              }`} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Oturum Zaman Aşımı (dakika)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => setSettings({ ...settings, sessionTimeout: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Şifre Geçerlilik Süresi (gün)</label>
          <input
            type="number"
            value={settings.passwordExpiry}
            onChange={(e) => setSettings({ ...settings, passwordExpiry: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
      </div>
    </div>
  );

  const renderIntegrationsSettings = () => (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 text-purple-700">
          <Server size={18} />
          <span className="font-medium">Üçüncü parti servis entegrasyonları</span>
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Key size={16} className="inline mr-2" />
            Gemini API Key
          </label>
          <input
            type="password"
            value={settings.geminiApiKey}
            onChange={(e) => setSettings({ ...settings, geminiApiKey: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">Almila AI için Google Gemini API anahtarı</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">E-posta Sağlayıcı</label>
            <select
              value={settings.emailProvider}
              onChange={(e) => setSettings({ ...settings, emailProvider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="sendgrid">SendGrid</option>
              <option value="mailgun">Mailgun</option>
              <option value="ses">Amazon SES</option>
              <option value="smtp">Custom SMTP</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">SMS Sağlayıcı</label>
            <select
              value={settings.smsProvider}
              onChange={(e) => setSettings({ ...settings, smsProvider: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            >
              <option value="twilio">Twilio</option>
              <option value="nexmo">Nexmo</option>
              <option value="messagebird">MessageBird</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
          <input
            type="text"
            value={settings.analyticsId}
            onChange={(e) => setSettings({ ...settings, analyticsId: e.target.value })}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20"
            placeholder="GA-XXXXXXX"
          />
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Tema</h3>
        <div className="grid grid-cols-3 gap-4">
          {[
            { value: 'light', label: 'Açık', icon: Sun },
            { value: 'dark', label: 'Koyu', icon: Moon },
            { value: 'system', label: 'Sistem', icon: Smartphone },
          ].map((theme) => (
            <button
              key={theme.value}
              onClick={() => setSettings({ ...settings, theme: theme.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.theme === theme.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <theme.icon size={24} className={settings.theme === theme.value ? 'text-red-600 mx-auto mb-2' : 'text-gray-400 mx-auto mb-2'} />
              <p className={`text-sm font-medium ${settings.theme === theme.value ? 'text-red-700' : 'text-gray-700'}`}>
                {theme.label}
              </p>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-gray-500 uppercase">Sidebar Stili</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { value: 'dark', label: 'Koyu Sidebar' },
            { value: 'light', label: 'Açık Sidebar' },
          ].map((style) => (
            <button
              key={style.value}
              onClick={() => setSettings({ ...settings, sidebarStyle: style.value })}
              className={`p-4 rounded-xl border-2 transition-all ${
                settings.sidebarStyle === style.value
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className={`h-16 rounded-lg mb-2 ${style.value === 'dark' ? 'bg-gray-900' : 'bg-gray-100 border border-gray-200'}`} />
              <p className="text-sm font-medium text-gray-700">{style.label}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
        <div>
          <p className="font-medium text-gray-900">Kompakt Mod</p>
          <p className="text-sm text-gray-500">Daha az boşluk ile kompakt görünüm</p>
        </div>
        <button
          onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
          className={`w-12 h-6 rounded-full transition-colors ${
            settings.compactMode ? 'bg-green-500' : 'bg-gray-300'
          }`}
        >
          <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
            settings.compactMode ? 'translate-x-6' : 'translate-x-0.5'
          }`} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Ayarları</h1>
          <p className="text-sm text-gray-500 mt-1">Platform yapılandırma ve tercihler</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Sıfırla</span>
          </button>
          <button
            onClick={handleSave}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
              saved
                ? 'bg-green-600 text-white'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {saved ? <Check size={16} /> : <Save size={16} />}
            <span className="text-sm font-bold">{saved ? 'Kaydedildi!' : 'Kaydet'}</span>
          </button>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Tabs Sidebar */}
        <div className="w-64 shrink-0">
          <div className="bg-white rounded-xl border border-gray-200 p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as SettingsTab)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-red-50 text-red-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <tab.icon size={18} className={activeTab === tab.id ? 'text-red-600' : 'text-gray-400'} />
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 p-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'integrations' && renderIntegrationsSettings()}
          {activeTab === 'appearance' && renderAppearanceSettings()}
        </div>
      </div>
    </div>
  );
}
