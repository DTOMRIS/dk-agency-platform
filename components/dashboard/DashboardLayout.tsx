'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useTranslations } from 'next-intl';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import DashboardBottomNav from '@/components/dashboard/DashboardBottomNav';
import { DashboardTopBar } from '@/components/dashboard/DashboardTopBar';
import PanelBackBar from '@/components/panel/PanelBackBar';
import { inter } from '@/components/home/v2/font';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslations('dashboardSidebar');

  return (
    // TASK-0548: v2 surface (cream + Inter), same as the b2b-panel shell.
    <div className={`dashboard-scope ${inter.className} min-h-screen bg-[#F6F1E9] text-[#334155]`}>
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-[#E4DCCD] bg-[#F6F1E9] px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-[#E4DCCD] bg-white text-[#0F172A]"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm font-bold text-[#0F172A]">{t('title')}</div>
        <div className="text-xs font-semibold text-[#5B6474]">{t('role')}</div>
      </div>

      <div className="min-h-screen bg-[#F6F1E9] pt-16 pb-20 lg:ml-72 lg:pt-0 lg:pb-0">
        <DashboardTopBar />
        <PanelBackBar root="/dashboard" className="px-4 pt-4 sm:px-8 sm:pt-5" />
        <main>{children}</main>
      </div>

      <DashboardBottomNav onMore={() => setSidebarOpen(true)} />
    </div>
  );
}
