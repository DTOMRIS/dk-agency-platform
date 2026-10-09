import { renderHomeOg, HOME_OG_SIZE } from '@/lib/og/home-og';

// TASK-0513: /ru, /en, /tr link önizləməsi öz dilində (əvvəl hamısı AZ şəkli göstərirdi).
// [locale]/layout openGraph.images bu ünvana açıq işarə edir.
export const alt = 'DK Agency — food cost, P&L, OCAQ, KAZAN AI';
export const size = HOME_OG_SIZE;
export const contentType = 'image/png';
export const dynamic = 'force-dynamic';

export default async function OpenGraphImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  return renderHomeOg(locale);
}
