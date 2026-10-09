import type { Metadata } from 'next';
import InsaatChecklistPage from '@/app/toolkit/insaat-checklist/page';

export const metadata: Metadata = {
  title: 'İnşaatdan açılışa: yoxlama siyahısı',
  description:
    'Restoranın tikintisindən açılışına qədər 62 iş: planlaşdırma, ön hazırlıq, kaba işlər, incə işlər, avadanlıq və açılış hazırlığı.',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'İnşaatdan açılışa: restoranın yoxlama siyahısı',
  description:
    'Restoranı tikintidən açılışa qədər 6 mərhələdə idarə etmək üçün 62 maddəlik yoxlama siyahısı.',
  totalTime: 'P12W',
  supply: [
    { '@type': 'HowToSupply', name: 'İnşaat planı' },
    { '@type': 'HowToSupply', name: 'Büdcə cədvəli' },
    { '@type': 'HowToSupply', name: 'Podratçı təklifləri' },
  ],
  tool: [
    { '@type': 'HowToTool', name: 'Tikinti üçün yoxlama siyahısı' },
    { '@type': 'HowToTool', name: 'Gedişatın foto və video qeydləri' },
  ],
  step: [
    { '@type': 'HowToStep', name: 'Əməliyyat dizaynı', text: 'Memarın eskizində qonağın, məhsulun və işçinin yolunu, kirli və təmiz qabın ayrı axınını və saatda neçə sifariş çıxacağını yoxla.' },
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
