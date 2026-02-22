// components/b2b-panel/B2BSidebar.tsx
// DK Agency B2B Portal Sidebar - Restaurant365 Style
// Yatırımcı/Partner Portal Navigasyonu

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Plus,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
  Building2,
  Briefcase,
  Bell,
  Star,
  Wrench,
  TrendingUp,
  PieChart,
  Users,
  Shield,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  color: string;
  highlight?: boolean;
  badge?: number;
  pro?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: 'GENEL',
    items: [
      { href: '/b2b-panel', label: 'Dashboard', icon: LayoutDashboard, color: 'from-blue-500 to-blue-600' },
      { href: '/b2b-panel/ilanlarim', label: 'İlanlarım', icon: FileText, color: 'from-purple-500 to-purple-600' },
      { href: '/b2b-panel/yeni-ilan', label: 'Yeni İlan', icon: Plus, color: 'from-green-500 to-green-600', highlight: true },
    ],
  },
  {
    title: 'İLETİŞİM',
    items: [
      { href: '/b2b-panel/teklifler', label: 'Gelen Teklifler', icon: Briefcase, badge: 3, color: 'from-amber-500 to-amber-600' },
      { href: '/b2b-panel/mesajlar', label: 'Mesajlar', icon: MessageSquare, badge: 5, color: 'from-pink-500 to-pink-600' },
      { href: '/b2b-panel/bildirimler', label: 'Bildirimler', icon: Bell, color: 'from-indigo-500 to-indigo-600' },
    ],
  },
  {
    title: 'ARAÇLAR',
    items: [
      { href: '/b2b-panel/toolkit', label: 'Toolkit', icon: Wrench, color: 'from-red-500 to-red-600', pro: true },
      { href: '/b2b-panel/favoriler', label: 'Favorilerim', icon: Star, color: 'from-yellow-500 to-yellow-600' },
      { href: '/b2b-panel/analizler', label: 'AI Analizleri', icon: Sparkles, color: 'from-cyan-500 to-cyan-600' },
    ],
  },
  {
    title: 'HESAP',
    items: [
      { href: '/b2b-panel/profil', label: 'Firma Profili', icon: Building2, color: 'from-gray-500 to-gray-600' },
      { href: '/b2b-panel/ayarlar', label: 'Ayarlar', icon: Settings, color: 'from-slate-500 to-slate-600' },
      { href: '/b2b-panel/destek', label: 'Destek', icon: HelpCircle, color: 'from-teal-500 to-teal-600' },
    ],
  },
];

export default function B2BSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/b2b-panel') return pathname === '/b2b-panel';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-72 bg-gray-900 min-h-screen flex flex-col">
      {/* Logo Header */}
      <div className="p-5 border-b border-gray-800/50">
        <Link href="/b2b-panel" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-all">
            <span className="text-white font-bold text-lg">DK</span>
          </div>
          <div>
            <h1 className="font-bold text-white">DK Agency</h1>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">B2B Portal</p>
          </div>
        </Link>
      </div>

      {/* User Card */}
      <div className="p-4 border-b border-gray-800/50">
        <div className="bg-gradient-to-r from-gray-800 to-gray-800/50 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center text-white font-bold shadow-lg">
              İH
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-white text-sm truncate">İstanbul HORECA</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Shield size={10} className="text-amber-400" />
                <span className="text-[10px] text-amber-400 font-semibold uppercase">Premium</span>
              </div>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 pt-3 border-t border-gray-700/50">
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
              <span>Profil Tamamlama</span>
              <span className="text-white font-medium">78%</span>
            </div>
            <div className="h-1.5 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-[78%] bg-gradient-to-r from-red-500 to-red-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
            <p className="px-3 mb-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
              {section.title}
            </p>
            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);

                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`
                        group flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200
                        ${active 
                          ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' 
                          : item.highlight 
                            ? 'text-green-400 hover:text-white hover:bg-gray-800/70 border border-dashed border-green-500/30 hover:border-transparent' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/70'
                        }
                      `}
                    >
                      <div className={`
                        w-8 h-8 rounded-lg flex items-center justify-center transition-all
                        ${active 
                          ? 'bg-white/20' 
                          : `bg-gradient-to-br ${item.color} opacity-80 group-hover:opacity-100`
                        }
                      `}>
                        <Icon size={15} className="text-white" />
                      </div>
                      <span className="flex-1 font-medium text-sm">{item.label}</span>
                      {item.badge && (
                        <span className={`
                          px-2 py-0.5 text-[10px] font-bold rounded-full
                          ${active ? 'bg-white/20 text-white' : 'bg-red-500/20 text-red-400'}
                        `}>
                          {item.badge}
                        </span>
                      )}
                      {item.pro && !active && (
                        <span className="px-1.5 py-0.5 text-[8px] font-bold bg-amber-500/20 text-amber-400 rounded uppercase">
                          Pro
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Upgrade Card */}
      <div className="p-4">
        <div className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 rounded-xl p-4 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-sm font-bold text-white">AI Asistan</span>
          </div>
          <p className="text-xs text-gray-400 mb-3">Almila ile yatırım analizlerinizi hızlandırın</p>
          <button className="w-full py-2 bg-gradient-to-r from-amber-500 to-amber-600 text-gray-900 text-xs font-bold rounded-lg hover:from-amber-400 hover:to-amber-500 transition-all">
            Şimdi Dene
          </button>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800/50">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:text-white hover:bg-gray-800/70 transition-all">
          <div className="w-8 h-8 rounded-lg bg-gray-800 flex items-center justify-center">
            <LogOut size={15} />
          </div>
          <span className="font-medium text-sm">Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}
