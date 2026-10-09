import { renderHomeOg, HOME_OG_SIZE } from '@/lib/og/home-og';

// TASK-0513: saytın ümumi link önizləməsi (AZ). Dizayn lib/og/home-og.tsx-dədir; dillər üçün
// app/[locale]/opengraph-image.tsx eyni renderer-i işlədir.
export const alt = 'DK Agency — Biz itkini tapırıq, siz restoranı idarə edirsiniz';
export const size = HOME_OG_SIZE;
export const contentType = 'image/png';
// TASK-0508/0510: build prerender-ində Google Fonts sorğusu build-i yıxmasın — ilk sorğuda yaradılır.
export const dynamic = 'force-dynamic';

export default async function OpenGraphImage() {
  return renderHomeOg('az');
}
