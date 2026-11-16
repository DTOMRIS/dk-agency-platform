import { requireAdminPage } from '@/lib/auth/guards';
import KazanSalesBoard from '@/components/dashboard/KazanSalesBoard';

export default async function DashboardKazanLeadsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const p = await searchParams;
  const value = (k: string) => typeof p[k] === 'string' ? p[k] as string : undefined;
  return <KazanSalesBoard initial={{ status: value('status'), intent: value('intent'), businessType: value('businessType') }} />;
}
