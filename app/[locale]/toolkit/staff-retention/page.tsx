import type { Metadata } from 'next';
import StaffRetentionPage from '@/app/toolkit/staff-retention/page';

export const metadata: Metadata = {
  title: 'İşçi saxlama kalkulyatoru',
  description:
    'İşçi dəyişmə faizini, bir işçinin yerini doldurmağın xərcini və işdən çıxan işçilərə görə ildə itən pulu hesablayın.',
};

export default function LocalizedStaffRetentionPage() {
  return <StaffRetentionPage />;
}
