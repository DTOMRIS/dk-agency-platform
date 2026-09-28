import { redirect } from 'next/navigation';

// TASK-0458: Marketinq Ocağı üzv alətləridir — dashboard admin-only olduğu üçün
// üzv panelinə köçdü. Köhnə linklər / əlfəcinlər üçün yönləndirmə.
export default function DashboardMarketinqOcagiRedirect() {
  redirect('/b2b-panel/marketinq-ocagi');
}
