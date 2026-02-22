// app/b2b-panel/layout.tsx
// DK Agency - B2B Kullanıcı Portal Layout

import React from 'react';
import B2BSidebar from '@/components/b2b-panel/B2BSidebar';

export const metadata = {
  title: 'B2B Portal | DK Agency',
  description: 'DK Agency HORECA B2B Yatırımcı ve Partner Portalı',
};

export default function B2BPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      <B2BSidebar />
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
