// app/dashboard/roller/page.tsx
// DK Agency Admin - Rol ve Yetki Yönetimi

'use client';

import { useState } from 'react';
import {
  Shield,
  Users,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  Eye,
  FileText,
  Settings,
  MessageSquare,
  DollarSign,
  BarChart3,
  Lock,
  Unlock,
  ChevronDown,
  Search
} from 'lucide-react';

interface Permission {
  id: string;
  label: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  color: string;
  userCount: number;
  permissions: string[];
  isSystem: boolean;
}

const permissions: Permission[] = [
  { id: 'users_view', label: 'Kullanıcı Görüntüleme', description: 'Kullanıcı listesini görüntüleme', category: 'Kullanıcılar' },
  { id: 'users_create', label: 'Kullanıcı Oluşturma', description: 'Yeni kullanıcı ekleme', category: 'Kullanıcılar' },
  { id: 'users_edit', label: 'Kullanıcı Düzenleme', description: 'Kullanıcı bilgilerini güncelleme', category: 'Kullanıcılar' },
  { id: 'users_delete', label: 'Kullanıcı Silme', description: 'Kullanıcı hesabı silme', category: 'Kullanıcılar' },
  { id: 'listings_view', label: 'İlan Görüntüleme', description: 'Tüm ilanları görüntüleme', category: 'İlanlar' },
  { id: 'listings_create', label: 'İlan Oluşturma', description: 'Yeni ilan ekleme', category: 'İlanlar' },
  { id: 'listings_approve', label: 'İlan Onaylama', description: 'İlanları onaylama/reddetme', category: 'İlanlar' },
  { id: 'listings_delete', label: 'İlan Silme', description: 'İlan silme', category: 'İlanlar' },
  { id: 'partners_view', label: 'Partner Görüntüleme', description: 'Partner listesini görüntüleme', category: 'Partnerler' },
  { id: 'partners_manage', label: 'Partner Yönetimi', description: 'Partner ekleme/düzenleme', category: 'Partnerler' },
  { id: 'reports_view', label: 'Rapor Görüntüleme', description: 'Raporlara erişim', category: 'Raporlar' },
  { id: 'reports_export', label: 'Rapor Dışa Aktarma', description: 'Raporları indirme', category: 'Raporlar' },
  { id: 'settings_view', label: 'Ayarları Görüntüleme', description: 'Sistem ayarlarını görme', category: 'Sistem' },
  { id: 'settings_edit', label: 'Ayarları Düzenleme', description: 'Sistem ayarlarını değiştirme', category: 'Sistem' },
  { id: 'logs_view', label: 'Log Görüntüleme', description: 'Sistem loglarına erişim', category: 'Sistem' },
  { id: 'roles_manage', label: 'Rol Yönetimi', description: 'Rol ve yetki düzenleme', category: 'Sistem' },
];

const initialRoles: Role[] = [
  {
    id: 'admin',
    name: 'Admin',
    description: 'Tam yetki - Tüm özelliklere erişim',
    color: 'bg-red-600',
    userCount: 2,
    permissions: permissions.map(p => p.id),
    isSystem: true
  },
  {
    id: 'moderator',
    name: 'Moderatör',
    description: 'İçerik yönetimi ve onay yetkisi',
    color: 'bg-blue-600',
    userCount: 5,
    permissions: ['users_view', 'listings_view', 'listings_approve', 'partners_view', 'reports_view'],
    isSystem: true
  },
  {
    id: 'editor',
    name: 'Editör',
    description: 'Haber ve içerik düzenleme',
    color: 'bg-green-600',
    userCount: 8,
    permissions: ['listings_view', 'listings_create', 'reports_view'],
    isSystem: false
  },
  {
    id: 'viewer',
    name: 'İzleyici',
    description: 'Sadece görüntüleme yetkisi',
    color: 'bg-gray-600',
    userCount: 15,
    permissions: ['users_view', 'listings_view', 'partners_view', 'reports_view'],
    isSystem: false
  },
];

