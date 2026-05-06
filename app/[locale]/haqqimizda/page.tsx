'use client';

import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';
import ComingSoon from '@/components/shared/ComingSoon';

const pageCopy: Record<Locale, { title: string; description: string }> = {
  az: {
    title: 'Haqqımızda',
    description: 'DK Agency komandası və missiyamız haqqında məlumat tezliklə burada olacaq.',
  },
  ru: {
    title: 'О нас',
    description: 'Информация о команде DK Agency и нашей миссии скоро появится здесь.',
  },
  en: {
    title: 'About Us',
    description: 'Information about the DK Agency team and our mission will be available here soon.',
  },
  tr: {
    title: 'Hakkımızda',
    description: 'DK Agency ekibi ve misyonumuz hakkında bilgiler yakında burada olacak.',
  },
};

export default function HaqqimizaPage() {
  const pathname = usePathname();
  const locale = normalizeLocale(pathname.split('/')[1]);
  const copy = pageCopy[locale];

  return (
    <ComingSoon
      title={copy.title}
      description={copy.description}
    />
  );
}
