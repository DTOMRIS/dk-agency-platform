// app/b2b-panel/layout.tsx
// DK Agency - B2B Kullanıcı Portal Layout

import React from 'react';
import { redirect } from 'next/navigation';
import B2BSidebar from '@/components/b2b-panel/B2BSidebar';
import Header from '@/components/layout/Header';
import { inter } from '@/components/home/v2/font';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import { getServerMemberSession } from '@/lib/members/server-session';

export const metadata = {
  title: 'B2B Portal | DK Agency',
  description: 'DK Agency HORECA B2B Yatırımcı ve Partner Portalı',
};

export default async function B2BPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerMemberSession();

  if (!session.loggedIn) {
    redirect('/auth/login');
  }

  return (
    // TASK-0524 (owner 10.10: «üst bar naviqasiya fərqlidir, toparlamaq lazım»): the site's v2 header on
    // desktop, so the portal and the public pages share one top bar; the sidebar sits sticky under it.
    // Phones keep the portal's own bar (one menu button, not two). Cream v2 surface + Inter.
    <div className={`${inter.className} min-h-screen bg-[#F6F1E9]`}>
      <div className="sticky top-0 z-50 hidden lg:block">
        <Header />
      </div>
      <div className="flex">
        <B2BSidebar />
        {/* TASK-0506: telefonda üst bar (h-14) üçün yer; min-w-0 — geniş məzmun flex-i sıxışdırmasın */}
        <main className="min-w-0 flex-1 pt-14 lg:pt-0">
          {children}
        </main>
      </div>
      <OnboardingModal />
    </div>
  );
}
