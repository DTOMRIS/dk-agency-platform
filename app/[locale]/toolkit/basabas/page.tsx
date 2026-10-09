import type { Metadata } from 'next';
import BasabasPage from '@/app/toolkit/basabas/page';

export const metadata: Metadata = {
  title: 'Zərərsiz nöqtə (başa-baş) kalkulyatoru',
  description:
    'Restoran zərərə düşməmək üçün ayda ən azı nə qədər satmalıdır: sabit və dəyişən xərclər, gündəlik müştəri hədəfi.',
};

export default function LocalizedBasabasPage() {
  return <BasabasPage />;
}
