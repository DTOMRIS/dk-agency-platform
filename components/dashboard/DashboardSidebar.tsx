// components/dashboard/DashboardSidebar.tsx
// DK Agency Admin Dashboard Sidebar - Restaurant365 Style
// Holding Yönetim Merkezi

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Building2,
  FileText,
  Users,
  Settings,
  TrendingUp,
  Calendar,
  X,
  MessageSquare,
  ShieldCheck,
  PieChart,
  Activity,
  LogOut,
  FolderKanban,
  CheckSquare,
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'KONTROL MERKEZİ',
    items: [
      { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Proje Hunisi', href: '/dashboard/pipeline', icon: FolderKanban, badge: '12' },
      { title: 'Mesajlar', href: '/dashboard/mesajlar', icon: MessageSquare, badge: '5' },
    ],
  },
  {
    title: 'İÇERİK YÖNETİMİ',
    items: [
      { title: 'Haberler & Analizler', href: '/dashboard/haberler', icon: Newspaper },
      { title: 'Duyurular', href: '/dashboard/duyurular', icon: Megaphone },
      { title: 'Etkinlikler', href: '/dashboard/etkinlikler', icon: Calendar },
    ],
  },
  {
    title: 'B2B EKOSİSTEM',
    items: [
      { title: 'B2B Yönetimi', href: '/dashboard/b2b-yonetimi', icon: Building2 },
      { title: 'İlan Onayları', href: '/dashboard/ilan-onaylari', icon: CheckSquare, badge: '8' },
      { title: 'Deal Flow', href: '/dashboard/deal-flow', icon: TrendingUp },
    ],
  },
  {
    title: 'ANALİTİK',
    items: [
      { title: 'Raporlar', href: '/dashboard/raporlar', icon: PieChart },
      { title: 'Aktivite Logları', href: '/dashboard/loglar', icon: Activity },
    ],
  },
  {
    title: 'SİSTEM',
    items: [
      { title: 'Kullanıcılar', href: '/dashboard/kullanicilar', icon: Users },
      { title: 'Roller & İzinler', href: '/dashboard/roller', icon: ShieldCheck },
      { title: 'Ayarlar', href: '/dashboard/ayarlar', icon: Settings },
    ],
  },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen w-72 bg-gray-900 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
          flex flex-col
        `}
      >
        {/* Header - Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-800/50">
          <Link href="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
              DK
            </div>
            <div>
              <span className="font-bold text-white text-sm">DK Agency</span>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">Holding Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-500 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Admin Info */}
        <div className="px-4 py-4 border-b border-gray-800/50">
          <div className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center">
              <ShieldCheck size={18} className="text-red-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">God Mode</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
          </div>
        </div>

        {/* Menu */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          {MENU_SECTIONS.map((section, idx) => (
            <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
              <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-colors
                        ${active ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}
                      `}>
                        <Icon size={16} className={active ? 'text-white' : 'text-gray-500 group-hover:text-red-400'} />
                      </div>
                      <span className="flex-1 text-sm font-medium">{item.title}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-[10px] font-bold rounded-full
                          ${active ? 'bg-white/20 text-white' : 'bg-red-600/20 text-red-400'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800/50">
          <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800/70 transition-all">
            <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
              <LogOut size={16} />
            </div>
            <span className="text-sm font-medium">Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
