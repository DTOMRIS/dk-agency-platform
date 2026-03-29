'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Newspaper,
  Megaphone,
  Building2,
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
  ShieldAlert,
} from 'lucide-react';

const MENU_SECTIONS = [
  {
    title: 'İdarəetmə',
    items: [
      { title: 'Admin Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { title: 'Pipeline', href: '/dashboard/pipeline', icon: FolderKanban, badge: '12' },
      { title: 'Mesajlar', href: '/dashboard/mesajlar', icon: MessageSquare, badge: '5' },
    ],
  },
  {
    title: 'Kontent',
    items: [
      { title: 'Xəbərlər & Analizlər', href: '/dashboard/haberler', icon: Newspaper },
      { title: 'Duyurular', href: '/dashboard/duyurular', icon: Megaphone },
      { title: 'Tədbirlər', href: '/dashboard/etkinlikler', icon: Calendar },
    ],
  },
  {
    title: 'B2B Ekosistem',
    items: [
      { title: 'B2B idarəetməsi', href: '/dashboard/b2b-yonetimi', icon: Building2 },
      { title: 'İlan onayları', href: '/dashboard/ilan-onaylari', icon: CheckSquare, badge: '8' },
      { title: 'Deal flow', href: '/dashboard/deal-flow', icon: TrendingUp },
    ],
  },
  {
    title: 'Analitika',
    items: [
      { title: 'Raporlar', href: '/dashboard/raporlar', icon: PieChart },
      { title: 'AQTA Hazırlıq', href: '/dashboard/aqta-checklist', icon: ShieldAlert },
      { title: 'Aktivlik logları', href: '/dashboard/loglar', icon: Activity },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { title: 'İstifadəçilər', href: '/dashboard/kullanicilar', icon: Users },
      { title: 'Rollar & icazələr', href: '/dashboard/roller', icon: ShieldCheck },
      { title: 'Ayarlar', href: '/dashboard/ayarlar', icon: Settings },
    ],
  },
];

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({
  isOpen = true,
  onClose,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          fixed left-0 top-0 z-50 flex h-screen w-72 flex-col bg-gray-900
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex h-16 items-center justify-between border-b border-gray-800/50 px-5">
          <Link href="/dashboard" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-red-500 to-red-700 font-bold text-white shadow-lg shadow-red-500/20 transition-shadow group-hover:shadow-red-500/40">
              DK
            </div>
            <div>
              <span className="text-sm font-bold text-white">DK Agency</span>
              <p className="text-[10px] uppercase tracking-wider text-gray-500">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-800 hover:text-white lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="border-b border-gray-800/50 px-4 py-4">
          <div className="flex items-center gap-3 rounded-xl bg-gray-800/50 p-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-700 to-gray-600">
              <ShieldCheck size={18} className="text-red-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">God Mode</p>
              <p className="text-xs text-gray-500">Super Admin</p>
            </div>
            <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {MENU_SECTIONS.map((section, index) => (
            <div key={section.title} className={index > 0 ? 'mt-6' : ''}>
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-gray-600">
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
                        group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-200
                        ${active ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'text-gray-400 hover:bg-gray-800/70 hover:text-white'}
                      `}
                    >
                      <div
                        className={`
                          flex h-8 w-8 items-center justify-center rounded-lg transition-colors
                          ${active ? 'bg-white/20' : 'bg-gray-800 group-hover:bg-gray-700'}
                        `}
                      >
                        <Icon
                          size={16}
                          className={active ? 'text-white' : 'text-gray-500 group-hover:text-red-400'}
                        />
                      </div>
                      <span className="flex-1 text-sm font-medium">{item.title}</span>
                      {item.badge && (
                        <span
                          className={`
                            rounded-full px-2 py-0.5 text-[10px] font-bold
                            ${active ? 'bg-white/20 text-white' : 'bg-red-600/20 text-red-400'}
                          `}
                        >
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

        <div className="border-t border-gray-800/50 p-4">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-gray-500 transition-all hover:bg-gray-800/70 hover:text-white">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-800">
              <LogOut size={16} />
            </div>
            <span className="text-sm font-medium">Çıxış et</span>
          </button>
        </div>
      </aside>
    </>
  );
}
