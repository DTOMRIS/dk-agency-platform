'use client';

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
  Shield,
  Sparkles,
  LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
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
      { href: '/b2b-panel', label: 'Dashboard', icon: LayoutDashboard },
      { href: '/b2b-panel/ilanlarim', label: 'İlanlarım', icon: FileText },
      { href: '/b2b-panel/yeni-ilan', label: 'Yeni İlan', icon: Plus, highlight: true },
    ],
  },
  {
    title: 'İLETİŞİM',
    items: [
      { href: '/b2b-panel/teklifler', label: 'Gelen Teklifler', icon: Briefcase, badge: 3 },
      { href: '/b2b-panel/mesajlar', label: 'Mesajlar', icon: MessageSquare, badge: 5 },
      { href: '/b2b-panel/bildirimler', label: 'Bildirimler', icon: Bell },
    ],
  },
  {
    title: 'ARAÇLAR',
    items: [
      { href: '/b2b-panel/toolkit', label: 'Toolkit', icon: Wrench, pro: true },
      { href: '/b2b-panel/favoriler', label: 'Favorilerim', icon: Star },
      { href: '/b2b-panel/analizler', label: 'AI Analizleri', icon: Sparkles },
    ],
  },
  {
    title: 'HESAP',
    items: [
      { href: '/b2b-panel/profil', label: 'Firma Profili', icon: Building2 },
      { href: '/b2b-panel/ayarlar', label: 'Ayarlar', icon: Settings },
      { href: '/b2b-panel/destek', label: 'Destek', icon: HelpCircle },
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
    <aside className="flex min-h-screen w-72 flex-col border-r border-slate-200 bg-white">
      <div className="border-b border-slate-200 p-5">
        <Link href="/b2b-panel" className="group flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1A1A2E] shadow-sm transition-all group-hover:shadow-md">
            <span className="text-lg font-bold text-white">DK</span>
          </div>
          <div>
            <h1 className="font-bold text-slate-900">DK Agency</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">B2B Portal</p>
          </div>
        </Link>
      </div>

      <div className="border-b border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 font-bold text-red-600 shadow-sm">
              İH
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900">İstanbul HORECA</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <Shield size={10} className="text-amber-500" />
                <span className="text-[10px] font-semibold uppercase text-amber-600">Premium</span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>Profil Tamamlama</span>
              <span className="font-medium text-slate-900">78%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-red-500 to-red-600" />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.title} className={idx > 0 ? 'mt-6' : ''}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
                      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                        active
                          ? 'bg-red-50 text-red-600'
                          : item.highlight
                            ? 'border border-dashed border-emerald-300 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                          active
                            ? 'bg-red-100 text-red-600'
                            : item.highlight
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                      {item.pro && !active && (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700">
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

      <div className="p-4">
        <div className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-white p-4">
          <div className="mb-2 flex items-center gap-2">
            <Sparkles size={16} className="text-amber-600" />
            <span className="text-sm font-bold text-slate-900">KAZAN AI</span>
          </div>
          <p className="mb-3 text-xs text-slate-600">Food cost, P&amp;L və əməliyyat qərarlarını daha sürətli şərh et.</p>
          <button className="w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-xs font-bold text-slate-900 transition-all hover:from-amber-300 hover:to-amber-400">
            İndi bax
          </button>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium">Çıxış Yap</span>
        </button>
      </div>
    </aside>
  );
}
