/**
 * Franchise Radar — types (F-RADAR Faza 1).
 * Field-by-field so a Faza 2 DB migration reuses the same shape.
 * Brand names + factual data (investment, origin) are facts, not endorsements.
 * NOTE: we never host brand logos — use a sector icon + brand name (text).
 */

export type FranchiseEntryModel = 'unit_franchise' | 'master_license' | 'country_license';

export type FranchiseSector = 'qsr' | 'coffee' | 'dessert' | 'fast_casual' | 'education' | 'hotel' | 'convenience';

export type AzStatus = 'not_present' | 'under_research' | 'coming_soon';

export type FranchiseBrand = {
  /** URL-safe id: 'five-guys', 'wendys' */
  slug: string;
  /** Display name (factual, never translated) */
  brandName: string;
  /** Origin: ISO country code or name: 'US', 'TR', 'JP' */
  origin: string;
  sector: FranchiseSector;
  entryModel: FranchiseEntryModel;
  /** null = not disclosed */
  investmentMinUsd: number | null;
  investmentMaxUsd: number | null;
  franchiseFeeUsd: number | null;
  azStatus: AzStatus;
  founded: number | null;
  globalUnits: number | null;
  /** i18n key suffix for the "why it's an AZ opportunity" copy (franchiseRadar.brandDesc.<descKey>) */
  descKey: string;
  /** Source note for audit (open-source data, may change) */
  sourceNote: string;
  /** lucide icon name used instead of a hosted logo */
  iconCategory: string;
};
