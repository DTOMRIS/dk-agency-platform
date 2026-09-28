import { redirect } from 'next/navigation';

// TASK-0458: köhnə /dashboard/marketinq-ocagi/<alət> linkləri üçün yönləndirmə.
export default async function DashboardMarketinqToolRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  redirect(`/b2b-panel/marketinq-ocagi/${encodeURIComponent(slug)}`);
}
