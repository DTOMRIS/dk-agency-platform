/**
 * Franchise Directory — single source of truth (SSOT) for the Franchise Radar.
 * Mirrors the sektorConfigs pattern (L-009: reuse, don't reinvent).
 */
import type { FranchiseBrand, FranchiseSector } from './types';
import { FRANCHISE_BRANDS } from './brands';

export type { FranchiseBrand, FranchiseSector, FranchiseEntryModel, AzStatus } from './types';

export function getFranchiseBrand(slug: string): FranchiseBrand | null {
  return FRANCHISE_BRANDS.find((b) => b.slug === slug) ?? null;
}

export function getAllBrands(): FranchiseBrand[] {
  return FRANCHISE_BRANDS;
}

export function getBrandsBySector(sector: FranchiseSector): FranchiseBrand[] {
  return FRANCHISE_BRANDS.filter((b) => b.sector === sector);
}

export const VALID_BRAND_SLUGS: string[] = FRANCHISE_BRANDS.map((b) => b.slug);

/** Sectors actually present in the catalog (for filter chips). */
export const ACTIVE_SECTORS: FranchiseSector[] = [
  ...new Set(FRANCHISE_BRANDS.map((b) => b.sector)),
];
