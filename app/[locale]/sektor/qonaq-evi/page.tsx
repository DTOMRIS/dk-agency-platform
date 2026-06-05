import type { Metadata } from 'next';
import QonaqEviSektorPage from '@/app/sektor/qonaq-evi/page';

export const metadata: Metadata = {
  title: 'Qonaq Evi & Pansiyon — Booking, Airbnb, Yandex Travel üçün Tam Bələdçi | DK Agency',
  description:
    'Pansiyon, qonaq evi və Airbnb host-ları üçün OTA hazırlıq testi, ROI kalkulyatoru və WhatsApp template paketi. Xınalıqdan Bakıya — DK Agency dəstəyi ilə.',
  openGraph: {
    title: 'Qonaq Evi & Pansiyon Sektoru | DK Agency',
    description: 'OTA hazırlıq testi, ROI kalkulyatoru və WhatsApp şablonları — pulsuz alətlər.',
    type: 'website',
    images: [
      {
        url: '/sektor/qonaq-evi/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Qonaq Evi & Pansiyon — DK Agency',
      },
    ],
  },
};

export default function LocalizedQonaqEviPage() {
  return <QonaqEviSektorPage />;
}
