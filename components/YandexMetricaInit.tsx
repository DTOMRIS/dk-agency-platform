'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { initYandexMetrica, trackPageView, isYandexEnabled } from '@/lib/analytics/yandex-metrica';

const STORAGE_KEY = 'dk-cookie-consent';

function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    return parsed?.accepted === true;
  } catch {
    return false;
  }
}

export default function YandexMetricaInit() {
  const pathname = usePathname();

  useEffect(() => {
    if (!isYandexEnabled()) return;
    if (!hasAnalyticsConsent()) return;
    initYandexMetrica();
  }, []);

  useEffect(() => {
    if (hasAnalyticsConsent()) {
      trackPageView(pathname);
    }
  }, [pathname]);

  if (!isYandexEnabled()) return null;

  const counterId = process.env.NEXT_PUBLIC_YANDEX_METRICA_ID;
  return (
    <noscript>
      <div>
        <img
          src={`https://mc.yandex.ru/watch/${counterId}`}
          style={{ position: 'absolute', left: '-9999px' }}
          alt=""
        />
      </div>
    </noscript>
  );
}
