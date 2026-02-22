// app/dashboard/kullanicilar/page.tsx
// DK Agency Admin - Kullanıcı Yönetimi

'use client';

import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Filter,
  Download,
  UserPlus,
  X
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'editor' | 'viewer' | 'partner';
  status: 'active' | 'pending' | 'suspended';
  lastLogin: string;
  createdAt: string;
  avatar?: string;
}

const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Elvin Guliyev',
    email: 'elvin@dkagency.az',
    phone: '+994 50 111 2233',
    role: 'admin',
    status: 'active',
    lastLogin: '2026-02-21 09:30',
    createdAt: '2025-01-15',
  },
  {
    id: '2',
    name: 'Aysel Huseynova',
    email: 'aysel@dkagency.az',
    phone: '+994 55 222 3344',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-02-20 16:45',
    createdAt: '2025-03-20',
  },
  {
    id: '3',
    name: 'Orkhan Mammadov',
    email: 'orkhan@dkagency.az',
    phone: '+994 70 333 4455',
    role: 'editor',
    status: 'active',
    lastLogin: '2026-02-21 08:15',
    createdAt: '2025-05-10',
  },
  {
    id: '4',
    name: 'Nigar Hasanova',
    email: 'nigar@partner.com',
    phone: '+994 77 444 5566',
    role: 'partner',
    status: 'active',
    lastLogin: '2026-02-19 14:20',
    createdAt: '2025-08-01',
  },
  {
    id: '5',
    name: 'Rashad Aliyev',
    email: 'rashad@investor.com',
    phone: '+994 50 555 6677',
    role: 'viewer',
    status: 'pending',
    lastLogin: '-',
    createdAt: '2026-02-18',
  },
  {
    id: '6',
    name: 'Leyla Mammadova',
    email: 'leyla@test.com',
    phone: '+994 55 666 7788',
    role: 'viewer',
    status: 'suspended',
    lastLogin: '2026-01-15 10:00',
    createdAt: '2025-11-20',
  },
];

const ROLE_CONFIG = {
  admin: { label: 'Admin', color: 'bg-red-100 text-red-700', icon: Shield },
  editor: { label: 'Editör', color: 'bg-blue-100 text-blue-700', icon: Edit },
  viewer: { label: 'Görüntüleyici', color: 'bg-gray-100 text-gray-700', icon: Eye },
  partner: { label: 'Partner', color: 'bg-purple-100 text-purple-700', icon: Users },
};

const STATUS_CONFIG = {
  active: { label: 'Aktif', color: 'text-green-600', icon: CheckCircle },
  pending: { label: 'Beklemede', color: 'text-amber-600', icon: Clock },
  suspended: { label: 'Askıda', color: 'text-red-600', icon: XCircle },
};

export default function KullanicilarPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredUsers = MOCK_USERS.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  const stats = {
    total: MOCK_USERS.length,
    active: MOCK_USERS.filter((u) => u.status === 'active').length,
    pending: MOCK_USERS.filter((u) => u.status === 'pending').length,
    admins: MOCK_USERS.filter((u) => u.role === 'admin').length,
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center shadow-xl">
            <Users size={24} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi</h1>
            <p className="text-gray-500 text-sm mt-0.5">Sistem kullanıcıları ve erişim kontrolü</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
            <Download size={16} />
            Dışa Aktar
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-semibold transition-colors"
          >
            <UserPlus size={18} />
            Yeni Kullanıcı
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
              <Users size={20} className="text-gray-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500">Toplam Kullanıcı</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle size={20} className="text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
              <p className="text-xs text-gray-500">Aktif</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              <p className="text-xs text-gray-500">Beklemede</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <Shield size={20} className="text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.admins}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="İsim veya e-posta ara..."
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            >
              <option value="all">Tüm Roller</option>
              <option value="admin">Admin</option>
              <option value="editor">Editör</option>
              <option value="viewer">Görüntüleyici</option>
              <option value="partner">Partner</option>
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">Aktif</option>
              <option value="pending">Beklemede</option>
              <option value="suspended">Askıda</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Kullanıcı
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Rol
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İletişim
                </th>
                <th className="text-center p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="text-left p-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Son Giriş
                </th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const roleConfig = ROLE_CONFIG[user.role];
                const statusConfig = STATUS_CONFIG[user.status];
                const RoleIcon = roleConfig.icon;
                const StatusIcon = statusConfig.icon;

                return (
                  <tr
                    key={user.id}
                    className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-900 to-gray-700 flex items-center justify-center text-white font-bold text-sm">
                          {user.name
                            .split(' ')
                            .map((n) => n[0])
                            .join('')}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-xs text-gray-500">Kayıt: {user.createdAt}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${roleConfig.color}`}
                      >
                        <RoleIcon size={12} />
                        {roleConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                          <Phone size={14} className="text-gray-400" />
                          {user.phone}
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`inline-flex items-center gap-1 text-sm font-medium ${statusConfig.color}`}>
                        <StatusIcon size={14} />
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="text-sm text-gray-600">{user.lastLogin}</span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <Edit size={16} className="text-gray-400" />
                        </button>
                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={16} className="text-gray-400 hover:text-red-500" />
                        </button>
                        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreHorizontal size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="p-12 text-center">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">Kullanıcı bulunamadı</p>
            <p className="text-sm text-gray-400 mt-1">Filtreleri değiştirin veya yeni kullanıcı ekleyin</p>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-900">Yeni Kullanıcı Ekle</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
                <input
                  type="text"
                  placeholder="Kullanıcı adı"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
                  <input
                    type="email"
                    placeholder="email@domain.com"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    type="tel"
                    placeholder="+994 XX XXX XXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 bg-white">
                  <option value="">Rol Seçin</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editör</option>
                  <option value="viewer">Görüntüleyici</option>
                  <option value="partner">Partner</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
            </form>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  alert('Kullanıcı eklendi! (Demo)');
                  setShowAddModal(false);
                }}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors"
              >
                Kullanıcı Ekle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
