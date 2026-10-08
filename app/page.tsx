import type { Metadata } from 'next';

// TASK-0510: kök ünvan (/) [locale] layout-dan keçmir — link önizləməsinin yeni mətni burada.
// Root layout qorunan fayldır, ona görə metadata səhifə səviyyəsində verilir.
const title = 'DK Agency | HoReCa İdarəetmə, KAZAN AI & Biznes Ekosistemi';
const description =
  '40 illik təcrübə, KAZAN AI asistanı, 18+ interaktiv maliyyə aləti, ekspert bloq və sektor xəbərləri — Azərbaycan HoReCa sektoru üçün.';

export const metadata: Metadata = {
  title,
  description,
  openGraph: { type: 'website', siteName: 'DK Agency', locale: 'az_AZ', url: 'https://dkagency.com.tr', title, description },
  twitter: { card: 'summary_large_image', title, description },
};

export { default } from '@/app/[locale]/page';
