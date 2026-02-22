// app/dashboard/etkinlikler/page.tsx
// DK Agency Admin - Etkinlik ve Aktivite Takibi

'use client';

import { useState } from 'react';
import {
  Activity,
  Calendar,
  Clock,
  User,
  FileText,
  MessageSquare,
  DollarSign,
  Building2,
  Filter,
  Search,
  ChevronRight,
  Eye,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  XCircle,
  TrendingUp,
  Users
} from 'lucide-react';

type ActivityType = 'all' | 'listing' | 'partner' | 'deal' | 'message' | 'system';

interface ActivityItem {
  id: number;
  type: 'listing' | 'partner' | 'deal' | 'message' | 'system';
  action: string;
  description: string;
  user: string;
  userRole: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
  metadata?: {
    target?: string;
    value?: string;
    link?: string;
  };
}

const activities: ActivityItem[] = [
  {
    id: 1,
    type: 'listing',
    action: 'İlan Oluşturuldu',
    description: 'Fine Dining Bakü Merkez ilanı oluşturuldu',
    user: 'Elvin Guliyev',
    userRole: 'Partner',
    timestamp: '2026-02-21 14:32:15',
    status: 'success',
    metadata: { target: 'İlan #2026-0156', value: '450,000 ₼' }
  },
  {
    id: 2,
    type: 'partner',
    action: 'Partner Başvurusu',
    description: 'Yeni B2B partner başvurusu alındı',
    user: 'Aynur Hasanova',
    userRole: 'Azer Food Group',
    timestamp: '2026-02-21 13:45:22',
    status: 'pending',
    metadata: { target: 'Başvuru #P-2026-089' }
  },
  {
    id: 3,
    type: 'deal',
    action: 'Deal Aşama Değişikliği',
    description: 'Otel Restaurant Devri fırsatı "Müzakere" aşamasına taşındı',
    user: 'Admin',
    userRole: 'Sistem Yöneticisi',
    timestamp: '2026-02-21 12:15:33',
    status: 'success',
    metadata: { target: 'Deal #D-2026-042', value: '680,000 ₼' }
  },
  {
    id: 4,
    type: 'message',
    action: 'Mesaj Alındı',
    description: 'Rashad Mammadov yeni mesaj gönderdi',
    user: 'Rashad Mammadov',
    userRole: 'Caspian Hotels',
    timestamp: '2026-02-21 11:28:44',
    status: 'success',
    metadata: { target: 'Yatırım Görüşmesi Talebi' }
  },
  {
    id: 5,
    type: 'listing',
    action: 'İlan Onaylandı',
    description: 'Café & Bistro Şəki ilanı onaylandı ve yayınlandı',
    user: 'Moderatör Ekibi',
    userRole: 'Moderatör',
    timestamp: '2026-02-21 10:55:18',
    status: 'success',
    metadata: { target: 'İlan #2026-0154', value: '120,000 ₼' }
  },
  {
    id: 6,
    type: 'system',
    action: 'Ödeme Alındı',
    description: 'Premium üyelik ödemesi işlendi',
    user: 'Sistem',
    userRole: 'Otomatik',
    timestamp: '2026-02-21 09:42:11',
    status: 'success',
    metadata: { target: 'GP Restaurants', value: '299 ₼' }
  },
  {
    id: 7,
    type: 'deal',
    action: 'Deal Kapandı',
    description: 'Bakery Franchise Deal başarıyla tamamlandı',
    user: 'Leyla Aliyeva',
    userRole: 'Yatırım Uzmanı',
    timestamp: '2026-02-20 16:30:22',
    status: 'success',
    metadata: { target: 'Deal #D-2026-038', value: '380,000 ₼' }
  },
  {
    id: 8,
    type: 'partner',
    action: 'Partner Profili Güncellendi',
    description: 'Mountain Ventures şirket bilgileri güncellendi',
    user: 'Kenan Rzayev',
    userRole: 'Partner',
    timestamp: '2026-02-20 14:18:55',
    status: 'success',
    metadata: { target: 'Partner #B2B-045' }
  },
  {
    id: 9,
    type: 'listing',
    action: 'İlan Reddedildi',
    description: 'Eksik belgeler nedeniyle ilan reddedildi',
    user: 'Moderatör Ekibi',
    userRole: 'Moderatör',
    timestamp: '2026-02-20 11:45:33',
    status: 'failed',
    metadata: { target: 'İlan #2026-0151' }
  },
  {
    id: 10,
    type: 'system',
    action: 'AI Analiz Tamamlandı',
    description: 'Almila AI ön değerleme raporu oluşturuldu',
    user: 'Almila AI',
    userRole: 'Yapay Zeka',
    timestamp: '2026-02-20 09:22:18',
    status: 'success',
    metadata: { target: 'İlan #2026-0153', value: 'Skor: 82/100' }
  },
];

