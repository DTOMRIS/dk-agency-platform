import type { Metadata } from 'next';
import InsaatChecklistPage from '@/app/toolkit/insaat-checklist/page';

export const metadata: Metadata = {
  title: 'İnşaatdan Açılışa Checklist',
  description:
    '62 maddəlik restoran açılış checklist-i: əməliyyat dizaynı, ön hazırlıq, kaba işlər, incə işlər, avadanlıq və açılış sprinti.',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'İnşaatdan Açılışa restoran checklist-i',
  description:
    'Restoran obyektini inşaatdan açılışa qədər 6 fazada idarə etmək üçün 62 maddəlik praktik checklist.',
  totalTime: 'P12W',
  supply: [
    { '@type': 'HowToSupply', name: 'İnşaat planı' },
    { '@type': 'HowToSupply', name: 'Büdcə cədvəli' },
    { '@type': 'HowToSupply', name: 'Podratçı təklifləri' },
  ],
  tool: [
    { '@type': 'HowToTool', name: 'Tikinti nəzarət checklist-i' },
    { '@type': 'HowToTool', name: 'Foto və video progress qeydləri' },
  ],
  step: [
    { '@type': 'HowToStep', name: 'Əməliyyat dizaynı', text: 'Memarın eskizində qonaq, məhsul və işçi yolunu, kirli-təmiz axını və saatlıq gücü yoxla.' },
    { '@type': 'HowToStep', name: 'Ön hazırlıq', text: 'Elektrik, qaz, su, baca, büdcə və müqavilələri tamamla.' },
    { '@type': 'HowToStep', name: 'Kaba işlər', text: 'Divar, döşəmə, su, kanalizasiya, qaz və havalandırma skeletini qur.' },
    { '@type': 'HowToStep', name: 'İncə işlər', text: 'Boya, işıq, mebel, giriş və dekor həllərini tamamla.' },
    { '@type': 'HowToStep', name: 'Avadanlıq və texnologiya', text: 'Mətbəx avadanlığı, POS, internet və təhlükəsizlik sistemlərini test et.' },
    { '@type': 'HowToStep', name: 'Açılış hazırlığı', text: 'Yoxlamalar, komanda təlimi, soft opening və rəsmi açılışı hazırla.' },
  ],
};

export default function LocalizedInsaatChecklistPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <InsaatChecklistPage />
    </>
  );
}
