import type { Metadata } from 'next';
import FoodCostPage from '@/app/[locale]/toolkit/food-cost/page';

export const metadata: Metadata = {
  title: 'Food cost (ərzaq xərci faizi) kalkulyatoru',
  description:
    'Porsiyanın maya dəyərini, təmizləmə itkisini (sümük, qabıq, yağ) və düzgün satış qiymətini hesablayan pulsuz alət.',
};

export default function PublicFoodCostPage() {
  return <FoodCostPage />;
}
