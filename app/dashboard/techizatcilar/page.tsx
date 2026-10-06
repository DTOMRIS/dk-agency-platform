import type { Metadata } from 'next';

import SupplyBoard from '@/components/dashboard/supply/SupplyBoard';
import { requireAdminPage } from '@/lib/auth/guards';

/**
 * TASK-0498 — Təchizatçı bazası və Tələb lövhəsi (yalnız admin, şəxsi məlumat).
 * `requireAdminPage()` cookie oxuyur → səhifə həmişə dinamikdir.
 * robots.txt `/dashboard`-u bağlayır; şəxsi məlumat olduğu üçün səhifə əlavə olaraq noindex.
 */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function TechizatcilarPage() {
  await requireAdminPage();
  return <SupplyBoard />;
}
