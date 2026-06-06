/**
 * Sektor configs — single source of truth (SSOT) for sektor landing pages.
 *
 * The dynamic route `app/[locale]/sektor/[slug]/page.tsx` resolves a slug to a
 * config here; an unknown slug → `notFound()`.
 */
import type { SektorConfig } from './types';
import { qonaqEviConfig } from './qonaqEvi';
import { otelConfig } from './otel';
import { restoranConfig } from './restoran';
import { kafeConfig } from './kafe';

export type { SektorConfig } from './types';

export const SEKTOR_CONFIGS: Record<string, SektorConfig> = {
  'qonaq-evi': qonaqEviConfig,
  otel: otelConfig,
  restoran: restoranConfig,
  kafe: kafeConfig,
};

export function getSektorConfig(slug: string): SektorConfig | null {
  return SEKTOR_CONFIGS[slug] ?? null;
}

export const VALID_SEKTOR_SLUGS = Object.keys(SEKTOR_CONFIGS);

export const SEKTOR_CONFIG_LIST: SektorConfig[] = Object.values(SEKTOR_CONFIGS);
