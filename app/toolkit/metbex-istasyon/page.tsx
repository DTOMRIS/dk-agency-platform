import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Mətbəx stansiyaları — fast food mətbəxinin planı",
  description:
    "Fast food mətbəxi üçün: menyudakı yemək sayına və gündəlik sifarişə görə neçə stansiya, neçə işçi lazımdır və işçi xərci satışın neçə faizini tutur.",
};

export { default } from '@/app/[locale]/toolkit/metbex-istasyon/page';
