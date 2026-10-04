import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import DashboardShell from '@/components/dashboard/DashboardLayout';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { normalizeLocale } from '@/i18n/config';
import { getLocale } from 'next-intl/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect('/auth/login');
  }
  // TASK-0458: dashboard yalnız admin üçündür (əvvəl JWT-nin varlığı kifayət edirdi —
  // qeydiyyatlı istənilən üzv admin səhifələrini açırdı). Üzv alətləri (Marketinq Ocağı)
  // /b2b-panel/marketinq-ocagi-yə köçdü. [locale]/dashboard/layout bunu re-export edir.
  if (auth.role !== 'admin') {
    redirect('/b2b-panel');
  }

  // TASK-0483: locale comes from the URL (/ru/dashboard …), the same source server pages use via
  // getLocale(). It used to come from the NEXT_LOCALE cookie, so after switching language the
  // menu/top bar changed but page content stayed AZ (mixed-language panel).
  const locale = normalizeLocale(await getLocale());
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
