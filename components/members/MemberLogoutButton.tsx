'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { LogOut } from 'lucide-react';
import { clearMemberSession } from '@/lib/member-access';
import { normalizeLocale, withLocale } from '@/i18n/config';

export default function MemberLogoutButton() {
  const router = useRouter();
  const t = useTranslations('membershipPage');
  const locale = normalizeLocale(useLocale());

  const handleLogout = async () => {
    clearMemberSession();
    await fetch('/api/member/session', { method: 'DELETE' });
    router.refresh();
    router.push(withLocale(locale, '/uzvluk'));
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm font-bold text-slate-800 transition hover:bg-slate-50"
    >
      <LogOut className="h-4 w-4" aria-hidden="true" />
      {t('logout')}
    </button>
  );
}
