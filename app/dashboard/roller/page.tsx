// app/dashboard/roller/page.tsx
// DK Agency Admin - Rol ve Yetki Yönetimi

'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
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
import { normalizeLocale, type Locale } from '@/i18n/config';

const pageCopy: Record<Locale, {
  pageTitle: string;
  pageSubtitle: string;
  newRole: string;
  searchPlaceholder: string;
  systemBadge: string;
  systemLocked: string;
  userCount: string;
  permissions: string;
  save: string;
  edit: string;
  selectRoleTitle: string;
  selectRoleDesc: string;
  // Permission labels
  pUsersView: string;
  pUsersCreate: string;
  pUsersEdit: string;
  pUsersDelete: string;
  pListingsView: string;
  pListingsCreate: string;
  pListingsApprove: string;
  pListingsDelete: string;
  pPartnersView: string;
  pPartnersManage: string;
  pReportsView: string;
  pReportsExport: string;
  pSettingsView: string;
  pSettingsEdit: string;
  pLogsView: string;
  pRolesManage: string;
  // Permission descriptions
  dUsersView: string;
  dUsersCreate: string;
  dUsersEdit: string;
  dUsersDelete: string;
  dListingsView: string;
  dListingsCreate: string;
  dListingsApprove: string;
  dListingsDelete: string;
  dPartnersView: string;
  dPartnersManage: string;
  dReportsView: string;
  dReportsExport: string;
  dSettingsView: string;
  dSettingsEdit: string;
  dLogsView: string;
  dRolesManage: string;
  // Permission categories
  catUsers: string;
  catListings: string;
  catPartners: string;
  catReports: string;
  catSystem: string;
  // Role descriptions
  roleAdminDesc: string;
  roleModeratorDesc: string;
  roleEditorDesc: string;
  roleViewerDesc: string;
}> = {
  az: {
    pageTitle: 'Rol və İcazə İdarəetməsi',
    pageSubtitle: 'İstifadəçi rolları və giriş icazələri',
    newRole: 'Yeni Rol',
    searchPlaceholder: 'Rol axtar...',
    systemBadge: 'Sistem',
    systemLocked: 'Sistem rolları redaktə edilə bilməz. Bu rol standart icazələrlə qorunur.',
    userCount: 'istifadəçi',
    permissions: 'icazə',
    save: 'Saxla',
    edit: 'Düzəlt',
    selectRoleTitle: 'Rol Seçin',
    selectRoleDesc: 'İcazələri görmək və düzəltmək üçün sol tərəfdən bir rol seçin.',
    pUsersView: 'İstifadəçi Görüntüleme',
    pUsersCreate: 'İstifadəçi Yaratma',
    pUsersEdit: 'İstifadəçi Düzəltmə',
    pUsersDelete: 'İstifadəçi Silmə',
    pListingsView: 'Elan Görüntüleme',
    pListingsCreate: 'Elan Yaratma',
    pListingsApprove: 'Elan Təsdiqləmə',
    pListingsDelete: 'Elan Silmə',
    pPartnersView: 'Tərəfdaş Görüntüleme',
    pPartnersManage: 'Tərəfdaş İdarəetmə',
    pReportsView: 'Hesabat Görüntüleme',
    pReportsExport: 'Hesabat İxracı',
    pSettingsView: 'Ayarları Görüntüleme',
    pSettingsEdit: 'Ayarları Düzəltmə',
    pLogsView: 'Log Görüntüleme',
    pRolesManage: 'Rol İdarəetmə',
    dUsersView: 'İstifadəçi siyahısını görmə',
    dUsersCreate: 'Yeni istifadəçi əlavə etmə',
    dUsersEdit: 'İstifadəçi məlumatlarını yeniləmə',
    dUsersDelete: 'İstifadəçi hesabını silmə',
    dListingsView: 'Bütün elanları görüntüləmə',
    dListingsCreate: 'Yeni elan əlavə etmə',
    dListingsApprove: 'Elanları təsdiqləmə/rədd etmə',
    dListingsDelete: 'Elan silmə',
    dPartnersView: 'Tərəfdaş siyahısını görüntüləmə',
    dPartnersManage: 'Tərəfdaş əlavə etmə/düzəltmə',
    dReportsView: 'Hesabatlara giriş',
    dReportsExport: 'Hesabatları yükləmə',
    dSettingsView: 'Sistem ayarlarını görüntüləmə',
    dSettingsEdit: 'Sistem ayarlarını dəyişdirmə',
    dLogsView: 'Sistem loglarına giriş',
    dRolesManage: 'Rol və icazə düzəltmə',
    catUsers: 'İstifadəçilər',
    catListings: 'Elanlar',
    catPartners: 'Tərəfdaşlar',
    catReports: 'Hesabatlar',
    catSystem: 'Sistem',
    roleAdminDesc: 'Tam icazə - Bütün xüsusiyyətlərə giriş',
    roleModeratorDesc: 'Məzmun idarəetmə və təsdiq icazəsi',
    roleEditorDesc: 'Xəbər və məzmun düzəltmə',
    roleViewerDesc: 'Yalnız görüntüləmə icazəsi',
  },
  ru: {
    pageTitle: 'Управление ролями и правами',
    pageSubtitle: 'Роли пользователей и права доступа',
    newRole: 'Новая роль',
    searchPlaceholder: 'Поиск ролей...',
    systemBadge: 'Система',
    systemLocked: 'Системные роли недоступны для редактирования. Эта роль защищена правами по умолчанию.',
    userCount: 'пользователей',
    permissions: 'прав',
    save: 'Сохранить',
    edit: 'Редактировать',
    selectRoleTitle: 'Выберите роль',
    selectRoleDesc: 'Выберите роль слева, чтобы просмотреть и изменить права доступа.',
    pUsersView: 'Просмотр пользователей',
    pUsersCreate: 'Создание пользователей',
    pUsersEdit: 'Редактирование пользователей',
    pUsersDelete: 'Удаление пользователей',
    pListingsView: 'Просмотр объявлений',
    pListingsCreate: 'Создание объявлений',
    pListingsApprove: 'Одобрение объявлений',
    pListingsDelete: 'Удаление объявлений',
    pPartnersView: 'Просмотр партнёров',
    pPartnersManage: 'Управление партнёрами',
    pReportsView: 'Просмотр отчётов',
    pReportsExport: 'Экспорт отчётов',
    pSettingsView: 'Просмотр настроек',
    pSettingsEdit: 'Редактирование настроек',
    pLogsView: 'Просмотр логов',
    pRolesManage: 'Управление ролями',
    dUsersView: 'Просмотр списка пользователей',
    dUsersCreate: 'Добавление новых пользователей',
    dUsersEdit: 'Обновление данных пользователей',
    dUsersDelete: 'Удаление аккаунтов пользователей',
    dListingsView: 'Просмотр всех объявлений',
    dListingsCreate: 'Добавление новых объявлений',
    dListingsApprove: 'Одобрение/отклонение объявлений',
    dListingsDelete: 'Удаление объявлений',
    dPartnersView: 'Просмотр списка партнёров',
    dPartnersManage: 'Добавление/редактирование партнёров',
    dReportsView: 'Доступ к отчётам',
    dReportsExport: 'Скачивание отчётов',
    dSettingsView: 'Просмотр системных настроек',
    dSettingsEdit: 'Изменение системных настроек',
    dLogsView: 'Доступ к системным логам',
    dRolesManage: 'Редактирование ролей и прав',
    catUsers: 'Пользователи',
    catListings: 'Объявления',
    catPartners: 'Партнёры',
    catReports: 'Отчёты',
    catSystem: 'Система',
    roleAdminDesc: 'Полный доступ — доступ ко всем функциям',
    roleModeratorDesc: 'Управление контентом и права на одобрение',
    roleEditorDesc: 'Редактирование новостей и контента',
    roleViewerDesc: 'Только права на просмотр',
  },
  en: {
    pageTitle: 'Role & Permission Management',
    pageSubtitle: 'User roles and access permissions',
    newRole: 'New Role',
    searchPlaceholder: 'Search roles...',
    systemBadge: 'System',
    systemLocked: 'System roles cannot be edited. This role is protected with default permissions.',
    userCount: 'users',
    permissions: 'permissions',
    save: 'Save',
    edit: 'Edit',
    selectRoleTitle: 'Select a Role',
    selectRoleDesc: 'Select a role from the left to view and edit its permissions.',
    pUsersView: 'View Users',
    pUsersCreate: 'Create Users',
    pUsersEdit: 'Edit Users',
    pUsersDelete: 'Delete Users',
    pListingsView: 'View Listings',
    pListingsCreate: 'Create Listings',
    pListingsApprove: 'Approve Listings',
    pListingsDelete: 'Delete Listings',
    pPartnersView: 'View Partners',
    pPartnersManage: 'Manage Partners',
    pReportsView: 'View Reports',
    pReportsExport: 'Export Reports',
    pSettingsView: 'View Settings',
    pSettingsEdit: 'Edit Settings',
    pLogsView: 'View Logs',
    pRolesManage: 'Manage Roles',
    dUsersView: 'View user list',
    dUsersCreate: 'Add new users',
    dUsersEdit: 'Update user information',
    dUsersDelete: 'Delete user accounts',
    dListingsView: 'View all listings',
    dListingsCreate: 'Add new listings',
    dListingsApprove: 'Approve/reject listings',
    dListingsDelete: 'Delete listings',
    dPartnersView: 'View partner list',
    dPartnersManage: 'Add/edit partners',
    dReportsView: 'Access reports',
    dReportsExport: 'Download reports',
    dSettingsView: 'View system settings',
    dSettingsEdit: 'Modify system settings',
    dLogsView: 'Access system logs',
    dRolesManage: 'Edit roles and permissions',
    catUsers: 'Users',
    catListings: 'Listings',
    catPartners: 'Partners',
    catReports: 'Reports',
    catSystem: 'System',
    roleAdminDesc: 'Full access — all features',
    roleModeratorDesc: 'Content management and approval authority',
    roleEditorDesc: 'News and content editing',
    roleViewerDesc: 'View-only access',
  },
  tr: {
    pageTitle: 'Rol ve Yetki Yönetimi',
    pageSubtitle: 'Kullanıcı rolleri ve erişim izinleri',
    newRole: 'Yeni Rol',
    searchPlaceholder: 'Rol ara...',
    systemBadge: 'Sistem',
    systemLocked: 'Sistem rolleri düzenlenemez. Bu rol varsayılan izinlerle korunmaktadır.',
    userCount: 'kullanıcı',
    permissions: 'yetki',
    save: 'Kaydet',
    edit: 'Düzenle',
    selectRoleTitle: 'Rol Seçin',
    selectRoleDesc: 'Yetkileri görüntülemek ve düzenlemek için sol taraftan bir rol seçin.',
    pUsersView: 'Kullanıcı Görüntüleme',
    pUsersCreate: 'Kullanıcı Oluşturma',
    pUsersEdit: 'Kullanıcı Düzenleme',
    pUsersDelete: 'Kullanıcı Silme',
    pListingsView: 'İlan Görüntüleme',
    pListingsCreate: 'İlan Oluşturma',
    pListingsApprove: 'İlan Onaylama',
    pListingsDelete: 'İlan Silme',
    pPartnersView: 'Partner Görüntüleme',
    pPartnersManage: 'Partner Yönetimi',
    pReportsView: 'Rapor Görüntüleme',
    pReportsExport: 'Rapor Dışa Aktarma',
    pSettingsView: 'Ayarları Görüntüleme',
    pSettingsEdit: 'Ayarları Düzenleme',
    pLogsView: 'Log Görüntüleme',
    pRolesManage: 'Rol Yönetimi',
    dUsersView: 'Kullanıcı listesini görüntüleme',
    dUsersCreate: 'Yeni kullanıcı ekleme',
    dUsersEdit: 'Kullanıcı bilgilerini güncelleme',
    dUsersDelete: 'Kullanıcı hesabı silme',
    dListingsView: 'Tüm ilanları görüntüleme',
    dListingsCreate: 'Yeni ilan ekleme',
    dListingsApprove: 'İlanları onaylama/reddetme',
    dListingsDelete: 'İlan silme',
    dPartnersView: 'Partner listesini görüntüleme',
    dPartnersManage: 'Partner ekleme/düzenleme',
    dReportsView: 'Raporlara erişim',
    dReportsExport: 'Raporları indirme',
    dSettingsView: 'Sistem ayarlarını görme',
    dSettingsEdit: 'Sistem ayarlarını değiştirme',
    dLogsView: 'Sistem loglarına erişim',
    dRolesManage: 'Rol ve yetki düzenleme',
    catUsers: 'Kullanıcılar',
    catListings: 'İlanlar',
    catPartners: 'Partnerler',
    catReports: 'Raporlar',
    catSystem: 'Sistem',
    roleAdminDesc: 'Tam yetki - Tüm özelliklere erişim',
    roleModeratorDesc: 'İçerik yönetimi ve onay yetkisi',
    roleEditorDesc: 'Haber ve içerik düzenleme',
    roleViewerDesc: 'Sadece görüntüleme yetkisi',
  },
};

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
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  const permissions: Permission[] = [
    { id: 'users_view', label: copy.pUsersView, description: copy.dUsersView, category: copy.catUsers },
    { id: 'users_create', label: copy.pUsersCreate, description: copy.dUsersCreate, category: copy.catUsers },
    { id: 'users_edit', label: copy.pUsersEdit, description: copy.dUsersEdit, category: copy.catUsers },
    { id: 'users_delete', label: copy.pUsersDelete, description: copy.dUsersDelete, category: copy.catUsers },
    { id: 'listings_view', label: copy.pListingsView, description: copy.dListingsView, category: copy.catListings },
    { id: 'listings_create', label: copy.pListingsCreate, description: copy.dListingsCreate, category: copy.catListings },
    { id: 'listings_approve', label: copy.pListingsApprove, description: copy.dListingsApprove, category: copy.catListings },
    { id: 'listings_delete', label: copy.pListingsDelete, description: copy.dListingsDelete, category: copy.catListings },
    { id: 'partners_view', label: copy.pPartnersView, description: copy.dPartnersView, category: copy.catPartners },
    { id: 'partners_manage', label: copy.pPartnersManage, description: copy.dPartnersManage, category: copy.catPartners },
    { id: 'reports_view', label: copy.pReportsView, description: copy.dReportsView, category: copy.catReports },
    { id: 'reports_export', label: copy.pReportsExport, description: copy.dReportsExport, category: copy.catReports },
    { id: 'settings_view', label: copy.pSettingsView, description: copy.dSettingsView, category: copy.catSystem },
    { id: 'settings_edit', label: copy.pSettingsEdit, description: copy.dSettingsEdit, category: copy.catSystem },
    { id: 'logs_view', label: copy.pLogsView, description: copy.dLogsView, category: copy.catSystem },
    { id: 'roles_manage', label: copy.pRolesManage, description: copy.dRolesManage, category: copy.catSystem },
  ];

  const initialRoles: Role[] = [
    {
      id: 'admin',
      name: 'Admin',
      description: copy.roleAdminDesc,
      color: 'bg-red-600',
      userCount: 2,
      permissions: permissions.map(p => p.id),
      isSystem: true
    },
    {
      id: 'moderator',
      name: 'Moderatör',
      description: copy.roleModeratorDesc,
      color: 'bg-blue-600',
      userCount: 5,
      permissions: ['users_view', 'listings_view', 'listings_approve', 'partners_view', 'reports_view'],
      isSystem: true
    },
    {
      id: 'editor',
      name: 'Editör',
      description: copy.roleEditorDesc,
      color: 'bg-green-600',
      userCount: 8,
      permissions: ['listings_view', 'listings_create', 'reports_view'],
      isSystem: false
    },
    {
      id: 'viewer',
      name: 'İzleyici',
      description: copy.roleViewerDesc,
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
          <h1 className="text-2xl font-bold text-gray-900">{copy.pageTitle}</h1>
          <p className="text-sm text-gray-500 mt-1">{copy.pageSubtitle}</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-dk-red text-white rounded-xl hover:bg-dk-red-strong transition-colors">
          <Plus size={16} />
          <span className="text-sm font-bold">{copy.newRole}</span>
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
              placeholder={copy.searchPlaceholder}
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
                    <p className="text-xs text-gray-500">{role.permissions.length} {copy.permissions}</p>
                  </div>
                </div>
                {role.isSystem && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                    {copy.systemBadge}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-600 mb-3">{role.description}</p>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-500">
                  <Users size={14} />
                  <span className="text-xs">{role.userCount} {copy.userCount}</span>
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
                    {isEditing ? copy.save : copy.edit}
                  </button>
                )}
              </div>

              {selectedRole.isSystem && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-3">
                  <Lock size={18} className="text-amber-600" />
                  <p className="text-sm text-amber-700">
                    {copy.systemLocked}
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
              <h3 className="text-lg font-semibold text-gray-700 mb-2">{copy.selectRoleTitle}</h3>
              <p className="text-sm text-gray-500">
                {copy.selectRoleDesc}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
