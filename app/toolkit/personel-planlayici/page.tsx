import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "İşçi planlayıcısı — növbədə neçə işçi lazımdır",
  description:
    "Restoran və kafe üçün: açılışda, ən sıx saatlarda və axşam növbəsində neçə işçi lazımdır və işçi xərci satışın neçə faizini tutur.",
};

export { default } from '@/app/[locale]/toolkit/personel-planlayici/page';
