// app/dashboard/layout.tsx
// DK Agency Dashboard Layout

'use client';

import { useState } from 'react';
import DashboardSidebar from '@/components/dashboard/DashboardSidebar';
import { Menu } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-100">
      <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-gray-900 border-b border-gray-800 h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="text-gray-400 hover:text-white"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2 ml-4">
          <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center text-white font-bold text-xs">
            DK
          </div>
          <span className="font-bold text-white text-sm">Dashboard</span>
        </div>
      </div>

      {/* Main Content */}
      <main className="lg:ml-72 pt-14 lg:pt-0 min-h-screen">
        {children}
      </main>
    </div>
  );
}
