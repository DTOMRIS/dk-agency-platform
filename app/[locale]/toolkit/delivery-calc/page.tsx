import type { Metadata } from 'next';
import DeliveryCalcPage from '@/app/toolkit/delivery-calc/page';

export const metadata: Metadata = {
  title: 'Çatdırılma komissiyası kalkulyatoru',
  description:
    'Wolt, Bolt Food, Yango və öz kuryeriniz üçün komissiya, ərzaq xərci və bir sifarişdən sizə qalan pulu hesablayın.',
};

export default function LocalizedDeliveryCalcPage() {
  return <DeliveryCalcPage />;
}