const typeConfig = {
  listing: { icon: FileText, color: 'bg-blue-100 text-blue-600', label: 'İlan' },
  partner: { icon: Building2, color: 'bg-purple-100 text-purple-600', label: 'Partner' },
  deal: { icon: DollarSign, color: 'bg-green-100 text-green-600', label: 'Deal' },
  message: { icon: MessageSquare, color: 'bg-amber-100 text-amber-600', label: 'Mesaj' },
  system: { icon: Activity, color: 'bg-gray-100 text-gray-600', label: 'Sistem' },
};

const statusConfig = {
  success: { icon: CheckCircle, color: 'text-green-500' },
  pending: { icon: AlertCircle, color: 'text-amber-500' },
  failed: { icon: XCircle, color: 'text-red-500' },
};

export default function EtkinliklerPage() {
  const [filter, setFilter] = useState<ActivityType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('week');

  const filteredActivities = activities.filter(a => {
    if (filter !== 'all' && a.type !== filter) return false;
    if (searchQuery && !a.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: activities.length,
    today: activities.filter(a => a.timestamp.startsWith('2026-02-21')).length,
    success: activities.filter(a => a.status === 'success').length,
    pending: activities.filter(a => a.status === 'pending').length,
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Etkinlikler</h1>
          <p className="text-sm text-gray-500 mt-1">Platform aktivite ve işlem geçmişi</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-xl bg-white text-sm font-medium"
          >
            <option value="today">Bugün</option>
            <option value="week">Bu Hafta</option>
            <option value="month">Bu Ay</option>
            <option value="all">Tümü</option>
          </select>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Activity size={16} />
            <span className="text-xs font-medium">Toplam Etkinlik</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Calendar size={16} />
            <span className="text-xs font-medium">Bugün</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.today}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <CheckCircle size={16} />
            <span className="text-xs font-medium">Başarılı</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.success}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <AlertCircle size={16} />
            <span className="text-xs font-medium">Bekleyen</span>
          </div>
          <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Etkinliklerde ara..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'listing', 'partner', 'deal', 'message', 'system'] as ActivityType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === type
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {type === 'all' ? 'Tümü' : typeConfig[type].label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity List */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="divide-y divide-gray-100">
          {filteredActivities.map((activity) => {
            const TypeIcon = typeConfig[activity.type].icon;
            const StatusIcon = statusConfig[activity.status].icon;

            return (
              <div
                key={activity.id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl ${typeConfig[activity.type].color} flex items-center justify-center shrink-0`}>
                    <TypeIcon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h4 className="font-semibold text-gray-900">{activity.action}</h4>
                        <p className="text-sm text-gray-600">{activity.description}</p>
                      </div>
                      <StatusIcon size={18} className={statusConfig[activity.status].color} />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User size={12} />
                        <span>{activity.user}</span>
                        <span className="text-gray-300">•</span>
                        <span>{activity.userRole}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={12} />
                        {activity.timestamp}
                      </div>
                    </div>
                    {activity.metadata && (
                      <div className="flex items-center gap-3 mt-2">
                        {activity.metadata.target && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg">
                            {activity.metadata.target}
                          </span>
                        )}
                        {activity.metadata.value && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                            {activity.metadata.value}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <ChevronRight size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
