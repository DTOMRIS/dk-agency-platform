'use client';

import { Suspense, startTransition, useEffect, useState } from 'react';
import Link from 'next/link';
import PortalEngagementTracker from '@/components/analytics/PortalEngagementTracker';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import {
  Bell,
  Briefcase,
  Building2,
  FileText,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Plus,
  Settings,
  Shield,
  Sparkles,
  Receipt,
  Star,
  Wrench,
  type LucideIcon,
} from 'lucide-react';

interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  highlight?: boolean;
  badge?: number;
  pro?: boolean;
}

interface NavSection {
  titleKey: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    titleKey: 'sectionGeneral',
    items: [
      { href: '/b2b-panel', labelKey: 'dashboard', icon: LayoutDashboard },
      { href: '/b2b-panel/ilanlarim', labelKey: 'myListings', icon: FileText },
      { href: '/b2b-panel/yeni-ilan', labelKey: 'newListing', icon: Plus, highlight: true },
    ],
  },
  {
    titleKey: 'sectionCommunication',
    items: [
      { href: '/b2b-panel/teklifler', labelKey: 'incomingOffers', icon: Briefcase, badge: 3 },
      { href: '/b2b-panel/mesajlar', labelKey: 'messages', icon: MessageSquare, badge: 5 },
      { href: '/b2b-panel/bildirimler', labelKey: 'notifications', icon: Bell },
    ],
  },
  {
    titleKey: 'sectionTools',
    items: [
      { href: '/b2b-panel/toolkit', labelKey: 'toolkit', icon: Wrench, pro: true },
      { href: '/b2b-panel/faturalar', labelKey: 'invoices', icon: Receipt },
      { href: '/b2b-panel/favoriler', labelKey: 'favorites', icon: Star },
      { href: '/b2b-panel/analizler', labelKey: 'aiAnalysis', icon: Sparkles },
    ],
  },
  {
    titleKey: 'sectionAccount',
    items: [
      { href: '/b2b-panel/profil', labelKey: 'companyProfile', icon: Building2 },
      { href: '/b2b-panel/ayarlar', labelKey: 'settings', icon: Settings },
      { href: '/b2b-panel/destek', labelKey: 'support', icon: HelpCircle },
    ],
  },
];

function getProfileFromStorage(): { logo?: string; form?: { companyName?: string } } | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('dk_company_profile') || 'null');
  } catch {
    return null;
  }
}

function CompanyLogo() {
  const [logo, setLogo] = useState<string | null>(null);
  useEffect(() => {
    const stored = getProfileFromStorage()?.logo || null;
    startTransition(() => setLogo(stored));
  }, []);
  if (logo) return <img src={logo} alt="Logo" className="h-12 w-12 rounded-xl object-cover border border-slate-200" />;
  return (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-100 text-slate-400 shadow-sm">
      <Building2 size={22} />
    </div>
  );
}

function CompanyName() {
  const [name, setName] = useState('Mənim Şirkətim');
  useEffect(() => {
    const stored = getProfileFromStorage()?.form?.companyName || 'Mənim Şirkətim';
    startTransition(() => setName(stored));
  }, []);
  return <p className="truncate text-sm font-semibold text-slate-900">{name}</p>;
}

export default function B2BSidebar() {
  const pathname = usePathname();
  const t = useTranslations('dashboard.sidebar');

  const isActive = (href: string) => {
    if (href === '/b2b-panel') return pathname === '/b2b-panel';
    return pathname.startsWith(href);
  };

  return (
    <>
      <Suspense fallback={null}>
        <PortalEngagementTracker />
      </Suspense>
      <aside className="flex min-h-screen w-72 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-md">
      <div className="border-b border-slate-200 p-5">
        <Link href="/b2b-panel" className="group flex items-center gap-3">
          <img
            src="/images/logo-mobil.png"
            alt="DK Agency Logo"
            className="h-11 w-11 shrink-0 object-contain shadow-sm transition-all group-hover:shadow-md"
          />
          <div>
            <h1 className="font-bold text-slate-900">DK Agency</h1>
            <p className="text-[10px] uppercase tracking-wider text-slate-500">B2B Portal</p>
          </div>
        </Link>
      </div>

      <div className="border-b border-slate-200 p-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/50 backdrop-blur-sm p-4">
          <div className="flex items-center gap-3">
            <CompanyLogo />
            <div className="min-w-0 flex-1">
              <CompanyName />
              <div className="mt-0.5 flex items-center gap-1.5">
                <Shield size={10} className="text-amber-500" />
                <span className="text-[10px] font-semibold uppercase text-amber-600">
                  {t('premium')}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 border-t border-slate-200 pt-3">
            <div className="mb-1 flex items-center justify-between text-[10px] text-slate-500">
              <span>{t('profileCompletion')}</span>
              <span className="font-medium text-slate-900">78%</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full w-[78%] rounded-full bg-gradient-to-r from-dk-red to-dk-red-strong" />
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section, idx) => (
          <div key={section.titleKey} className={idx > 0 ? 'mt-6' : ''}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-400">
              {t(section.titleKey)}
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
                          ? 'bg-dk-red/10 text-dk-red'
                          : item.highlight
                            ? 'border border-dashed border-emerald-300 text-slate-700 hover:border-emerald-400 hover:bg-emerald-50'
                            : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg transition-all ${
                          active
                            ? 'bg-dk-red/15 text-dk-red'
                            : item.highlight
                              ? 'bg-emerald-100 text-emerald-600'
                              : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}
                      >
                        <Icon size={15} />
                      </div>
                      <span className="flex-1">{t(item.labelKey)}</span>
                      {item.badge ? (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                            active ? 'bg-dk-red/15 text-dk-red' : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {item.badge}
                        </span>
                      ) : null}
                      {item.pro && !active ? (
                        <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[8px] font-bold uppercase text-amber-700">
                          {t('premium')}
                        </span>
                      ) : null}
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
            <span className="text-sm font-bold text-slate-900">{t('kazanAiTitle')}</span>
          </div>
          <p className="mb-3 text-xs text-slate-600">{t('kazanAiDesc')}</p>
          <Link
            href="/kazan-ai"
            className="block w-full rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 py-2 text-center text-xs font-bold text-slate-900 transition-all hover:from-amber-300 hover:to-amber-400"
          >
            {t('kazanAiCta')}
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-200 p-4">
        <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-slate-500 transition-all hover:bg-slate-50 hover:text-slate-900">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <LogOut size={15} />
          </div>
          <span className="text-sm font-medium">{t('logout')}</span>
        </button>
      </div>
    </aside>
  </>);
}
