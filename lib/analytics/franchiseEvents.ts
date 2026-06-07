'use client';

import { trackEvent } from './yandex-metrica';

export type FranchiseRadarAction = 'view' | 'filter' | 'lead';

export interface FranchiseRadarEventParams {
  action: FranchiseRadarAction;
  /** sector filter value, for 'filter' */
  sector?: string;
  /** brand slug, for 'lead' */
  brandSlug?: string;
}

export function trackFranchiseRadar({
  action,
  sector,
  brandSlug,
}: FranchiseRadarEventParams): void {
  trackEvent(`franchise_radar_${action}`, {
    sector,
    brandSlug,
    path: typeof window !== 'undefined' ? window.location.pathname : undefined,
  });
}
