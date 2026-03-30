'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BookOpen,
  ChevronLeft,
  FilePenLine,
  Globe,
  LayoutDashboard,
  LogOut,
  Newspaper,
  Settings,
  Store,
  Users,
  Wrench,
} from 'lucide-react';
import { MOCK_LISTINGS } from '@/lib/data/mockListings';
import { adminBlogPosts, adminNewsQueue } from '@/lib/data/adminContent';

const pendingListings = MOCK_LISTINGS.filter((listing) =>
  ['submitted', 'committee_review', 'ai_checked'].includes(listing.status),
).length;
const pendingNews = adminNewsQueue.filter((item) => item.status === 'fetched').length;
const draftBlogs = adminBlogPosts.filter((item) => item.status === 'draft').length;

const navItems = [
  { title: 'Əsas səhifə', href: '/dashboard', icon: LayoutDashboard },
  { title: 'Elanlar', href: '/dashboard/ilanlar', icon: Store, badge: pendingListings },
  { title: 'Hero', href: '/dashboard/hero', icon: FilePenLine },
  { title: 'Xəbərlər', href: '/dashboard/xeberler', icon: Newspaper, badge: pendingNews },
  { title: 'Bloq', href: '/dashboard/blog', icon: BookOpen, badge: draftBlogs },
  { title: 'Toolkit', href: '/dashboard/toolkit', icon: Wrench },
  { title: 'Sayt', href: '/dashboard/site', icon: Globe },
  { title: 'İstifadəçilər', href: '/dashboard/users', icon: Users },
  { title: 'Parametrlər', href: '/dashboard/settings', icon: Settings },
] as const;

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function DashboardSidebar({ isOpen = true, onClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <>
      {isOpen ? (
        <button
          type="button"
          aria-label="Sidebar bağla"
          className="fixed inset-0 z-40 bg-slate-950/30 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-5">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--dk-navy)] text-sm font-black text-white shadow-lg shadow-slate-900/15">
              DK
            </div>
            <div>
              <div className="text-sm font-black tracking-wide text-[var(--dk-navy)]">OCAQ İdarə Paneli</div>
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                Admin mərkəzi
              </div>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:border-[var(--dk-gold)] hover:text-[var(--dk-navy)] lg:hidden"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="border-b border-slate-200 px-5 py-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-bold text-[var(--dk-navy)]">Doğan Tomris</p>
            <p className="mt-1 text-xs text-slate-500">Tam idarəetmə girişi aktivdir</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`group flex items-center gap-3 rounded-2xl border-l-4 px-4 py-3 transition ${
                    active
                      ? 'border-[var(--dk-gold)] bg-amber-50 text-[var(--dk-navy)]'
                      : 'border-transparent text-slate-600 hover:bg-slate-50 hover:text-[var(--dk-navy)]'
                  }`}
                >
                  <span
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                      active ? 'bg-white text-[var(--dk-red)] shadow-sm' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Icon size={18} />
                  </span>
                  <span className="flex-1 text-sm font-semibold">{item.title}</span>
                  {'badge' in item && item.badge ? (
                    <span className="rounded-full bg-[var(--dk-red)] px-2.5 py-1 text-[11px] font-bold text-white">
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="border-t border-slate-200 p-4">
          <div className="mb-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm font-bold text-[var(--dk-navy)]">Admin</p>
            <p className="mt-1 text-xs text-slate-500">admin@dkagency.az</p>
          </div>

          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:border-[var(--dk-red)] hover:text-[var(--dk-red)]"
          >
            <LogOut size={18} />
            Çıxış
          </button>
        </div>
      </aside>
    </>
  );
}
