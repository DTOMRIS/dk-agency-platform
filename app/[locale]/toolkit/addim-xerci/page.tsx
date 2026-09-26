import type { Metadata } from 'next';
import AddimXerciPage from '@/app/toolkit/addim-xerci/page';

export const metadata: Metadata = {
  title: 'Addım Xərci Kalkulyatoru',
  description:
    'Aşpaz və ofisiantın gündə boş yola sərf etdiyi vaxtı aylıq və illik əmək haqqı itkisinə çevir. Spagetti diaqramı ilə ölç, öz rəqəmlərinlə hesabla.',
};

export default function LocalizedAddimXerciPage() {
  return <AddimXerciPage />;
}
