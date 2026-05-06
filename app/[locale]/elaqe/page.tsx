'use client';

import { usePathname } from 'next/navigation';
import { normalizeLocale, type Locale } from '@/i18n/config';
import ComingSoon from '@/components/shared/ComingSoon';

const pageCopy: Record<Locale, { title: string; description: string }> = {
  az: {
    title: 'Əlaqə',
    description: 'Bizimlə əlaqə formu və məlumatlar tezliklə burada olacaq. Hal-hazırda WhatsApp üzərindən əlaqə saxlaya bilərsiniz.',
  },
  ru: {
    title: 'Контакты',
    description: 'Форма обратной связи и контактная информация скоро появятся здесь. Пока вы можете связаться с нами через WhatsApp.',
  },
  en: {
    title: 'Contact',
    description: 'A contact form and our details will be available here soon. For now, you can reach us via WhatsApp.',
  },
  tr: {
    title: 'İletişim',
    description: 'Bizimle iletişim formu ve bilgiler yakında burada olacak. Şu an için WhatsApp üzerinden iletişime geçebilirsiniz.',
  },
};

export default function ElaqePage() {
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
