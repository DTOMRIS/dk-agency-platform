'use client';

import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { clearMemberSession } from '@/lib/member-access';

export default function MemberLogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    router.refresh();
    router.push('/uzvluk');
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
    >
      <LogOut className="h-4 w-4" />
      Çıxış et
    </button>
  );
}
