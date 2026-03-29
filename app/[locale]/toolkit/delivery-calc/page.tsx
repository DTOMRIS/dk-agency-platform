import type { Metadata } from 'next';
import DeliveryCalcPage from '@/app/toolkit/delivery-calc/page';

export const metadata: Metadata = {
  title: 'Delivery Komissiya Kalkulyatoru',
  description:
    'Wolt, Bolt Food, Yango və öz delivery modeli üçün komissiya, food cost və aylıq netto nəticəni hesabla.',
};

export default function LocalizedDeliveryCalcPage() {
  return <DeliveryCalcPage />;
}
