export type { SektorConfig, SektorToolItem, SektorStatItem, SektorFaqItem, SektorToolIcon } from './types';
export { qonaqEviConfig } from './qonaqEvi';
export { otelConfig } from './otel';
export { restoranConfig } from './restoran';
export { kafeConfig } from './kafe';

import { qonaqEviConfig } from './qonaqEvi';
import { otelConfig } from './otel';
import { restoranConfig } from './restoran';
import { kafeConfig } from './kafe';
import type { SektorConfig } from './types';

export const SEKTOR_CONFIGS: Record<string, SektorConfig> = {
  'qonaq-evi': qonaqEviConfig,
  'otel': otelConfig,
  'restoran': restoranConfig,
  'kafe': kafeConfig,
};

export function getSektorConfig(slug: string): SektorConfig | null {
  return SEKTOR_CONFIGS[slug] ?? null;
}

export const VALID_SEKTOR_SLUGS = Object.keys(SEKTOR_CONFIGS);
