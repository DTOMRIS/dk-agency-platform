'use client';

import { useEffect, useState } from 'react';
import {
  isLaunchActive,
  daysUntilLaunchEnd,
  shouldWarnLaunchEnding,
  launchEndLabel,
} from '@/lib/launch-campaign';

/**
 * Invoice (Fatura) module launch banner.
 * Free until the campaign end date; ≤30 days → countdown warning; after → grace notice.
 * Client-only (date-based) to avoid SSR hydration mismatch. Mobile-safe, dark text on light.
 */
export default function LaunchCampaignBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const active = isLaunchActive();
  const days = daysUntilLaunchEnd();
  const warn = shouldWarnLaunchEnding();

  if (active && !warn) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
        <span>🎁</span>
        <span>
          KAZAN AI Fatura OCR modulu <b>{launchEndLabel()}</b> tarixinə qədər tamamilə pulsuzdur.
        </span>
      </div>
    );
  }

  if (active && warn) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">
        <span>⏳</span>
        <span>
          Pulsuz dövr bitməsinə <b>{days} gün</b> qaldı ({launchEndLabel()}). Sonra köhnə
          faturalarınız oxunabilir qalacaq; yalnız yeni yükləmə + OCR üçün paket lazım olacaq.
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
      <span>ℹ️</span>
      <span>
        Pulsuz dövr bitdi. Köhnə faturalarınız və CSV/PDF ixracı həmişə açıqdır — yalnız yeni
        yükləmə, OCR və AI analiz Kalfa paketi tələb edir. Datanız girov tutulmur.
      </span>
    </div>
  );
}
