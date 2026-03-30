'use client';

import { useState } from 'react';
import { Menu } from 'lucide-react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="fixed left-0 right-0 top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600"
        >
          <Menu size={20} />
        </button>
        <div className="text-sm font-bold text-[var(--dk-navy)]">OCAQ İdarə Paneli</div>
        <div className="text-xs font-semibold text-slate-500">Admin</div>
      </div>

      <main className="min-h-screen bg-white pt-16 lg:ml-72 lg:pt-0">{children}</main>
    </div>
  );
}
