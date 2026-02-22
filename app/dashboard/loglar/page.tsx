// app/dashboard/loglar/page.tsx
// DK Agency Admin - Sistem Log Sayfası

'use client';

import { useState } from 'react';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
  Clock,
  User,
  Shield,
  Download,
  ChevronDown,
  Terminal,
  Database,
  Globe,
  Key
} from 'lucide-react';

type LogLevel = 'all' | 'info' | 'warning' | 'error' | 'success';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  category: string;
  message: string;
  user?: string;
  ip?: string;
  details?: string;
}

const logs: LogEntry[] = [
  {
    id: 1,
    timestamp: '2026-02-21 14:32:15',
    level: 'success',
    category: 'AUTH',
    message: 'Kullanıcı girişi başarılı',
    user: 'admin@dkagency.az',
    ip: '185.129.xxx.xxx',
    details: 'Chrome 120, Windows 11'
  },
  {
    id: 2,
    timestamp: '2026-02-21 14:28:42',
    level: 'info',
    category: 'LISTING',
    message: 'Yeni ilan oluşturuldu: #2026-0156',
    user: 'partner@caspianhotels.az',
    details: 'Kategori: Devir, Fiyat: 450,000 ₼'
  },
  {
    id: 3,
    timestamp: '2026-02-21 14:15:33',
    level: 'warning',
    category: 'SECURITY',
    message: 'Çoklu başarısız giriş denemesi',
    ip: '91.234.xxx.xxx',
    details: '5 başarısız deneme - IP geçici olarak engellendi'
  },
  {
    id: 4,
    timestamp: '2026-02-21 14:10:22',
    level: 'error',
    category: 'API',
    message: 'Orchestrator API timeout hatası',
    details: 'Endpoint: /api/orchestrator, Duration: 30001ms'
  },
  {
    id: 5,
    timestamp: '2026-02-21 13:55:18',
    level: 'info',
    category: 'PARTNER',
    message: 'Partner profili güncellendi',
    user: 'gp.restaurants@mail.az',
    details: 'Güncellenen alanlar: telefon, adres'
  },
  {
    id: 6,
    timestamp: '2026-02-21 13:42:55',
    level: 'success',
    category: 'PAYMENT',
    message: 'Premium üyelik ödemesi alındı',
    user: 'investor@azerfood.az',
    details: 'Plan: PRO, Tutar: 299 ₼/ay'
  },
  {
    id: 7,
    timestamp: '2026-02-21 13:30:11',
    level: 'info',
    category: 'AI',
    message: 'AI analiz talebi işlendi',
    user: 'partner@sweetdreams.az',
    details: 'Agent: Almila, Duration: 2.3s'
  },
  {
    id: 8,
    timestamp: '2026-02-21 13:15:44',
    level: 'warning',
    category: 'SYSTEM',
    message: 'Yüksek bellek kullanımı tespit edildi',
    details: 'Memory: 87%, Threshold: 80%'
  },
  {
    id: 9,
    timestamp: '2026-02-21 12:58:33',
    level: 'error',
    category: 'DATABASE',
    message: 'Veritabanı bağlantı hatası',
    details: 'Connection pool exhausted, retrying...'
  },
  {
    id: 10,
    timestamp: '2026-02-21 12:45:22',
    level: 'success',
    category: 'AUTH',
    message: 'Şifre başarıyla değiştirildi',
    user: 'moderator@dkagency.az',
    ip: '185.129.xxx.xxx'
  },
];

const levelConfig = {
  info: { icon: Info, color: 'bg-blue-100 text-blue-600', label: 'Bilgi' },
  warning: { icon: AlertCircle, color: 'bg-amber-100 text-amber-600', label: 'Uyarı' },
  error: { icon: XCircle, color: 'bg-red-100 text-red-600', label: 'Hata' },
  success: { icon: CheckCircle, color: 'bg-green-100 text-green-600', label: 'Başarılı' },
};

const categoryIcons: Record<string, typeof Activity> = {
  AUTH: Key,
  LISTING: Globe,
  SECURITY: Shield,
  API: Terminal,
  PARTNER: User,
  PAYMENT: Database,
  AI: Activity,
  SYSTEM: Terminal,
  DATABASE: Database,
};

export default function LoglarPage() {
  const [filter, setFilter] = useState<LogLevel>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<LogEntry | null>(null);

  const filteredLogs = logs.filter(log => {
    if (filter !== 'all' && log.level !== filter) return false;
    if (searchQuery && !log.message.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: logs.length,
    info: logs.filter(l => l.level === 'info').length,
    warning: logs.filter(l => l.level === 'warning').length,
    error: logs.filter(l => l.level === 'error').length,
    success: logs.filter(l => l.level === 'success').length,
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sistem Logları</h1>
          <p className="text-sm text-gray-500 mt-1">Gerçek zamanlı sistem aktivite izleme</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <RefreshCw size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Yenile</span>
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
            <Download size={16} className="text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Dışa Aktar</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
          <p className="text-xs text-gray-500">Toplam Log</p>
        </div>
        <div className="bg-blue-50 rounded-xl border border-blue-200 p-4">
          <p className="text-2xl font-bold text-blue-700">{stats.info}</p>
          <p className="text-xs text-blue-600">Bilgi</p>
        </div>
        <div className="bg-green-50 rounded-xl border border-green-200 p-4">
          <p className="text-2xl font-bold text-green-700">{stats.success}</p>
          <p className="text-xs text-green-600">Başarılı</p>
        </div>
        <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
          <p className="text-2xl font-bold text-amber-700">{stats.warning}</p>
          <p className="text-xs text-amber-600">Uyarı</p>
        </div>
        <div className="bg-red-50 rounded-xl border border-red-200 p-4">
          <p className="text-2xl font-bold text-red-700">{stats.error}</p>
          <p className="text-xs text-red-600">Hata</p>
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
            placeholder="Loglarda ara..."
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'info', 'success', 'warning', 'error'] as LogLevel[]).map((level) => (
            <button
              key={level}
              onClick={() => setFilter(level)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                filter === level
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {level === 'all' ? 'Tümü' : levelConfig[level].label}
            </button>
          ))}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Zaman</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Seviye</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Kategori</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Mesaj</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Kullanıcı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredLogs.map((log) => {
                const LevelIcon = levelConfig[log.level].icon;
                const CategoryIcon = categoryIcons[log.category] || Activity;
                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Clock size={14} />
                        {log.timestamp}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${levelConfig[log.level].color}`}>
                        <LevelIcon size={12} />
                        {levelConfig[log.level].label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <CategoryIcon size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{log.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">{log.message}</p>
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                            <User size={12} className="text-gray-500" />
                          </div>
                          <span className="text-sm text-gray-600">{log.user}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Sistem</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedLog(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${levelConfig[selectedLog.level].color} flex items-center justify-center`}>
                  {(() => {
                    const Icon = levelConfig[selectedLog.level].icon;
                    return <Icon size={20} />;
                  })()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedLog.category}</h3>
                  <p className="text-xs text-gray-500">{selectedLog.timestamp}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <XCircle size={20} className="text-gray-400" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Mesaj</p>
                <p className="text-sm text-gray-900">{selectedLog.message}</p>
              </div>
              {selectedLog.details && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Detaylar</p>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg font-mono">{selectedLog.details}</p>
                </div>
              )}
              {selectedLog.user && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Kullanıcı</p>
                  <p className="text-sm text-gray-700">{selectedLog.user}</p>
                </div>
              )}
              {selectedLog.ip && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">IP Adresi</p>
                  <p className="text-sm text-gray-700">{selectedLog.ip}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
