import { redirect } from 'next/navigation';

export default async function LocalizedDashboardIlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/dashboard/ilanlar/${id}`);
}
