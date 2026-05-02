import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/DashboardLayout';
import { getAuthFromCookie } from '@/lib/auth/jwt';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthFromCookie();

  if (!auth) {
    redirect('/auth/login');
  }

  return <DashboardShell>{children}</DashboardShell>;
}
