import type { Metadata } from 'next';
import BasabasPage from '@/app/toolkit/basabas/page';

export const metadata: Metadata = {
  title: 'Başabaş Nöqtəsi Kalkulyatoru',
  description:
    'Restoran başabaş nöqtəsini hesabla: sabit xərclər, dəyişən xərclər, gündəlik müştəri hədəfi.',
};

export default function LocalizedBasabasPage() {
  return <BasabasPage />;
}
