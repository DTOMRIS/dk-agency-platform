// app/dashboard/roller/page.tsx
// DK Agency Admin - Rol ve Yetki Yönetimi

'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
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

export default function RollerPage() {
  const t = useTranslations('dashboardRoller');

  const permissions: Permission[] = [
    { id: 'users_view', label: t('pUsersView'), description: t('dUsersView'), category: t('catUsers') },
    { id: 'users_create', label: t('pUsersCreate'), description: t('dUsersCreate'), category: t('catUsers') },
    { id: 'users_edit', label: t('pUsersEdit'), description: t('dUsersEdit'), category: t('catUsers') },
    { id: 'users_delete', label: t('pUsersDelete'), description: t('dUsersDelete'), category: t('catUsers') },
    { id: 'listings_view', label: t('pListingsView'), description: t('dListingsView'), category: t('catListings') },
    { id: 'listings_create', label: t('pListingsCreate'), description: t('dListingsCreate'), category: t('catListings') },
    { id: 'listings_approve', label: t('pListingsApprove'), description: t('dListingsApprove'), category: t('catListings') },
    { id: 'listings_delete', label: t('pListingsDelete'), description: t('dListingsDelete'), category: t('catListings') },
    { id: 'partners_view', label: t('pPartnersView'), description: t('dPartnersView'), category: t('catPartners') },
    { id: 'partners_manage', label: t('pPartnersManage'), description: t('dPartnersManage'), category: t('catPartners') },
    { id: 'reports_view', label: t('pReportsView'), description: t('dReportsView'), category: t('catReports') },
    { id: 'reports_export', label: t('pReportsExport'), description: t('dReportsExport'), category: t('catReports') },
    { id: 'settings_view', label: t('pSettingsView'), description: t('dSettingsView'), category: t('catSystem') },
    { id: 'settings_edit', label: t('pSettingsEdit'), description: t('dSettingsEdit'), category: t('catSystem') },
    { id: 'logs_view', label: t('pLogsView'), description: t('dLogsView'), category: t('catSystem') },
    { id: 'roles_manage', label: t('pRolesManage'), description: t('dRolesManage'), category: t('catSystem') },
  ];

  const initialRoles: Role[] = [
    {
      id: 'admin',
      name: 'Admin',
      description: t('roleAdminDesc'),
      color: 'bg-red-600',
      userCount: 2,
      permissions: permissions.map(p => p.id),
      isSystem: true
    },
    {
      id: 'moderator',
      name: 'Moderatör',
      description: t('roleModeratorDesc'),
      color: 'bg-blue-600',
      userCount: 5,
      permissions: ['users_view', 'listings_view', 'listings_approve', 'partners_view', 'reports_view'],
      isSystem: true
    },
    {
      id: 'editor',
      name: 'Editör',
      description: t('roleEditorDesc'),
      color: 'bg-green-600',
      userCount: 8,
      permissions: ['listings_view', 'listings_create', 'reports_view'],
      isSystem: false
    },
    {
      id: 'viewer',
      name: 'İzleyici',
      description: t('roleViewerDesc'),
      color: 'bg-gray-600',
      userCount: 15,
      permissions: ['users_view', 'listings_view', 'partners_view', 'reports_view'],
      isSystem: false
    },
  ];

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
          <h1 className="text-2xl font-bold text-gray-900">{t('pageTitle')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('pageSubtitle')}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-dk-red text-white rounded-xl hover:bg-dk-red-strong transition-colors">
          <Plus size={16} />
          <span className="text-sm font-bold">{t('newRole')}</span>
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
              placeholder={t('searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-dk-red/20"
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
                  ? 'border-dk-red ring-2 ring-dk-red/20'
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
                    <p className="text-xs text-gray-500">{role.permissions.length} {t('permissions')}</p>
                  </div>
                </div>
                {role.isSystem && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {t('systemBadge')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users size={14} />
                  <span className="text-xs">{role.userCount} {t('userCount')}</span>
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
                    {isEditing ? t('save') : t('edit')}
                  </button>
                )}
              </div>

              {selectedRole.isSystem && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Lock size={18} className="text-amber-600" />
                  <p className="text-sm text-amber-700">
                    {t('systemLocked')}
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{t('selectRoleTitle')}</h3>
              <p className="text-sm text-gray-500">
                {t('selectRoleDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