export default function RollerPage() {
  const [roles, setRoles] = useState(initialRoles);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const permissionCategories = [...new Set(permissions.map(p => p.category))];

  const togglePermission = (permId: string) => {
    if (!selectedRole || selectedRole.isSystem) return;
    
    setSelectedRole(prev => {
      if (!prev) return prev;
      const hasPermission = prev.permissions.includes(permId);
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter(p => p !== permId)
          : [...prev.permissions, permId]
      };
    });
  };

  return (
    <div className="p-6 lg:p-8 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rol ve Yetki Yönetimi</h1>
          <p className="text-sm text-gray-500 mt-1">Kullanıcı rolleri ve erişim izinleri</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors">
          <Plus size={16} />
          <span className="text-sm font-bold">Yeni Rol</span>
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Roles List */}
        <div className="lg:col-span-1 space-y-4">
          <div className="relative mb-4">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rol ara..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20"
            />
          </div>

          {roles
            .filter(r => r.name.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((role) => (
            <div
              key={role.id}
              onClick={() => { setSelectedRole(role); setIsEditing(false); }}
              className={`bg-white rounded-xl border p-4 cursor-pointer transition-all ${
                selectedRole?.id === role.id
                  ? 'border-red-500 ring-2 ring-red-500/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 ${role.color} rounded-xl flex items-center justify-center`}>
                    <Shield size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{role.name}</h3>
                    <p className="text-xs text-gray-500">{role.permissions.length} yetki</p>
                  </div>
                </div>
                {role.isSystem && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    Sistem
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users size={14} />
                  <span className="text-xs">{role.userCount} kullanıcı</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                    <Edit2 size={14} className="text-gray-400" />
                  </button>
                  {!role.isSystem && (
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions Panel */}
        <div className="lg:col-span-2">
          {selectedRole ? (
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 ${selectedRole.color} rounded-xl flex items-center justify-center`}>
                    <Shield size={24} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedRole.name}</h2>
                    <p className="text-sm text-gray-500">{selectedRole.description}</p>
                  </div>
                </div>
                {!selectedRole.isSystem && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      isEditing
                        ? 'bg-green-600 text-white hover:bg-green-700'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {isEditing ? 'Kaydet' : 'Düzenle'}
                  </button>
                )}
              </div>

              {selectedRole.isSystem && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Lock size={18} className="text-amber-600" />
                  <p className="text-sm text-amber-700">
                    Sistem rolleri düzenlenemez. Bu rol varsayılan izinlerle korunmaktadır.
                  </p>
                </div>
              )}

              <div className="space-y-6">
                {permissionCategories.map((category) => (
                  <div key={category}>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">{category}</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {permissions
                        .filter(p => p.category === category)
                        .map((perm) => {
                          const hasPermission = selectedRole.permissions.includes(perm.id);
                          return (
                            <div
                              key={perm.id}
                              onClick={() => isEditing && togglePermission(perm.id)}
                              className={`p-4 rounded-xl border transition-all ${
                                hasPermission
                                  ? 'bg-green-50 border-green-200'
                                  : 'bg-gray-50 border-gray-200'
                              } ${isEditing && !selectedRole.isSystem ? 'cursor-pointer hover:shadow-md' : ''}`}
                            >
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-gray-900">{perm.label}</p>
                                  <p className="text-xs text-gray-500 mt-1">{perm.description}</p>
                                </div>
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  hasPermission ? 'bg-green-500' : 'bg-gray-300'
                                }`}>
                                  {hasPermission ? (
                                    <Check size={14} className="text-white" />
                                  ) : (
                                    <X size={14} className="text-white" />
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Shield size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Rol Seçin</h3>
              <p className="text-sm text-gray-500">
                Yetkileri görüntülemek ve düzenlemek için sol taraftan bir rol seçin.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
