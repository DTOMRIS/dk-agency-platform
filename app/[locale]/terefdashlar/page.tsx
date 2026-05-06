'use client';

import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';
import ComingSoon from '@/components/shared/ComingSoon';

const pageCopy: Record<Locale, { title: string; description: string }> = {
  az: {
    title: 'Tərəfdaşlar',
    description: 'Sektor tərəfdaşları, təlim partnyorları və sponsor şəbəkəsi tezliklə burada olacaq.',
  },
  ru: {
    title: 'Партнёры',
    description: 'Отраслевые партнёры, учебные партнёры и спонсорская сеть скоро появятся здесь.',
  },
  en: {
    title: 'Partners',
    description: 'Sector partners, training partners, and sponsor network will be available here soon.',
  },
  tr: {
    title: 'Ortaklar',
    description: 'Sektör ortakları, eğitim iş ortakları ve sponsor ağı yakında burada olacak.',
  },
};

export default function TerefdashlarPage() {
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
