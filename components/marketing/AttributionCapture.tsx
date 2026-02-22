'use client';

import { useEffect } from 'react';
import { persistAttributionIfAllowed } from '@/lib/marketing/attribution';

const TRACK_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'gclid'] as const;

export default function AttributionCapture() {
  useEffect(() => {
    const search = new URLSearchParams(window.location.search);

    const found = TRACK_KEYS.reduce<Record<string, string>>((acc, key) => {
      const value = search.get(key);
      if (value) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(found).length === 0) {
      return;
    }

    persistAttributionIfAllowed({
      ...found,
      captured_at: new Date().toISOString(),
      landing_path: `${window.location.pathname}${window.location.search}`,
    });
  }, []);

  return null;
}
