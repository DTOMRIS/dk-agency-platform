import type { Metadata } from 'next';

// TASK-0510: kök ünvan (/) [locale] layout-dan keçmir — link önizləməsinin mətni burada.
// Root layout qorunan fayldır, ona görə metadata səhifə səviyyəsində verilir.
// TASK-0513: ana səhifə v2 mesajı; [locale]/layout-dakı AZ mətni ilə eynidir.
const title = 'DK Agency — Biz itkini tapırıq, siz restoranı idarə edirsiniz';
const description =
  'Food cost, P&L, delivery komissiyası, OCAQ gündəlik nəzarət və KAZAN AI — restoran, kafe və otellər üçün. Pulsuz diaqnostika.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { type: 'website', siteName: 'DK Agency', locale: 'az_AZ', url: 'https://dkagency.com.tr', title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export { default } from '@/app/[locale]/page';
