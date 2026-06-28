'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { locales, normalizeLocale, switchLocalePath, type Locale } from '@/i18n/config';

export default function DeviceLanguageDetector() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Only check if user hasn't explicitly chosen a language in session/localStorage
    const userChosen = localStorage.getItem('dk_user_language_set');
    if (userChosen) return;

    if (typeof window !== 'undefined' && navigator.language) {
      const lang = navigator.language.toLowerCase();
      let detectedLocale: Locale | null = null;

      if (lang.startsWith('az')) detectedLocale = 'az';
      else if (lang.startsWith('tr')) detectedLocale = 'tr';
      else if (lang.startsWith('ru')) detectedLocale = 'ru';
      else if (lang.startsWith('en')) detectedLocale = 'en';

      const currentLocale = normalizeLocale(pathname.split('/')[1]);

      if (detectedLocale && detectedLocale !== currentLocale) {
        // Mark as set so we don't redirect repeatedly in the same session
        localStorage.setItem('dk_user_language_set', 'auto');
        const targetPath = switchLocalePath(pathname, detectedLocale);
        router.replace(targetPath);
      }
    }
  }, [pathname, router]);

  return null;
}
