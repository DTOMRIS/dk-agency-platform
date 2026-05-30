import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import DashboardShell from '@/components/dashboard/DashboardLayout';
import { getAuthFromCookie } from '@/lib/auth/jwt';
import { isLocale, defaultLocale } from '@/i18n/config';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect('/auth/login');
  }

  // Resolve locale from NEXT_LOCALE cookie (set by next-intl middleware/language switcher)
  const cookieStore = await cookies();
  const cookieLocale = cookieStore.get('NEXT_LOCALE')?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;
  const messages = (await import(`@/messages/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <DashboardShell>{children}</DashboardShell>
    </NextIntlClientProvider>
  );
}
