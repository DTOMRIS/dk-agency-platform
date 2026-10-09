/**
 * @file tool-directory.ts
 * @purpose /toolkit directory metadata (group, icon, tags) on top of the TOOLKIT_CATALOG slug list.
 *          `pnl` and `pnl-simulator` open the same component, so the directory lists 17 unique tools
 *          (owner decision 2026-10-09). Texts live in messages → innerV2.toolkit.tools.<slug>.
 * @task TASK-0514
 */

import type { IconName } from '@/components/home/v2/shared';
import { TOOLKIT_CATALOG } from '@/lib/news/toolkit-catalog';

export type ToolGroup = 'xerc' | 'gelir' | 'acilis' | 'kadr';

export const TOOL_GROUPS: readonly ToolGroup[] = ['xerc', 'gelir', 'acilis', 'kadr'];

export interface ToolMeta {
  slug: string;
  group: ToolGroup;
  icon: IconName;
  /** Hotel / guesthouse tool — shows the «Qonaqlama» tag. */
  hospitality?: boolean;
}

/** Route aliases that open an already listed tool (counted once). */
const ALIASES = new Set(['pnl-simulator']);

/** Directory order = approved mockup order (grouped Xərc → Gəlir → Açılış → Kadr). */
const META: ReadonlyArray<ToolMeta> = [
  { slug: 'food-cost', group: 'xerc', icon: 'pie' },
  { slug: 'pnl', group: 'xerc', icon: 'bars' },
  { slug: 'basabas', group: 'xerc', icon: 'target' },
  { slug: 'delivery-calc', group: 'xerc', icon: 'scooter' },
  { slug: 'addim-xerci', group: 'xerc', icon: 'foot' },
  { slug: 'menu-matrix', group: 'gelir', icon: 'grid' },
  { slug: 'qonaq-evi-roi-kalkulyatoru', group: 'gelir', icon: 'house', hospitality: true },
  { slug: 'ota-hazirlig-testi', group: 'gelir', icon: 'globe', hospitality: true },
  { slug: 'whatsapp-template-paketi', group: 'gelir', icon: 'chat', hospitality: true },
  { slug: 'checklist', group: 'acilis', icon: 'clip' },
  { slug: 'insaat-checklist', group: 'acilis', icon: 'hat' },
  { slug: 'aqta-checklist', group: 'acilis', icon: 'shield' },
  { slug: 'branding-guide', group: 'acilis', icon: 'palette' },
  { slug: 'otel-hazirlig-testi', group: 'acilis', icon: 'bed', hospitality: true },
  { slug: 'personel-planlayici', group: 'kadr', icon: 'shift' },
  { slug: 'metbex-istasyon', group: 'kadr', icon: 'chef' },
  { slug: 'staff-retention', group: 'kadr', icon: 'retain' },
];

const CATALOG_SLUGS = new Set(TOOLKIT_CATALOG.map((tool) => tool.slug));

/** The 17 unique free Toolkit tools — only slugs that really exist in the catalog. */
export const TOOL_DIRECTORY: ReadonlyArray<ToolMeta> = META.filter((tool) =>
  CATALOG_SLUGS.has(tool.slug)
);

/** Number of unique free Toolkit tools (pnl / pnl-simulator counted once). */
export const FREE_TOOLKIT_COUNT = TOOLKIT_CATALOG.filter((tool) => !ALIASES.has(tool.slug)).length;

/** Editorial pick for «Ən çox lazım olan 3 alət» — not usage statistics. */
export const FEATURED_TOOL_SLUGS = ['food-cost', 'delivery-calc', 'pnl'] as const;

export function getToolMeta(slug: string): ToolMeta | undefined {
  const canonical = slug === 'pnl-simulator' ? 'pnl' : slug;
  return TOOL_DIRECTORY.find((tool) => tool.slug === canonical);
}

/** Blog article → tool it teaches (same pairs the tool pages already link to). */
export const BLOG_TOOL_MAP: Readonly<Record<string, string>> = {
  '1-porsiya-food-cost-hesablama': 'food-cost',
  'pnl-oxuya-bilmirsen': 'pnl',
  'basabas-noqtesi-hesablama': 'basabas',
  'wolt-bolt-komissiyon': 'delivery-calc',
  'menyu-muhendisliyi-satis': 'menu-matrix',
  'aqta-cerime-checklist': 'aqta-checklist',
  'insaatdan-acilisa-checklist': 'insaat-checklist',
  'restoran-markalasma-konsept': 'branding-guide',
  'isci-saxlama-7-strategiya': 'staff-retention',
  'aha-ulduz-sertifikati-otel-hazirliq': 'otel-hazirlig-testi',
};
