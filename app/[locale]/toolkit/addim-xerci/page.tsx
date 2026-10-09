import type { Metadata } from 'next';
import AddimXerciPage from '@/app/toolkit/addim-xerci/page';

export const metadata: Metadata = {
  title: 'Addım xərci kalkulyatoru',
  description:
    'Aşpaz və ofisiantın gündə boş yola sərf etdiyi vaxtı aylıq və illik maaş itkisinə çevirin. İşçinin yolunu kağızdakı planda xəttlə çəkib ölçün, öz rəqəmlərinizlə hesablayın.',
};

export default function LocalizedAddimXerciPage() {
  return <AddimXerciPage />;
}
