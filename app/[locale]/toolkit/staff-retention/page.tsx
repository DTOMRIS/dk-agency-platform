import type { Metadata } from 'next';
import StaffRetentionPage from '@/app/toolkit/staff-retention/page';

export const metadata: Metadata = {
  title: 'İşçi Saxlama Kalkulyatoru',
  description:
    'İşçi turnover faizini, 1 işçi dəyişmə xərcini və illik kadr itkisini Azərbaycan restoran reallığına uyğun hesabla.',
};

export default function LocalizedStaffRetentionPage() {
  return <StaffRetentionPage />;
}
