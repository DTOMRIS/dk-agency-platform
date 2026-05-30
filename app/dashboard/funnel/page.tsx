import { redirect } from 'next/navigation';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { getLocale } from 'next-intl/server';
import { normalizeLocale } from '@/i18n/config';
import ActivationFunnelWidget from '@/components/dashboard/ActivationFunnelWidget';

export default async function FunnelPage() {
  const auth = await getAuthFromCookie();
  if (!auth) redirect('/auth/login');
  if (auth.role !== 'admin') redirect('/dashboard');

  const rawLocale = await getLocale();
  const locale = normalizeLocale(rawLocale);

  return (
    <div className="min-h-screen bg-white p-6 lg:p-8">
      <div className="mx-auto max-w-3xl">
        <ActivationFunnelWidget locale={locale} days={30} />
      </div>
    </div>
  );
}
