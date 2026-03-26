import type { Metadata } from 'next';
import FoodCostPage from '@/app/[locale]/toolkit/food-cost/page';

export const metadata: Metadata = {
  title: 'Food Cost Kalkulyator',
  description:
    'Porsiya maya dəyərini, trim loss-u və ideal satış qiymətini hesablayan food cost kalkulyatoru.',
};

export default function PublicFoodCostPage() {
  return <FoodCostPage />;
}
